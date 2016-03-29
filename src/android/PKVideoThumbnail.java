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
package com.photokandy.PKVideoThumbnail;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaResourceApi;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.graphics.Bitmap;
import android.graphics.Bitmap.CompressFormat;
import android.graphics.Matrix;
import android.graphics.RectF;
import android.media.*;
import android.provider.MediaStore;
import android.util.Base64;
import android.net.Uri;

import java.io.*;

/**
 * This class echoes a string called from JavaScript.
 */
public class PKVideoThumbnail extends CordovaPlugin {
    
    private String mapPath(String path) {
        CordovaResourceApi resourceApi = webView.getResourceApi();
        String returnUri;
        try {
            returnUri = (resourceApi.remapUri(Uri.parse(path))).toString();
        } catch (IllegalArgumentException e) {
            returnUri = path;
        }
        return returnUri;
    }

    /**
     * Executes the request and returns PluginResult.
     *
     * @param action        The action to execute.
     * @param args          JSONArry of arguments for the plugin.
     * @param callbackId    The callback id used when calling back into JavaScript.
     * @return              A PluginResult object with a status and message.
     */
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        try {
            if (action.equals("createThumbnail")) {
                String sourceVideo = mapPath(args.getString(0)).replaceAll("file://", "");
                String targetImage = mapPath(args.getString(1)).replaceAll("file://", "");

                JSONObject options = args.getJSONObject(2);

                String processingMode = options.optString("mode", "file");
                int outputQuality = (int) (options.optDouble("quality", 0.8) * 100);
                double position = options.optDouble("position", 1.0);

                JSONObject resize = options.optJSONObject("resize");

                // get the thumbnail
                Bitmap thumbnail = ThumbnailUtils.createVideoThumbnail(sourceVideo, MediaStore.Images.Thumbnails.MINI_KIND);
                // NOTE: can't get the thumbnail at a specific location :-(
                if (thumbnail == null) {
                    callbackContext.error( "Couldn't read video at " + sourceVideo);
                    return true;
                }
                // resize the thumbnail if necessary
                if (resize != null) {
                    double newWidth = resize.optDouble("width", 100);
                    double newHeight = resize.optDouble("height", 100);
                    
                    // based on http://stackoverflow.com/a/30024180/741043
                    Matrix m = new Matrix();
                    m.setRectToRect(new RectF(0, 0, thumbnail.getWidth(), thumbnail.getHeight()), 
                                    new RectF(0, 0, (float)newWidth, (float)newHeight), Matrix.ScaleToFit.CENTER);
                    try {
                        thumbnail = Bitmap.createBitmap(thumbnail, 0, 0, thumbnail.getWidth(), thumbnail.getHeight(), m, true);
                    } catch (IllegalArgumentException e) {
                        callbackContext.error( "Could not resize thumbnail; width or height out of range?" );
                        return true;                                            
                    }
                }

                // compress the thumbnail to a JPEG                 
                ByteArrayOutputStream theThumbnailOS = new ByteArrayOutputStream();
                if (!thumbnail.compress(CompressFormat.JPEG, outputQuality, theThumbnailOS)) {
                    callbackContext.error( "Could not compress thumbnail to a JPEG of the desired quality." );
                    return true;                    
                }
                
                // and return it in the desired format
                if (processingMode.equals("file")) {
                    FileOutputStream theOutputStream;
                    try
                    {
                        File theOutputFile = new File (targetImage);
                        if (!theOutputFile.exists())
                        {
                            if (!theOutputFile.createNewFile())
                            {
                                callbackContext.error("Could not save thumbnail to " + targetImage);
                                return true;
                            }
                        }
                        if (theOutputFile.canWrite())
                        {
                            theOutputStream = new FileOutputStream (theOutputFile);
                            if (theOutputStream != null)
                            {
                                theThumbnailOS.writeTo(theOutputStream);
                            }
                            else
                            {
                                callbackContext.error("Could not save thumbnail; target not writeable");
                                return true;
                            }
                        }
                    }
                    catch (IOException e)
                    {
                        e.printStackTrace();
                        callbackContext.error( "I/O exception saving thumbnail" );
                        return true; 
                    }
                    callbackContext.success(targetImage);
                    return true; 
                }
                if (processingMode.equals("array")) {
                    callbackContext.success(theThumbnailOS.toByteArray());
                    return true;
                }
                // otherwise return base64
                // based on http://stackoverflow.com/a/9768973/741043
                callbackContext.success("data:image/jpeg;base64," + 
                                        Base64.encodeToString(theThumbnailOS.toByteArray(), Base64.DEFAULT));
                return true; 
            } else {
                return false;
            }
        } catch (JSONException e) {
            callbackContext.error ( "JSON Exception" );
            return true;
        }
    }
}
