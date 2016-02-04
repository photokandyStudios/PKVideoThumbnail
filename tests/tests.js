    exports.defineAutoTests = function() {
        describe('Video Thumbnail', function() {
            ["sample_iTunes.mov", "sample_iPod.m4v", "sample_mpeg2.m2v",
             "sample_mpeg4.mp4", "sample.3gp", "sample_3GPP2.3g2"].map(function(fn) {
                describe(fn, function() {
                    [ "file", "array", "base64" ].map(function(m, j) {
                        describe(m, function () {
                            [
                             ["create a thumbnail w/ no options", undefined, true, false, false],
                             ["create a thumbnail w/ empty options", {}, true, false, false],
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
                             ["create a thumbnail w/ neg quality", {mode: m, position:2.0, quality:-1.0}, true, true, true]
                            ].map(function (t, i) {
                                it(t[0], function(done) {
                                   function finished(passed, data) {
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
                                       done();
                                   }
                                   window.PKVideoThumbnail.createThumbnail( "/assets/" + fn,
                                                                            "cdvfile://localhost/persistent/" + fn + "-" + i + ".jpg", t[1],
                                                                           function(a) {finished(true,a);},
                                                                           function(b) {finished(false,b);});
                                });
                            });
                        });
                    });
                });
            });
        });
    };

