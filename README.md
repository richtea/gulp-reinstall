# gulp-reinstall

gulp-reinstall is a [gulp](https://github.com/gulpjs/gulp) plugin to automatically install npm, bower, tsd, typings,
composer and pip packages/dependencies.

[![NPM](https://nodei.co/npm/gulp-reinstall.png)](https://nodei.co/npm/gulp-reinstall/)

![CI build](https://github.com/richtea/gulp-reinstall/workflows/CI%20build/badge.svg)
[![devDependency Status](https://david-dm.org/richtea/gulp-reinstall/dev-status.svg)](https://david-dm.org/richtea/gulp-reinstall#info=devDependencies)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/richtea/gulp-reinstall/blob/master/LICENSE)

<!-- TOC depthfrom:2 updateonsave:false -->

- [Overview](#overview)
- [Usage](#usage)
- [Options](#options)
  - [options.commands](#optionscommands)
  - [options.production](#optionsproduction)
  - [options.ignoreScripts](#optionsignorescripts)
  - [options.noOptional](#optionsnooptional)
  - [options.allowRoot](#optionsallowroot)
  - [options.args](#optionsargs)
  - [options.\<command-name>](#options%5Ccommand-name)
- [Credits](#credits)
- [Contributing](#contributing)
  - [Getting started](#getting-started)
  - [Release process](#release-process)
- [License](#license)

<!-- /TOC -->

## Overview

gulp-reinstall runs package install commands based on the files found in a vinyl stream. The filename determines
the command that is run.

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

**NOTE** gulp-reinstall requires at least NodeJS 8.3.

## Usage

```javascript
var reinstall = require('gulp-reinstall');

gulp.src(['./bower.json', './package.json']).pipe(reinstall());
```

## Options

### options.commands

**Type:** `Object`

**Default:** `null`

Use this option to add or override the command to be run for a particular filename.

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
      yarn: ['install', '--ignore-scripts', '--force']
    })
  ); // yarn install --ignore-scripts --force
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
  // npm install --production
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
  // npm install --ignore-scripts
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
  // npm install --no-optional
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
  // bower install --allow-root
  .pipe(reinstall({ allowRoot: true }));
```

### options.args

**Type:** `Array | String`

**Default:** `undefined`

Specify additional arguments that will be passed to all install command(s).

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

### options.\<command-name>

**Type:** `Array | String | Object`

**Default:** `null`

Use this to specify additional arguments for a particular command.

**Example:**

```javascript
var reinstall = require('gulp-reinstall');

gulp
  .src(__dirname + '/templates/**')
  .pipe(gulp.dest('./'))
  .pipe(
    reinstall({
      // Either a single argument as a string
      npm: '--production',
      // Or arguments as an object (transformed using Dargs: https://www.npmjs.com/package/dargs)
      bower: { allowRoot: true },
      // Or arguments as an array
      pip: ['--target', '.']
    })
  );
```

## Credits

This plugin is inspired by [gulp-install](https://github.com/slushjs/gulp-install), and significant parts
of the source code owe a debt to that plugin, although the main plugin logic is largely rewritten.

The `gulp-install` plugin appears to be no longer maintained, and is dependent on the now-deprecated
`gulp-util` package. gulp-reinstall removes that dependency, and also reduces the number of package
dependencies to avoid `npm audit` problems in future.

## Contributing

Contributions are very welcome! The rest of this section describes how to set yourself up for developing gulp-reinstall.

### Getting started

Just clone the repo locally and start hacking.

### Release process

The release process is driven by [release-it](https://github.com/release-it/release-it). First you create a draft
GitHub release locally by using `release-it`, then you publish the release through the GitHub web UI.

To create a draft release:

1. On your local computer, checkout the `master` branch.
2. Run `npm run release` with the options you want, then follow the prompts. The two most useful options are `--dry-run`
   and `--preRelease=alpha` (or whatever the pre-release version is). Note that you need to add `--` before any release-it
   arguments.

Example:

```shell
npm run release -- --dry-run --preRelease=alpha
```

The release-it settings are configured to create a draft release on GitHub. Once the release is published within GitHub,
an [automated workflow](.github/workflows/npmpublish.yml) publishes the package to the `npm` repository.

Note: in order to run the release process, you need to set up the `RELEASEMGMT_GITHUB_API_TOKEN` environment variable
on your local computer. This should contain a GitHub PAT with the appropriate permissions - see the
[release-it documentation](https://github.com/release-it/release-it/blob/master/docs/github-releases.md) for more details.

## License

Licensed under the [MIT License](./LICENSE).
