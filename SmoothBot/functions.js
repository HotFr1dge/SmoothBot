module.exports = {
	botMentioned: msg => {
		const regex = RegExp(`^<@!${msg.client.user.id}>`);
		const match = msg.content.match(regex);
		let output;
		(!match) ? output = false : output = true;
		return output;
	},

	formatDate: function(date) {
		return `${date.getDate() < 10 ? '0' + date.getDate() : date.getDate()}.${(date.getMonth() + 1) < 10 ? '0' + date.getMonth() + 1 : date.getMonth() + 1}.${date.getFullYear()}`;
	},

	formatTime: function(date) {
		return `${date.getHours() < 10 ? '0' + date.getHours() : date.getHours()}:${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()}`;
	},

	rand: function(min, max) {
		min = parseInt(min, 10);
		max = parseInt(max, 10);

		if (min > max) {
			const tmp = min;
			min = max;
			max = tmp;
		}

		return Math.floor(Math.random() * (max - min + 1) + min);
	},

	getMember: function(message, toFind = '') {
		toFind = toFind.toLowerCase();

		let target = message.guild.members.cache.get(toFind);

		if (!target && message.mentions.members) {
			target = message.mentions.members.first();
		}

		if (!target && toFind) {
			target = message.guild.members.cache.find(member => {
				return member.displayName.toLowerCase().includes(toFind) ||
                member.user.tag.toLowerCase().includes(toFind);
			});
		}

		if (!target) {
			target = message.member;
		}

		return target;
	},

};
