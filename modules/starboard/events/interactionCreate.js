/*
 * 0xBot Starboard addon
 *
 * * This addon adds your bot a Starboard system
 * * You can get information about the bot's functionality and how to use it in the documentation.
 *   * https://docs.smartshub.dev/0xbot
 *
 * This addon is licensed under the MIT License.
 */

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
                await interaction.reply({ content: "❌ No se pudo encontrar el mensaje.", ephemeral: true });
                return;
            }

            // Most useful line ever lol
            const content = message.content;

            const match = content.match(/⭐ \*\*(\d+)\*\*/);
            if (match) {
                const number = parseInt(match[1], 10);
                message.edit(message.content.replace(`**${number}**`, `**${number + 1}**`))
                interaction.reply({
                    content: "Star added!",
                    ephemeral: true
                })
            }
        } catch (err) {
            logger.error(`Error al obtener el mensaje: ${err.message}`);
            await interaction.reply({ content: "⚠️ Hubo un error al obtener el mensaje.", ephemeral: true });
        }
    },
};
