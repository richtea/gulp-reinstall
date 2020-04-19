# gulp-reinstall

Automatically install npm, bower, tsd, typings, composer and pip packages/dependencies if the relative configurations are found in the gulp file stream.

<!-- TOC depthfrom:2 updateonsave:false -->

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
- [License](#license)

<!-- /TOC -->

| File Found         | Command run                       |
| ------------------ | --------------------------------- |
| `package.json`     | `npm install`                     |
| `bower.json`       | `bower install`                   |
| `tsd.json`         | `tsd reinstall --save`            |
| `typings.json`     | `typings install`                 |
| `composer.json`    | `composer install`                |
| `requirements.txt` | `pip install -r requirements.txt` |

It will run the command in the directory it finds the file, so if you have configs nested in a lower directory than your `gulpfile.js`, this will still work.

**NOTE** gulp-reinstall requires at least NodeJS version 8.3.

## Primary objective

Used for installing NPM packages as part of a Gulp build. This package is inspired by (and parts are based on) [gulp-install](https://github.com/slushjs/gulp-install). The original plugin appears no longer maintained, and needed to be updated to remove some warnings from `npm audit`. This rewrite also reduces the number of package dependencies to avoid similar problems in future.

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

**Type:** `Array|String|Object`

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

Set to `true` if invocations of `npm install` should be appended with the `--ignore-scripts` parameter. Useful for skipping `postinstall` scripts with `npm`.

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

Set to `true` if `npm install` should be appended with the `--no-optional` parameter which will prevent optional dependencies from being installed.

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

**Type:** `Array or String`

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

## License

Licensed under the [MIT License](./LICENSE).