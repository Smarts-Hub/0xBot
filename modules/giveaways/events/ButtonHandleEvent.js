import { Events } from 'discord.js';
import Giveaway from '../models/Giveaway.js';

export default {
  name: Events.InteractionCreate,
  async execute(interaction) {
    // Handle button interactions
    if (interaction.isButton()) {
      if (interaction.customId === 'enter_giveaway') {
        await handleGiveawayEntry(interaction);
      }
    }
  }
};

async function handleGiveawayEntry(interaction) {
  try {
    // Find the giveaway by message ID
    const giveaway = await Giveaway.findOne({ 
      messageId: interaction.message.id,
      isActive: true 
    });

    if (!giveaway) {
      return interaction.reply({
        content: '❌ This giveaway is no longer active or could not be found.',
        ephemeral: true
      });
    }

    // Check if giveaway has ended
    if (new Date() >= giveaway.endTime) {
      return interaction.reply({
        content: '⏰ This giveaway has already ended!',
        ephemeral: true
      });
    }

    // Check if user is already participating
    if (giveaway.participants.includes(interaction.user.id)) {
      return interaction.reply({
        content: '⚠️ You are already entered in this giveaway!',
        ephemeral: true
      });
    }

    // Add user to participants
    await Giveaway.findByIdAndUpdate(
      giveaway._id,
      { $push: { participants: interaction.user.id } },
      { new: true }
    );

    // Get updated participant count
    const updatedGiveaway = await Giveaway.findById(giveaway._id);
    const participantCount = updatedGiveaway.participants.length;

    await interaction.reply({
      content: `✅ You have successfully entered the giveaway! **${participantCount}** ${participantCount === 1 ? 'person has' : 'people have'} entered so far.`,
      ephemeral: true
    });

    const message = await interaction.channel.messages.fetch(interaction.message.id);
    if (message) {
      const embed = message.embeds[0];
      if (embed) {
        const updatedEmbed = {
          ...embed.toJSON(),
          fields: embed.fields.map(field => {
            if (field.name === 'Participants') {
              return { name: 'Participants', value: `${participantCount}`, inline: true };
            }
            return field;
          })
        };
        await message.edit({ embeds: [updatedEmbed] });
      }
    }

  } catch (error) {
    console.error('Error handling giveaway entry:', error);
    await interaction.reply({
      content: '❌ An error occurred while entering the giveaway. Please try again.',
      ephemeral: true
    });
  }
}