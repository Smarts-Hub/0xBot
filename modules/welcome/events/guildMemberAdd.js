import { Events, EmbedBuilder, AttachmentBuilder } from "discord.js";
import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";
import { yamlConfig } from "../index.js";
import logger from "../../../core/logger.js";

export default {
  name: Events.GuildMemberAdd,
  async execute(member, client) {
    try {
      const welcome = yamlConfig.welcome;
      const channel = member.guild.channels.cache.get(welcome.channel);
      if (!channel) return logger.warn(`Welcome channel not found: ${welcome.channel}`);

      const width = 800;
      const height = 400;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      const background = await loadImage(welcome.image["background-image-url"]);
      ctx.drawImage(background, 0, 0, width, height);

      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(0, 0, width, height);

      const avatar = await loadImage(member.user.displayAvatarURL({ extension: "png", size: 256 }));
      const avatarSize = 128;
      const avatarX = 50;
      const avatarY = height / 2 - avatarSize / 2;

      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
      ctx.restore();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 40px Sans";
      ctx.fillText(welcome.image.title.replace("{user}", member.user.username), 200, 150);

      ctx.font = "28px Sans";
      ctx.fillText(welcome.image.subtitle, 200, 200);

      const buffer = canvas.toBuffer("image/png");
      const attachment = new AttachmentBuilder(buffer, { name: "welcome.png" });

      const embed = new EmbedBuilder()
        .setColor(welcome.embed.color)
        .setTitle(welcome.embed.title.replace("{user}", member.user.username))
        .setDescription(welcome.embed.description)
        .addFields(
          welcome.embed.fields.map(f => ({
            name: f.name,
            value: f.text,
            inline: f.inline || false
          }))
        )
        .setTimestamp(welcome.embed["show-timestamp"] ? new Date() : null)
        .setAuthor(
          welcome.embed["show-author"] ? { name: member.user.username, iconURL: member.user.displayAvatarURL() } : null
        )
        .setImage("attachment://welcome.png");

      await channel.send({ embeds: [embed], files: [attachment] });
      logger.info(`Sent welcome message for ${member.user.tag}`);
    } catch (error) {
      logger.error(`Error sending welcome message: ${error}`);
    }
  },
};
