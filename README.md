# Moovie
> An advanced HTML5 video player for MooTools.

[![Build Status][build-image]][build-url]
[![Code GPA][gpa-image]][gpa-url]
[![Test Coverage][coverage-image]][coverage-url]
[![devDependency Status][dependencies-image]][dependencies-url]
[![Bower Version][bower-image]][bower-url]
[![NPM version][npm-image]][npm-url]

## Getting Started

### Using Bower
_If you haven't used [Bower](http://bower.io/) before, be sure to check out their [Getting Started](http://bower.io/#getting-started) guide._

From the same directory as your project's _bower.json_, install Moovie with the following command:

```bash
bower install Moovie
```

Once that's done, add this line to your HTML file:

```html
<script src="/bower_components/Moovie/dist/moovie.min.js"></script>
```

## Usage
Dynamically create a Moovie instance with a subtitles and a title, then add to DOM.

```js
var player = new Moovie({
    debug: true,
    src: '/assets/avatar_2008.mp4',
    title: 'Avatar (2008)'
    tracks: [{
        kind: 'subtitles',
        src: '/assets/avatar_2008.vtt',
        srclang: 'en',
        default: true,
        label: 'English Subtitles'
    }]
});

$(player).inject(document.body);
```

Convert an existing `<video>` element to a Moovie instance and add a playlist.

```js
$('my-video').Moovie({
    debug: true,
    playlist: '/playlist.json'
});
```

See the [Wiki]() for more exmaples.

## Tasks
Before using any of the following tasks you must run the following commands:

```bash
npm install -g grunt-cli karma-cli bower
```

```bash
npm install && bower install
```

* `grunt build` creates a distributable copy and a minified copy from the source code (saved in the `./dist/` directory).
* `grunt test` will lint source code, create coverage reports and run Karma in CI mode.
* `grunt start` does the same as `grunt test` but monitors the source code for changes, on the fly.
* `grunt release` will update the versions in _bower.json_ and _package.json_, tag a commit with a [Semver]() _patch_ and push to GitHub.

## Tests
This project uses [Mocha](http://mochajs.org/), [Chai](http://chaijs.com/) and [Sinon](http://sinonjs.org/) for testing and all tests/coverage reports can be found in the `./tests/` directory.

## Contributing
1. Fork this repository!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push your branch: `git push origin my-new-feature`
5. Submit a pull request.

## Changelog
Changes will not be recorded until Moovie has officially been released

## Contributors
* Colin Aarts <colin@colinaarts.com>
* Nathan Bishop <nbish11@hotmail.com>

## License
The MIT License (MIT)

Copyright (c) 2010 Colin Aarts

[build-url]: https://travis-ci.org/nbish11/microjs
[build-image]: http://img.shields.io/travis/nbish11/microjs.png

[gpa-url]: https://codeclimate.com/github/nbish11/microjs
[gpa-image]: https://codeclimate.com/github/nbish11/microjs.png

[coverage-url]: https://codeclimate.com/github/nbish11/microjs/code?sort=covered_percent&sort_direction=desc
[coverage-image]: https://codeclimate.com/github/nbish11/microjs/coverage.png

[dependencies-url]: https://david-dm.org/nbish11/microjs#info=devDependencies
[dependencies-image]: https://david-dm.org/nbish11/microjs/dev-status.svg

[issues-url]: https://github.com/nbish11/microjs/issues
[issues-image]: http://img.shields.io/github/issues/nbish11/microjs.png

[bower-url]: http://bower.io/search/?q=microjs
[bower-image]: https://badge.fury.io/bo/microjs.png

[npm-url]: https://www.npmjs.org/package/microjs
[npm-image]: https://badge.fury.io/js/microjs.png
