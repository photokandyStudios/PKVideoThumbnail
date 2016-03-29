/**
 * PKVideoThumbnail
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify,
 * merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies
 * or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT
 * OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

#import "PKVideoThumbnail.h"
#import <Cordova/CDVPluginResult.h>
#import <AVFoundation/AVFoundation.h>
#import <AVFoundation/AVAsset.h>
#import "CDVFile.h"
#import <MediaPlayer/MediaPlayer.h>

@implementation PKVideoThumbnail

- (NSURL *) obtainURLForPath:(NSString *)path {
    if ([path hasPrefix:@"cdvfile://"]) {
        // use the File API to get the appropriate URL, given the path
        // based on media plugin's code for obtaining file paths
        CDVFile *filePlugin = [self.commandDelegate getCommandInstance:@"File"];
        CDVFilesystemURL *fsURL = [CDVFilesystemURL fileSystemURLWithString:path];
        NSString *filePath = [filePlugin filesystemPathForURL:fsURL];
        if (filePath) {
            return [NSURL URLWithString:[[@"file://" stringByAppendingString:filePath] stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding]];
        } else {
            return [NSURL URLWithString:[path stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding]];
        }
    } else {
        if ([path rangeOfString:@"://"].location == NSNotFound) {
            NSString *pathForResource = [self.commandDelegate pathForResource:path];
            if (pathForResource) {
                return [NSURL URLWithString:[[@"file://" stringByAppendingString:pathForResource] stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding]];
            } else {
                return NULL;
            }
        }
        else {
            return [NSURL URLWithString:[path stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding]];
        }
    }
}

- (CDVPluginResult *) extractThumbnailAtPath:(NSString *)sourcePath toPath:(NSString *)targetPath withOptions:(NSDictionary *)options
{

    UIImage *thumbnail;
    NSURL *url = [self obtainURLForPath:sourcePath];

    // from http://stackoverflow.com/q/9145968 by Mx Gherkins
    // and http://www.catehuston.com/blog/2015/07/29/ios-getting-a-thumbnail-for-a-video/

    AVAsset *asset = [AVAsset assetWithURL:url];
    //AVURLAsset *asset = [[AVURLAsset alloc] initWithURL:url options:nil];
    AVAssetImageGenerator *generate = [AVAssetImageGenerator assetImageGeneratorWithAsset:asset];
    //AVAssetImageGenerator *generate = [[AVAssetImageGenerator alloc] initWithAsset:asset];
    generate.appliesPreferredTrackTransform = YES; // http://stackoverflow.com/a/9146246 by djromero

    NSError *err = NULL;
    Float64 position = [[options objectForKey:@"position"] floatValue];
    CMTime time = CMTimeMakeWithSeconds(position, 1000);
    CGImageRef imgRef = [generate copyCGImageAtTime:time actualTime:NULL error:&err];
    if (err) {
        return [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:[NSString stringWithFormat:@"Could not extract thumbnail from %@ at time %f; err=%@", url, position, err]];
    }
    thumbnail = [[UIImage alloc] initWithCGImage:imgRef];
    CGImageRelease(imgRef);

    if (!thumbnail) {
        return [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:[NSString stringWithFormat:@"Didn't get a thumbnail from CGImage using %@", url]];
    }

    // if we have a thumbnail, we now need to determine if it needs resized...
    NSDictionary *dimensions = [options objectForKey:@"resize"];
    if (dimensions) {
        // from http://nshipster.com/image-resizing/
        Float64 newWidth = [[dimensions objectForKey:@"width"] floatValue];
        Float64 newHeight = [[dimensions objectForKey:@"height"] floatValue];
        CGRect targetFrame = CGRectMake(0, 0, newWidth, newHeight);
        CGRect targetFrameWithAspectRatio = AVMakeRectWithAspectRatioInsideRect(thumbnail.size, targetFrame);

        UIGraphicsBeginImageContextWithOptions(targetFrameWithAspectRatio.size, true, 0.0);
        [thumbnail drawInRect:CGRectMake(0.0, 0.0,
                                         targetFrameWithAspectRatio.size.width,
                                         targetFrameWithAspectRatio.size.height)];
        thumbnail = UIGraphicsGetImageFromCurrentImageContext();
        UIGraphicsEndImageContext();
    }

    Float64 quality = [[options objectForKey:@"quality"] floatValue];

    // if mode is file, we'll write it out to a file as a JPEG
    if ([[[options objectForKey:@"mode"] lowercaseString] isEqualToString:@"file"]) {
        NSURL *target = [self obtainURLForPath:targetPath];
        if (target) {
            NSString *revisedTargetPath = [target.absoluteString stringByReplacingOccurrencesOfString:@"file://" withString:@""];
            // write out the thumbnail; a return of NO will be a failure.
            if([UIImageJPEGRepresentation(thumbnail, quality) writeToFile:revisedTargetPath atomically:YES]) {
            return [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:[NSString stringWithFormat:@"%@", targetPath]];
            } else {
                return [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:[NSString stringWithFormat:@"Could not create thumbnail. Source: %@, Target: %@, Modified Target: %@", url, targetPath, revisedTargetPath]];
            };
        } else {
            return [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:[NSString stringWithFormat:@"Target can't be in the bundle. Source: %@, Target: %@", url, targetPath]];
        }
    } else {
        // return the image data to the callback
        NSData *imageData = UIImageJPEGRepresentation(thumbnail, quality);
        if ([[[options objectForKey:@"mode"] lowercaseString] isEqualToString:@"array"]) {
            return [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsArrayBuffer:imageData];
        } else {
            return [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:[@"data:image/jpeg;base64," stringByAppendingString:[imageData base64EncodedStringWithOptions:0]]];
        }
    }
}

- (void) createThumbnail:(CDVInvokedUrlCommand*)command
{
    CDVPluginResult* pluginResult = nil;

    @try {
        NSString* theSourceVideoName = [command argumentAtIndex:0];
        NSString* theTargetImageName = [command argumentAtIndex:1];

        NSMutableDictionary* options = nil;
        options = [command argumentAtIndex:2 withDefault:nil];
        if (options != nil) {
            options = [NSMutableDictionary dictionaryWithDictionary:options];
        } else {
            options = [NSMutableDictionary dictionaryWithCapacity:1];
        }

        // supply default options if none provided
        if (![options objectForKey:@"position"]) {
            // if not supplied, we default to 1 second into the video
            [options setObject:[NSNumber numberWithFloat:1.0] forKey:@"position"];
        }
        if (![options objectForKey:@"mode"]) {
            // if not supplied, we default to "file" mode (rather than "data")
            [options setObject:@"file" forKey: @"mode"];
        }
        if (![options objectForKey:@"quality"]) {
            // if not supplied, thumbnail quality is 80%.
            [options setObject:[NSNumber numberWithFloat:0.8] forKey:@"quality"];
        }

        pluginResult = [self extractThumbnailAtPath:theSourceVideoName toPath:theTargetImageName withOptions:options];
    } @catch (NSException* exception) {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_JSON_EXCEPTION messageAsString:[exception reason]];
    }

    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}
@end



