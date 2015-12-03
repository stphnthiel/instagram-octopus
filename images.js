var fs = require('fs');
var request = require('request');
var _ = require('lodash');

var FILE_NAME = process.argv[2] ? process.argv[2] : 'kimkardashian.json';

var file_name_pattern = /\/([^\/]+)$/;

function download(uri, filename, callback){
    request.head(uri, function(err, res, body){
        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};

fs.readFile(FILE_NAME, function(err, data) {
    var timeline;
    if (err) {
        console.log('No timeline exists. Doing nothing');
    }
    else {
        timeline = JSON.parse(data.toString());
        var folder = 'downloads/' + _.first(timeline).user.username;
        try {
            var stats = fs.lstatSync(folder);
        }
        catch (e) {
            fs.mkdirSync(folder);
        }
        finally {
            var i = 0;
            function next() {
                if (i < timeline.length - 1) {
                    i++;
                    get(i);
                }
                else {
                    console.log('Done!');
                }
            }

            function get(i) {
                var media = timeline[i];

                var url = media.images.standard_resolution.url;
                var file_name = file_name_pattern.exec(url)[1];
                var file_path = folder + '/' + file_name;

                try {
                    var file_stats = fs.lstatSync(file_path);
                    if (file_stats.isFile()) {
                        console.log('Exists: ' + file_name);
                        next();
                        
                    }
                }
                catch (e) {
                    download(url,  file_path, function() {
                        console.log('Downloaded: ' + file_name);
                        setTimeout(next, Math.random() * 1500);
                    });
                }
            }
            // start downloading
            get(0);
        }
    }
});