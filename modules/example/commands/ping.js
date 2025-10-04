import { SlashCommandBuilder } from 'discord.js';
import logger from "#logger";

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Responds with pong'),
    //You can add here as many options as you want
  async execute(interaction, client) {
    // Command goes here
    logger.info("Somebody used this command!");    
    interaction.reply("Pong!");
  },
};