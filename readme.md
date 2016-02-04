# PKVideoThumbnail

@author Kerri Shotts

@email kerrishotts@gmail.com

@version 2.0.0

This plugin lets you extract a thumbnail from a video file. The video file must be
supported by the platform, and the thumbnail will be written to a location you 
specify. 

Supports: iOS 6+, Android 2.3+

The license is MIT, so feel free to use, enhance, etc. If you do make changes that would
benefit the community, it would be great if you would contribute them back to the original
plugin, but that is not required.

## License

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

## Repository

Available on [Github](https://github.com/photokandyStudios/PKVideoThumbnail). Contributions welcome!

## Minimum Requirements

* Cordova 2.9 or higher (tested 3.4)
* iOS 6 or higher; Android 2.3 or higher

## Installation

Add the plugin using Cordova's CLI:

```
cordova plugin add com.photokandy.videothumbnail
```

## Features

The plugin supports the following abilities:

* Request the thumbnail at a specific resolution (if supported by the platform)

* Request a thumbnail from a specific timestamp within the video

* Pass the thumbnail in an ArrayBuffer or Base64 String rather than storing to a file

* Use cdvfile:// instead of file://


## Use

All interaction with the library is through `window.PKVideoThumbnail`. To request a thumbnail from a video file, simply:

```
window.PKVideoThumbnail.createThumbnail ( sourceVideoPath, targetThumbnailPath, success, failure );
```

Both the source and target path should be a `file://` absolute URL. If using `file://localhost/`, you should eliminate `localhost`
from the `targetThumbnailPath` for proper functionality. The intermediate directories specified in `targetThumbnailPath` must also
exist (missing directories are *not* created).

The `success` method receives the `targetThumbnailPath` in case the method needs to do further work on the image. The `error` method
often receives the `targetThumbnailPath` on iOS, but will receive an error message indicating cause of failure on Android.

The thumbnail obtained is platform and video-specific. There is no support for requesting thumbnails of different sizes; if you need
this, you can alter the thumbnail after it is written out to storage.
