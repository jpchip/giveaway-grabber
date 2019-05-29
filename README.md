[![npm version](https://badge.fury.io/js/giveaway-grabber.svg)](https://badge.fury.io/js/giveaway-grabber)

# giveaway-grabber 🎁

This script will loop through all the [Amazon giveaways](https://www.amazon.com/ga/giveaways/) and try to submit entries for them.

If there are things you really never want to win (like socks), you can add keywords to the blacklist in the config file
and the script will always skip those entries.

I wanted a reason to experiment with [Puppeteer](https://github.com/GoogleChrome/puppeteer), so here goes.

Note: does not support entries that require following someone. Some video giveaways require
using Chrome instead of Chromium, see **chromeExecutablePath** section below.

## Installation

Prerequisites: [Node.js](https://nodejs.org/en/) (>=10.0.0), npm version 3+.

You can install giveaway-grabber using npm:

```bash
npm install -g giveaway-grabber
```

You should then set up a configuration file:

```bash
gg init
```

Follow the step by step instructions, which will create a `.ggrc.json` file in your current directory.

## Usage

Run the script with:

```bash
gg
```

Note that the script will crash if the Chrome window is minimized! Check the console to monitor progress.


Other available commands:

| Command  | Description |
| ------------- | ------------- |
| `gg help` | Lists available commands and their descriptions.  |
| `gg --version` | Outputs gg CLI version.  |
| `gg --page=[number]` | Starts script on given page number (eg. `gg --page=34`) |
| `gg --config==[string]` | Specify path to JSON config file (eg. `gg --config=/var/myconfig.json`) |

If you would rather have the output write to a file then stdout, pipe it like:

`gg > gg.log 2>&1`

## Configuration

After running `gg init`, you'll have a `.ggrc.json` file in your directory. It will look like this:

```json
{
  "username": "test@example.com",
  "password": "123456",
  "2FA": false,
  "remember_me": false,
  "sendgrid_api_key": "",
  "sendgrid_cc": "",
  "blacklist": "floss,socks,ties",
  "chromeExecutablePath": "",
  "minimum_price": 10
}
```

| Option  | Description |
| ------------- | ------------- |
| username  | Your Amazon Account Email Address  |
| password  | Your Amazon Account Password  |
| 2FA | Set true if you have two factor authentication enabled. Defaults to false. |
| remember_me | Set true if you want to stay logged in between running scripts. Defaults to false. |
| sendgrid_api_key | Your [sendgrid](https://sendgrid.com/) API key, if you want to receive an email when you win. Optional |
| sendgrid_cc | An email address to be cc'ed if you win |
| blacklist | Comma delimited list of keywords to avoid when entering giveaways. Optional |
| chromeExecutablePath | Path to your own install of Chrome. Optional |
| minimum_price | Skip the giveaways with items with price lower than the minimum price |
### Two factor Authentication (2FA)

If you have two factor authentication enabled, set the `2FA` option. The script will wait for you to enter your code.

If you set `remember_me` to true, you should only have to enter your two factor code the first time you start the script.

### Blacklist

If there are types of giveaways you always want to skip, you can add a comma separated list of keywords
to the blacklist.

Keywords are case insensitive.

The console will let you know when it skips giveaways that you marked as blacklisted like `giveaway 5 is blacklisted [kindle edition].`

### Emails

If you want to receive an email notification on winning, sign up for a free [sendgrid](https://sendgrid.com/) account and
add the API key to your `.ggrc.json` file. Set `sendgrid_cc` to CC the winning email to another address.

### chromeExecutablePath

You can point to an existing install of Chrome using chromeExecutablePath:

On Windows:
```
"chromeExecutablePath" : "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
```
On MacOS:
```
"chromeExecutablePath" : "../../Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
```

This is required if you want to be able to enter all video giveaways. Chromium, which Puppeteer
uses by default, does not support some of the video types used. The script will work fine without it,
but it will only enter video giveaways with YouTube videos.

## CAPTCHAs

Every so often Amazon will present a CAPTCHA. The script will attempt to enter it automatically, but if it fails, it will
pause and wait for you to enter it. The console will warn you with an `ENTER CAPTCHA!` message,
and you **should** get a system notification (only tested it on Windows 10).

## Winning

If you are lucky enough to win, you should get a system notification and the url to
the page will be logged like `Winning Entry URL: https://amazon.com/ga/p/335..`.

If you set your `sendgrid_api_key` you'll also receive an email.

### Good luck!

## Development

Clone this repo, and you run the script locally with `npm start`. Note that options
must be passed with an extra `--`, like:

```
npm start -- --page=34
```

You can run the tests with:

```bash
npm test
```

and lint the code with:

```bash
npm run lint
```

We love pull requests from everyone! See the [Contributing Doc](./CONTRIBUTING.md) for more info.

## Questions

If you have any questions, just [open an issue](https://github.com/jpchip/giveaway-grabber/issues/new).

## Disclaimer

This project is not associated with Amazon in any way. I just created it for my own experimentation, so use at your own risk.
