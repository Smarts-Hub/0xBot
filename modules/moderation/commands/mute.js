import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import Mutes from "../models/Mutes.js";
import { yamlConfig } from "../index.js";

export default {
    data: new SlashCommandBuilder()
        .setName("mute")
        .setDescription("Mute a user")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("The user to mute")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("reason")
                .setDescription("Reason for the mute")
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName("duration")
                .setDescription("Duration of the mute in minutes (0 = permanent)")
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        await interaction.deferReply();

        const user = interaction.options.getUser("user");
        const reason = interaction.options.getString("reason") || "No reason provided";
        const durationMinutes = interaction.options.getInteger("duration") ?? 0;

        const durationSeconds = durationMinutes * 60; 

        const mute = new Mutes({
            userId: user.id,
            reason: reason,
            moderatorId: interaction.user.id,
            duration: durationSeconds
        });

        await mute.save();

        if (durationMinutes > 0) {
            try {
                const member = await interaction.guild.members.fetch(user.id);
                await member.timeout(durationSeconds * 1000, reason);
            } catch (err) {
                console.error("Error applying timeout:", err);
            }
        }

        const channel = await interaction.guild.channels.cache.get(yamlConfig.moderation["logs-channel"]);
        const embed = new EmbedBuilder()
            .setColor(yamlConfig.moderation.mute.embed.color ?? 'Orange')
            .setTitle(yamlConfig.moderation.mute.embed.title ?? "You muted a user")
            .setDescription(`**Reason:**\`\`\`${reason}\`\`\``)
            .addFields(
                { name: "User", value: `${user} (${user.id})`},
                { name: "Time (min)", value: `${durationMinutes}m`},
            )
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        const usrEmbed = new EmbedBuilder()
            .setColor(yamlConfig.moderation.mute["user-embed"].color ?? 'Orange')
            .setTitle(yamlConfig.moderation.mute["user-embed"].title ?? "You got muted!")
            .setDescription(yamlConfig.moderation.mute["user-embed"].description.replace(`{reason}`, reason))
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });

        if(channel) {
            await channel.send({ embeds: [embed] });
        }
        try {
            await user.send({ embeds: [usrEmbed] });
        } catch {
            logger.error("Could not send warn error to usr.")
        }
    }
};
