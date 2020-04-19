const { spawn } = require('child_process');

exports.run = command => {
  return new Promise((resolve, reject) => {
    const cmd = spawn(command.cmd, command.args, {
      shell: true,
      stdio: 'inherit',
      cwd: command.cwd || process.cwd()
    });
    cmd.on('error', err => {
      reject(err);
    });
    cmd.on('close', code => {
      if (code !== 0) {
        reject(new Error(`"${command.cmd}" exited with non-zero code ${code}`));
        return;
      }
      resolve();
    });
  });
};
