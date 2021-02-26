const { MessageEmbed } = require('discord.js');
const { color_danger } = require('../../colours.json');
const sqlite = require('sqlite3');

module.exports = {
	name: 'messageUpdate',
	once: false,
	run(client, oldMessage, newMessage) {
		if (newMessage.author.bot) return;
		if (oldMessage.content == newMessage.content) return;

		const db = new sqlite.Database('./resources/Smooth.db', sqlite.OPEN_READONLY);

		const messageUpdatedEmbed = new MessageEmbed()
			.setDescription(`✏️ Wiadomość wysłana przez ${oldMessage.author} w ${oldMessage.channel} została edytowana.`)
			.setThumbnail(oldMessage.author.displayAvatarURL({ format:'png', dynamic:true, size:1024 }))
			.setColor(color_danger)
			.setTimestamp()
			.addField('Poprzednia treść wiadomości:', oldMessage.content)
			.addField('Nowa treść wiadomości:', newMessage.content)
			.setAuthor(oldMessage.author.tag, oldMessage.author.displayAvatarURL({ format:'png', dynamic:true, size:1024 }));

		const query = 'SELECT * FROM logs WHERE guild_id = ?';
		db.get(query, [oldMessage.guild.id], (err, row) => {
			if (err) {
				console.log(err);
				return;
			}
			if (!row) return;
			oldMessage.guild.channels.cache.get(row.channel_id).send(messageUpdatedEmbed);
		});
	},
};
