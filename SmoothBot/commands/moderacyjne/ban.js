const { MessageEmbed } = require('discord.js');
const { color_moderation, color_error } = require('../../colours.json');

module.exports = {
	name: 'ban',
	category: 'moderacyjne',
	description: 'Banuje użytkownika na serwerze.',
	usage: '<wzmianka | id> [powód]',
	deleteInvoke: true,
	userPerms: ['BAN_MEMBERS'],
	clientPerms: ['BAN_MEMBERS'],
	async run(client, message, args) {
		const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
		const compareRolePosition = member.roles.highest.comparePositionTo(message.member.roles.highest);
		const reason = args.slice(1).join(' ');

		const errEmbed = new MessageEmbed()
			.setColor(color_error)
			.setDescription('❌ Nie znaleziono takiego użytkownika.');

		if (!member) return message.channel.send(errEmbed).then(m => m.delete({ timeout: 5000 }));

		if (member === message.member || member.user.bot) return message.channel.send(errEmbed.setDescription('❌ Nie możesz zbanować tego użytkownika.')).then(m => m.delete({ timeout: 5000 }));

		if (compareRolePosition >= 0 && message.member.id != message.guild.ownerID) return message.channel.send(errEmbed.setDescription('❌ Nie możesz zbanować tego użytkownika, ponieważ jego rola jest wyżej w hierarchi niż twoja.')).then(m => m.delete({ timeout: 5000 }));

		if (member.id === member.guild.ownerID) return message.channel.send(errEmbed.setDescription('❌ Nie możesz zbanować tego użytkownika, ponieważ jest właścicielem serwera.')).then(m => m.delete({ timeout: 5000 }));

		const acceptEmbed = new MessageEmbed()
			.setColor(color_moderation)
			.setDescription(`Czy na pewno chcesz zbanować ${member}?`);

		message.channel.send(acceptEmbed).then(msg => {
			msg.react('✅');
			msg.react('❌');
			const filter = (reaction, user) => {
				return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
			};
			msg.awaitReactions(filter, { max: 1, time: 30000, errors: ['time'] })
				.then(collected => {
					const reaction = collected.first();

					if (reaction.emoji.name === '✅') {
						msg.reactions.removeAll();

						if (!member.kickable) return msg.edit(errEmbed.setDescription('❌ Nie mogę zbanować tego użytkownika! Sprawdź czy moja rola jest wyżej niż rola osoby, którą chesz zbanować.')).then(m => m.delete({ timeout: 5000 }));

						reason ? acceptEmbed.addField('Powód', reason) : '';

						member.ban(reason ? reason : '').then(() => {
							msg.edit(acceptEmbed.setAuthor('ZBANOWANONO', 'https://cdn.discordapp.com/attachments/777615056220192808/777615116274237470/ban.png').setDescription(`${member} został zbanowany/a.`).setTimestamp().setFooter(`Wykonane przez ${message.author.tag}`, message.author.displayAvatarURL({ format: 'png', dynamic: true, size: 2048 })));
						}).catch(() => {
							msg.edit(errEmbed.setDescription('❌ Wystąpił nieczekiwany błąd!'));
						});
					}
					else {
						msg.reactions.removeAll();
						msg.edit(errEmbed.setDescription('❌ Anulowano banowanie!'));
					}
				})
				.catch(() => {
					msg.reactions.removeAll();
					msg.edit(errEmbed.setDescription('❌ Nie odpowiedziałeś na pytanie dlatego anulowano banowanie!'));
				});
		});
	},
};