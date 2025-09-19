import { EmbedBuilder } from "discord.js";
import { yamlConfig } from "../index.js";

export default {
    name: "interactionCreate",
    async execute(interaction) {
        if (!interaction.isModalSubmit()) return;
        if (interaction.customId !== 'suggest_admin_modal') return;

        try {
            const action = interaction.fields.getTextInputValue('suggest_action');
            const reason = interaction.fields.getTextInputValue('suggest_reason');
            
            const isAccept = action.toLowerCase() === 'accept';
            const isReject = action.toLowerCase() === 'reject';
            const isDelete = action.toLowerCase() === 'delete';

            if (!isAccept && !isReject && !isDelete) {
                return interaction.reply({
                    content: "❌ Invalid action. Please use 'accept', 'reject' or 'delete'.",
                    ephemeral: true
                });
            }

            if (isDelete) {
                const originalEmbed = interaction.message.embeds[0];
                
                await sendDeleteLog(interaction, originalEmbed, reason);
                
                await interaction.message.delete();
                
                return interaction.reply({
                    content: "✅ Suggestion deleted successfully!",
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
};

async function sendDeleteLog(interaction, originalEmbed, reason) {
    try {
        const config = yamlConfig?.suggestions || {};
        const logChannelId = config["log-channel"];
        
        if (!logChannelId) return;

        const logChannel = interaction.guild.channels.cache.get(logChannelId);
        if (!logChannel) return;

        const logEmbed = new EmbedBuilder()
            .setTitle('🗑️ Suggestion Deleted')
            .setColor('#FF0000')
            .setDescription(`A suggestion was deleted by ${interaction.user}`)
            .addFields(
                { name: 'Moderator', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
                { name: 'Reason', value: reason || 'No reason provided', inline: true },
                { name: 'Deleted At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
            )
            .setFooter({ text: 'Suggestion Log System' })
            .setTimestamp();

        if (originalEmbed) {
            if (originalEmbed.data.author) {
                logEmbed.setAuthor(originalEmbed.data.author);
            }
            if (originalEmbed.data.description) {
                logEmbed.addFields({ 
                    name: 'Original Suggestion', 
                    value: originalEmbed.data.description.length > 1000 
                        ? originalEmbed.data.description.substring(0, 1000) + '...' 
                        : originalEmbed.data.description 
                });
            }
        }

        await logChannel.send({ embeds: [logEmbed] });

    } catch (error) {
        console.error("Error sending delete log:", error);
    }
}