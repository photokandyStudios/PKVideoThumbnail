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
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.graphics.Bitmap;
import android.graphics.Bitmap.CompressFormat;
import android.media.*;
import android.provider.MediaStore;

import java.io.*;

/**
 * This class echoes a string called from JavaScript.
 */
public class PKVideoThumbnail extends CordovaPlugin {

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
                String sourceVideo = args.getString(0);
                String targetImage = args.getString(1);
                
                Bitmap thumbnail = ThumbnailUtils.createVideoThumbnail ( sourceVideo.substring(7), MediaStore.Images.Thumbnails.MINI_KIND);
                
                FileOutputStream theOutputStream;
                try
                {
                	File theOutputFile = new File (targetImage.substring(7));
                	if (!theOutputFile.exists())
                	{
                		if (!theOutputFile.createNewFile())
                		{
                                        callbackContext.error ( "Could not save thumbnail." );
                                        return true;
                		}
                	}
                	if (theOutputFile.canWrite())
                	{
                		theOutputStream = new FileOutputStream (theOutputFile);
                		if (theOutputStream != null)
                		{
                			thumbnail.compress(CompressFormat.JPEG, 75, theOutputStream);
                		}
                		else
                		{
                                        callbackContext.error ( "Could not save thumbnail; target not writeable");
                                        return true;
                		}
                	}
                }
                catch (IOException e)
                {
                	e.printStackTrace();
                        callbackContext.error ( "I/O exception saving thumbnail" );
                        return true; 
                }
                callbackContext.success ( targetImage );        
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
