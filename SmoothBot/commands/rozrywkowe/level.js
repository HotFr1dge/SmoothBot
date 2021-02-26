const { MessageAttachment, MessageEmbed } = require('discord.js');
const { getMember, rand } = require('../../functions.js');
const { color_error } = require('../../colours.json');
const sqlite = require('sqlite3');

const { Canvas, resolveImage } = require('canvas-constructor');
const { registerFont } = require('canvas');
const { resolve, join } = require('path');
const fetch = require('node-fetch');

module.exports = {
	name: 'level',
	aliases: ['poziom', 'rank'],
	category: 'rozrywkowe',
	description: 'Wyświetla aktualny poziom na serwerze.',
	deleteInvoke: false,
	async run(client, message, args) {
		const db = new sqlite.Database('./resources/Smooth.db', sqlite.OPEN_READONLY);
		const member = getMember(message, args.join(' '));

		const errEmbed = new MessageEmbed()
			.setColor(color_error)
			.setDescription('❌ Nie możesz sprawdzić poziomu bota!');

		if (member.user.bot) return message.channel.send(errEmbed);

		const firstQuery = 'SELECT * FROM levelsSettings WHERE guild_id = ?';
		db.get(firstQuery, [message.guild.id], (err, firstRow) => {
			if (!firstRow || firstRow.disabled == false) {
				const query = 'SELECT * FROM levels WHERE guild_id = ? AND user_id = ?';
				db.get(query, [message.guild.id, member.user.id], async (err, row) => {
					if (err) console.log(err);
					let xp, lvl;
					if (!row) {
						xp = 0;
						lvl = 0;
					}
					else {
						xp = row.exp;
						lvl = row.level;
					}
					try {
						const buffer = await profile(message, member, lvl, xp);
						const filename = `profile-${member.id}.jpg`;
						const attachment = new MessageAttachment(buffer, filename);
						await message.channel.send(attachment);
					}
					catch (error) {
						client.logger.error(error.stack);
						message.channel.send(errEmbed.setDescription(`An error ocurred: \`\`\`${error.message}\`\`\``));
					}
				});
			}
			else if (firstRow.disabled == true) {
				message.channel.send(errEmbed.setDescription('❌ System poziomów został wyłączony na tym serwerze.'));
			}
			db.close();
		});
	},
};

async function profile(message, member, lvl, exp) {

	try {
		const result = await fetch(member.user.displayAvatarURL({ size: 512, format: 'png', dynamic: false }));
		if (!result.ok) throw new Error('Failed to get the avatar!');
		const avatar = await result.buffer();

		const bgs = [
			'https://cdn.mee6.xyz/plugins/levels/cards/backgrounds/4cc81b4c-c779-4999-9be0-8a3a0a64cbaa.jpg',
			'https://cdn.mee6.xyz/plugins/levels/cards/backgrounds/c9ac0859-d134-473c-94df-e90f780b06a5.jpg',
			'https://cdn.mee6.xyz/plugins/levels/cards/backgrounds/0b6c7fe0-20c2-4aba-bd8e-2cdf57ee3e32.jpg',
			'https://cdn.mee6.xyz/plugins/levels/cards/backgrounds/9711cff0-81b6-40a2-98eb-5b5e879cf1b9.jpg',
			'https://cdn.mee6.xyz/plugins/levels/cards/backgrounds/da3c529f-15c4-4152-8a43-2b401fd93124.jpg',
		];

		const bg_img = bgs[rand(0, bgs.length - 1)];

		const result2 = await fetch(bg_img);
		if (!result2.ok) throw new Error('Failed to get the avatar!');
		const bg = await result2.buffer();

		const name = member.displayName.length > 30 ? member.displayName.substring(0, 17) + '...'
			: member.displayName;

		const member_color = member.displayHexColor;

		registerFont(resolve(join(__dirname, '../../resources/JosefinSans.ttf')), { family: 'Josefin Sans' });

		let points_size = exp / 10 / 100 * 660;
		if (points_size < 20) {
			points_size = 0;
		}

		return new Canvas(1000, 300)
			.printImage(await resolveImage(bg), 0, 0, 1000, 300)
			.createRoundedClip(30, 30, 940, 240, 5)
			.setColor('rgba(0, 0, 0, 0.3)')
			.fill()
			.setShadowColor('rgba(22, 22, 22, 1)')
			.setShadowOffsetY(5)
			.setShadowBlur(10)
			.setColor('rgba(44, 47, 51, 1)')
			.printCircle(155, 150, 94)
			.printCircularImage(await resolveImage(avatar), 156, 150, 96)
			.save()
			.createRoundedClip(270, 190, 670, 46, 100)
			.setColor('#23272A')
			.fill()
			.createRoundedClip(275, 195, points_size === 0 ? 0.001 : points_size, 36, 100)
			.setColor(member_color)
			.fill()
			.restore()
			.setTextAlign('left')
			.setTextFont('26pt Josefin Sans')
			.setColor('#FFFFFF')
			.printText(name, 290, 180)
			.setTextAlign('right')
			.printText(`Level: ${lvl.toLocaleString()}`, 950, 70)
			.setTextFont('18pt Josefin Sans')
			.printText(`EXP: ${exp.toLocaleString()}/1000`, 930, 185)
			.toBuffer();
	}
	catch (error) {
		await message.channel.send(`An error occurred: **${error.message}**`);
	}
}