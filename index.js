import logger from "./core/logger.js";
import fs from "node:fs";
import path from "node:path";
import { run } from "./core/modules/loader.js";
import { init } from "./core/bot/client.js";

logger.info("Starting 0xBot...");

const rootDir = path.dirname(new URL(import.meta.url).pathname);
const modulesDir = path.join(rootDir, "modules");
const configDir = path.join(rootDir, "config");
const defaultConfigFile = path.join(rootDir, "core/assets/config.json");
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

logger.debug("Debug is enabled! Showing debug information.");

await run();
await init();