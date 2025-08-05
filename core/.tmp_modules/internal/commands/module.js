import { EmbedBuilder, MessageFlags, PermissionsBitField, SlashCommandBuilder } from 'discord.js';
import { api } from '../index.js';

export default {
	data: new SlashCommandBuilder()
		.setName('module')
		.setDescription('Manage 0xBot modules')
		.addSubcommand(subcommand => 
			subcommand
			.setName("list")
			.setDescription("List all the modules")
		)
		.setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),
	async execute(interaction, client) {
		if(interaction.options.getSubcommand() === "list") {
			const moduleList = api.moduleList;
			const embed = new EmbedBuilder()
			.setTitle("🔌 Module list")
			.setDescription(moduleList.toString())
			.setColor('#8fff00')
			.setFooter({ text: "0xBot Internal Commands" })
			.setTimestamp();

			interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral})
		}
	},
};
