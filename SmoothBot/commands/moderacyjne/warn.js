const { MessageEmbed } = require('discord.js');
const { color_moderation, color_error } = require('../../colours.json');
const sqlite = require('sqlite3');

module.exports = {
	name: 'warn',
	aliases: ['ostrzeż'],
	category: 'moderacyjne',
	description: 'Ostrzega użytkownika na serwerze.',
	usage: '<wzmianka | id> [powód]',
	deleteInvoke: true,
	userPerms: ['KICK_MEMBERS', 'BAN_MEMBERS'],
	clientPerms: ['KICK_MEMBERS', 'BAN_MEMBERS'],
	async run(client, message, args) {
		const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
		const compareRolePosition = member.roles.highest.comparePositionTo(message.member.roles.highest);
		const reason = args.slice(1).join(' ');

		const errEmbed = new MessageEmbed()
			.setColor(color_error)
			.setDescription('❌ Nie znaleziono takiego użytkownika.');

		if (!member) return message.channel.send(errEmbed).then(m => m.delete({ timeout: 5000 }));

		if (member === message.member || member.user.bot) return message.channel.send(errEmbed.setDescription('❌ Nie możesz ostrzec tego użytkownika.')).then(m => m.delete({ timeout: 5000 }));

		if (compareRolePosition >= 0 && message.member.id != message.guild.ownerID) return message.channel.send(errEmbed.setDescription('❌ Nie możesz ostrzec tego użytkownika, ponieważ jego rola jest wyżej w hierarchi niż twoja.')).then(m => m.delete({ timeout: 5000 }));

		if (member.id === member.guild.ownerID) return message.channel.send(errEmbed.setDescription('❌ Nie możesz ostrzec tego użytkownika, ponieważ jest właścicielem serwera.')).then(m => m.delete({ timeout: 5000 }));

		const acceptEmbed = new MessageEmbed()
			.setColor(color_moderation)
			.setDescription(`Czy na pewno chcesz ostrzec ${member}?`);

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

						reason ? acceptEmbed.addField('Powód', reason) : '';

						const db = new sqlite.Database('./resources/Smooth.db', sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE);
						const query = 'SELECT * FROM warns WHERE guild_id = ? AND user_id = ?';
						db.get(query, [message.guild.id, member.id], (err, row) => {
							if (err) console.log(err);
							if (!row) {
								const insert = db.prepare('INSERT INTO warns VALUES(?, ?, ?)');
								insert.run(message.guild.id, member.id, 1);
								insert.finalize();
							}
							else {
								const warnsCount = row.warns;
								const update = db.prepare('UPDATE warns SET warns = ? WHERE guild_id = ? AND user_id = ?');
								update.run(warnsCount + 1, message.guild.id, member.id);
								update.finalize();
							}
							db.close();
							msg.edit(acceptEmbed.setAuthor('OSTRZEŻONO', 'https://cdn.discordapp.com/attachments/777615056220192808/779442893781598208/warn.png').setDescription(`${member} został ostrzeżony/a.`).setTimestamp().setFooter(`Wykonane przez ${message.author.tag}`, message.author.displayAvatarURL({ format: 'png', dynamic: true, size: 2048 })));
						});

					}
					else {
						msg.reactions.removeAll();
						msg.edit(errEmbed.setDescription('❌ Anulowano ostrzeganie!'));
					}
				})
				.catch(() => {
					msg.reactions.removeAll();
					msg.edit(errEmbed.setDescription('❌ Nie odpowiedziałeś na pytanie dlatego anulowano ostrzeganie!'));
				});
		});
	},
};
