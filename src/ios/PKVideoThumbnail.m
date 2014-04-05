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

#import <MediaPlayer/MediaPlayer.h>

@implementation PKVideoThumbnail

BOOL extractVideoThumbnail ( NSString *theSourceVideoName,
                             NSString *theTargetImageName )
{

    UIImage *thumbnail;
    NSURL *url;
    NSString *revisedTargetImageName = [[theTargetImageName stringByReplacingOccurrencesOfString:@"file://" withString:@""] stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
  
    if ( [theSourceVideoName rangeOfString:@"://"].location == NSNotFound )
    {
      url = [NSURL URLWithString:[[@"file://localhost" stringByAppendingString:theSourceVideoName]
                                 stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding]];
    }
    else
    {
      url = [NSURL URLWithString:[theSourceVideoName stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding]];
    }
    
    // BASED ON http://stackoverflow.com/a/6432050 //
    MPMoviePlayerController *mp = [[MPMoviePlayerController alloc]
      initWithContentURL: url ];
    mp.shouldAutoplay = NO;
    mp.initialPlaybackTime = 1;
    mp.currentPlaybackTime = 1;
    // get the thumbnail
    thumbnail = [mp thumbnailImageAtTime:1
                             timeOption:MPMovieTimeOptionNearestKeyFrame];
    [mp stop];

    // write out the thumbnail; a return of NO will be a failure.
    return [UIImageJPEGRepresentation ( thumbnail, 1.0) writeToFile:revisedTargetImageName atomically:YES];
}


- (void) createThumbnail:(CDVInvokedUrlCommand*)command
{
    CDVPluginResult* pluginResult = nil;
    NSString* javaScript = nil;

    @try {
        NSString* theSourceVideoName = [command.arguments objectAtIndex:0];
        NSString* theTargetImageName = [command.arguments objectAtIndex:1];
        
        if ( extractVideoThumbnail(theSourceVideoName, theTargetImageName) )
        {
            pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:theTargetImageName];
            javaScript = [pluginResult toSuccessCallbackString:command.callbackId];
        }
        else
        {
            pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:theTargetImageName];
            javaScript = [pluginResult toErrorCallbackString:command.callbackId];
        }
    } @catch (NSException* exception) {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_JSON_EXCEPTION messageAsString:[exception reason]];
        javaScript = [pluginResult toErrorCallbackString:command.callbackId];
    }

    [self writeJavascript:javaScript];
}
@end
