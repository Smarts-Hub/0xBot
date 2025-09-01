/*
 * 0xBot - Fully modular discord bot 
 *
 * * This bot offers the ability to create a discord bot fully customizable through modules.
 * * You can get information about the bot's functionality and how to use it in the documentation.
 *   * https://docs.smartshub.dev/0xbot
 *
 * 0xBot is licensed under the MIT License.
 */

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
