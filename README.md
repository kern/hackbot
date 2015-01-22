# hackbot

A customizable Facebook Group embetterment robot.

## Installation/Usage

You'll need to set a few configuration options before using the hackbot in
`config.json`. Add your Facebook Group ID, the refresh rate in milliseconds,
and the IDs of the group's administrators to the configuration file.

To generate an access token, open up the [Facebook Graph API
Explorer](https://developers.facebook.com/tools/explorer/) and make sure you're
using a custom application. Click "Get Access Token" and make sure the
`user_groups` and `publish_actions` permissions are ticked. Click the blue "Get
Access Token" in the modal. Copy the short-lived access token and navigate in
your browser to the following URL:

    https://graph.facebook.com/oauth/access_token?
        client_id=APP_ID&
        client_secret=APP_SECRET&
        grant_type=fb_exchange_token&
        fb_exchange_token=SHORT_LIVED_ACCESS_TOKEN

Replace `APP_ID`, `APP_SECRET`, and `SHORT_LIVED_ACCESS_TOKEN` with the proper
values. Take the long-lived (60 day) access token and pass it as an environment
variable. Then you should be good to go!

    $ env ACCESS_TOKEN=[LONG_LIVED_ACCESS_TOKEN] npm start

Currently, there is no way to update the access token without restarting the
hackbot.

Keep in mind that Facebook's user IDs are unique to each application, so you'll
have to find some way of finding out admin IDs using the Graph API.

## Adding Filters

You can add feed filters under the `lib/filters` directory. An [example closed
thread
filter](https://github.com/kern/hackbot/blob/master/lib/filters/closed.js) is
provided.

Filters are functions that receive an array of arrays of posts. Each item in
the outer array represents a post and comment thread on Facebook, with the
first item being the original post. Items of the inner array are [Post
objects](https://github.com/kern/hackbot/blob/master/lib/Post.js).

If you add a filter, make sure to add the exported function to the
`startRefreshing()` call in the [index
file](https://github.com/kern/hackbot/blob/master/lib/index.js);

## TODOs

* Add more fun and useful filters.
* Automatically update the access token through OAuth.
* Remove the dependency on the `fb` package.
* Create a simple administrative interface.
* Implement a logging infrastructure for filters.

## Contributors

Made with ♥ and caffeine at [MHacks V](http://mhacks.org/) by [Alex
Kern](https://twitter.com/KernCanCode) and [Eva
Zheng](https://twitter.com/evadoraz).

## License

MIT
