const { MessageEmbed } = require('discord.js');
const { color_moderation } = require('../../colours.json');
const sqlite = require('sqlite3');

module.exports = {
	name: 'channelDelete',
	once: false,
	run(client, guildChannel) {
		const db = new sqlite.Database('./resources/Smooth.db', sqlite.OPEN_READONLY);

		if (guildChannel.type == 'dm' || guildChannel.type == 'store' || guildChannel.type == 'unknown') return;

		let fill;
		if (guildChannel.type == 'text') {
			fill = `kanał tekstowy ${guildChannel}.`;
		}
		else if (guildChannel.type == 'news') {
			fill = `kanał ogłoszeniowy ${guildChannel}`;
		}
		else if (guildChannel.type == 'voice') {
			fill = `kanał głosowy ${guildChannel.name}.`;
		}
		else if (guildChannel.type == 'category') {
			fill = `kategorię ${guildChannel.name}`;
		}


		const channelDeleteEmbed = new MessageEmbed()
			.setDescription(`➖ Usunięto ${fill}`)
			.setColor(color_moderation)
			.setTimestamp();

		const query = 'SELECT * FROM logs WHERE guild_id = ?';
		db.get(query, [guildChannel.guild.id], (err, row) => {
			if (err) {
				console.log(err);
				return;
			}
			if (!row) return;
			guildChannel.guild.channels.cache.get(row.channel_id).send(channelDeleteEmbed);
		});
	},
};
