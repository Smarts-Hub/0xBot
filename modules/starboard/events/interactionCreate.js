
import { ActionRowBuilder, ButtonStyle, EmbedBuilder, Events, ButtonBuilder } from "discord.js";
import { yamlConfig } from "../index.js";
import logger from "../../../core/logger.js";

export default {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        if (!interaction.isButton()) return;
        if (!interaction.customId.startsWith("@starboard")) return;

        const parts = interaction.customId.split(":");
        const messageId = parts[1];

        if (!messageId) return;

        try {
            const message = await interaction.channel.messages.fetch(messageId);

            if (!message) {
                await interaction.reply({ content: "❌ Could not find the message.", ephemeral: true });
                return;
            }

            // Most useful line ever lol
            const content = message.content;

            const match = content.match(/⭐ \*\*(\d+)\*\*/);
            if (match) {
                const number = parseInt(match[1], 10);
                message.edit(message.content.replace(`**${number}**`, `**${number + 1}**`))
                interaction.reply({
                    content: yamlConfig.starboard["interaction-message"] ?? "Star added!",
                    ephemeral: true
                })
            }
        } catch (err) {
            logger.error(`Error retrieving starboard message: ${err.message}`);
            await interaction.reply({ content: "❌ There was an error while retrieving the message.", ephemeral: true });
        }
    },
};
