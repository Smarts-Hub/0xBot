
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
    if(!yamlConfig?.embeds) {
        logger.error("Yaml configuration for this resource is not valid!")
    }
}



export { api, yamlConfig };
