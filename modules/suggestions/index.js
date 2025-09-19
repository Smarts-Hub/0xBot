// Sugestions module by xInsso

import path from "node:path";
import { fileURLToPath } from "node:url";
import suggestCommand from "./commands/suggest.js";
import messageCreateEvent from "./events/messageCreate.js";
import interactionCreateButtons from "./events/interactionCreateButtons.js";
import interactionCreateModals from "./events/interactionCreateModals.js";

import fs from "node:fs/promises";
import yaml from "js-yaml";
import logger from "../../core/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const commands = [suggestCommand];
export const events = [
    messageCreateEvent,
    interactionCreateButtons,
    interactionCreateModals
];

let api;
let yamlConfig;
export async function run(apiInstance) {
    api = apiInstance;
    try {
        yamlConfig = await yaml.load(await fs.readFile(path.resolve(__dirname, "config.yml"), "utf8"));
        if(!yamlConfig?.suggestions) {
            logger.error("Yaml configuration for Suggestions Module is not valid!");
        }
    } catch (error) {
        logger.error("Error loading suggestions config:", error);
    }
}

export { api, yamlConfig };