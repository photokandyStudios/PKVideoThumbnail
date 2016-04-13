    exports.defineAutoTests = function() {
        var basePath = device.platform === "iOS" ? "/assets/" : "cdvfile://localhost/persistent/";
        // Android doesn't support thumbnails from videos in android_asset
        // so we have to use local files. prepare by uploading the contents of the assets
        // directory to the avd, like so:
        // adb push ../tests/assets/sample.3gp /data/user/0/com.photokandy.PKVideoThumbnail.runtests/files/files/sample.3gp
        // adb push ../tests/assets/sample_3GPP2.3g2 /data/user/0/com.photokandy.PKVideoThumbnail.runtests/files/files/sample_3GPP2.3g2
        // adb push ../tests/assets/sample_iTunes.mov /data/user/0/com.photokandy.PKVideoThumbnail.runtests/files/files/sample_iTunes.mov
        // adb push ../tests/assets/sample_iPod.m4v /data/user/0/com.photokandy.PKVideoThumbnail.runtests/files/files/sample_iPod.m4v
        // adb push ../tests/assets/sample_mpeg4.mp4 /data/user/0/com.photokandy.PKVideoThumbnail.runtests/files/files/sample_mpeg4.mp4
        describe('Video Thumbnail', function() {
            ["sample_iTunes.mov", "sample_iPod.m4v",// "sample_mpeg2.m2v",
             "sample_mpeg4.mp4", "sample.3gp", "sample_3GPP2.3g2"].map(function(fn) {
                describe(fn, function() {
                    [ "file", "array", "base64" ].map(function(m, j) {
                        describe(m, function () {
                            [ // description                    options pass=file  array  base64
                             ["create a thumbnail w/ no options", undefined, true, undefined, undefined],
                             ["create a thumbnail w/ empty options", {}, true, undefined, undefined],
                             ["create a thumbnail w/ mode option", { mode: m }, true, true, true],
                             ["create a thumbnail w/ zero position", { mode: m, position: 0.0 }, true, true, true],
                             ["create a thumbnail w/ one position", { mode: m, position: 1.0}, true, true, true],
                             ["create a thumbnail w/ ten position", { mode: m, position: 10.0}, true, true, true],
                             ["create a thumbnail w/ crazy position", { mode: m, position: 10000.0}, true, true, true],
                             ["create a thumbnail w/ negative position", {mode: m, position: -100.0}, true, true, true],
                             ["create a thumbnail w/ small resize", {mode: m, position: 2.0, resize: {width: 10, height: 10}}, true, true, true],
                             ["create a thumbnail w/ med resize", {mode: m, position: 2.0, resize: {width: 100, height: 100}}, true, true, true],
                             ["create a thumbnail w/ large resize",{mode: m, position: 2.0, resize: {width: 500, height: 500}}, true, true, true],
                             ["create a thumbnail w/ zero resize", {mode: m, position: 2.0, resize: {width: 0, height: 0}}, false, false, false],
                             ["create a thumbnail w/ negative resize", {mode: m, position:2.0,resize:{width:-10,height:-10}}, false, false, false],
                             ["create a thumbnail w/ 100% quality", {mode: m, position:2.0, quality:1.0}, true, true, true],
                             ["create a thumbmail w/ 50% quality", {mode: m, position:2.0, quality:0.5}, true, true, true],
                             ["create a thumbnail w/ 0% quality", {mode: m, position:2.0, quality:0.0}, true, true, true],
                             ["create a thumbnail w/ neg quality", {mode: m, position:2.0, quality:-1.0}, false, false, false]
                            ].map(function (t, i) {
                                function finished(passed, data, done) {
                                    if (passed) {
                                        switch(m) {
                                        case "file":
                                            expect(data.length).toBeGreaterThan(0);
                                            break;
                                        case "array":
                                            expect(data.byteLength).toBeGreaterThan(0);
                                            break;
                                        case "base64":
                                            expect(data).toContain("data:image/jpeg;base64,");
                                            expect(data.length).toBeGreaterThan(23);
                                            break;
                                        }
                                    } else {
                                        console.error(data);
                                    }
                                    expect(passed).toBe(t[2+j]);
                                    if (done) {done();}
                                }
                                if (t[2+j] !== undefined) {
                                    // only run for tests where the passing result is
                                    // defined as true or false
                                    it(t[0] + " (callback)", function(done) {
                                        if (t[1] !== undefined) {
                                            window.PKVideoThumbnail.createThumbnail(
                                                basePath + fn,
                                                "cdvfile://localhost/persistent/" + fn + "-" + i + ".jpg", t[1],
                                                function(data) {finished(true,data,done);},
                                                function(err) {finished(false,err,done);});
                                        } else {
                                            window.PKVideoThumbnail.createThumbnail(
                                                basePath + fn,
                                                "cdvfile://localhost/persistent/" + fn + "-" + i + ".jpg",
                                                function(data) {finished(true,data,done);},
                                                function(err) {finished(false,err,done);});
                                        }
                                    });
                                    it(t[0] + " (promise)", function(done) {
                                        window.PKVideoThumbnail.createThumbnail( basePath + fn,
                                                                                "cdvfile://localhost/persistent/" + fn + "-" + i + ".jpg", t[1] )
                                        .then(function(data) {
                                            finished(true,data);
                                        })
                                        .catch(function(err) {
                                            finished(false,err);
                                        })
                                        .then(done);
                                    });
                                }
                            });
                        });
                    });
                });
            });
        });
    };

