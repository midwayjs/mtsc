const cp = require('child_process');
const { existsSync } = require('fs');
const { unlink } = require('fs/promises');

function execa(cmd, args, options) {
  return new Promise((resolve, reject) => {
    // mock execa
    const child = cp.spawn(cmd, args, {
      cwd: __dirname,
      stdio: ['inherit', 'pipe', 'inherit', 'ipc'],
      ...options,
    });

    child.output = [];
    child.stdout.on('data', (data) => {
      child.output.push(data.toString());
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
      if (code !== 0) {
        reject(new Error(`Child process exited with code ${code}`));
      }
    });
  });
}

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

async function removeFile(fileList) {
  for (const f of fileList) {
    if (existsSync(f)) {
      await unlink(f);
    }
  }
}

exports.execa = execa;
exports.sleep = sleep;
exports.removeFile = removeFile;
