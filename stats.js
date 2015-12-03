var fs = require('fs');
var d3 = require('d3');
var _ = require('lodash');

var FILE_NAME = process.argv[2] ? process.argv[2] : 'kimkardashian.json';
var STAT = process.argv[3] ? process.argv[3] : 'num_likes';

var dateFormat = d3.time.format('%Y-%m-%d %H:%M:%S.%L');
var username = FILE_NAME.replace('.json', '');

fs.readFile(FILE_NAME, function(err, data) {
    var timeline;
    if (err) console.log('File not found!');
    else {
        timeline = JSON.parse(data.toString());
        var csv;
        switch(STAT) {
            case 'num_likes':
                csv = _.map(timeline, function(media) {
                    var date = new Date(media.created_time * 1000);
                    return media.id + ',' + dateFormat(date) + ',' + media.likes.count;
                });
                break;
            case 'num_comments':
                csv = _.map(timeline, function(media) {
                    var date = new Date(media.created_time * 1000);
                    return media.id + ',' + dateFormat(date) + ',' + media.comments.count;
                });
                break;
            case 'locations':
                csv = _.chain(timeline)
                    .filter(function(media) { return _.isUndefined(media.location); })
                    .map(function(media) {
                        var date = new Date(media.created_time * 1000);
                        return media.id + ',' + dateFormat(date) + ',' + media.location.latitude + ':' + media.location.longitude;
                    })
                    .value();
                break;
            default:
                console.log('Unknown stat');
        }

        fs.writeFileSync(username + '_' + STAT + '.csv', csv.join('\n'));
    }
});