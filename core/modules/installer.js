import { exec } from 'node:child_process';

export function installPackage(packageName) {
  return new Promise((resolve, reject) => {
    exec(`npm install ${packageName}`, (error, stdout, stderr) => {
      if (error) return reject(error.message);
      if (stderr) return reject(stderr);
      resolve(stdout);
    });
  });
}