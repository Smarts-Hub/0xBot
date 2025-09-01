/*
 * 0xBot - Fully modular discord bot 
 *
 * * This bot offers the ability to create a discord bot fully customizable through modules.
 * * You can get information about the bot's functionality and how to use it in the documentation.
 *   * https://docs.smartshub.dev/0xbot
 *
 * 0xBot is licensed under the MIT License.
 */

import { Events, MessageFlags } from "discord.js";

export default {
	name: Events.InteractionCreate,
	async execute(interaction, client) {
		if (!interaction.isChatInputCommand()) return;

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			await command.execute(interaction, client);
		} catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
			} else {
				await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
			}
		}
	},
};