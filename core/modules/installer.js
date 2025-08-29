import { exec } from "node:child_process";
import { restart } from "./restarter.js";

export async function installPackage(packageName, autorestart) {
  return new Promise((resolve, reject) => {
    exec(`npm install ${packageName}`, async (error, stdout, stderr) => {
      if (error) return reject(error.message);
      if (stderr) return reject(stderr);
      
      if (autorestart) await restart();

      resolve(stdout);
    });
  });
}
