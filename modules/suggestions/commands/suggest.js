import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { yamlConfig } from "../index.js";

export default {
    data: new SlashCommandBuilder()
        .setName("suggest")
        .setDescription("Submit a suggestion for the server")
        .addStringOption(option =>
            option.setName("suggestion")
                .setDescription("Your suggestion")
                .setRequired(true)
        ),

    async execute(interaction) {
        const suggestion = interaction.options.getString("suggestion");
        const config = yamlConfig?.suggestions || {};
        
        const suggestionChannelId = config["suggestion-channel"];
        if (!suggestionChannelId) {
            return interaction.reply({
                content: "❌ The suggestion system is not configured properly.",
                ephemeral: true
            });
        }

        const suggestionChannel = interaction.guild.channels.cache.get(suggestionChannelId);
        if (!suggestionChannel) {
            return interaction.reply({
                content: "❌ Suggestion channel not found. Please contact an administrator.",
                ephemeral: true
            });
        }

        // Crear embed con contadores de votos
        const suggestionEmbed = new EmbedBuilder()
            .setAuthor({ 
                name: config?.embed?.author?.replace("{user}", interaction.user.username) || `Suggestion from ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL()
            })
            .setDescription(suggestion)
            .setColor(config?.embed?.color || "#5865F2")
            .setFooter({ 
                text: config?.embed?.footer?.replace("{user}", interaction.user.username) || `Suggested by ${interaction.user.username}` 
            })
            .addFields(
                { name: "Votes", value: "👍 0 | 👎 0", inline: true }
            )
            .setTimestamp();

        // Crear botones
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('suggest_upvote')
                    .setLabel('Upvote')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('👍'),
                new ButtonBuilder()
                    .setCustomId('suggest_downvote')
                    .setLabel('Downvote')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('👎'),
                new ButtonBuilder()
                    .setCustomId('suggest_admin')
                    .setLabel('Admin')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('⚙️')
            );

        try {
            const message = await suggestionChannel.send({
                embeds: [suggestionEmbed],
                components: [row]
            });

            await interaction.reply({
                content: config["success-message"]?.replace("{channel}", suggestionChannel.toString()) || `✅ Your suggestion has been submitted to ${suggestionChannel}!`,
                ephemeral: true
            });

        } catch (error) {
            console.error("Error sending suggestion:", error);
            await interaction.reply({
                content: "❌ There was an error submitting your suggestion. Please try again later.",
                ephemeral: true
            });
        }
    }
};