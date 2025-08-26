import { REST, Routes } from 'discord.js';
import config from '../../config/config.json' with { type: 'json' };
import fs from 'node:fs';
import path from 'node:path';
import logger from '../logger.js';
import { pathToFileURL } from 'node:url';

const { clientId, guildId, token } = config;
const commands = [];

/**
 * Carga comandos desde una carpeta `commands` dentro de cada subcarpeta de basePath
 */
const loadCommandsFromTmpModules = async (basePath) => {
  if (!fs.existsSync(basePath)) return;

  const moduleFolders = fs.readdirSync(basePath);
  

  for (const moduleFolder of moduleFolders) {
    const modulePath = path.join(basePath, moduleFolder);
    const commandsPath = path.join(modulePath, 'commands');


    // Verifica que existe y es carpeta
    if (fs.existsSync(commandsPath) && fs.statSync(commandsPath).isDirectory()) {

        const subfolderPath = path.join(commandsPath);
        if (!fs.statSync(subfolderPath).isDirectory()) continue;

        const commandFiles = fs.readdirSync(subfolderPath).filter((file) => file.endsWith('.js'));

        for (const file of commandFiles) {
          const filePath = path.join(subfolderPath, file);
          logger.debug(file)
          try {
            const command = await import(pathToFileURL(filePath).href);
            if ('data' in command.default && 'execute' in command.default) {
              commands.push(command.default.data.toJSON());
            } else {
              logger.warn(`Command at ${filePath} is missing required "data" or "execute".`);
            }
          } catch (err) {
            logger.error(`Failed to load command at ${filePath}: ${err}`);
          }
        }
      
    }
  }
};



export const main = async () => {
  await loadCommandsFromTmpModules(path.join(import.meta.dirname, '../../modules'));

  const rest = new REST().setToken(token);

  try {
    logger.info(`Started refreshing ${commands.length} application (/) commands.`);

    const data = await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands },
    );

    logger.success(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    logger.error(`Error while reloading commands: ${error}`);
  }
};

