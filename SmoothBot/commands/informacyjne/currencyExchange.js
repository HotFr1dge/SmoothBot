/* eslint-disable no-inline-comments */
const { MessageEmbed } = require('discord.js');
const superagent = require('superagent');
const { color_informative, color_error } = require('../../colours.json');

module.exports = {
	name: 'currencyExchange',
	aliases: ['wymianaWalut'],
	category: 'informacyjne',
	description: 'Wysyła aktualne kursy walut.',
	usage: '[kod waluty]',
	deleteInvoke: false,
	async run(client, message, args) {
		const errEmbed = new MessageEmbed()
			.setDescription('❌ Wystąpił nieoczekiwany błąd API!')
			.setColor(color_error);

		const { body } = await superagent
			.get(encodeURI('http://api.nbp.pl/api/exchangerates/tables/a?format=json'))
			.catch(() => {
				return message.channel.send(errEmbed).then(m => m.delete({ timeout: 5000 }));
			});

		if (!body) return message.channel.send(errEmbed).then(m => m.delete({ timeout: 5000 }));

		const finalEmbed = new MessageEmbed()
			.setAuthor('KURSY WYMIANY WALUT', 'https://cdn.discordapp.com/attachments/777615056220192808/779799838077616208/weather.png')
			.setTimestamp()
			.setColor(color_informative)
			.setFooter(`${message.author.tag} | Powered by: nbp.pl`, `${message.author.displayAvatarURL({ size: 2048, format: 'png', dynamic: true })}`)
			.addField(`${body[0].rates[1].currency} [${body[0].rates[1].code}]`, body[0].rates[1].mid, true) // USD
			.addField(`${body[0].rates[7].currency} [${body[0].rates[7].code}]`, body[0].rates[7].mid, true) // EUR
			.addField(`${body[0].rates[10].currency} [${body[0].rates[10].code}]`, body[0].rates[10].mid, true) // GBP
			.addField(`${body[0].rates[9].currency} [${body[0].rates[9].code}]`, body[0].rates[9].mid, true) // CHF
			.addField(`${body[0].rates[13].currency} [${body[0].rates[13].code}]`, body[0].rates[13].mid, true) // CZK
			.addField(`${body[0].rates[14].currency} [${body[0].rates[14].code}]`, body[0].rates[14].mid, true) // DKK
			.addField(`${body[0].rates[16].currency} [${body[0].rates[16].code}]`, body[0].rates[16].mid, true) // NOK
			.addField(`${body[0].rates[17].currency} [${body[0].rates[17].code}]`, body[0].rates[17].mid, true) // SEK
			.addField(`${body[0].rates[11].currency} [${body[0].rates[11].code}]`, body[0].rates[11].mid, true) // UAH
			.addField(`${body[0].rates[29].currency} [${body[0].rates[29].code}]`, body[0].rates[29].mid, true) // RUB
			.addField(`${body[0].rates[33].currency} [${body[0].rates[33].code}]`, body[0].rates[33].mid, true) // CNY
			.addField(`${body[0].rates[12].currency} [${body[0].rates[12].code}]`, body[0].rates[12].mid, true); // JPY

		if (!args[0]) {
			message.channel.send(finalEmbed);
		}
		else {
			let output = '';
			body[0].rates.forEach(x => {
				output += `\`${x.code}\`` + ', ';
			});

			if (!body[0].rates.find(x => x.code == args[0])) return message.channel.send(errEmbed.setDescription('❌ Nie znaleziono waluty o takim kodzie!').addField('DOSTĘPNE WALUTY', output)).then(m => m.delete({ timeout: 5000 }));

			const currency = body[0].rates.find(x => x.code == args[0]);

			const simplyEmbed = new MessageEmbed()
				.setAuthor(`KURS WYMIANY - ${currency.code}`, 'https://cdn.discordapp.com/attachments/777615056220192808/779799838077616208/weather.png')
				.setTimestamp()
				.setColor(color_informative)
				.addField(`${currency.currency} [${currency.code}]`, currency.mid)
				.setFooter(`${message.author.tag} | Powered by: nbp.pl`, `${message.author.displayAvatarURL({ size: 2048, format: 'png', dynamic: true })}`);
			message.channel.send(simplyEmbed);
		}

	},
};