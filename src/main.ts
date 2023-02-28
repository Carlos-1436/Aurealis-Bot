import "dotenv/config";
import "reflect-metadata";
import { dirname, importx } from "@discordx/importer";
import { IntentsBitField } from "discord.js";
import { Client, DIService, tsyringeDependencyRegistryEngine } from "discordx";
import { container } from "tsyringe";

DIService.engine = tsyringeDependencyRegistryEngine.setInjector(container);

export const bot = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildMessageReactions,
    IntentsBitField.Flags.GuildVoiceStates,
    IntentsBitField.Flags.MessageContent,
  ],

  silent: false,

  simpleCommand: {
    prefix: "!",
  },
});

bot.once("ready", async () => {
  await bot.initApplicationCommands();
  console.log("Bot started");
});

async function run() {
  await importx(`${dirname(import.meta.url)}/{events,commands}/**/*.{ts,js}`);

  if (!process.env.BOT_TOKEN) {
    throw Error("Could not find BOT_TOKEN in your environment");
  }
  await bot.login(process.env.BOT_TOKEN);
}

run();
