module.exports = {
	name: 'ready',
	once: true,
	run(client) {
		console.log('Bot is ready!');

		// Zmiana ststusu w zależności od pingu.
		setInterval(function() {
			if (client.ws.ping <= 100) {
				client.user.setStatus('online');
			}
			else if (client.ws.ping <= 200) {
				client.user.setStatus('idle');
			}
			else {
				client.user.setStatus('dnd');
			}
		}, 60000);

		// Ustawienia aktywności w grze
		client.user.setPresence({
			activity: {
				name : `${process.env.PREFIX}help | @${client.user.username}`,
				type : 'WATCHING',
			},
		});
	},
};