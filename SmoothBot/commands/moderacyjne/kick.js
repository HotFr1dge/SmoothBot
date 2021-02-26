const { MessageEmbed } = require('discord.js');
const { color_moderation, color_error } = require('../../colours.json');

module.exports = {
	name: 'kick',
	aliases: ['wyrzuć'],
	category: 'moderacyjne',
	description: 'Wyrzuca użytkownika z serwera.',
	usage: '<wzmianka | id> [powód]',
	deleteInvoke: true,
	userPerms: ['KICK_MEMBERS'],
	clientPerms: ['KICK_MEMBERS'],
	async run(client, message, args) {
		const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
		const compareRolePosition = member.roles.highest.comparePositionTo(message.member.roles.highest);
		const reason = args.slice(1).join(' ');

		const errEmbed = new MessageEmbed()
			.setColor(color_error)
			.setDescription('❌ Nie znaleziono takiego użytkownika.');

		if (!member) return message.channel.send(errEmbed).then(m => m.delete({ timeout: 5000 }));

		if (member === message.member || member.user.bot) return message.channel.send(errEmbed.setDescription('❌ Nie możesz wyrzucić tego użytkownika.')).then(m => m.delete({ timeout: 5000 }));

		if (compareRolePosition >= 0 && message.member.id != message.guild.ownerID) return message.channel.send(errEmbed.setDescription('❌ Nie możesz wyrzucić tego użytkownika, ponieważ jego rola jest wyżej w hierarchi niż twoja.')).then(m => m.delete({ timeout: 5000 }));

		if (member.id === member.guild.ownerID) return message.channel.send(errEmbed.setDescription('❌ Nie możesz wyrzucić tego użytkownika, ponieważ jest właścicielem serwera.')).then(m => m.delete({ timeout: 5000 }));

		const acceptEmbed = new MessageEmbed()
			.setColor(color_moderation)
			.setDescription(`Czy na pewno chcesz wyrzucić ${member}?`);

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

						if (!member.kickable) return msg.edit(errEmbed.setDescription('❌ Nie mogę wyrzucić tego użytkownika! Sprawdź czy moja rola jest wyżej niż rola osoby, którą chesz wyrzucić.')).then(m => m.delete({ timeout: 5000 }));

						reason ? acceptEmbed.addField('Powód', reason) : '';

						member.kick(reason ? reason : '').then(() => {
							msg.edit(acceptEmbed.setAuthor('WYRZUCONO', 'https://cdn.discordapp.com/attachments/777615056220192808/777615113284222976/kick.png').setDescription(`${member} został wyrzucony/a.`).setTimestamp().setFooter(`Wykonane przez ${message.author.tag}`, message.author.displayAvatarURL({ format: 'png', dynamic: true, size: 2048 })));
						}).catch(() => {
							msg.edit(errEmbed.setDescription('❌ Wystąpił nieczekiwany błąd!'));
						});
					}
					else {
						msg.reactions.removeAll();
						msg.edit(errEmbed.setDescription('❌ Anulowano wyrzucanie!'));
					}
				})
				.catch(() => {
					msg.reactions.removeAll();
					msg.edit(errEmbed.setDescription('❌ Nie odpowiedziałeś na pytanie dlatego anulowano wyrzucanie!'));
				});
		});
	},
};