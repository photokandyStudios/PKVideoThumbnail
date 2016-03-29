(function(){
    var videoURI = "http://www.sample-videos.com/video/mp4/720/big_buck_bunny_720p_2mb.mp4";

    function log() {
        var el = document.getElementById("console");
        el.textContent += [].slice.apply(arguments).join(" ") + "\n";  
    }
    
    function constructImage(src) {
        var img = document.createElement("img");
        img.src = src;
        return img;
    }
    
    function extractThumbnails() {
        // we generate TWO thumbnails -- one from a file
        // and one from a data representation
        log("Extracting thumbnails");
        return Promise.resolve()
                      .then(function createFileThumbnail() {
                          return PKVideoThumbnail.createThumbnail("cdvfile://localhost/persistent/video.mp4",
                                                                  "cdvfile://localhost/persistent/thumbnail.jpg",
                                                                  { mode: "file", 
                                                                    quality: .8,
                                                                    position: 1.0, 
                                                                    resize: {height: 384, width: 384} });
                      }).then(function showFileThumbnail(uri) {
                          document.getElementById("fileThumbnail").appendChild(constructImage(uri));
                      }).then(function createDataThumbnail() {
                          return PKVideoThumbnail.createThumbnail("cdvfile://localhost/persistent/video.mp4",
                                                                  "IGNORE",
                                                                  { mode: "base64", 
                                                                    quality: .8,
                                                                    position: 5.0, // iOS only 
                                                                    resize: {height: 384, width: 384} });                          
                      }).then(function showDataThumbnail(data) {
                          document.getElementById("dataThumbnail").appendChild(constructImage(data));
                      });
    }
    
    function downloadVideoFile(fileToDownload) {
        log("Downloading " + fileToDownload);
        return new Promise(function (resolve, reject) {
            var fileTransfer = new FileTransfer();
            var uri = encodeURI(fileToDownload);
            fileTransfer.download(
                uri,
                "cdvfile://localhost/persistent/video.mp4",
                function success(entry) {
                    log("download complete: " + entry.toURL());
                    resolve(entry);
                },
                function error(error) {
                    log("download error source " + error.source);
                    log("download error target " + error.target);
                    log("download error code" + error.code);
                    reject(error);
                },
                false
            );
        });
    }
    
    function onDeviceReady() {
        log("Received deviceready");
        downloadVideoFile(videoURI).then(extractThumbnails).then(function() {
            log("Done; scroll down to review output!");
        }).catch(function (err) {
            log("ERROR: " + err.message + " (" + JSON.stringify(err) + ")");
        });
    }

    document.addEventListener('deviceready', onDeviceReady, false);
})();