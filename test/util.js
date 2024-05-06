const cp = require('child_process');

function execa(cmd, args, options) {
  return new Promise((resolve, reject) => {
    // mock execa
    const child = cp.spawn(cmd, args, {
      cwd: __dirname,
      stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
      ...options,
    });

    child.on('message', (data) => {
      if (args.includes('--watch')) {
        if (data === 'watch-compile-success-first' || data === 'watch-compile-fail') {
          resolve(child);
        } else {
          console.log('got event:', data);
        }
      } else {
        if (data === 'compile-success') {
          resolve(child);
        } else {
          console.log('got event:', data);
        }
      }
    });

    child.on('error', (err) => {
      reject(err);
    });

    child.once('exit', (code) => {
      console.log('exit', code);
    });
  });

  return child;
}

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

exports.execa = execa;
exports.sleep = sleep;
