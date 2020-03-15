const {MessageEmbed} = require("discord.js")
const prettyMilliseconds = require('pretty-ms');

module.exports = { 
    config: {
        name: "loopqueue",
        description: "i loop an active queue forever or stop a forever looping queue.",
        usage: "ur loopqueue",
        category: "music",
        accessableby: "Members",
        aliases: ["loopall", "repeatall", "repeatqueue"]
    },
    run: async (client, message, args) => {

        const player = client.music.players.get(message.guild.id);

        if (!player) return message.channel.send("`man ur know im not even connected to a channel, idot.`");
        if (!player.playing) return message.channel.send("`man ur know im not even playing a song.`");

        const { voiceChannel } = message.member;
        if(!voiceChannel || voiceChannel.id !== player.voiceChannel.id) return message.channel.send("`no song looping unless youre in the same channel as me`");

        player.setQueueRepeat(!player.queueRepeat);
        if (player.queueRepeat) {
            const embed = new MessageEmbed()
            .setAuthor(`${message.author.username}: Repeating a queue`, message.author.displayAvatarURL)
            .setTitle(`**${message.guild.name}'s Queue**`)
            .setColor("#B44874")
            .setDescription(`**Now Repeating Queue:** __**(${prettyMilliseconds(player.queue.duration, {colonNotation: true, secondsDecimalDigits: 0})})**__ total length\nTyping ur queue will show all songs in queue.`)       
            .setFooter(`ShanerBot: QueueRepeat (${message.guild.name})`, client.user.displayAvatarURL)
                message.channel.send(embed);
        } else{
            message.channel.send("`ok, i stopped repeating the queue.`")
        }
    }
}