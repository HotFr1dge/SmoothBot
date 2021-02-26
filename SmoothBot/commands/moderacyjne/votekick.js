const { MessageEmbed } = require('discord.js');
const { color_moderation, color_error } = require('../../colours.json');
const cooldown = new Set();

module.exports = {
	name: 'votekick',
	aliases: ['vote-kick'],
	category: 'moderacyjne',
	description: 'Glosowanie za wyrzuceniem użytkownika z serwera.',
	usage: '<wzmianka | id> [powód]',
	deleteInvoke: true,
	userPerms: ['KICK_MEMBERS'],
	clientPerms: ['KICK_MEMBERS'],
	async run(client, message, args) {
		const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
		const reason = args.slice(1).join(' ');
		const compareRolePosition = member.roles.highest.comparePositionTo(message.member.roles.highest);
		let counter = 0;
		let memberCount;
		const members = message.guild.members.cache.filter(x => !x.user.bot && x.presence.status != 'offline').array();

		const errEmbed = new MessageEmbed()
			.setColor(color_error)
			.setDescription('❌ Nie znaleziono takiego użytkownika.');

		members.includes(member) ? memberCount = members.length - 1 : memberCount = members.length;

		if (!member) return message.channel.send(errEmbed).then(m => m.delete({ timeout: 5000 }));

		if (member === message.member || member.user.bot || member.id == message.guild.ownerID) return message.channel.send(errEmbed.setDescription('❌ Nie możesz wyrzucić tego użytkownika.')).then(m => m.delete({ timeout: 5000 }));

		if (member.id === member.guild.ownerID) return message.channel.send(errEmbed.setDescription('❌ Nie możesz wyrzucić tego użytkownika, ponieważ jest właścicielem serwera.')).then(m => m.delete({ timeout: 5000 }));

		if (memberCount < 3) {
			return message.channel.send(errEmbed.setDescription('❌ Nie możesz stworzyć głosowania, gdyż liczba osób online uprawnionych do głosowania jest mniejsza niż 3.')).then(m => m.delete({ timeout: 5000 }));
		}

		if (compareRolePosition >= 0 && message.member.id != message.guild.ownerID) return message.channel.send(errEmbed.setDescription('❌ Nie możesz wyrzucić tego użytkownika, ponieważ jego rola jest wyżej w hierarchi niż twoja.')).then(m => m.delete({ timeout: 5000 }));

		if (cooldown.has(message.guild.id)) return message.channel.send(errEmbed.setDescription('❌ Nie możesz teraz stworzyć głosowania. Poczekaj aż obecne głosowanie się skończy.')).then(m => m.delete({ timeout: 5000 }));

		const acceptEmbed = new MessageEmbed()
			.setColor(color_moderation)
			.setDescription(`Głosowanie za wyrzuceniem ${member} ${counter}/${memberCount}`);

		reason ? acceptEmbed.addField('Powód', reason) : '';

		message.channel.send(acceptEmbed).then(async msg => {
			await msg.react('✅');
			const filter = (reaction, user) => {
				return reaction.emoji.name === '✅';
			};
			const collector = msg.createReactionCollector(filter, { time: 60000 });
			const votedMembers = [];
			cooldown.add(message.guild.id);

			collector.on('collect', (reaction, user) => {
				if (votedMembers.includes(user.id)) return user.send(errEmbed.setDescription(`❌ ${user} Zagłosowałeś już za wyrzuceniem użytkownika ${member}.`)).then(m => m.delete({ timeout: 10000 }));
				if (user.id == member.id) return message.channel.send(errEmbed.setDescription('❌ Nie możesz wziąć udziału w głosowaniu.')).then(m => m.delete({ timeout: 5000 }));
				if (user.presence.status == 'offline') return message.channel.send(errEmbed.setDescription('❌ Nie możesz wziąć udziału w głosowaniu, ponieważ masz status offline lub niewidoczny.')).then(m => m.delete({ timeout: 5000 }));
				counter++;
				votedMembers.push(user.id);
				const percent = (counter / memberCount) * 100;
				if (percent > 50) {
					msg.reactions.removeAll();

					if (!member.kickable) return msg.edit(errEmbed.setDescription('❌ Nie mogę wyrzucić tego użytkownika! Sprawdź czy moja rola jest wyżej niż rola osoby, którą chesz wyrzucić.')).then(m => m.delete({ timeout: 5000 }));

					member.kick(reason ? reason : '').then(() => {
						msg.edit(acceptEmbed.setAuthor('WYRZUCONO', 'https://cdn.discordapp.com/attachments/777615056220192808/777615113284222976/kick.png').setDescription(`${member} został wyrzucony/a w wyniku głosowania (${counter}/${memberCount} - ${Math.round(percent)}%).`).setTimestamp().setFooter(`Wykonane przez ${message.author.tag}`, message.author.displayAvatarURL({ format: 'png', dynamic: true, size: 2048 })));
					}).catch(() => {
						msg.edit(errEmbed.setDescription('❌ Wystąpił nieczekiwany błąd!'));
					});
				}
				else {
					msg.edit(acceptEmbed.setDescription(`Głosowanie za wyrzuceniem ${member} (${counter}/${memberCount} - ${Math.round(percent)}%)`));
				}
			});

			collector.on('end', collected => {
				const percent = (counter / memberCount) * 100;
				msg.reactions.removeAll();
				msg.edit(errEmbed.setDescription(`❌ Użytkownik nie został wyrzucony z powodu braku większości głosów! (${counter}/${memberCount} - ${percent}%)`));
			});

		});

	},
};