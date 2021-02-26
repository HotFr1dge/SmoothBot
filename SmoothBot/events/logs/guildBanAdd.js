const { MessageEmbed } = require('discord.js');
const { color_error } = require('../../colours.json');
const sqlite = require('sqlite3');

module.exports = {
	name: 'guildBanAdd',
	once: false,
	async run(client, guild, userBanned) {
		const db = new sqlite.Database('./resources/Smooth.db', sqlite.OPEN_READONLY);

		const ban = await guild.fetchBan(userBanned);
		const auditLog = await guild.fetchAuditLogs({ options: { type:23, user:userBanned, limit:5 } });
		const guildBanAddEmbed = new MessageEmbed()
			.setDescription(`✈️ ${userBanned} został zbanowany.`)
			.setThumbnail(userBanned.displayAvatarURL({ format:'png', dynamic:true, size:1024 }))
			.setColor(color_error)
			.setTimestamp()
			.setAuthor(userBanned.tag, userBanned.displayAvatarURL({ format:'png', dynamic:true, size:1024 }));

		ban.reason ? guildBanAddEmbed.addField('Powód:', ban.reason) : '';
		auditLog.entries.first().executor ? guildBanAddEmbed.setFooter(`Wykonane przez ${auditLog.entries.first().executor.tag}`) : '';

		const query = 'SELECT * FROM logs WHERE guild_id = ?';
		db.get(query, [guild.id], (err, row) => {
			if (err) {
				console.log(err);
				return;
			}
			if (!row) return;
			guild.channels.cache.get(row.channel_id).send(guildBanAddEmbed);
		});
	},
};
