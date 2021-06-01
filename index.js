const Discord = require('discord.js');
const { token } = require('./config.json');
const fs = require("fs");

const client = new Discord.Client({ intents: Discord.Intents.ALL });

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

client.login(token);