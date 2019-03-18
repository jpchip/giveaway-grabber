# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
