const { Transform } = require('stream');
const logger = require('gulplog');
const PluginError = require('plugin-error');
const path = require('path');
const dargs = require('dargs');
const { default: PQueue } = require('p-queue');

const commandRunner = require('./lib/command-runner');

const PLUGIN_NAME = 'gulp-reinstall';

const installCommands = {
  tsd: ['reinstall', '--save'],
  bower: ['install', '--config.interactive=false'],
  npm: ['install'],
  pip: ['install', '-r', 'requirements.txt'],
  composer: ['install'],
  typings: ['install'],
};

const defaultFileToCommand = {
  'tsd.json': 'tsd',
  'bower.json': 'bower',
  'package.json': 'npm',
  'requirements.txt': 'pip',
  'composer.json': 'composer',
  'typings.json': 'typings',
};

const noop = () => {};

function transfob(transform, flush) {
  const t2 = new Transform({
    objectMode: true,
  });
  // eslint-disable-next-line no-underscore-dangle
  t2._transform = transform;
  if (flush) {
    // eslint-disable-next-line no-underscore-dangle
    t2._flush = flush;
  }
  return t2;
}

function gulpReinstall(opts = {}, done = noop) {
  if (typeof opts === 'function') {
    // eslint-disable-next-line no-param-reassign
    done = opts;
    // eslint-disable-next-line no-param-reassign
    opts = {};
  }
  const fileToCommand = { ...defaultFileToCommand, ...opts.commands };
  const queue = new PQueue({ concurrency: 1 });

  function generateCommand(file) {
    const installCmd = fileToCommand[path.basename(file.path)];
    if (installCmd) {
      const cmd = {
        cmd: installCmd,
        args: (installCommands[installCmd] || []).slice(),
      };
      if (['bower', 'npm'].includes(cmd.cmd) && opts.production) {
        cmd.args.push('--production');
      }
      if (cmd.cmd === 'npm' && opts.ignoreScripts) {
        cmd.args.push('--ignore-scripts');
      }
      if (opts.args) {
        cmd.args = cmd.args.concat(opts.args).map((arg) => arg.toString());
      }
      if (Array.isArray(opts[cmd.cmd])) {
        cmd.args = cmd.args.concat(opts[cmd.cmd].map((arg) => arg.toString()));
      } else if (typeof opts[cmd.cmd] === 'object') {
        cmd.args = cmd.args.concat(dargs(opts[cmd.cmd]));
      } else if (opts[cmd.cmd]) {
        cmd.args = cmd.args.concat(opts[cmd.cmd].toString());
      }
      if (cmd.cmd === 'bower' && opts.allowRoot) {
        cmd.args.push('--allow-root');
      }
      if (cmd.cmd === 'npm' && opts.noOptional) {
        cmd.args.push('--no-optional');
      }
      cmd.cwd = path.dirname(file.path);
      return cmd;
    }

    return false;
  }

  function runCommand(cmd, cb, file) {
    (async () => {
      await queue.add(async () => {
        try {
          await commandRunner.run(cmd);
          cb(null, file);
        } catch (error) {
          cb(new PluginError(PLUGIN_NAME, error), file);
        }
      });
    })();
  }

  return transfob(
    (file, enc, cb) => {
      if (!file.path) {
        return cb(null, file);
      }

      const cmd = generateCommand(file);
      if (cmd) {
        return runCommand(cmd, cb);
      }

      logger.warn('File %s is not supported', file);
      return cb(null, file);
    },
    async (cb) => {
      await queue.onIdle();
      done();
      cb();
    }
  );
}

module.exports = gulpReinstall;
