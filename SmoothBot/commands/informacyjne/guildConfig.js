const sqlite = require('sqlite3');
const { MessageEmbed } = require('discord.js');
const { color_informative } = require('../../colours.json');

module.exports = {
	name: 'guildSettings',
	aliases: ['ustawieniaSerwera'],
	category: 'informacyjne',
	usage: '<moduł>',
	description: 'Pozwala na konfiguracje bota na poziomie serwera.',
	userPerms: ['ADMINISTRATOR'],
	clientPerms: ['ADMINISTRATOR'],
	deleteInvoke: false,
	async run(client, message, args) {

		const configEmbed1 = new MessageEmbed()
			.setAuthor('USTAWIENIA SERWERA', 'https://cdn.discordapp.com/attachments/777615056220192808/777615115150557184/settings.png')
			.setDescription(`Aby skonfigurować ustawienia serwera wpisz komendę a po niej nazwę mudułu który chcesz skonfigurować.\n__Wzór:__ \`${process.env.PREFIX}${module.exports.name} ${module.exports.usage}\`\n`)
			.addField('Lista modułów do konfiguracji:', '`prefix`, `logs`, `levelSystem`, `levelSystemAlerts`')
			.setColor(color_informative);

		const configEmbed2 = new MessageEmbed()
			.setAuthor('USTAWIENIA SERWERA - LOGI')
			.setDescription('Oznacz kanał, na którym mają być wysyłane logi.\nMasz na to 30 sekund. Wpisz `anuluj` aby anulować konfigurację.')
			.setColor(color_informative);

		const configEmbed3 = new MessageEmbed()
			.setColor(color_informative)
			.setAuthor('USTAWIENIA SERWERA - SYSTEM POZIOMÓW')
			.setDescription(`Aby wyłączyć lub włączyć system poziomów wpisz: \`${process.env.PREFIX + module.exports.name} levelSystem <on | off>\``);

		const configEmbed4 = new MessageEmbed()
			.setColor(color_informative)
			.setAuthor('USTAWIENIA SERWERA - SYSTEM POZIOMÓW')
			.setDescription(`Aby wyłączyć lub włączyć powiadomienia o awansowaniu wpisz: \`${process.env.PREFIX + module.exports.name} levelSystemAlerts <on | off>\``);

		const configEmbed5 = new MessageEmbed()
			.setColor(color_informative)
			.setAuthor('USTAWIENIA SERWERA - PREFIX')
			.setDescription('Odpowiedz wpisując w wiadomości prefix.\nMasz na to 30 sekund. Wpisz `anuluj` aby anulować konfigurację.');

		if (!args[0]) {
			message.channel.send(configEmbed1);
		}
		else if (args[0] == 'logs') {
			message.channel.send(configEmbed2).then(msg => {
				const logsFilter = response => {
					return response.author.id === message.author.id;
				};
				msg.channel.awaitMessages(logsFilter, { max: 1, time: 30000, errors: ['time'] }).then(response => {
					if (response.first().content.includes('anuluj')) {
						msg.edit(configEmbed2.setDescription('**__Konfiguracja została anulowana!__**'));
					}
					else if (response.first().mentions.channels.array().length == 1) {
						if (response.first().mentions.channels.first().type != 'text' || !message.guild.channels.cache.has(response.first().mentions.channels.first().id)) return msg.edit(configEmbed2.setDescription('**__Oznaczony kanał nie jest kanałem tekstowym lub nie należy do tego serwera!__**'));

						const db = new sqlite.Database('./resources/Smooth.db', sqlite.OPEN_READWRITE);
						const query = 'SELECT * FROM logs WHERE guild_id = ?';
						db.get(query, [message.guild.id], (err, row) => {
							if (err) {
								return console.log(err);
							}
							if (!row) {
								const insert = db.prepare('INSERT INTO logs VALUES(?,?)');
								insert.run(message.guild.id, response.first().mentions.channels.first().id);
								insert.finalize();
								msg.edit(configEmbed2.setDescription('**__Pomyślnie ustawiono kanał dla logów!__**'));
							}
							else {
								const update = db.prepare('UPDATE logs SET channel_id = ? WHERE guild_id = ?');
								update.run(response.first().mentions.channels.first().id, message.guild.id);
								update.finalize();
								msg.edit(configEmbed2.setDescription('**__Pomyślnie zaktualizowano kanał dla logów!__**'));
							}
							db.close();
						});
					}
					else if (response.first().mentions.channels.array().length > 1) {
						msg.edit(configEmbed2.setDescription('**__Oznaczono więcej niż jeden kanał!__**'));
					}
					else {
						msg.edit(configEmbed2.setDescription('**__Nie oznaczono kanału lub oznaczony kanał nie istnieje!__**'));
					}
					response.first().delete();
				}).catch(() => {
					msg.edit(configEmbed2.setDescription('**__Minął czas na odpowiedź!__**'));
				});
			});
		}
		else if (args[0] == 'levelSystem') {

			if (!args[1]) return message.channel.send(configEmbed3);

			let ins;
			if (args[1] == 'on') {
				ins = false;
			}
			else if (args[1] == 'off') {
				ins = true;
			}
			else {
				return message.channel.send(configEmbed3);
			}

			const db = new sqlite.Database('./resources/Smooth.db', sqlite.OPEN_READWRITE);
			const query = 'SELECT * FROM levelsSettings WHERE guild_id = ?';
			db.get(query, [message.guild.id], (err, row) => {
				if (err) return console.log(err);
				if (!row) {
					const insert = db.prepare('INSERT INTO levelsSettings VALUES(?, ?, ?)');
					insert.run(message.guild.id, ins, true);
					insert.finalize();
				}
				else if (row.disabled == ins) {
					db.close();
					return message.channel.send(configEmbed3.setDescription(`System poziomów jest już ${ins ? 'wyłączony' : 'włączony'} na serwerze.`));
				}
				else {
					const update = db.prepare('UPDATE levelsSettings SET disabled = ? WHERE guild_id = ?');
					update.run(ins, message.guild.id);
					update.finalize();
				}
				db.close();
				message.channel.send(configEmbed3.setDescription(`Pomyślnie ${ins ? 'wyłączono' : 'włączono'} system poziomów na serwerze.`));
			});
		}
		else if (args[0] == 'levelSystemAlerts') {
			if (!args[1]) return message.channel.send(configEmbed4);

			let ins;
			if (args[1] == 'on') {
				ins = true;
			}
			else if (args[1] == 'off') {
				ins = false;
			}
			else {
				return message.channel.send(configEmbed4);
			}

			const db = new sqlite.Database('./resources/Smooth.db', sqlite.OPEN_READWRITE);
			const query = 'SELECT * FROM levelsSettings WHERE guild_id = ?';
			db.get(query, [message.guild.id], (err, row) => {
				if (err) return console.log(err);
				if (!row) {
					const insert = db.prepare('INSERT INTO levelsSettings VALUES(?, ?, ?)');
					insert.run(message.guild.id, true, ins);
					insert.finalize();
				}
				else if (row.disabled == true) {
					return message.channel.send(configEmbed4.setDescription('Nie możesz dokonać tej konfiguracji, ponieważ system poziomów jest wyłączony na tym serwerze.'));
				}
				else if (row.alert == ins) {
					return message.channel.send(configEmbed4.setDescription(`Powiadomienia o awansowaniu są już ${ins ? 'włączone' : 'wyłączone'} na serwerze.`));
				}
				else {
					const update = db.prepare('UPDATE levelsSettings SET alert = ? WHERE guild_id = ?');
					update.run(ins, message.guild.id);
					update.finalize();
				}
				db.close();
				message.channel.send(configEmbed3.setDescription(`Pomyślnie ${ins ? 'włączono' : 'wyłączono'} powiadomienia o awansowaniu na serwerze.`));
			});
		}
		else if (args[0] == 'prefix') {
			message.channel.send(configEmbed5).then(msg => {
				const prefixFilter = response => {
					return response.author.id === message.author.id;
				};
				msg.channel.awaitMessages(prefixFilter, { max: 1, time: 30000, errors: ['time'] }).then(response => {
					if (response.first().content.includes('anuluj')) {
						msg.edit(configEmbed5.setDescription('**__Konfiguracja została anulowana!__**'));
					}
					else {
						const db = new sqlite.Database('./resources/Smooth.db', sqlite.OPEN_READWRITE);
						const query = 'SELECT * FROM prefixes WHERE guild_id = ?';
						db.get(query, [message.guild.id], (err, row) => {
							if (err) return console.log(err);
							if (!row) {
								const insert = db.prepare('INSERT INTO prefixes VALUES(?,?)');
								insert.run(message.guild.id, response.first().content);
								insert.finalize();
								msg.edit(configEmbed5.setDescription(`**__Pomyślnie ustawiono prefix na \`${response.first().content}\`!__**`));
							}
							else {
								const update = db.prepare('UPDATE prefixes SET prefix = ? WHERE guild_id = ?');
								update.run(response.first().content, message.guild.id);
								update.finalize();
								msg.edit(configEmbed5.setDescription(`**__Pomyślnie zmieniono prefix na \`${response.first().content}\`!__**`));
							}
							db.close();
						});
					}
					response.first().delete();
				}).catch(() => {
					msg.edit(configEmbed5.setDescription('**__Minął czas na odpowiedź!__**'));
				});
			});
		}
	},
};
