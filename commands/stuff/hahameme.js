const {RichEmbed} = require("discord.js")
const fetch = require('node-fetch');

module.exports = { 
  config: {
      name: "hahameme",
      description: "man, its a meme from a website ok",
      usage: "ur hahameme",
      category: "stuff",
      accessableby: "Members",
      aliases: ["hahameme"]
  },
  run: async (client, message, args) => {
    fetch('https://apis.duncte123.me/meme')
    .then(res => res.json()).then(body => {
      if (!body) return msg.channel.send("``haha no meme for u, idot.``")
      let mEmbed = new RichEmbed()
      .setTitle(body.data['title'])
      .setColor("#ff00d9")
      .setFooter("ShanerBot", client.user.displayAvatarURL)
      .setImage(body.data['image'])
        message.channel.send({embed: mEmbed})
    })
  }

}