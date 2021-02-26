const { MessageEmbed } = require('discord.js');
const { color_moderation, color_error } = require('../../colours.json');
const sqlite = require('sqlite3');

module.exports = {
	name: 'warns',
	aliases: ['ostrzeżenia'],
	category: 'moderacyjne',
	description: 'Wysyła liczbę ostrzeżeń użytkownika na serwerze.',
	usage: '[wzmianka | id]',
	deleteInvoke: true,
	async run(client, message, args) {
		const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;

		const errEmbed = new MessageEmbed()
			.setColor(color_error)
			.setDescription('❌ Nie znaleziono takiego użytkownika.');

		if (!member) return message.channel.send(errEmbed).then(m => m.delete({ timeout: 5000 }));

		if (member.user.bot) return message.channel.send(errEmbed.setDescription('❌ Nie możesz sprawdzić ostrzeżeń tego użytkownika.')).then(m => m.delete({ timeout: 5000 }));

		if (member.id === member.guild.ownerID) return message.channel.send(errEmbed.setDescription('❌ Nie możesz sprawdzić ostrzeżeń użytkownika, ponieważ jest właścicielem serwera.')).then(m => m.delete({ timeout: 5000 }));

		const acceptEmbed = new MessageEmbed()
			.setColor(color_moderation)
			.setAuthor('OSTRZEŻENIA', 'https://cdn.discordapp.com/attachments/777615056220192808/779442893781598208/warn.png');

		const db = new sqlite.Database('./resources/Smooth.db', sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE);
		const query = 'SELECT * FROM warns WHERE guild_id = ? AND user_id = ?';
		db.get(query, [message.guild.id, member.id], (err, row) => {
			if (err) console.log(err);
			if (!row) {
				acceptEmbed.addField('Ilość ostrzeżeń:', '0');
			}
			else {
				const warnsCount = row.warns;
				acceptEmbed.addField('Ilość ostrzeżeń:', warnsCount);
			}
			db.close();
			message.channel.send(acceptEmbed);
		});
	},
};
