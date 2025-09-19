import { EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from "discord.js";
import { yamlConfig } from "../index.js";

export async function handleSuggestionButtons(interaction) {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith('suggest_')) return;

    const config = yamlConfig?.suggestions || {};
    const adminRoleId = config["admin-role"];

    try {
        if (interaction.customId === 'suggest_upvote' || interaction.customId === 'suggest_downvote') {
            await handleVote(interaction);
        } else if (interaction.customId === 'suggest_admin') {
            await handleAdminButton(interaction, adminRoleId);
        }
    } catch (error) {
        console.error("Error handling suggestion button:", error);
        await interaction.reply({
            content: "❌ An error occurred while processing your action.",
            ephemeral: true
        }).catch(() => {});
    }
}

async function handleVote(interaction) {
    const message = interaction.message;
    const embed = message.embeds[0];
    const voteField = embed.fields.find(field => field.name === "Votes");
    
    if (!voteField) return;

    let upvotes = 0;
    let downvotes = 0;
    
    const voteMatch = voteField.value.match(/👍 (\d+) \| 👎 (\d+)/);
    if (voteMatch) {
        upvotes = parseInt(voteMatch[1]);
        downvotes = parseInt(voteMatch[2]);
    }

    if (interaction.customId === 'suggest_upvote') {
        upvotes++;
    } else {
        downvotes++;
    }

    const newEmbed = EmbedBuilder.from(embed)
        .spliceFields(0, 1, { 
            name: "Votes", 
            value: `👍 ${upvotes} | 👎 ${downvotes}`, 
            inline: true 
        });

    await interaction.update({ embeds: [newEmbed] });
}

async function handleAdminButton(interaction, adminRoleId) {
    const hasAdmin = interaction.member.permissions.has('Administrator');
    const hasRole = adminRoleId && interaction.member.roles.cache.has(adminRoleId);
    
    if (!hasAdmin && !hasRole) {
        return interaction.reply({
            content: "❌ You don't have permission to use this feature.",
            ephemeral: true
        });
    }

    const modal = new ModalBuilder()
        .setCustomId('suggest_admin_modal')
        .setTitle('Manage Suggestion');

    const actionInput = new TextInputBuilder()
        .setCustomId('suggest_action')
        .setLabel('Action (accept/reject)')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(10)
        .setPlaceholder('Type "accept" or "reject"');

    const reasonInput = new TextInputBuilder()
        .setCustomId('suggest_reason')
        .setLabel('Reason (optional)')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false)
        .setMaxLength(500)
        .setPlaceholder('Enter the reason for your decision');

    const firstActionRow = new ActionRowBuilder().addComponents(actionInput);
    const secondActionRow = new ActionRowBuilder().addComponents(reasonInput);

    modal.addComponents(firstActionRow, secondActionRow);

    await interaction.showModal(modal);
}