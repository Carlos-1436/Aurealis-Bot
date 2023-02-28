import { CommandInteraction, PermissionFlagsBits } from "discord.js";
import { Discord, Guard, Slash } from "discordx";
import { injectable } from "tsyringe";
import { hasPermission } from "../../utils/guard/hasPermission.js";
import { guildsController } from "../../database/classes/guildsController.js";

@Discord()
@injectable()
export class Command {
    constructor(private _guildsController: guildsController) {}

    @Slash({ name: "remove_configs", description: "Remova as configurações do bot em seu servidor!" })
    @Guard(hasPermission(PermissionFlagsBits.Administrator))
    async exec(interaction: CommandInteraction) {
        let guildExists = await this._guildsController.guildExists(interaction.guildId);

        if (!guildExists)
            return interaction.reply({
                content: "❌ *Seu servidor não possui por configurações no `/setup` anteriormente.*",
                ephemeral: true
            });

        await this._guildsController.deleteGuild(interaction.guildId);

        interaction.reply({
            content: `✅ *As configurações foram deletadas com sucesso!*`,
            ephemeral: true
        });
    }
}