const { MessageEmbed } = require('discord.js');
const { color_error } = require('../../colours.json');
const sqlite = require('sqlite3');

module.exports = {
	name: 'inviteDelete',
	once: false,
	run(client, invite) {
		const db = new sqlite.Database('./resources/Smooth.db', sqlite.OPEN_READONLY);

		let fill;
		if (invite.channel.type == 'text') {
			fill = `tekstowego ${invite.channel}.`;
		}
		else if (invite.channel.type == 'voice') {
			fill = `głosowego ${invite.channel.name}.`;
		}

		const inviteDeleteEmbed = new MessageEmbed()
			.setDescription(`➖ Usunięto zaproszenie dla kanału ${fill}`)
			.setColor(color_error)
			.setTimestamp()
			.addField('Kod zaproszenia:', invite.code, true);

		const query = 'SELECT * FROM logs WHERE guild_id = ?';
		db.get(query, [invite.guild.id], (err, row) => {
			if (err) {
				console.log(err);
				return;
			}
			if (!row) return;
			invite.guild.channels.cache.get(row.channel_id).send(inviteDeleteEmbed);
		});
	},
};
