# Contributing

We love pull requests from everyone. By participating in this project, you
agree to abide by the project's [code of conduct](./CODE_OF_CONDUCT.md).

## Fork, then clone the repo:

    git clone git@github.com:<your-username>/giveaway-grabber.git;

## Set up your machine:
    
Install [Node.js](https://nodejs.org/en/) (>=10.0.0), npm version 3+. Then install dependencies:
    
    npm install

## Make your change

You can run the script locally with `npm start`. Note that options 
must be passed with an extra `--`, like:

```
npm start -- --page=34
```

Add tests for your change, if possible.

Make sure the tests pass:

    npm test

Lint your code:

      npm run lint

Push to your fork and [submit a pull request][pr].

[pr]: https://github.com/jpchip/giveaway-grabber/compare

At this point you're waiting on us. We may suggest some changes or improvements or alternatives.

Some things that will increase the chance that your pull request is accepted:

* Write tests.
* Write a description in the pull request explaining why you did what you did.
* Write a [good commit message][commit].

[commit]: http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html
