import { SlashCommandBuilder } from 'discord.js';
import { yamlConfig } from '../index.js';
import Giveaway from '../models/Giveaway.js';

export default {
  data: new SlashCommandBuilder()
    .setName('end-giveaway')
    .setDescription('Manually end a giveaway')
    .addStringOption(option =>
      option
        .setName('message-id')
        .setDescription('The message ID of the giveaway to end')
        .setRequired(true)
    ),

  async execute(interaction) {
    // Check permissions
    if (!interaction.member.roles.cache.has(yamlConfig.giveaways["required-role"])) {
      return interaction.reply({
        content: "❌ You don't have permission to use this command.",
        ephemeral: true,
      });
    }

    const messageId = interaction.options.getString('message-id');

    try {
      // Find the giveaway
      const giveaway = await Giveaway.findOne({ 
        messageId: messageId,
        isActive: true 
      });

      if (!giveaway) {
        return interaction.reply({
          content: '❌ Giveaway not found or already ended.',
          ephemeral: true
        });
      }

      // Check if user is the host or has admin permissions
      if (giveaway.hostId !== interaction.user.id && !interaction.member.permissions.has('Administrator')) {
        return interaction.reply({
          content: '❌ You can only end giveaways that you created, unless you have Administrator permissions.',
          ephemeral: true
        });
      }

      // Get the giveaway checker instance (you'll need to pass this from your main file)
      // For now, we'll manually end it
      const { GiveawayChecker } = await import('../utils/giveawayChecker.js');
      const checker = new GiveawayChecker(interaction.client);
      
      const result = await checker.manualEndGiveaway(messageId);

      if (result.success) {
        await interaction.reply({
          content: '✅ Giveaway ended successfully!',
          ephemeral: true
        });
      } else {
        await interaction.reply({
          content: `❌ ${result.message}`,
          ephemeral: true
        });
      }

    } catch (error) {
      console.error('Error ending giveaway:', error);
      await interaction.reply({
        content: '❌ An error occurred while ending the giveaway.',
        ephemeral: true
      });
    }
  }
};