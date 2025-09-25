// commands/create-giveaway.js (updated version)
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { yamlConfig } from "../index.js";
import Giveaway from "../models/Giveaway.js";

export default {
  data: new SlashCommandBuilder()
    .setName("create-giveaway")
    .setDescription("Start the creation of a new giveaway")
    .addStringOption((option) =>
      option
        .setName("channel-id")
        .setDescription("The ID of the channel where the giveaway will be hosted")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("duration")
        .setDescription("Duration of the giveaway (e.g., 1d, 12h, 30m)")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("winners")
        .setDescription("Number of winners for the giveaway")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("prize")
        .setDescription("The prize for the giveaway")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("Giveaway description (you can use markdown) (optional)")
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!interaction.member.roles.cache.has(yamlConfig.giveaways["required-role"])) {
      return interaction.reply({
        content: "❌ You don't have permission to use this command.",
        ephemeral: true,
      });
    }

    const channelId = interaction.options.getString("channel-id");
    const duration = interaction.options.getString("duration");
    const winnersCount = interaction.options.getInteger("winners");
    const prize = interaction.options.getString("prize");
    const description = interaction.options.getString("description") || "No description provided.";
    const channel = interaction.guild.channels.cache.get(channelId);

    if (!channel || channel.type !== 0) {
      return interaction.reply({
        content: "❌ Invalid channel ID or the channel is not a text channel.",
        ephemeral: true,
      });
    }

    // Parse duration to get end time
    const endTime = parseDuration(duration);
    if (!endTime) {
      return interaction.reply({
        content: "❌ Invalid duration format. Use formats like: 1d, 12h, 30m, 1w",
        ephemeral: true,
      });
    }

    const giveawayEmbed = new EmbedBuilder()
      .setTitle(`🎉 Giveaway: ${prize} 🎉`)
      .setDescription(description)
      .addFields(
        { name: "Duration", value: duration, inline: true },
        { name: "Winners", value: winnersCount.toString(), inline: true },
        { name: "Ends", value: `<t:${Math.floor(endTime.getTime() / 1000)}:R>`, inline: true },
        { name: "Participants", value: "0", inline: true }
      )
      .setFooter({ text: `Hosted by ${interaction.user.tag}` })
      .setTimestamp()
      .setColor('#FFD700');

    const giveawayButton = new ButtonBuilder()
      .setCustomId("enter_giveaway")
      .setLabel("🎉 Enter Giveaway")
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(giveawayButton);

    try {
      const message = await channel.send({ embeds: [giveawayEmbed], components: [row] });

      // Save giveaway to database
      const giveaway = new Giveaway({
        messageId: message.id,
        channelId: channel.id,
        guildId: interaction.guild.id,
        prize,
        description,
        winnersCount,
        duration,
        endTime,
        hostId: interaction.user.id,
        participants: [],
        winners: [],
        isActive: true,
        isEnded: false
      });

      await giveaway.save();

      return interaction.reply({
        content: `✅ Giveaway created in <#${channelId}>! It will end <t:${Math.floor(endTime.getTime() / 1000)}:R>`,
        ephemeral: true,
      });

    } catch (error) {
      console.error('Error creating giveaway:', error);
      return interaction.reply({
        content: "❌ An error occurred while creating the giveaway.",
        ephemeral: true,
      });
    }
  },
};

// Helper function to parse duration strings
function parseDuration(durationStr) {
  const regex = /^(\d+)([smhdw])$/i;
  const match = durationStr.toLowerCase().match(regex);
  
  if (!match) return null;
  
  const amount = parseInt(match[1]);
  const unit = match[2];
  
  const now = new Date();
  
  switch (unit) {
    case 's': return new Date(now.getTime() + amount * 1000);
    case 'm': return new Date(now.getTime() + amount * 60 * 1000);
    case 'h': return new Date(now.getTime() + amount * 60 * 60 * 1000);
    case 'd': return new Date(now.getTime() + amount * 24 * 60 * 60 * 1000);
    case 'w': return new Date(now.getTime() + amount * 7 * 24 * 60 * 60 * 1000);
    default: return null;
  }
}