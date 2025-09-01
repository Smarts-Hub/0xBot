/*
 * 0xBot - Fully modular discord bot 
 *
 * * This bot offers the ability to create a discord bot fully customizable through modules.
 * * You can get information about the bot's functionality and how to use it in the documentation.
 *   * https://docs.smartshub.dev/0xbot
 *
 * 0xBot is licensed under the MIT License.
 */

import { spawn } from "child_process";

export async function restart() {
  const args = process.argv.slice(1); 
  const cmd = process.argv[0]; 

  const child = spawn(cmd, args, {
    stdio: "inherit" 
  });

  child.on("close", (code) => {
    process.exit(code);
  });

  process.exit();
}