<img src="https://raw.githubusercontent.com/kern/hackbot/master/resources/logo.png" alt="hackbot" width="360" />

Hackbot adds features to Facebook Groups through automation.

An instance of hackbot is running on [Hackathon Hackers](https://facebook.com/groups/hackathonhackers).

## Installation

### 1. Get a Facebook access token

You'll need to set a few configuration options before using the hackbot in
`config.json`. Add your Facebook Group ID, the refresh rate in milliseconds,
and the IDs of the group's moderators to the configuration file.

To generate an access token, open up the [Facebook Graph API
Explorer][explorer] and make sure you're using a custom application. Click "Get
Access Token" and make sure the `user_managed_groups` and `publish_actions`
permissions are ticked.

<img src="https://raw.githubusercontent.com/kern/hackbot/master/resources/user_managed_groups.png" alt="user_managed_groups permission" width="555" />

<img src="https://raw.githubusercontent.com/kern/hackbot/master/resources/publish_actions.png" alt="publish_actions permission" width="555" />

Click the blue "Get Access Token" in the modal. Copy the
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

### 2. Collect the Graph IDs of your group's moderators

You can use the [Graph API Explorer][explorer] to find the numeric Graph API
IDs of your group's moderators.

[explorer]: https://developers.facebook.com/tools/explorer/

### 3. Install Hackbot

    $ npm install -g hackbot

## Usage

There will be *much* better usage documentation coming soon, but here's how it works:

    $ hackbot GROUP_ID ACCESS_TOKEN -m MOD_ID1,MOD_ID2,MOD_ID3 -s close,delete --interval 5

## Development

Hackbot uses [JavaScript Standard Style](https://github.com/feross/standard) and [Babel](https://babeljs.io/) for ES6+ support.

    $ git clone git@github.com:pavlovml/gallup.git
    $ npm install
    $ npm run dev -- [see usage above]

Lint before committing:

    $ npm run lint

## License & Acknowledgements

Hackbot is released under the [BSD 3-Clause][license] license. The initial
prototype was made with caffeine at [MHacks V][mhacks] by [Alex
Kern][kern-twitter] and [Eva Zheng][eva-twitter].

[license]: https://github.com/kern/hackbot/blob/master/LICENSE
[mhacks]: http://mhacks.org
[kern-twitter]: https://twitter.com/KernCanCode
[eva-twitter]: https://twitter.com/evadoraz
