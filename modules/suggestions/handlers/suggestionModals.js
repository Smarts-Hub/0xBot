import { EmbedBuilder } from "discord.js";

export async function handleSuggestionModals(interaction) {
    if (!interaction.isModalSubmit()) return;
    if (interaction.customId !== 'suggest_admin_modal') return;

    try {
        const action = interaction.fields.getTextInputValue('suggest_action');
        const reason = interaction.fields.getTextInputValue('suggest_reason');
        
        const isAccept = action.toLowerCase() === 'accept';
        if (!isAccept && action.toLowerCase() !== 'reject') {
            return interaction.reply({
                content: "❌ Invalid action. Please use 'accept' or 'reject'.",
                ephemeral: true
            });
        }

        const color = isAccept ? '#00FF00' : '#FF0000';
        const status = isAccept ? '✅ Accepted' : '❌ Rejected';
        const statusText = reason ? `${status} - ${reason}` : status;

        const originalEmbed = interaction.message.embeds[0];
        const newEmbed = EmbedBuilder.from(originalEmbed)
            .setColor(color)
            .addFields(
                { name: 'Status', value: statusText, inline: false }
            );

        await interaction.message.edit({ 
            embeds: [newEmbed], 
            components: [] 
        });
        
        await interaction.reply({
            content: `✅ Suggestion ${action.toLowerCase()}ed successfully!`,
            ephemeral: true
        });

    } catch (error) {
        console.error("Error handling suggestion modal:", error);
        await interaction.reply({
            content: "❌ An error occurred while processing your action.",
            ephemeral: true
        });
    }
}