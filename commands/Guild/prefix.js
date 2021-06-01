const Guild = require('../../models/Guild');
const sendMessage = require('../../utils/sendInteractMsg');

module.exports = {
  config: {
    name: "prefix",
    description: "Change the prefix used the activate the bot.",
    usage: "<guild-set-prefix> prefix <input>",
    category: "Guild",
    accessableby: "Administrators",
    aliases: [],
    options: [{
      name: "prefix",
      description: "a three letter max custom prefix for your server to activate the bot.",
      type: 3,
      required: true
    }]
  },
  run: async (client, message, args) => {

    const bundledPrefix = args.isInteraction ? args['0'].value : args?.content.join(' ') || "";
    //Error handling
    if (!bundledPrefix) return sendMessage(args, client, message, "❌ : Empty argument. Please rerun command with an argument.", "❌");
    else if (bundledPrefix.length > 3) return sendMessage(args, client, message, "❌ : You need to add a prefix that is no more than 3 characters long.", "❌");

    //logic
    await Guild.findOneAndUpdate({ guildID: message.guild?.id || message.guild_id }, { prefix: bundledPrefix }, (err, _) => {

      //error with DB
      if (err) return sendMessage(args, client, message, "❌ : Weird issue, try again later. ", "❌");
      //SUCESS
      else {
        client.guildPrefixes[message.guild?.id || message.guild_id] = bundledPrefix;
        return sendMessage(args, client, message, `👍 : Changes set. Prefix for this server is now **${bundledPrefix}**`, "❌");
      }
    });
  }
}

