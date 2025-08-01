import logger from "./core/logger.js";

logger.info("Starting 0xBot...");
logger.debug("Debug is enabled! Showing debug information.");

import { run } from "./core/modules/loader.js";
import { init } from "./core/bot/client.js";

run()
init()
