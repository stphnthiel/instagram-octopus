# A tool to crawl Instagram user accounts
made for a workshop at [Burg Giebichenstein](http://www.burg-halle.de/) Halle/Saale.

## Before Usage
You need your own credentials incl. an access token to use this tool. Please refer to on of the many pages explaining how to get these, e.g. [here](http://jelled.com/instagram/access-token)

## Usage
All functionality is available from the commandline:
* `npm run timeline <username>` crawls a user's entire history. the workflow will try to save intermediate results in case of errors and look for available data and pick up where it has stopped earlier
* `npm run images <path-to-username-timeline-json>` path/file format should be in the form <username>.json. the script will attempt to download all standard resolution images given for media. it will check if the files already exist before attempting to download them
* `npm run stats <path-to-username-timeline-json> <stat-name>` will export the given stat found in a timeline archive to csv with the following information: `media_id, formatted date string, stat`. the following stats are available so far: `num_likes` (export like count per media), `num_comments` (export comment count per media), `locations` (export locations in the format lat:lon per media). use them like this: `npm run stats downloads/username.json num_likes`

