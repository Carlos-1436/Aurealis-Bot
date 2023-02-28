import { ApplicationCommandOptionType, CommandInteraction, PermissionFlagsBits, TextChannel, VoiceChannel } from "discord.js";
import { Discord, Guard, Slash, SlashOption } from "discordx";
import { hasPermission } from "../../utils/guard/hasPermission.js";
import { guildsController } from "../../database/classes/guildsController.js";
import { injectable } from "tsyringe";

@Discord()
@injectable()
export class Command {
    constructor(private _guildsController: guildsController) {}

    @Slash({ name: "setup", description: "Configurar o bot em seu servidor!" })
    @Guard(hasPermission(PermissionFlagsBits.Administrator))
    async exec(
        @SlashOption({
            name: "logs_channel",
            description: "Canal destinado a receber os logs dos contatos",
            type: ApplicationCommandOptionType.Channel,
            required: true
        }) logs_channel: TextChannel | VoiceChannel,
        interaction: CommandInteraction
    ) {
        if (!(logs_channel instanceof TextChannel))
            return interaction.reply({
                ephemeral: true,
                content: "❌ *O canal de logs precisa ser um canal de texto.*"
            });

        let guildExists = await this._guildsController.guildExists(interaction.guildId);

        if (guildExists)
            return interaction.reply({
                content: "❌ *Esse servidor já foi configurado anteriormente!*",
                ephemeral: true
            });

        this._guildsController.addGuild(interaction.guildId, logs_channel.id)
            .then(() => {
                logs_channel.send({
                    content: "Esse canal foi configurado para receber logs relacionados aos contatos."
                });

                interaction.reply({
                    content: "✅ *Configurações concluídas com sucesso!*",
                    ephemeral: true
                });
            })
            .catch((err) => console.error(err));
    }
}