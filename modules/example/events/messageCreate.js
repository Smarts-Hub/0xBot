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

export default {
    name: Events.MessageCreate,
    async execute(message, client) {
        if(message.content === "hello") {
            message.reply("You said Hello!\n-# This is the event MessageCreate from the example module. You can edit or delete it.");
        }
    },
};