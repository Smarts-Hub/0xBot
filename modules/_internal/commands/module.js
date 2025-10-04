/*
 * 0xBot - Fully modular discord bot 
 *
 * * This bot offers the ability to create a discord bot fully customizable through modules.
 * * You can get information about the bot's functionality and how to use it in the documentation.
 *   * https://docs.smartshub.dev/0xbot
 *
 * 0xBot is licensed under the MIT License.
 */

import { EmbedBuilder, MessageFlags, PermissionsBitField, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';
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
        if (interaction.options.getSubcommand() === "list") {
            const moduleMetadataList = api.moduleMetadataList;

            if (!moduleMetadataList || moduleMetadataList.length === 0) {
                return interaction.reply({ content: "No modules found.", ephemeral: true });
            }

            let page = 0;

            const generateEmbed = (index) => {
                const mod = moduleMetadataList[index];
                return new EmbedBuilder()
                    .setTitle(`🔌 Module ${index + 1}/${moduleMetadataList.length}`)
                    .addFields(
                        { name: "Name", value: mod.name, inline: true },
                        { name: "Version", value: mod.version, inline: true },
                        { name: "Author", value: mod.author, inline: true },
						{ name: "Description", value: mod.description || "No description provided.", inline: false },
                    )
                    .setColor('#8fff00')
                    .setFooter({ text: "0xBot Internal Commands" })
                    .setTimestamp();
            };

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('prev')
                        .setLabel('⬅️ Previous')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('Next ➡️')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(moduleMetadataList.length === 1)
                );

            const message = await interaction.reply({ embeds: [generateEmbed(page)], components: [row], fetchReply: true });

            const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });

            collector.on('collect', i => {
                if (i.user.id !== interaction.user.id) {
                    return i.reply({ content: "You cannot use these buttons.", ephemeral: true });
                }

                if (i.customId === 'prev') page--;
                if (i.customId === 'next') page++;

                const newRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('prev')
                            .setLabel('⬅️ Previous')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(page === 0),
                        new ButtonBuilder()
                            .setCustomId('next')
                            .setLabel('Next ➡️')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(page === moduleMetadataList.length - 1)
                    );

                i.update({ embeds: [generateEmbed(page)], components: [newRow] });
            });

            collector.on('end', () => {
                const disabledRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('prev')
                            .setLabel('⬅️ Previous')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(true),
                        new ButtonBuilder()
                            .setCustomId('next')
                            .setLabel('Next ➡️')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(true)
                    );
                message.edit({ components: [disabledRow] });
            });
        }
    },
};
