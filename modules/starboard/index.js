/*
 * 0xBot - Fully modular discord bot 
 *
 * * This bot offers the ability to create a discord bot fully customizable through modules.
 * * You can get information about the bot's functionality and how to use it in the documentation.
 *   * https://docs.smartshub.dev/0xbot
 *
 * 0xBot is licensed under the MIT License.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";

import fs from "node:fs/promises";
import yaml from "js-yaml";
import logger from "../../core/logger.js";
import { log } from "node:console";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let api;
let yamlConfig;

export async function run(apiInstance) {
  api = apiInstance;
  yamlConfig = await yaml.load(await fs.readFile(path.join(__dirname, "config.yml"), "utf8"));
  if(!yamlConfig.starboard) {
    logger.warn("Yaml configuration for this resource is not valid!");
  }
}

export { api, yamlConfig };
