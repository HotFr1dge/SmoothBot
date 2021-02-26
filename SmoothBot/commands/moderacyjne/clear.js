const { MessageEmbed } = require('discord.js');
const { color_moderation, color_error } = require('../../colours.json');

module.exports = {
	name: 'clear',
	aliases: ['wyczyść'],
	category: 'moderacyjne',
	description: 'Czyści wiadomości na kanale wysłane w ciągu ostatnich dwóch tygodnii.',
	usage: '<liczba>',
	deleteInvoke: true,
	userPerms: ['MANAGE_MESSAGES'],
	clientPerms: ['MANAGE_MESSAGES'],
	async run(client, message, args) {
		const errEmbed = new MessageEmbed()
			.setColor(color_error)
			.setDescription('❌ Nie wpisałeś liczby wiadomści do usunięcia.');

		if (!args[0]) return message.channel.send(errEmbed).then(m => m.delete({ timeout: 5000 }));

		if (isNaN(args[0])) return message.channel.send(errEmbed.setDescription('❌ Podany argument nie jest liczbą.')).then(m => m.delete({ timeout: 5000 }));

		if (!Number.isInteger(parseFloat(args[0]))) return message.channel.send(errEmbed.setDescription('❌ Podany argument nie jest liczbą całkowitą.')).then(m => m.delete({ timeout: 5000 }));

		if (!(args[0] > 0 && args[0] <= 100)) return message.channel.send(errEmbed.setDescription('❌ Podany argument nie jest liczbą z przedziału `1-100`.')).then(m => m.delete({ timeout: 5000 }));

		const acceptEmbed = new MessageEmbed()
			.setColor(color_moderation)
			.setDescription(`Czy na pewno chcesz usunąć ${args[0] == 1 ? args[0] + '. wiadomość' : args[0] + '. wiadomości'}?`);

		message.channel.send(acceptEmbed).then(msg => {
			msg.react('✅');
			msg.react('❌');
			const filter = (reaction, user) => {
				return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
			};
			msg.awaitReactions(filter, { max: 1, time: 30000, errors: ['time'] })
				.then(collected => {
					const reaction = collected.first();

					if (reaction.emoji.name === '✅') {
						msg.reactions.removeAll();

						message.channel.bulkDelete(parseInt(args[0]), true).then(msgs => {
							msg.delete();
							message.channel.send(acceptEmbed.setAuthor('WYCZYSZCZONO').setDescription(`Usunięto ${msgs.size}. wiadomości`).setTimestamp().setFooter(`Wykonane przez ${message.author.tag}`, message.author.displayAvatarURL({ format: 'png', dynamic: true, size: 2048 })));
						});
					}
					else {
						msg.reactions.removeAll();
						msg.edit(errEmbed.setDescription('❌ Anulowano usuwanie wiadomości!'));
					}
				})
				.catch(() => {
					msg.reactions.removeAll();
					msg.edit(errEmbed.setDescription('❌ Nie odpowiedziałeś na pytanie dlatego anulowano wyrzucanie!'));
				});
		});
	},
};