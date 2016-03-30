# PKVideoThumbnail

This plugin extracts a thumbnail from a video file. The video file must be
supported by the platform, and the thumbnail will be written to a location you 
specify or be returned as an ArrayBuffer or Base64-encoded string.

Supports: iOS 6+, Android API Level 17+

The license is MIT, so feel free to use, enhance, etc. If you do make changes that would
benefit the community, it would be great if you would contribute them back to the original
plugin, but that is not required.

## Repository

Available on [Github](https://github.com/photokandyStudios/PKVideoThumbnail). Contributions welcome!

## Minimum Requirements

* Cordova-ios 4.x or higher (tested 4.0.1)
* Cordova-android 4.x or higher (tested 5.1.1)
* iOS 6 or higher; Android API 17+ or higher

## Installation

Add the plugin using Cordova's CLI:

```
cordova plugin add cordova-plugin-photokandy-video-thumbnail --save
```

## Features

The plugin supports the following abilities:

* Request the thumbnail at a specific resolution (if supported by the platform)

* Request a thumbnail from a specific timestamp within the video (if supported by the platform)

* Pass the thumbnail in an ArrayBuffer or Base64-encoded string instead of storing to a file

* Supports cdvfile:// URI scheme

## Use

All interaction with the library is through `window.PKVideoThumbnail`. To request a thumbnail from a video file, simply:

```
window.PKVideoThumbnail.createThumbnail ( sourceVideoPath, targetThumbnailPath [, options] [, success, failure] );
```

You can specify the following URI formats for source and target:

* `file://` (if using `file:///localhost/...`, eliminate `localhost` from the string)
* `cdvfile://` -- for example, `cdvfile://localhost/persistent/video.mp4`

The `options` object can specify an alternate size for the thumbnail, and can also specify quality and timestamp. 
It can also specify the processing mode of the plugin.

* `options.mode` -- the processing mode for the plugin.
    * `file` -- saves the thumbnail to the target specified. If not specified, this is the default. 
       The path to the target must exist and be writeable.
    * `array` -- returns an ArrayBuffer to the callback routine. In this case, `targetThumbnailPath` is ignored, but must be specified. 
       You can use an non-empty string like "callback" or "ignore".
    * `base64` -- returns a Base64-encoded string suitable for an inline image. `targetThumbnailPath` is ignored, but must be specified. 
       You can use an non-empty string  like "callback" or "ignore".
* `options.position` -- the timestamp from which the thumbnail should be extracted. This unit is in seconds. Not supported on
  Android. `1.0` seconds is the default. Thanks to <https://github.com/nov9thgrp> for the inspiration.
* `options.quality` -- the quality of the resulting JPEG from 0 - 1. 0.8 is the default, corresponding to 80%.
* `options.resize` -- resize the thumbnail whilst maintaining aspect ratio
    * `options.resize.width` -- the maximum width of the resulting thumbnail (in pixels)
    * `options.resize.height` -- the maximum height of the resulting thumbnail (in pixels)
    * The resulting thumbnail will fit within the desired size, but may not match exactly, depending upon aspect ratio.
    * On Android, the width and height must neither exceed 512x384 nor the resolution of the video, or an error is generated.

Should the operation succeed, the `success` callback is called with the transformed target file name in case 
additional work needs to be performed. 

If the operation fails, the `failure` callback is called with the reason of the failure. Failure messages are platform-specific. 
See each platform's quirks below.

If you'd rather use promises, simply omit the callbacks -- for example:

```js
window.PKVideoThumbnail.createThumbnail ( sourceVideoPath, targetThumbnailPath, options)
      .then((data) => {})
      .catch((err) => {});
```

### iOS Quirks

* You can extract thumbnails from videos in the application bundle. To do so, omit the URI scheme. 
  For example, `/assets/sample.mov` would load from the app's bundle.

* A negative quality will actually succeed, although the results are undefined.

#### Error Messages

* Target can't be in the bundle. Source: %@, Target: %@
* Could not extract thumbnail from %@ at time %f; err=%@
* Didn't get a thumbnail from CGImage using %@
* Could not create thumbnail. Source: %@, Target: %@, Modified Target: %@

### Android Quirks

* You ***cannot*** extract thumbnails from videos in your application bundle. If you must, you'll need to copy the files to a 
temporary location first.

* A negative quality will generate an error.

* Specifying a desired thumbnail size larger than 512x384 or the source video will generate an error.

* Currently does not support requesting a thumbnail from a specific timestamp. Doing so is ignored and no error is thrown.

#### Error messages

* Couldn't read video at %s
* Could not resize thumbnail; width or height out of range?
* Could not compress thumbnail to a JPEG of the desired quality.
* Could not save thumbnail to %s
* Could not save thumbnail; target not writeable
* I/O exception saving thumbnail
* JSON Exception




## License

MIT

Permission is hereby granted, free of charge, to any person obtaining a copy of this
software and associated documentation files (the "Software"), to deal in the Software
without restriction, including without limitation the rights to use, copy, modify,
merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be included in all copies
or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT
OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
