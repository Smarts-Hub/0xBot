import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import Bans from "../models/Bans.js";
import { yamlConfig } from "../index.js";
import logger from "../../../core/logger.js";

export default {
    data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Ban a user")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("The user to ban")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("reason")
                .setDescription("Reason for the ban")
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName("delete_messages")
                .setDescription("Delete past messages (0–7 days)")
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        await interaction.deferReply();

        const user = interaction.options.getUser("user");
        const reason = interaction.options.getString("reason") || "No reason provided";
        const deleteMessageDays = interaction.options.getInteger("delete_messages") ?? 0;

        const ban = new Bans({
            userId: user.id,
            reason,
            moderatorId: interaction.user.id,
            deleteMessageDays
        });

        await ban.save();

        

        const channel = interaction.guild.channels.cache.get(yamlConfig.moderation["logs-channel"]);
        const embed = new EmbedBuilder()
            .setColor(yamlConfig.moderation.ban.embed.color ?? "DarkRed")
            .setTitle(yamlConfig.moderation.ban.embed.title ?? "You banned a user")
            .setDescription(`**Reason:**\`\`\`${reason}\`\`\``)
            .addFields(
                { name: "User", value: `${user} (${user.id})` },
                { name: "Messages Deleted", value: `${deleteMessageDays} day(s)` }
            )
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        const usrEmbed = new EmbedBuilder()
            .setColor(yamlConfig.moderation.ban["user-embed"].color ?? "DarkRed")
            .setTitle(yamlConfig.moderation.ban["user-embed"].title ?? "You got banned!")
            .setDescription(
                yamlConfig.moderation.ban["user-embed"].description.replace(`{reason}`, reason)
            )
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });

        if (channel) {
            await channel.send({ embeds: [embed] });
        }
        try {
            await user.send({ embeds: [usrEmbed] });
        } catch {
            logger.error("Could not send ban notification to user.");
        }
        try {
            const member = await interaction.guild.members.fetch(user.id);
            await member.ban({
                reason,
                deleteMessageDays
            });
        } catch (err) {
            console.error("Error applying ban:", err);
        }
    }
};
