import path from "node:path";
import { fileURLToPath } from "node:url";

import fs from "node:fs/promises";
import yaml from "js-yaml";
import logger from "../../core/logger.js";

import Bans from "./models/Tempbans.js";
import cron from "node-cron";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let api;
let yamlConfig;
export async function run(apiInstance) {
    api = apiInstance;
    const client = api.client;
    yamlConfig = await yaml.load(await fs.readFile(path.resolve(__dirname, "config.yml"), "utf8"));
    if (!yamlConfig?.moderation) {
        logger.error("Yaml configuration for this resource is not valid!")
    }

    cron.schedule("0 0 * * *", async () => {
        console.log("[CRON] Running daily ban check...");

        try {
            const now = new Date();

            const bans = await Bans.find({});
            for (const ban of bans) {
                const banEnd = new Date(ban.timestamp);
                banEnd.setDate(banEnd.getDate() + ban.duration);

                if (now >= banEnd) {
                    console.log(`[BAN] Ban expired for user ${ban.userId}`);

                    try {
                        const guild = await client.guilds.fetch(process.env.GUILD_ID);
                        await guild.members.unban(ban.userId, "Ban duration expired");
                        console.log(`[DISCORD] Unbanned user ${ban.userId}`);
                    } catch (err) {
                        console.warn(`[DISCORD] Failed to unban user ${ban.userId}:`, err.message);
                    }

                    await Bans.deleteOne({ _id: ban._id });
                    console.log(`[DB] Removed ban entry for ${ban.userId}`);
                }
            }
        } catch (err) {
            console.error("[CRON] Error checking bans:", err);
        }
    });
}



export { api, yamlConfig };

