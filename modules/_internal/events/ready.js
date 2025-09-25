/*
 * 0xBot Leveling addon
 *
 * * This addon adds your bot a Leveling system
 * * You can get information about the bot's functionality and how to use it in the documentation.
 *   * https://docs.smartshub.dev/0xbot
 *
 * This addon is licensed under the MIT License.
 */

import { Events, MessageFlags } from "discord.js";
import logger from "../../../core/logger.js"
import {api} from "#api";
export default {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        logger.success("Bot has succesfully logged in!")
        logger.info(` * Client name: ${client.user.username}`)
        logger.info(` * Client guilds: ${client.guilds.cache.size}`)
        if(client.guilds.cache.size > 1) {
            logger.warn(` ! Warning: you are running the bot in two or more servers! Please note that this might cause problems in modules!`)
        }
        logger.info(` * Total modules loaded: ${api.moduleList.length}`)
    },
};