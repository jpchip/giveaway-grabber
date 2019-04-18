[![npm version](https://badge.fury.io/js/giveaway-grabber.svg)](https://badge.fury.io/js/giveaway-grabber)

# giveaway-grabber 🎁

This script will loop through all the [Amazon giveaways](https://www.amazon.com/ga/giveaways/) and try to submit entries for them. 

I wanted a reason to experiment with [Puppeteer](https://github.com/GoogleChrome/puppeteer), so here goes.

Note: does not support entries that require following someone.

## Installation

You can install giveaway-grabber using npm:

```bash
$ npm install -g giveaway-grabber
```

Or, you can clone this repo and run via `npm start`.

## Usage

As CLI:

```bash
$ gg --username=fake@example.com --password=123456
```

If cloned:

Copy .env.example to .env, adding your own Amazon username and password.

```bash
$ npm start
```

Note that the script will crash if the Chrome window is minimized! Check the console to monitor feedback.

If it does happen to die, re-start it on any page like:

```bash
$ gg --username=fake@example.com --password=123456 --page=34
```

OR:

```bash
$ npm start -- --page=34
```

### Two factor authentication

If you have two factor authentication enabled, add `--2FA` flag:

```bash
$ gg --username=fake@example.com --password=123456 --2FA
```

OR:

```bash
$ npm start -- --2FA
```

The script will wait for you to enter your code. 

### CAPTCHAs

Every so often Amazon will present a CAPTCHA. The script will attempt to enter it automatically, but if it fails, it will 
pause and wait for you to enter it. The console will warn you with an `ENTER CAPTCHA!` message,
and you **should** get a system notification (only tested it on Windows 10).

### Blacklist

If there are types of giveaways you always want to skip, you can add a comma separated list of keywords 
to a blacklist.

```bash
$ gg --username=fake@example.com --password=123456 --blacklist="perfume,kindle edition,floss"
```

or if cloned, add them to your `.env` file like `BLACKLIST="perfume,kindle edition,floss"`.

Keywords are case insensitive.

The console will let you know when it skips giveaways that you marked as blacklisted like `giveaway 5 is blacklisted [kindle edition].`

### Winning

If you are lucky enough to win, you should get a system notification and the url to
the page will be logged like `Winning Entry URL: https://amazon.com/ga/p/335..`.

#### Emails

If you want to also receive an email notification, sign up for a free [sendgrid](https://sendgrid.com/) account and 
add the API key to the .env file like `SENDGRID_API_KEY="YOUR_API_KEY_HERE"` or cli command:

```bash
$ gg --username=fake@example.com --password=123456 --SENDGRID_API_KEY="YOUR_KEY_HERE"
```


### Good luck!

## Questions

If you have any questions, just [open an issue](https://github.com/jpchip/giveaway-grabber/issues/new).

## Disclaimer

This project is not associated with Amazon in any way. I just created it for my own experimentation, so use at your own risk.
