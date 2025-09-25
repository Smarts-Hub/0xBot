// utils/giveawayChecker.js
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import Giveaway from '../models/Giveaway.js';

export class GiveawayChecker {
  constructor(client) {
    this.client = client;
    this.checkInterval = 30000; // Check every 30 seconds
  }

  // Start the checker
  start() {
    console.log('🎉 Giveaway checker started');
    this.intervalId = setInterval(() => {
      this.checkGiveaways();
    }, this.checkInterval);
  }

  // Stop the checker
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      console.log('🎉 Giveaway checker stopped');
    }
  }

  // Check for ended giveaways
  async checkGiveaways() {
    try {
      const endedGiveaways = await Giveaway.find({
        endTime: { $lte: new Date() },
        isActive: true,
        isEnded: false
      });

      for (const giveaway of endedGiveaways) {
        await this.endGiveaway(giveaway);
      }
    } catch (error) {
      console.error('Error checking giveaways:', error);
    }
  }

  // End a specific giveaway
  async endGiveaway(giveaway) {
    try {
      const channel = await this.client.channels.fetch(giveaway.channelId);
      if (!channel) {
        console.log(`Channel ${giveaway.channelId} not found for giveaway ${giveaway._id}`);
        return;
      }

      const message = await channel.messages.fetch(giveaway.messageId);
      if (!message) {
        console.log(`Message ${giveaway.messageId} not found for giveaway ${giveaway._id}`);
        return;
      }

      // Select winners
      const winners = this.selectWinners(giveaway.participants, giveaway.winnersCount);

      // Update giveaway in database
      await Giveaway.findByIdAndUpdate(giveaway._id, {
        winners: winners,
        isActive: false,
        isEnded: true
      });

      // Create ended giveaway embed
      const endedEmbed = new EmbedBuilder()
        .setTitle(`🎊 Giveaway Ended: ${giveaway.prize} 🎊`)
        .setDescription(giveaway.description)
        .addFields(
          { name: "Winners", value: giveaway.winnersCount.toString(), inline: true },
          { name: "Participants", value: giveaway.participants.length.toString(), inline: true },
          { name: "Ended", value: `<t:${Math.floor(giveaway.endTime.getTime() / 1000)}:R>`, inline: true }
        )
        .setFooter({ text: `Hosted by ${await this.getHostTag(giveaway.hostId)}` })
        .setTimestamp()
        .setColor('#FF0000');

      // Add winners field
      if (winners.length > 0) {
        const winnerMentions = winners.map(id => `<@${id}>`).join('\n');
        endedEmbed.addFields({ name: "🏆 Winners", value: winnerMentions, inline: false });
      } else {
        endedEmbed.addFields({ name: "🏆 Winners", value: "No valid participants", inline: false });
      }

      // Create disabled button
      const disabledButton = new ButtonBuilder()
        .setCustomId("enter_giveaway_ended")
        .setLabel("🎉 Giveaway Ended")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);

      const row = new ActionRowBuilder().addComponents(disabledButton);

      // Update the original message
      await message.edit({ embeds: [endedEmbed], components: [row] });

      // Send winner announcement
      if (winners.length > 0) {
        const winnerText = winners.length === 1 ? 'Winner' : 'Winners';
        const winnerMentions = winners.map(id => `<@${id}>`).join(', ');
        
        await channel.send({
          content: `🎊 **Giveaway ${winnerText}** 🎊\n\nCongratulations ${winnerMentions}! You won **${giveaway.prize}**!\n\nPlease contact the host <@${giveaway.hostId}> to claim your prize.`
        });
      } else {
        await channel.send({
          content: `😔 The giveaway for **${giveaway.prize}** has ended, but there were no valid participants.`
        });
      }

      console.log(`Giveaway ended: ${giveaway.prize} - ${winners.length} winners selected`);

    } catch (error) {
      console.error(`Error ending giveaway ${giveaway._id}:`, error);
    }
  }

  // Select random winners from participants
  selectWinners(participants, winnersCount) {
    if (participants.length === 0) return [];
    
    const availableParticipants = [...participants];
    const winners = [];
    const maxWinners = Math.min(winnersCount, availableParticipants.length);

    for (let i = 0; i < maxWinners; i++) {
      const randomIndex = Math.floor(Math.random() * availableParticipants.length);
      winners.push(availableParticipants[randomIndex]);
      availableParticipants.splice(randomIndex, 1);
    }

    return winners;
  }

  // Get host tag
  async getHostTag(hostId) {
    try {
      const user = await this.client.users.fetch(hostId);
      return user.tag;
    } catch {
      return 'Unknown User';
    }
  }

  // Manual end giveaway (for commands)
  async manualEndGiveaway(messageId) {
    const giveaway = await Giveaway.findOne({ 
      messageId: messageId,
      isActive: true 
    });

    if (!giveaway) {
      return { success: false, message: 'Giveaway not found or already ended.' };
    }

    await this.endGiveaway(giveaway);
    return { success: true, message: 'Giveaway ended successfully!' };
  }
}

// Initialize and start the checker (add this to your main bot file)
export function initializeGiveawayChecker(client) {
  const checker = new GiveawayChecker(client);
  checker.start();
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    checker.stop();
    process.exit(0);
  });
  
  return checker;
}