const { botMentioned } = require('../../functions');
const { MessageEmbed } = require('discord.js');
const { rand } = require('../../functions.js');
const { color_error } = require('../../colours.json');
const sqlite = require('sqlite3');

module.exports = {
	async run(client, message) {

		// Pomijanie wiadomości bota, wiadomości prywatnych
		if (message.author.bot || !message.guild) return;

		// pobieranie serwerowego prefixu z bazy.
		const db = new sqlite.Database('./resources/Smooth.db', sqlite.OPEN_READWRITE);
		const firstQuery = 'SELECT * FROM prefixes WHERE guild_id = ?';
		const getPrefix = () => {
			return new Promise((resolve, reject) => {
				db.get(firstQuery, [message.guild.id], async (err, row) => {
					if (err) reject(err);
					let prefix;
					if (!row) {
						prefix = process.env.PREFIX;
						resolve(prefix);
					}
					else {
						prefix = row.prefix;
						resolve(prefix);
					}
				});
			});
		};
		const prefix = await getPrefix();

		// Sprawdzenie czy bot został oznaczony
		if (botMentioned(message)) {
			const botMentionedEmbed = new MessageEmbed()
				.setDescription(`Mój prefix to: \`${prefix}\`\nAby uzyskać pomoc wpisz \`${prefix}help\``)
				.setColor('RANDOM');
			message.channel.send(botMentionedEmbed);
		}

		if (!message.guild.me) await message.guild.members.fetch(client.user);
		if (!message.member) await message.guild.members.fetch(message.author);

		// Definiowanie parametrów komendy
		const args = message.content
			.slice(prefix.length)
			.trim()
			.split(/ +/g);
		const cmd = args.shift();
		const command = client.commands.get(cmd) || client.commands.get(client.aliases.get(cmd));

		// Uruchamianie komendy jeśli istnieje
		if (command && command.run) {

			// Pomijanie wiadomości bez prefix'u
			if (!message.content.startsWith(prefix)) return;

			// Usuwanie komendy jeśli zadeklarowano
			if (command.deleteInvoke && message.deletable) await message.delete();

			// Sprzawdzanie permisji bota
			if (command.clientPerms && !command.clientPerms.every(x => message.guild.me.hasPermission(x))) {
				const clientPermsEmbed = new MessageEmbed()
					.setDescription(`❌ Brakuje mi jednej z następujących permisji: \`${command.clientPerms.join(', ')}\``)
					.setColor(color_error);

				return message.channel
					.send(clientPermsEmbed)
					.then(m => m.delete({ timeout: 5000 }));
			}

			// Sprawdzanie permisji autora komendy
			if (command.userPerms && !command.userPerms.every(x => message.member.hasPermission(x))) {
				const userPermsEmbed = new MessageEmbed()
					.setDescription(`❌ Brakuje Ci jednej z następujących permisji: \`${command.userPerms.join(', ')}\``)
					.setColor(color_error);

				return message.channel
					.send(userPermsEmbed)
					.then(m => m.delete({ timeout: 5000 }));
			}
			// Uruchomienie pliku
			command.run(client, message, args);
		}
		// jeśli komenda nie istnieje dodawanie expa
		else {
			const secondQuery = 'SELECT * FROM levelsSettings WHERE guild_id = ?';
			db.get(secondQuery, [message.guild.id], async (err, row) => {
				if (err) return console.log(err);
				if (!row) {
					await levelInit(db, message, true);
				}
				else if (row.disabled == true) {
					return;
				}
				else {
					await levelInit(db, message, row.alert ? true : false);
				}
			});
		}
		db.close();
	},
};


function genExp(message) {
	let randomNumber;

	if (message.content.length < 300) {
		randomNumber = rand(3, 10);
	}
	else if (message.content.length < 1000) {
		randomNumber = rand(10, 20);
	}
	else if (message.content.length > 1000) {
		randomNumber = Math.round(message.content.length / 20);
	}

	if (message.tts || message.attachments.array().length > 0) {
		randomNumber = randomNumber + 10;
	}

	return randomNumber;
}

async function levelInit(db, message, alert) {
	const query = 'SELECT * FROM levels WHERE guild_id = ? AND user_id = ?';
	db.get(query, [message.guild.id, message.author.id], (err, row) => {
		if (err) {
			console.log(err);
			return;
		}
		if (!row) {
			const insert = db.prepare('INSERT INTO levels VALUES(?, ?, ?, ?)');
			insert.run(message.guild.id, message.author.id, 1, 0);
			insert.finalize();
		}
		else if (row.exp + genExp(message) > 1000) {
			const update = db.prepare('UPDATE levels SET exp = ?, level = ? WHERE guild_id = ? AND user_id = ?');
			update.run((row.exp + genExp(message)) - 1000, row.level + 1, message.guild.id, message.author.id);
			update.finalize();
			if (alert === true) return message.channel.send(`${message.author} awansowałeś/aś na poziom ${row.level + 1}`);
		}
		else {
			const update = db.prepare('UPDATE levels SET exp = ? WHERE guild_id = ? AND user_id = ?');
			update.run(row.exp + genExp(message), message.guild.id, message.author.id);
			update.finalize();
		}
	});
}