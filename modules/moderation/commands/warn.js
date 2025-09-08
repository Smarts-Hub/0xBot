import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import Warns from "../models/WarnsSchema.js";
import { yamlConfig } from "../index.js"

export default {
    data: new SlashCommandBuilder()
        .setName("warn")
        .setDescription("Warn a user")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("The user to warn")
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName("reason")
                .setDescription("The reason of this warn")
                .setRequired(true)
            
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        await interaction.deferReply();
        const user = interaction.options.getUser("user");
        const reason = interaction.options.getString("reason") ?? "No reason provided";

        const addedWarn = await Warns.create({
            userId: user.id,
            reason,
            moderatorId: interaction.user.id
        })

        const channel = await interaction.guild.channels.cache.get(yamlConfig.moderation["logs-channel"]);
        const embed = new EmbedBuilder()
            .setColor(yamlConfig.moderation.warns.embed.color ?? 'Orange')
            .setTitle(yamlConfig.moderation.warns.embed.title ?? "You warned a user")
            .setDescription(`**Reason:**\`\`\`${reason}\`\`\``)
            .addFields(
                { name: "User", value: `${user} (${user.id})`},
            )
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        const usrEmbed = new EmbedBuilder()
            .setColor(yamlConfig.moderation.warns["user-embed"].color ?? 'Orange')
            .setTitle(yamlConfig.moderation.warns["user-embed"].title ?? "You got warned!")
            .setDescription(yamlConfig.moderation.warns["user-embed"].description.replace(`{reason}`, reason))
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
