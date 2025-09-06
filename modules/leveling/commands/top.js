import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import UserLevel from "../models/UserLevelSchema.js";
import { yamlConfig } from "../index.js";

export default {
  data: new SlashCommandBuilder()
    .setName("top")
    .setDescription("Check the top 10 users by level"),

  async execute(interaction) {
    try {
      const topUsers = await UserLevel.find()
        .sort({ level: -1, xp: -1 })
        .limit(10);

      if (!topUsers.length) {
        return interaction.reply({
          content: "❌ There is no data yet.",
          ephemeral: true,
        });
      }

      const leaderboard = topUsers
        .map(
          (u, i) =>
            `**#${i + 1}** <@${u.userId}> — 🏆 ${yamlConfig?.leveling?.["top-command-embed"]?.["fields-title"]?.level || "Level"} **${u.level}** (${u.xp} ${yamlConfig?.leveling?.["top-command-embed"]?.["fields-title"]?.xp || "XP"})`
        )
        .join("\n");

        const embed = new EmbedBuilder()
        .setTitle(yamlConfig?.leveling?.["top-command-embed"]?.title || "🏆 Top 10 users")
        .setDescription(leaderboard)
        .setColor(yamlConfig?.leveling?.["top-command-embed"]?.color || 0x5865f2)
        .setFooter({
          text: yamlConfig?.leveling?.["top-command-embed"]?.request?.replace("{requester}", interaction.user.tag) || `Requested by ${interaction.user.tag}`,
          icon_url: interaction.user.displayAvatarURL(),
        })
        .setTimestamp();

      await interaction.reply({
        embeds: [embed],
      });
    } catch (err) {
      console.error("❌ Error on /top:", err);
      await interaction.reply({
        content: "⚠️ An error occurred while displaying the top.",
        ephemeral: true,
      });
    }
  },
};
