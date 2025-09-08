import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';import Warns from "../models/WarnsSchema.js";
import { yamlConfig } from "../index.js"

export default {
    data: new SlashCommandBuilder()
        .setName("warns")
        .setDescription("View warns of a user")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("The user to see the warns")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        await interaction.deferReply();
        const user = interaction.options.getUser("user");

        const userWarns = await Warns.find({
            userId: user.id
        })

        if (!userWarns.length >= 1) {
            return interaction.editReply({ content: "No warns found for that user", ephemeral: true });
        }

        let page = 0;

        const generateEmbed = (index) => {
            const warn = userWarns[index];
            return new EmbedBuilder()
                .setTitle(`${yamlConfig.moderation.warnlist.embed.title} ${index + 1}/${userWarns.length}`)
                .addFields(
                    { name: yamlConfig.moderation.warnlist.embed["fields-title"].reason, value: warn.reason, inline: false },
                    { name: yamlConfig.moderation.warnlist.embed["fields-title"].moderator, value: warn.moderatorId, inline: true },
                    { name: `\`${yamlConfig.moderation.warnlist.embed["fields-title"].date}\``, value: warn.timestamp.toString(), inline: true }
                )
                .setColor(yamlConfig.moderation.warnlist.embed.color)
                .setTimestamp();
        };

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('prev')
                    .setLabel(`⬅️ ${yamlConfig.moderation.warnlist.buttons.prev}`)
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(true),
                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel(`${yamlConfig.moderation.warnlist.buttons.prev} ➡️`)
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(userWarns.length === 1)
            );

        const message = await interaction.editReply({ embeds: [generateEmbed(page)], components: [row], fetchReply: true });

        const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });

        collector.on('collect', i => {
            if (i.user.id !== interaction.user.id) {
                return i.reply({ content: yamlConfig.moderation.warnlist["cant-use-buttons"], ephemeral: true });
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
                        .setDisabled(page === userWarns.length - 1)
                );

            i.update({ embeds: [generateEmbed(page)], components: [newRow] });
        });

        collector.on('end', () => {
            const disabledRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('prev')
                        .setLabel(`⬅️ ${yamlConfig.moderation.warnlist.buttons.prev}`)
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel(`${yamlConfig.moderation.warnlist.buttons.prev} ➡️`)
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(true)
                );
            message.edit({ components: [disabledRow] });
        });


    }
};
