const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roltemporal')
        .setDescription('Otorga un rol temporalmente a un usuario.')
        .addUserOption(option => 
            option.setName('usuario')
                .setDescription('El usuario al que se le otorgará el rol')
                .setRequired(true))
        .addRoleOption(option => 
            option.setName('rol')
                .setDescription('El rol a otorgar')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('duración')
                .setDescription('La duración del rol: 1min, 5min, 30min')
                .setRequired(true)
                .addChoices(
                    { name: '1 minuto', value: '1min' },
                    { name: '5 minutos', value: '5min' },
                    { name: '30 minutos', value: '30min' }
                )),
    async execute(interaction) {
        const member = interaction.options.getUser('usuario');
        const role = interaction.options.getRole('rol');
        const duración = interaction.options.getString('duración');

        const guildMember = interaction.guild.members.cache.get(member.id);
        
        // Verificar permisos
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return interaction.reply({ content: 'No tienes permisos para gestionar roles.', ephemeral: true });
        }

        // Otorgar el rol
        await guildMember.roles.add(role);
        await interaction.reply(`${member.tag} ha recibido el rol ${role.name} por ${duración}.`);

        // Convertir duración a milisegundos
        let time;
        if (duración === '1min') time = 60000; // 1 minuto
        else if (duración === '5min') time = 300000; // 5 minutos
        else if (duración === '30min') time = 1800000; // 30 minutos

        // Remover el rol después de la duración
        setTimeout(async () => {
            if (guildMember.roles.cache.has(role.id)) {
                await guildMember.roles.remove(role);
                try {
                    await member.send(`Tu rol ${role.name} ha sido removido después de ${duración}.`);
                } catch (error) {
                    console.log('No pude enviar un mensaje privado al usuario.');
                }
            }
        }, time);
    },
};
