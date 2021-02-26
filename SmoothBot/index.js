require('dotenv').config();

const sqlite = require('sqlite3').verbose();
const db = new sqlite.Database('./resources/Smooth.db', sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE);
db.run('CREATE TABLE IF NOT EXISTS logs(guild_id TEXT, channel_id TEXT)');
db.run('CREATE TABLE IF NOT EXISTS prefixes(guild_id TEXT, prefix TEXT)');
db.run('CREATE TABLE IF NOT EXISTS levels(guild_id TEXT, user_id TEXT, exp INT, level INT)');
db.run('CREATE TABLE IF NOT EXISTS levelsSettings(guild_id TEXT, disabled BOOL, alert BOOL)');
db.run('CREATE TABLE IF NOT EXISTS warns(guild_id TEXT, user_id TEXT, warns INT)');
db.close();

const { Client, Collection } = require('discord.js');
const client = new Client({
	disableMentions: 'everyone',
});

['commands', 'aliases'].forEach(x => (client[x] = new Collection()));
['command', 'event'].forEach(x => require(`./handlers/${x}`)(client));

client.login(process.env.TOKEN);