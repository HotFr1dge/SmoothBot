const { MessageEmbed } = require('discord.js');
const { color_informative, color_error } = require('../../colours.json');

module.exports = {
	name: 'help',
	aliases: ['pomoc', 'h'],
	category: 'informacyjne',
	description: 'Wysyła listę wszystich komend bota.',
	deleteInvoke: false,
	async run(client, message, args) {
		if (args[0]) {
			return getCMD(client, message, args[0]);
		}
		else {
			return getAll(client, message);
		}
	},
};

function getAll(client, message) {
	// Define the help embed
	const embed = new MessageEmbed()
		.setAuthor(`${client.user.username} | Pomoc`, client.user.displayAvatarURL({ format: 'png', dynamic: true, size: 2048 }), 'https://smoothbot.com')
		.setColor(color_informative);

	// Filter all of the categories
	const categories = [...new Set(client.commands.map(x => x.category))]
		.filter(x => x)
		.map(x => x.toLowerCase());

	// Function to get all the command under a category
	const commands = category => {
		return client.commands
			.filter(cmd => cmd.category === category)
			.map(cmd => `\`${cmd.name}\``)
			.join(', ');
	};

	// Add commands for category field
	for (let i = 0; i < categories.length; i++) {
		embed.addField(`${categories[i][0].toUpperCase() + categories[i].slice(1)}`, `${commands(categories[i])}`);
	}

	// Send the help embed
	return message.channel.send(embed);
}

function getCMD(client, message, input) {
	const embed = new MessageEmbed();

	const cmd =
		client.commands.get(input) ||
		client.commands.get(client.aliases.get(input));

	let info = `❌ Nie znaleziono informacji o komendzie **${input}**`;

	if (!cmd) {
		return message.channel.send(embed.setColor(color_error).setDescription(info));
	}

	if (cmd.name) info = `**Nazwa komendy**: ${cmd.name}`;
	if (cmd.aliases) info += `\n**Aliasy**: ${cmd.aliases.map(a => `\`${a}\``).join(', ')}`;
	if (cmd.description) info += `\n**Opis**: ${cmd.description}`;
	if (cmd.userPerms) info += `\n**Wymagane uprawnienia**: ${cmd.userPerms.map(a => `\`${a}\``).join(', ')}`;
	if (cmd.usage) {
		info += `\n**Użycie**: ${cmd.usage}`;
		embed.setFooter('Składnia: <> = wymagane, [] = opcjonalne');
	}

	return message.channel.send(
		embed
			.setColor('GREEN')
			.setDescription(info)
			.setThumbnail(client.user.displayAvatarURL),
	);
}