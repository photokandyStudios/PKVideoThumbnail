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

var PKVideoThumbnail = PKVideoThumbnail || {};

PKVideoThumbnail.createThumbnail = function ( source, target, options, success, failure )
{
    if (!source) {
        throw new Error("Missing source path to video.");
    }
    if (!target) {
        throw new Error("Missing target URI for thumbnail image.");
    }
    
    var successCB = success;
    var failureCB = failure;
    var optionsToPass = options;
    if (typeof optionsToPass === "function") {
        // if options is a function, then we're being called the "old" way. In order
        // to maintain some degree of compatibility, let's be nice and shift all the
        // parameters in order for everything to still work.
        failureCB = successCB;
        successCB = optionsToPass;
        optionsToPass = undefined;
    }
    if (!optionsToPass) {
        optionsToPass = {};
    }
    
    if (!successCB && typeof Promise === "function") {
        // no callbacks provided, but we have a promise environment -- let's return
        // a promise instead!
        return new Promise(function (resolve, reject) {
            cordova.exec(resolve, reject, "PKVideoThumbnail", "createThumbnail", [source, target, optionsToPass]);            
        });
    } else {
        cordova.exec(successCB, failureCB, "PKVideoThumbnail", "createThumbnail", [source, target, optionsToPass]);
    }
}

module.exports = PKVideoThumbnail;
