const {MessageEmbed} = require("discord.js")
module.exports = { 
    config: {
        name: "skip",
        description: "ok i'll skip a song.",
        usage: "ur skip",
        category: "music",
        accessableby: "Members",
        aliases: ["s", "next"]
    },
    run: async (client, message, args) => {

        const player = client.music.players.get(message.guild.id);
        if (!player) return message.channel.send("`bruh, r u dumb? Not even gonna say anything.`");
        
        const {channel} = message.member.voice;
        if(!channel || channel.id != player.voiceChannel.id) return message.channel.send("`im not skipping unless your in the same channel and kiss me.`");

        player.setTrackRepeat(false);
        player.stop();
        return message.react("⏭️");
    }
}