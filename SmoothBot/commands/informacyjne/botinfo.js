const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'bot-info',
	category: 'informacyjne',
	description: 'Wysyła informację o bocie.',
	deleteInvoke: false,
	async run(client, message, args) {
		const uptime = process.uptime();
		const days = Math.floor((uptime % 31536000) / 86400);
		const hours = Math.floor((uptime % 86400) / 3600);
		const minutes = Math.floor((uptime % 3600) / 60);
		const seconds = Math.round(uptime % 60);
		const botuptime = (days > 0 ? days + 'd : ' : '') + (hours > 0 ? hours + 'g : ' : '') + (minutes > 0 ? minutes + 'm : ' : '') + (seconds > 0 ? seconds + 's' : '');

		const embed = new MessageEmbed()
			.setTitle('ℹ️ INFORMACJE O BOCIE')
			.setColor('BLUE')
			.setFooter(`${message.author.tag}`, `${message.author.displayAvatarURL({ size: 2048, format: 'png', dynamic: true })}`)
			.setThumbnail(`${client.user.displayAvatarURL({ size: 2048, format: 'png', dynamic: true })}`)
			.setTimestamp()
			.addField('__**Czas działania:**__', botuptime, false)
			.addField('__**Ping:**__', `${Math.round(client.ws.ping)} ms`, true)
			.addField('__**Serwery:**__', client.guilds.cache.size, true)
			.addField('__**Kanały:**__', client.channels.cache.size, true)
			.addField('__**Użytkownicy:**__', client.users.cache.size, true);

		message.channel.send(embed);
	},
};