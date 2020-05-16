# gulp-reinstall

![CI build](https://github.com/richtea/gulp-reinstall/workflows/CI%20build/badge.svg)

A Gulp plugin to automatically install npm, bower, tsd, typings, composer and pip packages/dependencies.

<!-- TOC depthfrom:2 updateonsave:false -->

- [Overview](#overview)
- [Primary objective](#primary-objective)
- [Installation](#installation)
- [Usage](#usage)
- [Options](#options)
  - [options.`<command>`](#optionscommand)
  - [options.commands](#optionscommands)
  - [options.production](#optionsproduction)
  - [options.ignoreScripts](#optionsignorescripts)
  - [options.noOptional](#optionsnooptional)
  - [options.allowRoot](#optionsallowroot)
  - [options.args](#optionsargs)
- [Contributing](#contributing)
  - [Getting started](#getting-started)
  - [Release process](#release-process)
- [License](#license)

<!-- /TOC -->

## Overview

`gulp-reinstall` is a Gulp plugin that runs commands based on the files found in a vinyl stream. The filename
determines the command that is run.

The default settings are:

| File Found         | Command run                       |
| ------------------ | --------------------------------- |
| `package.json`     | `npm install`                     |
| `bower.json`       | `bower install`                   |
| `tsd.json`         | `tsd reinstall --save`            |
| `typings.json`     | `typings install`                 |
| `composer.json`    | `composer install`                |
| `requirements.txt` | `pip install -r requirements.txt` |

It will run the command in the directory it finds the file, so if you have configs nested in a lower
directory than your `gulpfile.js`, this will still work.

**NOTE** `gulp-reinstall` requires at least NodeJS 8.3.

## Primary objective

Used for installing NPM packages as part of a Gulp build.

This plugin is inspired by [gulp-install](https://github.com/slushjs/gulp-install), and significant parts
of the source code owe a debt to that plugin, although the main plugin logic is largely rewritten.

The `gulp-install` plugin appears to be no longer maintained, and is dependent on the now-deprecated
`gulp-util` package. This replacement plugin removes that dependency, and also reduces the number of package
dependencies to avoid `npm audit` problems in future.

## Installation

Install `gulp-reinstall` as a development dependency:

```shell
npm install --save-dev gulp-reinstall
```

## Usage

```javascript
var reinstall = require('gulp-reinstall');

gulp.src(['./bower.json', './package.json']).pipe(reinstall());
```

## Options

### options.`<command>`

**Type:** `Array | String | Object`

**Default:** `null`

Use this option(s) to specify any arguments for any command, e.g:

```javascript
var reinstall = require('gulp-reinstall');

gulp
  .src(__dirname + '/templates/**')
  .pipe(gulp.dest('./'))
  .pipe(
    reinstall({
      npm: '--production', // Either a single argument as a string
      bower: { allowRoot: true }, // Or arguments as an object (transformed using Dargs: https://www.npmjs.com/package/dargs)
      pip: ['--target', '.'] // Or arguments as an array
    })
  );
```

### options.commands

**Type:** `Object`

**Default:** `null`

Use this option to add any command to be run for any file, e.g:

```javascript
var reinstall = require('gulp-reinstall');

gulp
  .src(__dirname + '/templates/**')
  .pipe(gulp.dest('./'))
  .pipe(
    reinstall({
      commands: {
        'package.json': 'yarn'
      },
      yarn: ['--extra', '--args', '--here']
    })
  );
```

### options.production

**Type:** `Boolean`

**Default:** `false`

Set to `true` if invocations of `npm install` and `bower install` should be appended with the `--production` parameter.

**Example:**

```javascript
var reinstall = require('gulp-reinstall');

gulp
  .src(__dirname + '/templates/**')
  .pipe(gulp.dest('./'))
  .pipe(reinstall({ production: true }));
```

### options.ignoreScripts

**Type:** `Boolean`

**Default:** `false`

Set to `true` if invocations of `npm install` should be appended with the `--ignore-scripts` parameter. Useful
for skipping `postinstall` scripts with `npm`.

**Example:**

```javascript
var reinstall = require('gulp-reinstall');

gulp
  .src(__dirname + '/templates/**')
  .pipe(gulp.dest('./'))
  .pipe(reinstall({ ignoreScripts: true }));
```

### options.noOptional

**Type:** `Boolean`

**Default:** `false`

Set to `true` if invocations of `npm install` should be appended with the `--no-optional` parameter, which will
prevent optional dependencies from being installed.

**Example:**

```javascript
var reinstall = require('gulp-reinstall');

gulp
  .src(__dirname + '/templates/**')
  .pipe(gulp.dest('./'))
  .pipe(reinstall({ noOptional: true }));
```

### options.allowRoot

**Type:** `Boolean`

**Default:** `false`

Set to `true` if invocations of `bower install` should be appended with the `--allow-root` parameter.

**Example:**

```javascript
var reinstall = require('gulp-reinstall');

gulp
  .src(__dirname + '/templates/**')
  .pipe(gulp.dest('./'))
  .pipe(reinstall({ allowRoot: true }));
```

### options.args

**Type:** `Array | String`

**Default:** `undefined`

Specify additional arguments that will be passed to the install command(s).

**Example:**

```javascript
var reinstall = require('gulp-reinstall');

gulp
  .src(__dirname + '/templates/**')
  .pipe(gulp.dest('./'))
  .pipe(
    reinstall(
      {
        args: ['dev', '--no-shrinkwrap']
      } // npm install --dev --no-shrinkwrap
    )
  );
```

## Contributing

### Getting started

Just clone the repo locally and start hacking.

### Release process

The release process is handled by using [Release-It!](https://github.com/release-it/release-it)

To trigger a draft release:

1. Checkout the `master` branch.
2. Run `npm run release` with the options you want, then follow the prompts. The two most useful options are `--dry-run`
   and `--preRelease=alpha` (or whatever the pre-release version is).

The above will create a draft release on GitHub. Once the release is published within GitHub, an automated workflow publishes
the package to the `npm` repository.

Note: to run the release process, you need to set up the `RELEASEMGMT_GITHUB_API_TOKEN` environment variable with
a GitHub PAT with the appropriate permissions - see the
[release-it documentation](https://github.com/release-it/release-it/blob/master/docs/github-releases.md) for more details.

## License

Licensed under the [MIT License](./LICENSE).
