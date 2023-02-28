import { Discord, Guard, Slash } from "discordx";
import { hasPermission } from "../../utils/guard/hasPermission.js";
import { ButtonStyle, CommandInteraction, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { ActionRowBuilder, ButtonBuilder } from "@discordjs/builders";
import { guildsController } from "../../database/classes/guildsController.js";
import { injectable } from "tsyringe";

@Discord()
@injectable()
export class Command {
    constructor(private _guildsController: guildsController,) {}

    @Slash({ name: "contact_embed", description: "Será enviado o embed de contato no servidor." })
    @Guard(hasPermission(PermissionFlagsBits.Administrator))
    async exec(interaction: CommandInteraction) {
        let guildExists = await this._guildsController.guildExists(interaction.guildId);

        if (!guildExists)
            return interaction.reply({
                content: "❌ *Seu servidor não foi configurado anteriormente, utilize `/setup` para iniciar a configuração*",
                ephemeral: true
            });

        let embed = new EmbedBuilder()
            .setTitle(`💎 • Fale comigo!`)
            .setColor([255, 213, 43])
            .setDescription('```"Como posso entrar em contato?""```' +
`\n > - **1:** Clique no botão abaixo desse Embed escrito "Contatar;"
> - **2:** Aguarde pelo ping feito pelo bot oficial em um canal privado localizado no topo do servidor;
> - **3:** Mencione o serviço que você gostaria, sua ideia e o que planeja. Se for um bot por exemplo, explique quais funcionalidades você gostaria nele e outros detalhes;
> - **4:** Aguarde por uma resposta.`)
            .setFooter({
                text: "Qualquer dúvida chame o staff responsável pelo servidor!"
            });

        let buttonRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Success)
                    .setLabel("Contatar")
                    .setCustomId("contact_btn")
            );

        interaction.channel.send({
            embeds: [embed],
            components: [buttonRow]
        });

        interaction.reply({
            content: "✅ *Embed enviado com sucesso!*",
            ephemeral: true
        });
    }
}