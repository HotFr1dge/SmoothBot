const { MessageEmbed } = require('discord.js');
const { color_moderation } = require('../../colours.json');
const sqlite = require('sqlite3');

module.exports = {
	name: 'guildBanRemove',
	once: false,
	async run(client, guild, userUnbanned) {
		const db = new sqlite.Database('./resources/Smooth.db', sqlite.OPEN_READONLY);

		const auditLog = await guild.fetchAuditLogs({ options: { type:23, user:userUnbanned, limit:5 } });
		const guildBanRemoveEmbed = new MessageEmbed()
			.setDescription(`🤝 ${userUnbanned} został odbanowany.`)
			.setThumbnail(userUnbanned.displayAvatarURL({ format:'png', dynamic:true, size:1024 }))
			.setColor(color_moderation)
			.setTimestamp()
			.setAuthor(userUnbanned.tag, userUnbanned.displayAvatarURL({ format:'png', dynamic:true, size:1024 }));

		auditLog.entries.first().reason ? guildBanRemoveEmbed.addField('Powód:', auditLog.entries.first().reason, true) : '';
		auditLog.entries.first().executor ? guildBanRemoveEmbed.setFooter(`Wykonane przez ${auditLog.entries.first().executor.tag}`) : '';

		const query = 'SELECT * FROM logs WHERE guild_id = ?';
		db.get(query, [guild.id], (err, row) => {
			if (err) {
				console.log(err);
				return;
			}
			if (!row) return;
			guild.channels.cache.get(row.channel_id).send(guildBanRemoveEmbed);
		});
	},
};
