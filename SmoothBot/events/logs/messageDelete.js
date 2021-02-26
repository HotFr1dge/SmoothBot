const { MessageEmbed } = require('discord.js');
const { color_error } = require('../../colours.json');
const sqlite = require('sqlite3');

module.exports = {
	name: 'messageDelete',
	once: false,
	run(client, message) {
		if (message.author.bot) return;

		const db = new sqlite.Database('./resources/Smooth.db', sqlite.OPEN_READONLY);

		const messageDeletedEmbed = new MessageEmbed()
			.setDescription(`🗑️ Wiadomość wysłana przez ${message.author} w ${message.channel} została usunięta.`)
			.setThumbnail(message.author.displayAvatarURL({ format:'png', dynamic:true, size:1024 }))
			.setColor(color_error)
			.setTimestamp()
			.addField('Treść wiadomości:', message.content.toString())
			.setAuthor(message.author.tag, message.author.displayAvatarURL({ format:'png', dynamic:true, size:1024 }));

		const query = 'SELECT * FROM logs WHERE guild_id = ?';
		db.get(query, [message.guild.id], (err, row) => {
			if (err) {
				console.log(err);
				return;
			}
			if (!row) return;
			message.guild.channels.cache.get(row.channel_id).send(messageDeletedEmbed);
		});
	},
};
