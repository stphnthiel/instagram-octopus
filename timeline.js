var fs = require('fs');
var _ = require('lodash');
var ig = require('instagram-node').instagram();
 
// Every call to `ig.use()` overrides the `client_id/client_secret` 
// or `access_token` previously entered if they exist. 
ig.use({ access_token: '<YOUR_ACCESS_TOKEN>' });
ig.use({ client_id: '<YOUR_CLIENT_ID>',
         client_secret: '<YOUR_CLIENT_SECRET>' });

var USER_NAME = process.argv[2];
var FILE_NAME = 'downloads/' + USER_NAME + '.json';

function get_older(user_id, timeline, complete_callback, error_callback) {
    max_id = _.last(timeline) === undefined ? undefined : _.last(timeline).id;
    ig.user_media_recent(user_id, { count: 30, max_id: max_id }, function(err, medias, pagination, remaining, limit) {
        if (err) error_callback(err);

        if (medias.length > 0) {
            console.log('Got ' + medias.length + ' items (' + timeline.length + ' total). (Req remaining: ' + remaining + ' Limit: ' + limit + ')');
            Array.prototype.push.apply(timeline, medias);
            // wait a second, then get next
            setTimeout(function() { get_older(user_id, timeline, complete_callback, error_callback); }, 1000);
        }
        else {
            complete_callback(timeline);
        }
    });
}

function get_newer(user_id, timeline, complete_callback, error_callback) {
    min_id = _.first(timeline) === undefined ? undefined : _.first(timeline).id;
    ig.user_media_recent(user_id, { count: 30, min_id: min_id }, function(err, medias, pagination, remaining, limit) {
        // the API returns the newer media incl. the one we set to search from (with min_id)
        // so we remove the one with min_id, as we already have it
        _.remove(medias, function(media) { return media.id === min_id });

        if (err) error_callback(err);
        if (medias.length > 0) {
            console.log('Got ' + medias.length + ' items (' + timeline.length + ' total). (Req remaining: ' + remaining + ' Limit: ' + limit + ')');
            Array.prototype.push.apply(timeline, medias);
            // wait a second, then get next
            setTimeout(function() { get_newer(user_id, timeline, complete_callback, error_callback); }, 1000);
        }
        else {
            complete_callback(timeline);
        }
    });
}

// save our timeline to a JSON file
function save(timeline) {
    console.log('Saving…');
    fs.writeFile(FILE_NAME, JSON.stringify(timeline), function(err) {
        if(err) {
            return console.log(err);
        }
        console.log('Done!');
    }); 
}
// this is called in case something, goes wrong. we will attempt to save our progress
function except(error) {
    console.log('Oops… aborting!', error);
    save(timeline);
}

/*
Start here. We will search the username for its user id.
If we find the username in the results, we will start crawling it's timeline.
If not, well… 
*/
ig.user_search(USER_NAME, function(err, users, remaining, limit) {
    var user = _.find(users, function(u) { return u.username ===  USER_NAME;});
    if (!user) return;

    // we have found the user, let's go!
    console.log('Crawling ' + user.full_name + ' (' + user.id + ')');
    fs.readFile(FILE_NAME, function(err, data) {
        var timeline;
        if (err) {
            console.log('No timeline exists. Starting fresh');
            timeline = [];
        }
        else {
            timeline = JSON.parse(data.toString());
            console.log('Found ' + timeline.length + ' items. Continuing…');
        }
        // first: get all entries older than what we have
        get_older(user.id, timeline,
            function(timeline) {
                console.log('Done getting older: ' + timeline.length);
                // then: get all entries newer than what we have
                get_newer(user.id, timeline,
                    function(timeline) {
                        console.log('Done getting newer: ' + timeline.length + ' Timeline should be complete!');
                        // timeline complete. we can save it
                        save(timeline);
                    }, except);
            }, except);
    });
});