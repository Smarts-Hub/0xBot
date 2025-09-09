/*
 * 0xBot - Fully modular discord bot 
 *
 * * This bot offers the ability to create a discord bot fully customizable through modules.
 * * You can get information about the bot's functionality and how to use it in the documentation.
 *   * https://docs.smartshub.dev/0xbot
 *
 * 0xBot is licensed under the MIT License.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modulesDir = path.join(__dirname, "modules");
const configDir = path.join(__dirname, "config");

const defaultConfigFile = path.join(__dirname, "core/assets/config.json");
const destinationConfigFile = path.join(configDir, "config.json");

if (!fs.existsSync(modulesDir)) {
    fs.mkdirSync(modulesDir, { recursive: true });
} else {
    const files = fs.readdirSync(modulesDir);
    if (files.length > 0) {
        console.log(`Modules folder already has ${files.length} file(s), skipping creation.`);
    }
}

if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
}

if (!fs.existsSync(destinationConfigFile)) {
    fs.copyFileSync(defaultConfigFile, destinationConfigFile);
}

start();

async function start() {
    const logger = (await import("./core/logger.js")).default;
    const { run } = await import("./core/modules/loader.js");
    const { init } = await import("./core/bot/client.js");
    const { connectMongoose } = await import("./core/storage/mongodb.js");

    logger.debug("Debug is enabled! Showing debug information.");
    await connectMongoose();
    await run();
    await init();
}
