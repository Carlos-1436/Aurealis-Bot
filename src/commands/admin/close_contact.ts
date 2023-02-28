import { CommandInteraction, PermissionFlagsBits, ApplicationCommandOptionType, GuildMember, TextChannel, Message, AttachmentBuilder } from "discord.js";
import { Discord, Guard, Slash, SlashOption } from "discordx";
import { hasPermission } from "../../utils/guard/hasPermission.js";
import { contactsController } from "../../database/classes/contactsController.js";
import { guildsController } from "../../database/classes/guildsController.js";
import { injectable } from "tsyringe";

@Discord()
@injectable()
export class Command {
    constructor(
        private _guildsController: guildsController,
        private _contactController: contactsController
    ) {}

    @Slash({ name: "close_contact", description: "Feche um contrato que havia sido aberto!" })
    @Guard(hasPermission(PermissionFlagsBits.Administrator))
    async exec(
        @SlashOption({
            name: "member",
            description: "Membro no qual abriu um canal de contato.",
            required: true,
            type: ApplicationCommandOptionType.Mentionable
        }) member: GuildMember,
        interaction: CommandInteraction
    ) {
        if (!(await this._guildsController.guildExists(interaction.guildId)))
            return interaction.reply({
                ephemeral: true,
                content: "❌ *Seu servidor não foi configurado anteriormente, utilize `/setup` para iniciar a configuração*"
            });

        let contactGetResult = await this._contactController.getContact(member.id, interaction.guildId);
        if (!contactGetResult.row)
            return interaction.reply({
                ephemeral: true,
                content: "❌ *O membro escolhido não possui um contato aberto no servidor.*"
            });

        // Enviando logs contendo as mensagens
        let channel = interaction.guild.channels.cache.get(contactGetResult.row.contactChannelId) as TextChannel;
        let guildGetResult = await this._guildsController.getGuild(interaction.guildId);
        let logsChannel = interaction.guild.channels.cache.get(guildGetResult.row.logsChannelId) as TextChannel;

        if (logsChannel) {
            let logs = ``;
            let messages = await channel.messages.fetch();

            messages.reverse()
            messages.each((message: Message) => {
                let datetime = new Date(message.createdTimestamp);
                logs += `[${datetime.toTimeString().split(" ")[0]}] ${message.author.tag}: ${message.content}\n`;
            });

            // Mensagem com anexo
            logsChannel.send({
                content: `**Arquivos de LOGS gerados:**\n*- Usuário que entrou em contato: **${member.user.tag}**(**${member.id}**)*`,
                files: [
                    new AttachmentBuilder(Buffer.from(logs, "utf-8"), { name: `${member.id}.txt` })
                ]
            }).catch(() => { return } );
        }

        if (channel && channel.deletable)
            channel.delete().catch((err) => {
                console.log(`Ocorreu um erro ao tentar deletar um canal de contato:\n - ${err}`);
            });

        // Deletando o canal
        let deletResult = await this._contactController.deleteContact(member.id, interaction.guildId);
        if (!deletResult.success)
            return interaction.reply({
                content: "❌ *Ocorreu um erro interno durante a remoção de registro, tente novamente mais tarde.*"
            });
    }
}