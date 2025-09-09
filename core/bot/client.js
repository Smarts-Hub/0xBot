/*
 * 0xBot - Fully modular discord bot 
 *
 * * This bot offers the ability to create a discord bot fully customizable through modules.
 * * You can get information about the bot's functionality and how to use it in the documentation.
 *   * https://docs.smartshub.dev/0xbot
 *
 * 0xBot is licensed under the MIT License.
 */

import { Client, Events, GatewayIntentBits, Collection } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';
import config from '../../config/config.json' with { type: 'json' };
import logger from '../logger.js';
import {main} from "./commands.js";
import { pathToFileURL } from 'url';


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildExpressions,
  ]
});

client.commands = new Collection();



const loadModulesFromBase = async (basePath) => {
  if (!fs.existsSync(basePath)) return;

  const moduleFolders = fs.readdirSync(basePath);
  logger.debug(`Found module folders: ${moduleFolders.join(', ')}`);

  for (const moduleFolder of moduleFolders) {
    const modulePath = path.join(basePath, moduleFolder);

    const commandsPath = path.join(modulePath, 'commands');
    if (fs.existsSync(commandsPath) && fs.statSync(commandsPath).isDirectory()) {
      const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

      for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        logger.debug(`Loading command: ${file}`);
        try {
          const commandModule = await import(pathToFileURL(filePath).href);
          const command = commandModule.default;
          if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command); // Registra en el cliente
          } else {
            logger.warn(`Command at ${filePath} is missing "data" or "execute".`);
          }
        } catch (err) {
          logger.error(`Failed to load command at ${filePath}: ${err}`);
        }
      }
    }

    const eventsPath = path.join(modulePath, 'events');
    if (fs.existsSync(eventsPath) && fs.statSync(eventsPath).isDirectory()) {
      const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

      for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        try {
          const eventModule = await import(pathToFileURL(filePath).href);
          const event = eventModule.default;

          if (!event || !event.name || typeof event.execute !== 'function') {
            logger.warn(`Event at ${filePath} is missing "name" or "execute" property.`);
            continue;
          }

          if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
            logger.debug(`Event registered: ${event.name} (once)`);
          } else {
            client.on(event.name, (...args) => event.execute(...args, client));
            logger.debug(`Event registered: ${event.name}`);
          }

        } catch (err) {
          logger.error(`Failed to load event at ${filePath}: ${err}`);
        }
      }
    }
  }
};


export const init = async () => {
  main();
  await loadModulesFromBase(path.join(import.meta.dirname, '../../modules'));
  await client.login(config.token);
};


export const discord_client = client;
