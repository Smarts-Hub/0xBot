/*
 * 0xBot - Fully modular discord bot 
 *
 * * This bot offers the ability to create a discord bot fully customizable through modules.
 * * You can get information about the bot's functionality and how to use it in the documentation.
 *   * https://docs.smartshub.dev/0xbot
 *
 * 0xBot is licensed under the MIT License.
 */

import chalk from 'chalk';
import config from "../config/config.json" with { type: "json" };

const timestamp = () => {
  return chalk.gray(`[${new Date().toLocaleTimeString()}]`);
};

const logger = {
  info: (message) => {
    console.log(`${timestamp()} ${chalk.blue('[INFO]')} ${message}`);
  },

  warn: (message) => {
    console.warn(`${timestamp()} ${chalk.yellow('[WARN]')} ${message}`);
  },

  error: (message) => {
    console.error(`${timestamp()} ${chalk.red('[ERROR]')} ${message}`);
  },

  success: (message) => {
    console.log(`${timestamp()} ${chalk.green('[SUCCESS]')} ${message}`);
  },

  debug: (message) => {
    if(config.logger.enable_debug) {
        console.debug(`${timestamp()} ${chalk.magenta('[DEBUG]')} ${message}`);
    }
  },
};

export default logger;
