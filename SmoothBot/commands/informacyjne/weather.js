const { MessageEmbed } = require('discord.js');
const superagent = require('superagent');
const { color_informative, color_error } = require('../../colours.json');
const { formatTime } = require('../../functions.js');

module.exports = {
	name: 'weather',
	aliases: ['pogoda'],
	category: 'informacyjne',
	description: 'Wysyła dane pogodowe dla podanej lokalizacji.',
	usage: '<lokalizacja>',
	deleteInvoke: false,
	async run(client, message, args) {
		const errEmbed = new MessageEmbed()
			.setDescription('❌ Nie wpisałeś lokalizacji dla, której chcesz sprawdzić pogodę')
			.setColor(color_error);

		if (!args[0]) return message.channel.send(errEmbed).then(m => m.delete({ timeout: 5000 }));

		const { body } = await superagent
			.get(encodeURI(`http://api.openweathermap.org/data/2.5/weather?q=${args.join(' ')}&appid=${process.env.WEATHER_APIKEY}&units=metric&lang=pl`))
			.catch(err => {
				if (err.response.res.text == '{"cod":"404","message":"city not found"}') return message.channel.send(errEmbed.setDescription('❌ Nie znaleziono takiego miasta!')).then(m => m.delete({ timeout: 5000 }));
				return message.channel.send(errEmbed.setDescription('❌ Wystąpił nieoczekiwany błąd API!')).then(m => m.delete({ timeout: 5000 }));
			});

		if (!body) return message.channel.send(errEmbed.setDescription('❌ Wystąpił nieoczekiwany błąd API!')).then(m => m.delete({ timeout: 5000 }));

		const finalEmbed = new MessageEmbed()
			.setAuthor(`POGODA - ${body.name}${body.sys.country ? ' : ' + body.sys.country : ''}`, 'https://cdn.discordapp.com/attachments/777615056220192808/779799838077616208/weather.png')
			.setTimestamp()
			.setColor(color_informative)
			.setFooter(`${message.author.tag} | Powered by: openweathermap.org`, message.author.displayAvatarURL({ size: 2048, format: 'png', dynamic: true }))
			.addField('Opis:', `${body.weather[0].description}`, false)
			.addField('Temperatura:', `${body.main.temp} °C`, true)
			.addField('Temperatura min:', `${body.main.temp_min} °C`, true)
			.addField('Temperatura max:', `${body.main.temp_max} °C`, true)
			.addField('Temperatura odczuwalna:', `${body.main.feels_like} °C`, true)
			.addField('Wilgotność:', `${body.main.humidity}%`, true)
			.addField('Ciśnienie:', `${body.main.pressure} hPa`, true)
			.addField('Wiatr:', `${body.wind.speed} km/h`, true)
			.addField('Zachmurzenie:', `${body.clouds.all}%`, true)
			.addField('Widoczność:', `${body.visibility ? body.visibility + 'm' : 'Brak danych'}`, true)
			.addField('Wschód słońca:', `${formatTime(new Date(body.sys.sunrise * 1000))}`, true)
			.addField('Zachód słońca:', `${formatTime(new Date(body.sys.sunset * 1000))}`, true)
			.addField('Dokładniejsza pogoda:', `[Kliknij tu](https://openweathermap.org/city/${body.id})`, false);

		message.channel.send(finalEmbed);
	},
};