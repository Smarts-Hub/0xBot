
import { Events, MessageFlags } from "discord.js";
import logger from "../../../core/logger.js"
import { initializeGiveawayChecker } from "../utils/giveawayChecker.js";
export default {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        initializeGiveawayChecker(client);
    },
};