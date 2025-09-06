import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import UserLevel from "../models/UserLevelSchema.js";
import { yamlConfig } from "../index.js"

export default {
    data: new SlashCommandBuilder()
        .setName("rank")
        .setDescription("Check your level and XP")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("The user to check")
                .setRequired(false)
        ),

    async execute(interaction) {
        const target = interaction.options.getUser("user") || interaction.user;

        // Buscar datos en la DB
        let userData = await UserLevel.findOne({ userId: target.id });

        if (!userData) {
            return interaction.reply({
                content: `❌ No data found for **${target.username}**.`,
                ephemeral: true
            });
        }

        // Calcular XP para el próximo nivel
        const thresholdXp = yamlConfig?.leveling?.["xp-threshold"] ?? 1000;
        const xpNeeded = Math.floor(((userData.level + 1) * thresholdXp));
        const progress = Math.floor((userData.xp / xpNeeded) * 100);

        const embed = new EmbedBuilder()
            .setAuthor({ name: yamlConfig?.leveling?.["rank-command-embed"]?.title?.replace("{user}", `${target.username}`) || `${target.username}'s Rank`, iconURL: target.displayAvatarURL() })
            .setColor(yamlConfig?.leveling?.["rank-command-embed"]?.color || "#5865F2")
            .addFields(
                { name: yamlConfig?.leveling?.["rank-command-embed"]?.["fields-title"]?.level || "Level", value: `${userData.level}`, inline: true },
                { name: yamlConfig?.leveling?.["rank-command-embed"]?.["fields-title"]?.xp || "XP", value: `${userData.xp} / ${xpNeeded}`, inline: true },
                { name: yamlConfig?.leveling?.["rank-command-embed"]?.["fields-title"]?.progress || "Progress", value: `${progress}%`, inline: true }
            )
            .setFooter({ text: yamlConfig?.leveling?.["rank-command-embed"]?.request?.replace("{requester}", interaction.user.username) || `Requested by ${interaction.user.username}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
