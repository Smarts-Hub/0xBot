import { exec } from "node:child_process";

export async function installPackage(packageName) {
  await new Promise((resolve, reject) => {
    exec(`npm install ${packageName}`, (error, stdout, stderr) => {
      if (error) return reject(error.message);
      if (stderr) return reject(stderr);
      console.log(stdout);
      resolve(stdout);
    });
  });

  const freshModule = await import(`${packageName}?update=${Date.now()}`);
  return freshModule;
}
