/*
 * 0xBot - Fully modular discord bot 
 *
 * * This bot offers the ability to create a discord bot fully customizable through modules.
 * * You can get information about the bot's functionality and how to use it in the documentation.
 *   * https://docs.smartshub.dev/0xbot
 *
 * 0xBot is licensed under the MIT License.
 */


import logger from "./core/logger.js";
import fs from "node:fs";
import path from "node:path";
import { run } from "./core/modules/loader.js";
import { init } from "./core/bot/client.js";

logger.info("Starting 0xBot...");

const modulesDir = path.join("modules");
const configDir = path.join("config");

const defaultConfigFile = path.join("core/assets/config.json");
const destinationConfigFile = path.join(configDir, "config.json");

if (!fs.existsSync(modulesDir)) {
    fs.mkdirSync(modulesDir, { recursive: true });
    logger.debug("Created ./modules directory.");
}

if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
    logger.debug("Created ./config directory.");
}

if (!fs.existsSync(destinationConfigFile)) {
    fs.copyFileSync(defaultConfigFile, destinationConfigFile);
    logger.debug("Copied default config.js to ./config/");
}

start()

async function start() {
    logger.debug("Debug is enabled! Showing debug information.");
    await run();
    await init();
}

