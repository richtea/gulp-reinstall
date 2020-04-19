const path = require('path');
const chai = require('chai');
const Vinyl = require('vinyl');
const commandRunner = require('../lib/command-runner');
const reinstall = require('../.');

const should = chai.should();

function fixture(file) {
  const filepath = path.join(__dirname, file);
  return new Vinyl({
    path: filepath,
    cwd: __dirname,
    base: path.join(__dirname, path.dirname(file)),
    contents: null
  });
}

function mockRunner() {
  const mock = cmd => {
    mock.called += 1;
    mock.commands.push(cmd);
    return Promise.resolve();
  };
  mock.called = 0;
  mock.commands = [];
  return mock;
}

let originalRun;

describe('gulp-install', function() {
  beforeEach(function() {
    originalRun = commandRunner.run;
    commandRunner.run = mockRunner();
  });

  afterEach(function() {
    commandRunner.run = originalRun;
  });

  it('should run `npm install` if stream contains `package.json`', function(done) {
    const file = fixture('package.json');

    const stream = reinstall();

    stream.on('error', err => {
      should.exist(err);
      done(err);
    });

    stream.on('data', () => {});

    stream.on('end', () => {
      commandRunner.run.called.should.equal(1);
      commandRunner.run.commands[0].cmd.should.equal('npm');
      commandRunner.run.commands[0].args.should.eql(['install']);
      done();
    });

    stream.write(file);

    stream.end();
  });

  it('should run `npm install --production` if stream contains `package.json` and `production` option is set', function(done) {
    const file = fixture('package.json');

    const stream = reinstall({ production: true });

    stream.on('error', err => {
      should.exist(err);
      done(err);
    });

    stream.on('data', () => {});

    stream.on('end', () => {
      commandRunner.run.called.should.equal(1);
      commandRunner.run.commands[0].cmd.should.equal('npm');
      commandRunner.run.commands[0].args.should.eql([
        'install',
        '--production'
      ]);
      done();
    });

    stream.write(file);

    stream.end();
  });

  it('should run `npm install --ignore-scripts` if stream contains `package.json` and `ignoreScripts` option is set', function(done) {
    const file = fixture('package.json');

    const stream = reinstall({ ignoreScripts: true });

    stream.on('error', err => {
      should.exist(err);
      done(err);
    });

    stream.on('data', () => {});

    stream.on('end', () => {
      commandRunner.run.called.should.equal(1);
      commandRunner.run.commands[0].cmd.should.equal('npm');
      commandRunner.run.commands[0].args.should.eql([
        'install',
        '--ignore-scripts'
      ]);
      done();
    });

    stream.write(file);

    stream.end();
  });

  it('should run `bower install --config.interactive=false` if stream contains `bower.json`', function(done) {
    const file = fixture('bower.json');

    const stream = reinstall();

    stream.on('error', err => {
      should.exist(err);
      done(err);
    });

    stream.on('data', () => {});

    stream.on('end', () => {
      commandRunner.run.called.should.equal(1);
      commandRunner.run.commands[0].cmd.should.equal('bower');
      commandRunner.run.commands[0].args.should.eql([
        'install',
        '--config.interactive=false'
      ]);
      done();
    });

    stream.write(file);

    stream.end();
  });

  it('should run `bower install --production --config.interactive=false` if stream contains `bower.json`', function(done) {
    const file = fixture('bower.json');

    const stream = reinstall({ production: true });

    stream.on('error', err => {
      should.exist(err);
      done(err);
    });

    stream.on('data', () => {});

    stream.on('end', () => {
      commandRunner.run.called.should.equal(1);
      commandRunner.run.commands[0].cmd.should.equal('bower');
      commandRunner.run.commands[0].args.should.eql([
        'install',
        '--config.interactive=false',
        '--production'
      ]);
      done();
    });

    stream.write(file);

    stream.end();
  });

  it('should run both `npm install` and `bower install --config.interactive=false` if stream contains both `package.json` and `bower.json`', function(done) {
    const files = [fixture('package.json'), fixture('bower.json')];

    const stream = reinstall();

    stream.on('error', err => {
      should.exist(err);
      done(err);
    });

    stream.on('data', () => {});

    stream.on('end', () => {
      commandRunner.run.called.should.equal(2);
      commandRunner.run.commands[0].cmd.should.equal('npm');
      commandRunner.run.commands[0].args.should.eql(['install']);
      commandRunner.run.commands[1].cmd.should.equal('bower');
      commandRunner.run.commands[1].args.should.eql([
        'install',
        '--config.interactive=false'
      ]);
      done();
    });

    files.forEach(file => stream.write(file));

    stream.end();
  });

  it('should run both `npm install --production` and `bower install --production --config.interactive=false` if stream contains both `package.json` and `bower.json`', function(done) {
    const files = [fixture('package.json'), fixture('bower.json')];

    const stream = reinstall({ production: true });

    stream.on('error', err => {
      should.exist(err);
      done(err);
    });

    stream.on('data', () => {});

    stream.on('end', () => {
      commandRunner.run.called.should.equal(2);
      commandRunner.run.commands[0].cmd.should.equal('npm');
      commandRunner.run.commands[0].args.should.eql([
        'install',
        '--production'
      ]);
      commandRunner.run.commands[1].cmd.should.equal('bower');
      commandRunner.run.commands[1].args.should.eql([
        'install',
        '--config.interactive=false',
        '--production'
      ]);
      done();
    });

    files.forEach(file => stream.write(file));

    stream.end();
  });

  it('should be able to specify different args for different commands', function(done) {
    const files = [fixture('package.json'), fixture('bower.json')];

    const stream = reinstall({
      bower: ['--allow-root'],
      npm: ['--silent']
    });

    stream.on('error', err => {
      should.exist(err);
      done(err);
    });

    stream.on('data', () => {});

    stream.on('end', () => {
      commandRunner.run.called.should.equal(2);
      commandRunner.run.commands[0].cmd.should.equal('npm');
      commandRunner.run.commands[0].args.should.eql(['install', '--silent']);
      commandRunner.run.commands[1].cmd.should.equal('bower');
      commandRunner.run.commands[1].args.should.eql([
        'install',
        '--config.interactive=false',
        '--allow-root'
      ]);
      done();
    });

    files.forEach(file => stream.write(file));

    stream.end();
  });

  it('should be able to specify different args using objects for different commands', function(done) {
    const files = [fixture('package.json'), fixture('bower.json')];

    const stream = reinstall({
      bower: { allowRoot: true, silent: true },
      npm: { registry: 'https://my.own-registry.com' }
    });

    stream.on('error', err => {
      should.exist(err);
      done(err);
    });

    stream.on('data', () => {});

    stream.on('end', () => {
      commandRunner.run.called.should.equal(2);
      commandRunner.run.commands[0].cmd.should.equal('npm');
      commandRunner.run.commands[0].args.should.eql([
        'install',
        '--registry=https://my.own-registry.com'
      ]);
      commandRunner.run.commands[1].cmd.should.equal('bower');
      commandRunner.run.commands[1].args.should.eql([
        'install',
        '--config.interactive=false',
        '--allow-root',
        '--silent'
      ]);
      done();
    });

    files.forEach(file => stream.write(file));

    stream.end();
  });

  it('should be able to specify a different single argument using a string for different commands', function(done) {
    const files = [fixture('package.json'), fixture('bower.json')];

    const stream = reinstall({
      bower: '--silent',
      npm: '--registry=https://my.own-registry.com'
    });

    stream.on('error', err => {
      should.exist(err);
      done(err);
    });

    stream.on('data', () => {});

    stream.on('end', () => {
      commandRunner.run.called.should.equal(2);
      commandRunner.run.commands[0].cmd.should.equal('npm');
      commandRunner.run.commands[0].args.should.eql([
        'install',
        '--registry=https://my.own-registry.com'
      ]);
      commandRunner.run.commands[1].cmd.should.equal('bower');
      commandRunner.run.commands[1].args.should.eql([
        'install',
        '--config.interactive=false',
        '--silent'
      ]);
      done();
    });

    files.forEach(file => stream.write(file));

    stream.end();
  });

  it('should be able to any command for any file', function(done) {
    const files = [
      fixture('package.json'),
      fixture('config.js'),
      fixture('blaha.yml')
    ];

    const stream = reinstall({
      jspm: 'install',
      blaha: ['one', 'two', '--three'],
      commands: {
        'package.json': 'yarn',
        'config.js': 'jspm',
        'blaha.yml': 'blaha'
      }
    });

    stream.on('error', err => {
      should.exist(err);
      done(err);
    });

    stream.on('data', () => {});

    stream.on('end', () => {
      commandRunner.run.called.should.equal(3);
      commandRunner.run.commands[0].cmd.should.equal('yarn');
      commandRunner.run.commands[0].args.should.eql([]);
      commandRunner.run.commands[1].cmd.should.equal('jspm');
      commandRunner.run.commands[1].args.should.eql(['install']);
      commandRunner.run.commands[2].cmd.should.equal('blaha');
      commandRunner.run.commands[2].args.should.eql(['one', 'two', '--three']);
      done();
    });

    files.forEach(file => stream.write(file));

    stream.end();
  });

  it('should run `bower install --allow-root --config.interactive=false` if stream contains `bower.json`', function(done) {
    const files = [fixture('bower.json')];

    const stream = reinstall({ allowRoot: true });

    stream.on('error', err => {
      should.exist(err);
      done(err);
    });

    stream.on('data', () => {});

    stream.on('end', () => {
      commandRunner.run.called.should.equal(1);
      commandRunner.run.commands[0].cmd.should.equal('bower');
      commandRunner.run.commands[0].args.should.eql([
        'install',
        '--config.interactive=false',
        '--allow-root'
      ]);
      done();
    });

    files.forEach(file => stream.write(file));

    stream.end();
  });

  it('should run `tsd reinstall --save` if stream contains `tsd.json`', function(done) {
    const file = fixture('tsd.json');

    const stream = reinstall();

    stream.on('error', err => {
      should.exist(err);
      done(err);
    });

    stream.on('data', () => {});

    stream.on('end', () => {
      commandRunner.run.called.should.equal(1);
      commandRunner.run.commands[0].cmd.should.equal('tsd');
      commandRunner.run.commands[0].args.should.eql(['reinstall', '--save']);
      done();
    });

    stream.write(file);

    stream.end();
  });

  it('should run `pip install -r requirements.txt` if stream contains `requirements.txt`', function(done) {
    const file = fixture('requirements.txt');

    const stream = reinstall();

    stream.on('error', err => {
      should.exist(err);
      done(err);
    });

    stream.on('data', () => {});

    stream.on('end', () => {
      commandRunner.run.called.should.equal(1);
      commandRunner.run.commands[0].cmd.should.equal('pip');
      commandRunner.run.commands[0].args.should.eql([
        'install',
        '-r',
        'requirements.txt'
      ]);
      done();
    });

    stream.write(file);

    stream.end();
  });

  it('should run `npm install --no-optional` if `noOptional` option is set', function(done) {
    const files = [fixture('package.json')];

    const stream = reinstall({ noOptional: true });

    stream.on('error', err => {
      should.exist(err);
      done(err);
    });

    stream.on('data', () => {});

    stream.on('end', () => {
      commandRunner.run.called.should.equal(1);
      commandRunner.run.commands[0].cmd.should.equal('npm');
      commandRunner.run.commands[0].args.should.eql([
        'install',
        '--no-optional'
      ]);
      done();
    });

    files.forEach(file => stream.write(file));

    stream.end();
  });

  it('should run `npm install --dev --no-shrinkwrap` if args option is the appropriate array', function(done) {
    const files = [fixture('package.json')];

    const stream = reinstall({
      args: ['--dev', '--no-shrinkwrap']
    });

    stream.on('error', err => {
      should.exist(err);
      done(err);
    });

    stream.on('data', () => {});

    stream.on('end', () => {
      commandRunner.run.called.should.equal(1);
      commandRunner.run.commands[0].cmd.should.equal('npm');
      commandRunner.run.commands[0].args.should.eql([
        'install',
        '--dev',
        '--no-shrinkwrap'
      ]);
      done();
    });

    files.forEach(file => stream.write(file));

    stream.end();
  });

  it("should run `npm install --dev` if args option is '--dev'", function(done) {
    const files = [fixture('package.json')];

    const stream = reinstall({
      args: '--dev'
    });

    stream.on('error', err => {
      should.exist(err);
      done(err);
    });

    stream.on('data', () => {});

    stream.on('end', () => {
      commandRunner.run.called.should.equal(1);
      commandRunner.run.commands[0].cmd.should.equal('npm');
      commandRunner.run.commands[0].args.should.eql(['install', '--dev']);
      done();
    });

    files.forEach(file => stream.write(file));

    stream.end();
  });

  it('should run `npm install` even if args option is in an invalid format', function(done) {
    const files = [fixture('package.json')];

    const stream = reinstall({
      args: 42
    });

    stream.on('error', err => {
      should.exist(err);
      done(err);
    });

    stream.on('data', () => {});

    stream.on('end', () => {
      commandRunner.run.called.should.equal(1);
      commandRunner.run.commands[0].cmd.should.equal('npm');
      commandRunner.run.commands[0].args.should.eql(['install', '42']);
      done();
    });

    files.forEach(file => stream.write(file));

    stream.end();
  });

  it('should set `cwd` correctly to be able to run the same command in multiple folders', function(done) {
    const files = [fixture('dir1/package.json'), fixture('dir2/package.json')];

    const stream = reinstall();

    stream.on('error', err => {
      should.exist(err);
      done(err);
    });

    stream.on('data', () => {});

    stream.on('end', () => {
      commandRunner.run.called.should.equal(2);
      commandRunner.run.commands[0].cmd.should.equal('npm');
      commandRunner.run.commands[0].args.should.eql(['install']);
      commandRunner.run.commands[0].cwd.should.equal(
        path.join(__dirname, 'dir1')
      );
      commandRunner.run.commands[1].cmd.should.equal('npm');
      commandRunner.run.commands[1].args.should.eql(['install']);
      commandRunner.run.commands[1].cwd.should.equal(
        path.join(__dirname, 'dir2')
      );
      done();
    });

    files.forEach(file => stream.write(file));

    stream.end();
  });

  it('should call given callback when done', function(done) {
    const files = [fixture('package.json')];

    const stream = reinstall(() => {
      commandRunner.run.called.should.equal(1);
      commandRunner.run.commands[0].cmd.should.equal('npm');
      commandRunner.run.commands[0].args.should.eql(['install']);
      done();
    });

    stream.on('error', err => {
      should.exist(err);
      done(err);
    });

    stream.on('data', () => {});

    files.forEach(file => stream.write(file));

    stream.end();
  });

  it('should allow both options and a callback', function(done) {
    const files = [fixture('package.json')];

    const stream = reinstall({ commands: { 'package.json': 'yarn' } }, () => {
      commandRunner.run.called.should.equal(1);
      commandRunner.run.commands[0].cmd.should.equal('yarn');
      commandRunner.run.commands[0].args.should.eql([]);
      done();
    });

    stream.on('error', err => {
      should.exist(err);
      done(err);
    });

    stream.on('data', () => {});

    files.forEach(file => stream.write(file));

    stream.end();
  });
});
