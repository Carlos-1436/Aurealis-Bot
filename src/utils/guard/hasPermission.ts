import { CommandInteraction } from "discord.js";
import { ArgsOf, Client, GuardFunction } from "discordx";

export function hasPermission(permission: bigint) {
    let guard: GuardFunction<ArgsOf<"interactionCreate"> | CommandInteraction>  = (
        interaction: CommandInteraction,
        client: Client,
        next) =>
    {
        if (!interaction.memberPermissions.has(permission))
            return interaction.reply({
                content: "❌ *Você não possui as permissões necessário para utilizar esse comando!*",
                ephemeral: true
            });
        next();
    }

    return guard;
}