/*
 * 0xBot - Fully modular discord bot 
 *
 * * This bot offers the ability to create a discord bot fully customizable through modules.
 * * You can get information about the bot's functionality and how to use it in the documentation.
 *   * https://docs.smartshub.dev/0xbot
 *
 * 0xBot is licensed under the MIT License.
 */

import fs from 'fs/promises';
import path from 'path';
import logger from "../logger.js";
import { discord_client } from "../bot/client.js";
import { pathToFileURL } from 'url';
import config from "../../config/config.json" with { type: "json" };
import { installPackage } from './installer.js';
import { restart } from './restarter.js';


const MODULES_DIR = './modules';
const CONFIG_DIR = './config';


var moduleList = new Array;
var moduleMetadataList = new Array;

export async function run() {

    const modules = await fs.readdir(MODULES_DIR);
    for (const module_ of modules) {
        const moduleName = path.basename(module_);
        const modulePath = path.join(MODULES_DIR, moduleName);

        const metadataRaw = await fs.readFile(path.join(modulePath, 'metadata.json'), 'utf-8');
        const metadata = JSON.parse(metadataRaw);

        const author = metadata.author;

        const mainPath = path.join(modulePath, metadata.main);
        const module = await import(pathToFileURL(mainPath).href);

        moduleList.push(moduleName)
        moduleMetadataList.push(metadata)
        if (typeof module.run === 'function') {
            module.run(createApi(moduleName));
        }
        logger.info("Loaded module " + moduleName + " by " + author);

    }
}



function createApi(moduleName) {
    return {
        logger: logger,
        client: discord_client,
        config,
        moduleList,
        moduleMetadataList,
        installPackage,
        restart
    };
}
