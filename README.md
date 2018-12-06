# giveaway-grabber 💰

This script will loop through all your Amazon giveaways and try to submit entries for them. 

Wanted a reason to experiment with puppeteer, so here goes.

## Installing/Getting started

Copy .env.example to .env, adding your own Amazon username and password.

```bash
$ npm install
$ npm start
```

Note that script will stop if window is minimized! Check the console to monitor feedback.

If it does happen to die, restart it on any page like:

```bash
$ npm start -- --page=34
```
