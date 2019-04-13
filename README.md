[![npm version](https://badge.fury.io/js/giveaway-grabber.svg)](https://badge.fury.io/js/giveaway-grabber)

# giveaway-grabber 🎁

This script will loop through all the [Amazon giveaways](https://www.amazon.com/ga/giveaways/) and try to submit entries for them. 

If there are things you really never want to win (like socks), you can add them to the blacklist
and the script will always skip those entries.

I wanted a reason to experiment with [Puppeteer](https://github.com/GoogleChrome/puppeteer), so here goes.

Note: does not support entries that require following someone.

## Installation

Prerequisites: [Node.js](https://nodejs.org/en/) (>=10.0.0), npm version 3+.

You can install giveaway-grabber using npm:

```bash
$ npm install -g giveaway-grabber
```

You should then set up a configuration file:

```bash
$ gg init
```

Follow the step by step instructions, which will create a `.ggrc.json` file in your current directory.

## Usage

Run the script with:

```bash
$ gg 
```

Note that the script will crash if the Chrome window is minimized! Check the console to monitor progress.


Other available commands:

| Command  | Description |
| ------------- | ------------- |
| `gg help` | 	Lists available commands and their descriptions.  |
| `gg --version` | Outputs gg CLI version.  |
| `gg --page=[number]` | Starts script on given page number (eg. `gg --page=34`) |
| `gg --config==[string]` | Specify path to JSON config file (eg. `gg --config=/var/myconfig.json`) |

## Configuration

After running `gg init`, you'll have a `.ggrc.json` file in your directory. It will look like this:

```json
{
  "username": "test@example.com",
  "password": "123456",
  "2FA": false,
  "sendgrid_api_key": "",
  "blacklist": "floss,socks,ties"
}
```

| Option  | Description |
| ------------- | ------------- |
| username  | Your Amazon Account Email Address  |
| password  | Your Amazon Account Password  |
| 2FA | Set true if you have two factor authentication enabled |
| sendgrid_api_key | Your [sendgrid](https://sendgrid.com/) API key, if you want to receive an email when you win. Optional |
| sendgrid_cc | An email address to be cc'ed if you win |
| blacklist | Comma delimited list of keywords to avoid when entering giveaways. Optional |

### Two factor Authentication (2FA)

If you have two factor authentication enabled, set the `2FA` option. The script will wait for you to enter your code. 

### Blacklist

If there are types of giveaways you always want to skip, you can add a comma separated list of keywords 
to the blacklist.

Keywords are case insensitive.

The console will let you know when it skips giveaways that you marked as blacklisted like `giveaway 5 is blacklisted [kindle edition].`


### CAPTCHAs

Every so often Amazon will present a CAPTCHA. The script will pause at this 
point and wait for you to enter it. The console will warn you with an `ENTER CAPTCHA!` message,
and you **should** get a system notification (only tested it on Windows 10).


### Winning

If you are lucky enough to win, you should get a system notification and the url to
the page will be logged like `Winning Entry URL: https://amazon.com/ga/p/335..`.

#### Emails

If you want to also receive an email notification, sign up for a free [sendgrid](https://sendgrid.com/) account and 
add the API key to your `.ggrc.json` file.

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

## Questions

If you have any questions, just [open an issue](https://github.com/jpchip/giveaway-grabber/issues/new).

## Disclaimer

This project is not associated with Amazon in any way. I just created it for my own experimentation, so use at your own risk.
