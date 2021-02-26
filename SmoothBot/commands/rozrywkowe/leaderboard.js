const { MessageEmbed } = require('discord.js');
const { color_fun, color_error } = require('../../colours.json');
const sqlite = require('sqlite3');

module.exports = {
	name: 'leaderboard',
	aliases: ['ranking'],
	category: 'rozrywkowe',
	description: 'Wyświetla ranking serwera.',
	deleteInvoke: false,
	run: async (client, message, args) => {
		const db = new sqlite.Database('./resources/Smooth.db', sqlite.OPEN_READONLY);

		const errEmbed = new MessageEmbed()
			.setColor(color_error)
			.setDescription('❌ Ranking nie jest jeszcze dostępny!');

		const leaderboardEmbed = new MessageEmbed()
			.setAuthor('RANKING - SYSTEM POZIOMÓW', 'https://cdn.discordapp.com/attachments/777615056220192808/777615113704177716/leaderboard.png')
			.setThumbnail(message.guild.iconURL({ format: 'png', dynamic: true, size: 1024 }) ? message.guild.iconURL({ format: 'png', dynamic: true, size: 1024 }) : `https://dummyimage.com/500x500/000/fff.png&text=${message.guild.nameAcronym}`)
			.setColor(color_fun)
			.setTimestamp();

		const firstQuery = 'SELECT * FROM levelsSettings WHERE guild_id = ?';
		db.get(firstQuery, [message.guild.id], (err, firstRow) => {
			if (err) console.log(err);
			if (!firstRow || firstRow.disabled == false) {
				const query = 'SELECT user_id, level, exp FROM levels WHERE guild_id = ? ORDER BY `levels`.`level` DESC, `levels`.`exp` DESC LIMIT 10';
				db.all(query, [message.guild.id], async (err, rows) => {
					if (err) console.log(err);
					if (!rows[0]) {
						message.channel.send(errEmbed);
					}
					else {
						let output = [];
						let y = 0;
						for (let i = 0; i < rows.length; i++) {
							if (message.guild.members.cache.has(rows[i].user_id)) {
								y++;
								output.push(`${y}. <@${rows[i].user_id}> POZIOM ${rows[i].level} : EXP ${rows[i].exp}`);
							}
						}
						output = output.join('\n');
						message.channel.send(leaderboardEmbed.setDescription(output));
					}
					db.close();
				});
			}
			else if (firstRow.disabled == true) {
				message.channel.send(errEmbed.setDescription('❌ System poziomów został wyłączony na tym serwerze.'));
			}
		});
	},
};