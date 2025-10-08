import { Events, EmbedBuilder, AttachmentBuilder } from "discord.js";
import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";
import { yamlConfig } from "../index.js";
import logger from "../../../core/logger.js";

export default {
  name: Events.GuildMemberAdd,
  async execute(member, client) {
    logger.debug("A member has joined the server");

    try {
      const welcome = yamlConfig.welcome;
      const channel = member.guild.channels.cache.get(welcome.channel);
      if (!channel) return logger.warn(`Welcome channel not found: ${welcome.channel}`);

      const type = welcome.type?.toLowerCase() || "embed";

      let buffer = null;

      if (type === "image" || type === "embed+image") {
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
        ctx.arc(
          avatarX + avatarSize / 2,
          avatarY + avatarSize / 2,
          avatarSize / 2,
          0,
          Math.PI * 2,
          true,
        );
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
        ctx.restore();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 40px Sans";
        ctx.fillText(welcome.image.title.replace("{user}", member.user.username), 200, 150);

        ctx.font = "28px Sans";
        ctx.fillText(welcome.image.subtitle, 200, 200);

        buffer = canvas.toBuffer("image/png");
      }

      if (type === "image") {
        const attachment = new AttachmentBuilder(buffer, { name: "welcome.png" });
        await channel.send({ files: [attachment] });
        logger.info(`Sent image-only welcome for ${member.user.tag}`);
        return;
      }

      const embed = new EmbedBuilder()
        .setColor(welcome.embed.color)
        .setTitle(welcome.embed.title.replace("{user}", member.user.username))
        .setDescription(welcome.embed.description.replace("{user}", member.user.username))
        .addFields(
          welcome.embed.fields.map((f) => ({
            name: f.namereplace("{user}", member.user.username),
            value: f.text.replace("{user}", member.user.username),
            inline: f.inline || false,
          })),
        );

      if (welcome.embed["show-timestamp"]) embed.setTimestamp();
      if (welcome.embed["show-author"])
        embed.setAuthor({
          name: member.user.username,
          iconURL: member.user.displayAvatarURL(),
        });

      const messagePayload =
        type === "embed+image"
          ? {
              embeds: [embed.setImage("attachment://welcome.png")],
              files: [new AttachmentBuilder(buffer, { name: "welcome.png" })],
            }
          : { embeds: [embed] };

      await channel.send(messagePayload);
      logger.info(`Sent ${type} welcome message for ${member.user.tag}`);
    } catch (error) {
      logger.error(`Error sending welcome message: ${error}`);
    }
  },
};
