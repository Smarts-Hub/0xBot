import type { Client } from "discord.js";

/** Logging system */
export interface Logger {
  info(message: string): void;
  success(message: string): void;
  debug(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

/** Main API received by modules on run() */
export interface ModuleApi {
  /** Logger */
  logger: Logger;

  /** Discord.js Client */
  client: Client;

  /** Global configuration */
  config: Record<string, any>;

  /** Loaded module list */
  moduleList: string[];

  /** Module metadata list */
  moduleMetadataList: Array<Record<string, any>>;

  /**
   * Installs a package using NPM
   * 
   * @param packageName The NPM package name
   * 
   * @returns The installed package
   * 
   * @deprecated
   */
  installPackage<T = any>(packageName: string): Promise<T>;

  /**
   *  Restarts the NodeJS process.
   */
  restart(): void;
}


export interface BotModule {
  run(api: ModuleApi): Promise<void> | void;
}
