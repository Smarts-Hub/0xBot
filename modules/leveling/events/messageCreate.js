
import { Events, EmbedBuilder } from "discord.js";
import { yamlConfig } from "../index.js";
import UserLevel from "../models/UserLevelSchema.js";
import logger from "../../../core/logger.js";


export default {
    name: Events.MessageCreate,
    async execute(message, client) {
        if (message.author.bot) return;


        const leveling = yamlConfig?.leveling ?? {};

        if(!yamlConfig?.leveling) {
            logger.error("Yaml configuration for this resource is not valid!")
        }

        const disallowedChannels = leveling["disallowed-channels"] ?? [];
        if(!leveling["disallowed-channels"]) {
            logger.error("Yaml configuration for disallowed channels is not valid!");
        }

        if (disallowedChannels.includes(message.channel.id)) return;

        const userId = message.author.id;

        let data = await UserLevel.findOne({ userId });
        if (!data) {
            data = await UserLevel.create({ userId, xp: 0, level: 1 });
        }

        data.xp += Math.floor(Math.random() * ((leveling["max-xp"] ?? 30) - (leveling["min-xp"] ?? 10) + 1)) + (leveling["min-xp"] ?? 10);
        const thresholdXp = yamlConfig?.leveling?.["xp-threshold"] ?? 1000;
        const xpNeeded = Math.floor(((data.level + 1) * thresholdXp));

        if (data.xp >= xpNeeded) {
            const newLevel = data.level + 1;
            data.level = newLevel;
            data.lastUpdated = new Date();
            await data.save();

            if (leveling["broadcast-level-up"]) {
                const embedConfig = leveling["broadcast-level-up-embed"] ?? {};
                const embed = new EmbedBuilder()
                    .setTitle(embedConfig.title
                        ?.replace("{level}", newLevel)
                        ?.replace("{user.mention}", `<@${userId}>`) || `Level Up!`)
                    .setDescription(embedConfig.description
                        ?.replace("{level}", newLevel)
                        ?.replace("{user.mention}", `<@${userId}>`) || "")
                    .setColor(embedConfig.color || "#00ff00");

                if (embedConfig.footer) {
                    embed.setFooter({
                        text: embedConfig.footer.text
                            ?.replace("{user.mention}", `<@${userId}>`) || "",
                        iconURL: embedConfig.footer.icon_url
                            ?.replace("{user.avatar_url}", message.author.displayAvatarURL())
                    });
                }

                if (embedConfig.thumbnail) {
                    embed.setThumbnail(embedConfig.thumbnail.url
                        ?.replace("{user.avatar_url}", message.author.displayAvatarURL()));
                }

                if (leveling["levelup-broadcast-channel"] === "reply") {
                    await message.reply({ embeds: [embed] });
                } else {
                    const channel = client.channels.cache.get(leveling["levelup-broadcast-channel"]);
                    if (channel?.isTextBased()) {
                        channel.send({ embeds: [embed] });
                    }
                }
            }
        } else {
            data.lastUpdated = new Date();
            await data.save();
        }
    }
};