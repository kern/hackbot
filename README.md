# hackbot

A customizable Facebook Group embetterment robot.

Hackbot uses the Facebook Graph API to implement extra moderative features that are not currently available to group administrators. At the moment, it only supports the closing of comment threads, but it's designed to be highly extensible.

An instance of hackbot is running on [Hackathon Hackers][hh].

[hh]: http://hh.gd

## Installation

You'll need to set a few configuration options before using the hackbot in
`config.json`. Add your Facebook Group ID, the refresh rate in milliseconds,
and the IDs of the group's moderators to the configuration file.

To generate an access token, open up the [Facebook Graph API
Explorer][explorer] and make sure you're using a custom application. Click "Get
Access Token" and make sure the `user_groups` and `publish_actions` permissions
are ticked. Click the blue "Get Access Token" in the modal. Copy the
short-lived access token and navigate in your browser to the following URL:

    https://graph.facebook.com/oauth/access_token?
        client_id=APP_ID&
        client_secret=APP_SECRET&
        grant_type=fb_exchange_token&
        fb_exchange_token=SHORT_LIVED_ACCESS_TOKEN

Replace `APP_ID`, `APP_SECRET`, and `SHORT_LIVED_ACCESS_TOKEN` with the proper
values. Take the long-lived (60 day) access token in the body and save it in an
environment variable named `ACCESS_TOKEN`. Then you should be good to go!

Keep in mind that Facebook's user IDs are unique to each application, so you'll
have to find some way of finding out moderator IDs using the Graph API.

*Note:* This process is annoying. Please consider [implementing this through a
web-based flow][oauth-issue].

[explorer]: https://developers.facebook.com/tools/explorer/
[oauth-issue]: https://github.com/kern/hackbot/issues/6

## Usage

To start the hackbot, use your long-lived access token and run:

    $ env ACCESS_TOKEN=[LONG_LIVED_ACCESS_TOKEN] npm start

Currently, there is no way to update the access token without restarting the
hackbot. You can set the port for the HTTP server using the `PORT` environment
variable.

To generate the docs:

    $ npm run doc
    $ open doc/index.html

Logs are stored in `log/` and are rotated daily. To view the logs:

    $ npm run log

## Adding Filters

Filters are the fundamental units of extension for hackbot.

You can add thread filters under the `lib/filters` directory. An [example
closed thread filter][close-file] is provided.

Filters are functions that receive an array of posts, representing a
post/comment thread on the Facebook Group. Items of the array are [Post
objects][post-file] where the first item is the original post.

If you add a filter, make sure to add its exported function to the `filters`
array in the [index file][index-file].

[close-file]: https://github.com/kern/hackbot/blob/master/lib/filters/close.js
[post-file]: https://github.com/kern/hackbot/blob/master/lib/Post.js
[index-file]: https://github.com/kern/hackbot/blob/master/lib/index.js

## Contributors

Made with caffeine at [MHacks V][mhacks] by [Alex Kern][kern-twitter] and [Eva
Zheng][eva-twitter].

[mhacks]: http://mhacks.org
[kern-twitter]: https://twitter.com/KernCanCode
[eva-twitter]: https://twitter.com/evadoraz

## License

[MIT][license]. Contributions welcome!

[license]: https://github.com/kern/hackbot/blob/master/LICENSE
