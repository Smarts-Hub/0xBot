import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { yamlConfig } from "../index.js";

export default {
  data: new SlashCommandBuilder()
    .setName("create-embed")
    .setDescription("Start the creation of a new embed"),

  async execute(interaction) {
    if (!interaction.member.roles.cache.has(yamlConfig.embeds["required-role"])) {
      return interaction.reply({
        content: "❌ You don't have permission to use this command.",
        ephemeral: true,
      });
    }

    let embed = new EmbedBuilder()
      .setTitle("*Title not set*")
      .setDescription("*Description not set*");
    let showTimestamp = false;
    let fields = [];

    // Buttons need to be ButtonBuilder instances
    const setTitleBtn = new ButtonBuilder()
      .setCustomId("set-embed-title")
      .setLabel("Set Title")
      .setEmoji("🏷️")
      .setStyle(ButtonStyle.Secondary);

    const setDescriptionBtn = new ButtonBuilder()
      .setCustomId("set-embed-desc")
      .setLabel("Set Description")
      .setEmoji("📄")
      .setStyle(ButtonStyle.Secondary);

    const setAuthorBtn = new ButtonBuilder()
      .setCustomId("set-embed-author")
      .setLabel("Set Author")
      .setEmoji("👤")
      .setStyle(ButtonStyle.Secondary);

    const setFooterBtn = new ButtonBuilder()
      .setCustomId("set-embed-footer")
      .setLabel("Set Footer")
      .setEmoji("👟")
      .setStyle(ButtonStyle.Secondary);

    const setColorBtn = new ButtonBuilder()
      .setCustomId("set-embed-color")
      .setLabel("Set Color")
      .setEmoji("🎨")
      .setStyle(ButtonStyle.Secondary);

    const addFieldBtn = new ButtonBuilder()
      .setCustomId("add-embed-field")
      .setLabel("Add Field")
      .setEmoji("➕")
      .setStyle(ButtonStyle.Secondary);

    const toggleTimestampBtn = new ButtonBuilder()
      .setCustomId("toggle-embed-timestamp")
      .setLabel("Toggle Timestamp")
      .setEmoji("⏰")
      .setStyle(ButtonStyle.Secondary);

    const sendBtn = new ButtonBuilder()
      .setCustomId("send-embed")
      .setLabel("Send")
      .setEmoji("📤")
      .setStyle(ButtonStyle.Success);

    const firstRow = new ActionRowBuilder().addComponents(
      setTitleBtn,
      setDescriptionBtn,
      setAuthorBtn,
      setFooterBtn,
      setColorBtn
    );

    const secondRow = new ActionRowBuilder().addComponents(
      addFieldBtn,
      toggleTimestampBtn,
      sendBtn
    );

    await interaction.reply({
      embeds: [embed],
      components: [firstRow, secondRow],
      ephemeral: true,
    });

    const collector = interaction.channel.createMessageComponentCollector({
      time: 5 * 60 * 1000,
    });

    // Handle modal submissions within the collector
    const modalSubmitListener = async (modalInteraction) => {
      if (!modalInteraction.isModalSubmit()) return;
      if (modalInteraction.user.id !== interaction.user.id) return;

      try {
        if (modalInteraction.customId === "modal-embed-title") {
          const title = modalInteraction.fields.getTextInputValue("embed-title-input");
          embed.setTitle(title || "*Title not set*");
          await modalInteraction.update({ embeds: [embed] });
        }

        if (modalInteraction.customId === "modal-embed-desc") {
          const desc = modalInteraction.fields.getTextInputValue("embed-desc-input");
          embed.setDescription(desc || "*Description not set*");
          await modalInteraction.update({ embeds: [embed] });
        }

        if (modalInteraction.customId === "modal-embed-author") {
          const author = modalInteraction.fields.getTextInputValue("embed-author-input");
          if (author) {
            embed.setAuthor({ name: author });
          } else {
            const { author: _, ...embedData } = embed.data;
            embed = EmbedBuilder.from(embedData);
          }
          await modalInteraction.update({ embeds: [embed] });
        }

        if (modalInteraction.customId === "modal-embed-footer") {
          const footer = modalInteraction.fields.getTextInputValue("embed-footer-input");
          if (footer) {
            embed.setFooter({ text: footer });
          } else {
            const { footer: _, ...embedData } = embed.data;
            embed = EmbedBuilder.from(embedData);
          }
          await modalInteraction.update({ embeds: [embed] });
        }

        if (modalInteraction.customId === "modal-embed-color") {
          const colorInput = modalInteraction.fields.getTextInputValue("embed-color-input");
          let color = null;
          if (colorInput) {
            const hexColor = colorInput.replace(/^#/, '');
            if (/^[0-9A-Fa-f]{6}$/.test(hexColor)) {
              color = parseInt(hexColor, 16);
            } else {
              return modalInteraction.reply({
                content: "❌ Invalid HEX color format. Use format like #0099FF.",
                ephemeral: true,
              });
            }
          }
          if (color !== null) {
            embed.setColor(color);
          } else {
            const { color: _, ...embedData } = embed.data;
            embed = EmbedBuilder.from(embedData);
          }
          await modalInteraction.update({ embeds: [embed] });
        }

        if (modalInteraction.customId === "modal-add-field") {
          const name = modalInteraction.fields.getTextInputValue("field-name-input");
          const value = modalInteraction.fields.getTextInputValue("field-value-input");
          fields.push({ name, value, inline: false });
          embed.setFields(fields);
          await modalInteraction.update({ embeds: [embed] });
        }

        if (modalInteraction.customId === "modal-send-embed") {
          const channelId = modalInteraction.fields.getTextInputValue("embed-channel-id");
          const channel = await interaction.client.channels.fetch(channelId).catch(() => null);
          interaction.client.removeListener("interactionCreate", modalSubmitListener);
          
          if (!channel || !channel.isTextBased()) {
            return modalInteraction.reply({
              content: "❌ Invalid channel ID.",
              ephemeral: true,
            });
          }
          await channel.send({ embeds: [embed] });
          await modalInteraction.reply({
            content: `✅ Embed sent to <#${channelId}>`,
            ephemeral: true,
          });
        }
      } catch (error) {
        console.error("Modal handling error:", error);
      }
    };

    // Add the modal submit listener
    interaction.client.on("interactionCreate", modalSubmitListener);

    collector.on("collect", async (btnInteraction) => {
      if (btnInteraction.user.id !== interaction.user.id) {
        return btnInteraction.reply({
          content: "❌ This is not your embed builder.",
          ephemeral: true,
        });
      }

      if (btnInteraction.customId === "set-embed-title") {
        const modal = new ModalBuilder()
          .setCustomId("modal-embed-title")
          .setTitle("Set Embed Title")
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("embed-title-input")
                .setLabel("Title")
                .setStyle(TextInputStyle.Short)
                .setRequired(false)
                .setValue(embed.data.title === "*Title not set*" ? "" : embed.data.title)
            )
          );
        await btnInteraction.showModal(modal);
      }

      if (btnInteraction.customId === "set-embed-desc") {
        const modal = new ModalBuilder()
          .setCustomId("modal-embed-desc")
          .setTitle("Set Embed Description")
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("embed-desc-input")
                .setLabel("Description")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(false)
                .setValue(embed.data.description === "*Description not set*" ? "" : embed.data.description)
            )
          );
        await btnInteraction.showModal(modal);
      }

      if (btnInteraction.customId === "set-embed-author") {
        const modal = new ModalBuilder()
          .setCustomId("modal-embed-author")
          .setTitle("Set Embed Author")
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("embed-author-input")
                .setLabel("Author Name")
                .setStyle(TextInputStyle.Short)
                .setRequired(false)
                .setValue(embed.data.author?.name || "")
            )
          );
        await btnInteraction.showModal(modal);
      }

      if (btnInteraction.customId === "set-embed-footer") {
        const modal = new ModalBuilder()
          .setCustomId("modal-embed-footer")
          .setTitle("Set Embed Footer")
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("embed-footer-input")
                .setLabel("Footer Text")
                .setStyle(TextInputStyle.Short)
                .setRequired(false)
                .setValue(embed.data.footer?.text || "")
            )
          );
        await btnInteraction.showModal(modal);
      }

      if (btnInteraction.customId === "set-embed-color") {
        const modal = new ModalBuilder()
          .setCustomId("modal-embed-color")
          .setTitle("Set Embed Color")
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("embed-color-input")
                .setLabel("HEX Color (e.g., #0099FF)")
                .setStyle(TextInputStyle.Short)
                .setRequired(false)
                .setPlaceholder("#0099FF")
                .setValue(embed.data.color ? `#${embed.data.color.toString(16).padStart(6, '0')}` : "")
            )
          );
        await btnInteraction.showModal(modal);
      }

      if (btnInteraction.customId === "add-embed-field") {
        const modal = new ModalBuilder()
          .setCustomId("modal-add-field")
          .setTitle("Add Field to Embed")
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("field-name-input")
                .setLabel("Field Name")
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setPlaceholder("Enter field name")
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("field-value-input")
                .setLabel("Field Value")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
                .setPlaceholder("Enter field value")
            )
          );
        await btnInteraction.showModal(modal);
      }

      if (btnInteraction.customId === "toggle-embed-timestamp") {
        showTimestamp = !showTimestamp;
        if (showTimestamp) {
          embed.setTimestamp();
        } else {
          const { timestamp, ...embedData } = embed.data;
          embed = EmbedBuilder.from(embedData);
        }
        await btnInteraction.update({ embeds: [embed] });
      }

      if (btnInteraction.customId === "send-embed") {
        const modal = new ModalBuilder()
          .setCustomId("modal-send-embed")
          .setTitle("Send Embed")
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("embed-channel-id")
                .setLabel("Channel ID")
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setPlaceholder("Enter channel ID")
            )
          );

        await btnInteraction.showModal(modal);
      }
    });

    collector.on("end", () => {
      // Remove the modal interaction listener when the collector ends
      interaction.client.removeListener("interactionCreate", modalSubmitListener);
    });
  },
};