module.exports = { 
    config: {
        name: "loop",
        description: "i loop a playing song forever or stop a forever looping song.",
        usage: "ur loop",
        category: "music",
        accessableby: "Members",
        aliases: ["repeat"]
    },
    run: async (client, message, args) => {

        const player = client.music.players.get(message.guild.id);

        if (!player) return message.channel.send("`man ur know im not even connected to a channel, idot.`");
        if (!player.playing) return message.channel.send("`man ur know im not even playing a song.`");

        const {channel} = message.member.voice;
        if(!channel || channel.id !== player.voiceChannel.id) return message.channel.send("`no song looping unless youre in the same channel as me`");

        player.setTrackRepeat(!player.trackRepeat);
        if (player.trackRepeat) {
            return message.react("🔂");
        } else{
            return message.react("❌");
        }
    }
}