
import { ActionRowBuilder, ButtonStyle, EmbedBuilder, Events } from "discord.js";
import { yamlConfig } from "../index.js";
import { ButtonBuilder } from "discord-gamecord/utils/utils.js";
import logger from "../../../core/logger.js";
export default {
    name: Events.MessageReactionAdd,
    async execute(reaction, client) {
        if (!reaction || reaction.partial) {
            try {
                await reaction.fetch();
            } catch (err) {
                console.error("Error fetching reaction:", err);
                return;
            }
        }

        const { emoji, message } = reaction;

        if (emoji.name !== '⭐') return;

        const STAR_LIMIT = yamlConfig.starboard["starboard-reactions-required"];
        

        const starCount = message.reactions.cache.get('⭐')?.count || 0;
        if (starCount == STAR_LIMIT) {
            const starboardChannel = message.guild.channels.cache.get('1388256659154927717');
            if (starboardChannel) {
                const embed = new EmbedBuilder()
                    .setColor(yamlConfig.starboard.embed["starboard-embed-color"] || 0xffd700)
                    .setAuthor({
                        name: message.author.tag,
                        iconURL: message.author.displayAvatarURL(),
                    })
                    .setTimestamp();

                    if (message.content) {
                        embed.setDescription(message.content);
                    }
                    
                    
                    if (message.attachments.size > 0 && message.attachments.first().contentType?.startsWith("image/")) {
                        embed.setImage(message.attachments.first().url);
                    }

               

                const starboardMessage = await starboardChannel.send({
                    content: `⭐ **${starCount}** | [Jump to Message](${message.url})`,
                    embeds: [embed]
                });

                 const starButton = new ButtonBuilder()
                    .setLabel("⭐")
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId(`@starboard:${starboardMessage.id}`);
                
                const row = new ActionRowBuilder().addComponents(starButton);


                starboardMessage.edit({ components: [row] })
            } else {
                logger.error("Starboard channel not found. Please check the configuration.");
            }
        }
    },
};

function extension(reaction, attachment) {
    const imageLink = attachment.split(".");
    const typeOfImage = imageLink[imageLink.length - 1];
    const image = /(jpg|jpeg|png|gif)/gi.test(typeOfImage);
    if (!image) return "";
    return attachment;
  };
