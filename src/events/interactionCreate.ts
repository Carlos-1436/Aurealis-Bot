import { ArgsOf, Discord, On } from "discordx";
import { bot } from "../main.js";
import { contactsController } from "../database/classes/contactsController.js";
import { injectable } from "tsyringe";
import { ButtonInteraction, ChannelType, TextChannel } from "discord.js";
import { guildsController } from "../database/classes/guildsController.js";

@Discord()
@injectable()
export class Event {
    constructor(
        private _contactController: contactsController,
        private _guildsController: guildsController
    ) {}

    // Criando canal de contato
    async createContactChannel(interaction: ButtonInteraction) {
        interaction.guild.channels.create({
            name: interaction.user.username,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                {
                    id: interaction.guildId,
                    deny: ["ViewChannel"]
                },
                {
                    id: interaction.user.id,
                    allow: ["ViewChannel"]
                }
            ]
        })
        .then(async (channel: TextChannel) => {
            await this._contactController.addContact(interaction.user.id, interaction.guildId, channel.id);

            interaction.reply({
                content: "✅ *Canal criado com sucesso!*",
                ephemeral: true
            });

            channel.send({
                content: `<@${interaction.user.id}> **Aguarde por uma resposta. Se achar que está demorando muito, mencione o administrador responsável pelo servidor/contatos!**`
            });
        })
        .catch((err) => interaction.reply({
            content: "❌ *Não foi possível criar o canal de comissão, fale com o staffer responsável para verificar minhas permissões.*",
            ephemeral: true
        }));
    }

    @On({ event: "interactionCreate" })
    async exec([interaction]: ArgsOf<"interactionCreate">) {
        try {
            if (interaction.isCommand())
                await bot.executeInteraction(interaction);

            if (!interaction.isButton()) return;

            switch (interaction.customId) {
                case "contact_btn":
                    // Verificando se o servidor foi configurado anteriormente
                    let guildExists = await this._guildsController.guildExists(interaction.guildId);

                    if (!guildExists)
                        return interaction.reply({
                            content: "❌ *O servidor não está configurado para utilizar essa função, tente primeiramente utilizar `/setup` ou peça para um staff fazer esse processo*.",
                            ephemeral: true
                        });

                    // Verificando se o membro possui algum contato já aberto no servidor
                    let contactExists = await this._contactController.contactExists(interaction.user.id, interaction.guildId);

                    if (contactExists)
                        return interaction.reply({
                            content: "❌ *Você já possui um contato que foi aberto nesse servidor.*",
                            ephemeral: true
                        });

                    this.createContactChannel(interaction);
                    break;
            }
        } catch (err) {
            console.log(`[COMMAND EXEC ERROR] - ${err.message}`);
        }
    }
}