/*
 * 0xBot Moderation addon
 *
 * * This addon adds your bot a Leveling system
 * * You can get information about the bot's functionality and how to use it in the documentation.
 *   * https://docs.smartshub.dev/0xbot
 *
 * This addon is licensed under the MIT License.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";

import fs from "node:fs/promises";
import yaml from "js-yaml";
import logger from "../../core/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let api;
let yamlConfig;
export async function run(apiInstance) {
    api = apiInstance;
    yamlConfig = await yaml.load(await fs.readFile(path.resolve(__dirname, "config.yml"), "utf8"));
    if(!yamlConfig?.moderations) {
        logger.error("Yaml configuration for this resource is not valid!")
    }
}



export { api, yamlConfig };

