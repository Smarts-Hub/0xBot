import fs from 'fs/promises';
import path from 'path';
import AdmZip from 'adm-zip';
import logger from "../logger.js";
import {discord_client} from "../bot/client.js";
import { fileURLToPath, pathToFileURL } from 'url';
import config from "../../config/config.json" with { type: "json" };
import { installPackage } from './installer.js';

const MODULES_DIR = './modules';
const TEMP_DIR = './core/.tmp_modules';
const CONFIG_DIR = './config';

var moduleList = new Array;

export async function run() {
    const files = await fs.readdir(MODULES_DIR);

    for (const file of files) {
        if (file.endsWith('.zip')) {
            logger.debug("Unzipping modules");
            const fullPath = path.join(MODULES_DIR, file);
            const moduleName = path.basename(file, '.zip');
            const extractPath = path.join(TEMP_DIR, moduleName);

            const zip = new AdmZip(fullPath);
            zip.extractAllTo(extractPath, true);

            const moduleConfigPath = path.join(extractPath, 'config.json');
            const destinationConfigPath = path.join(CONFIG_DIR, `${moduleName}_config.json`);
            if(fs.readFile(destinationConfigPath)) return;
            try {
                await fs.copyFile(moduleConfigPath, destinationConfigPath);
                logger.debug(`Copied config for ${moduleName} to ${destinationConfigPath}`);
            } catch (err) {
                logger.warn(`No config.json found for module ${moduleName} or failed to copy: ${err.message}`);
            }
        }
    }

    const modules = await fs.readdir(TEMP_DIR);
    for (const module_ of modules) {
        const moduleName = path.basename(module_);
        moduleList.push(moduleName)
        const modulePath = path.join(TEMP_DIR, moduleName);

        const metadataRaw = await fs.readFile(path.join(modulePath, 'metadata.json'), 'utf-8');
        const metadata = JSON.parse(metadataRaw);

        const author = metadata.author;

        const mainPath = path.join(modulePath, metadata.main);
        const module = await import(pathToFileURL(mainPath).href);
        logger.info("Loaded module " + moduleName + " by " + author);
        if (typeof module.run === 'function') {
            module.run(createApi(moduleName));
        }
    }
}

export async function getModuleConfig(moduleName) {
    const configPath = path.join(CONFIG_DIR, `${moduleName}_config.json`);
    try {
        const configRaw = await fs.readFile(configPath, 'utf-8');
        return JSON.parse(configRaw);
    } catch (err) {
        logger.warn(`Could not load config for module ${moduleName}`);
        return null;
    }
}

function createApi(moduleName) {
    
    return {
        logger: logger,
        client: discord_client,
        config,
        resourceConfig: getModuleConfig(moduleName),
        moduleList,
        installPackage
    };
}
