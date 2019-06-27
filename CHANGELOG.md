# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 4.2.0 - 2019-06-26
### Added
- Automatically unfollow follow type giveaways (#105)[https://github.com/jpchip/giveaway-grabber/issues/105]
### Fixed
- Enter captcha presented at login(#110)[https://github.com/jpchip/giveaway-grabber/issues/110]


## 4.1.0 - 2019-06-16
### Added
- Enter winner promo card giveaways (#96)[https://github.com/jpchip/giveaway-grabber/issues/96]
- Log entries skipped for being below minimum price
### Fixed
- Make sure url saved is always the url for the entry on the giveaways screen (#104)[https://github.com/jpchip/giveaway-grabber/issues/104]

## 4.0.1 - 2019-06-08
### Fixed
- Readme typos
### Security
- Update version of Puppeteer


## 4.0.0 - 2019-06-08
### Added
- Adds database to monitor entries (#74)[https://github.com/jpchip/giveaway-grabber/issues/74]
### Security
- Update version of Tesseract to resolve security vulnerabilities

## 3.5.0 - 2019-06-04
### Added
- Add ability to enter follow type giveaways (#11)[https://github.com/jpchip/giveaway-grabber/issues/11]


## 3.4.1 - 2019-05-28
### Added
- Update readme with info about chromium on macs
- Set default minimum price to 0 (#90)[https://github.com/jpchip/giveaway-grabber/issues/90]

## 3.4.0 - 2019-05-22
### Added
- Add ability to specify minimum price


## 3.3.0 - 2019-05-13
### Added
- Add ability to point to custom install of Chrome
- Add Support for Amazon Video Entries (#81)[https://github.com/jpchip/giveaway-grabber/issues/81]



## 3.2.0 - 2019-04-26
### Added
- Remember me option (#57)[https://github.com/jpchip/giveaway-grabber/issues/57] (#36)[https://github.com/jpchip/giveaway-grabber/issues/36]


## 3.1.0 - 2019-04-25
### Added
- Disable audio by default (#71)[https://github.com/jpchip/giveaway-grabber/issues/71]


## 3.0.1 - 2019-04-18
### Fixed
- Handle Sign in buttons (#66)[https://github.com/jpchip/giveaway-grabber/issues/66]

## 3.0.0 - 2019-04-18
### Added
- Added configuration via config file instead of .env (#40)[https://github.com/jpchip/giveaway-grabber/issues/40]
- Add contributing guide and code of conduct

Migration Guide:

Run `npm install`. Then run `gg init` or `npm start -- init` to create a config file. Delete your .env file.

## 2.9.0 - 2019-04-18
### Added
- Automatically enter captchas (#62)[https://github.com/jpchip/giveaway-grabber/issues/62]


## 2.8.0 - 2019-04-17
### Fixed
- Handle both possible layouts for giveaways (#66)[https://github.com/jpchip/giveaway-grabber/issues/66]


## 2.7.3 - 2019-04-17
### Fixed
- Fix issue preventing box being found (#66)[https://github.com/jpchip/giveaway-grabber/issues/66]


## 2.7.2 - 2019-04-11
### Fixed
- Fix issue where it would keep skipping giveaways after one wasn't found (#53)[https://github.com/jpchip/giveaway-grabber/issues/53]


## 2.7.1 - 2019-04-11
### Fixed
- If clicking box fails, give it one more try before moving on (#38)[https://github.com/jpchip/giveaway-grabber/issues/38]
- Catch navigation errors (#48)[https://github.com/jpchip/giveaway-grabber/issues/48]
- Check if on switch account page in more places (#49)[https://github.com/jpchip/giveaway-grabber/issues/49]


## 2.7.0 - 2019-03-31
### Fixed
- Blacklist matches whole words (#43)[https://github.com/jpchip/giveaway-grabber/issues/43]
### Added
- can send email on win via sendgrid (#44)[https://github.com/jpchip/giveaway-grabber/issues/44]


## 2.6.1 - 2019-03-29
### Fixed
- Include blacklisted keyword in console (#22)[https://github.com/jpchip/giveaway-grabber/issues/22]
- Clarify blacklisting in readme

## 2.6.0 - 2019-03-29
### Added
- added ability to blacklist by keywords (#22)[https://github.com/jpchip/giveaway-grabber/issues/22]


## 2.5.0 - 2019-03-27
### Added
- winning sends system notification (#30)[https://github.com/jpchip/giveaway-grabber/issues/30]
- winning also logs current url to make it easier to find

## 2.4.0 - 2019-03-16
### Added
 - installed latest versions of all dependencies
 - added Prettier
 - add prestart script to automatically install new dependencies

## 2.3.0 - 2019-03-15
### Added
 - captcha sends system notification (#26)[https://github.com/jpchip/giveaway-grabber/issues/26]

## 2.2.1 - 2019-02-28
### Fixed
- Update readme to include section about CAPTCHAs (#19)[https://github.com/jpchip/giveaway-grabber/issues/19]
- Fix selector for giveaways (#24)[https://github.com/jpchip/giveaway-grabber/issues/24]

### Added
 - Remove time limit on 2FA entry
 - Checks for password re-entry request while waiting for box


## 2.2.0 - 2019-02-23
### Fixed
- Error when at end of available sweep pages (#23)[https://github.com/jpchip/giveaway-grabber/issues/23]

### Added
 - captcha pauses until user enters input (#19)[https://github.com/jpchip/giveaway-grabber/issues/19]
 - Script logs in directly to giveaways page

## 2.1.0 - 2019-02-11
### Added
- Support for two factor authentication (#16)[https://github.com/jpchip/giveaway-grabber/issues/16]


## 2.0.0 - 2019-02-05
### Fixed
- Updates for refactored Amazon pages (#15)[https://github.com/jpchip/giveaway-grabber/issues/15]


## 1.0.1 - 2018-12-19
### Fixed
- UnhandledPromiseRejectionWarning: TypeError: text is not iterable (#13)[https://github.com/jpchip/giveaway-grabber/issues/13]

## 1.0.0 - 2018-12-08
### Fixed
- Handle video entries
- Handle re-sign in checks
- Various bug fixes and code cleanup

### Added
- cli installation option
- Can specify page to start on

## 0.2.0 - 2018-12-04
### Fixed
- Took out ability to run headless, as it doesn't work
- Add error handler in case box click fails

## 0.1.1 - 2018-12-04
### Fixed
- Start on First Page

## 0.1.0 - 2018-12-04
### Added
- add page iteration
- tells you if you didn't win
- ability to run headless or not

## 0.0.1 - 2018-12-03
### Added
- This CHANGELOG file
- Basic working script
- README file
