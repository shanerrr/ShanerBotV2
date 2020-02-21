const {RichEmbed} = require("discord.js")
const { Utils } = require("erela.js")

module.exports = { 
  config: {
      name: "play",
      description: "i play music for u ok.",
      usage: "ur play",
      category: "music",
      accessableby: "Members",
      aliases: ["p", "play"]
  },
  run: async (client, message, args) => {

    const { voiceChannel } = message.member;
        if (!voiceChannel) return message.channel.send("dude, where to play?????? join a channel.");

        const permissions = voiceChannel.permissionsFor(client.user);
        if (!permissions.has("CONNECT")) return message.channel.send("I cannot connect to your voice channel, make sure I have permission to!");
        if (!permissions.has("SPEAK")) return message.channel.send("I cannot connect to your voice channel, make sure I have permission to!");
        if (!args[0]) return message.channel.send("Please provide a song name or link to search.");

        const player = client.music.players.spawn({
          guild: message.guild,
          textChannel: message.channel,
          voiceChannel
      });

      client.music.search(args.join(" "), message.author).then(async res => {
        switch (res.loadType) {
            case "TRACK_LOADED":
                player.queue.add(res.tracks[0]);
                message.channel.send(`Enqueuing \`${res.tracks[0].title}\` \`${Utils.formatTime(res.tracks[0].duration, true)}\``);
                if (!player.playing) player.play()
                break;
            
            case "SEARCH_RESULT":
                let index = 1;
                const tracks = res.tracks.slice(0, 10);
                const embed = new RichEmbed()
                    .setAuthor("Song Selection.", message.author.displayAvatarURL)
                    .setDescription(tracks.map(video => `**${index++} -** ${video.title}`))
                    .setFooter("Your response time closes within the next 30 seconds. Type 'cancel' to cancel the selection");

                await message.channel.send(embed);

                const collector = message.channel.createMessageCollector(m => {
                    return m.author.id === message.author.id && new RegExp(`^([1-10]|cancel)$`, "i").test(m.content)
                }, { time: 30000, max: 1});

                collector.on("collect", m => {
                    if (/cancel/i.test(m.content)) return collector.stop("cancelled")

                    const track = tracks[Number(m.content) - 1];
                    player.queue.add(track)
                    message.channel.send(`Enqueuing \`${track.title}\` \`${Utils.formatTime(track.duration, true)}\``);
                    if(!player.playing) player.play();
                });

                collector.on("end", (_, reason) => {
                    if(["time", "cancelled"].includes(reason)) return message.channel.send("Cancelled selection.")
                });
                break;

            case "PLAYLIST_LOADED":
                res.playlist.tracks.forEach(track => player.queue.add(track));
                const duration = Utils.formatTime(res.playlist.tracks.reduce((acc, cur) => ({duration: acc.duration + cur.duration})).duration, true);
                message.channel.send(`Enqueuing \`${res.playlist.tracks.length}\` \`${duration}\` tracks in playlist \`${res.playlist.info.name}\``);
                if(!player.playing) player.play()
                break;
        }
    }).catch(err => message.channel.send(err.message))
}
}