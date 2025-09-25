import { yamlConfig } from "../index.js";

export default {
    name: "messageCreate",
    async execute(message) {
        if (message.author.bot) return;

        const config = yamlConfig?.suggestions || {};
        if (!config) return;

        const suggestionChannelId = config["suggestion-channel"];
        
        if (message.channel.id === suggestionChannelId) {
            try {
                await message.delete().catch(() => {});
                
                const warningMessage = await message.channel.send({
                    content: `❌ ${message.author}, please use \`/suggest\` to submit suggestions.`,
                    ephemeral: true
                });

                setTimeout(async () => {
                    try {
                        await warningMessage.delete();
                    } catch (error) {
                        console.error("Error deleting warning message:", error);
                    }
                }, 5000);

            } catch (error) {
                console.error("Error in suggestion channel:", error);
            }
        }
    }
};