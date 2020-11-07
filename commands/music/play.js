const {MessageEmbed} = require("discord.js")
const prettyMilliseconds = require('pretty-ms');
const {prefix} = require("../../botconfig.json")

module.exports = { 
  config: {
      name: "play",
      description: "i play music for u ok.",
      usage: "ur play <song name/url>",
      category: "music",
      accessableby: "Members",
      aliases: ["p", "search"]
  },
  run: async (client, message, args) => {
      
    const { channel } = message.member.voice;
    if (!channel) return message.channel.send("`ur know i cant join if youre not in a channel, right?`");
    if (!args[0]) return message.channel.send("`play what song man? enter youtube url or search.`");

    let player = client.manager.players.get(message.guild.id);
    if (!player) {
        let commandfile = client.commands.get("join");
        if(commandfile) commandfile.run(client, message, []);
        player = client.manager.players.get(message.guild.id);
    }
    if (!player) return
    else {
        client.retry.set(message.author.id, 0);
        getMusic();
    }

function getMusic() {
    client.manager.search(args.join(" "), message.author).then(async res => {
        switch (res.loadType) {
            case "TRACK_LOADED":
                if (res.tracks[0].duration>10800000) return message.channel.send("`im not in the mood to listen to anything longer than 3 hours sorry nty.`");
                player.queue.add(res.tracks[0]);
                const aEmbed = new MessageEmbed()
                    .setAuthor(`${message.author.username}: Enqueuing`, message.author.displayAvatarURL())
                    .setURL(res.tracks[0].uri)
                    .setThumbnail(res.tracks[0].thumbnail)
                    .setColor("#B44874")
                    .setTitle("**"+res.tracks[0].title+"**")
                    .addField("Duration:", `${prettyMilliseconds(res.tracks[0].duration, {colonNotation: true, secondsDecimalDigits: 0})}`, true)
                    .addField("Uploader:", `${res.tracks[0].author}`, true)
                    .setFooter(`ShanerBot: Play (${message.guild.name})`, client.user.displayAvatarURL())
                    if (player.queue.size >= 1) {
                        if (player.trackRepeat) {
                            asEmbed.addField("Position in queue:", `${player.queue.size+1}`, true)
                        }else{
                            aEmbed.addField("Position in queue:", `${player.queue.size+1}: (${prettyMilliseconds(player.queue.duration-player.position-res.tracks[0].duration, {colonNotation: true, secondsDecimalDigits: 0})} till played)`, true)
                        }
                    }
                message.channel.send({embed:aEmbed});
                //message.channel.send(`Enqueuing \`${res.tracks[0].title}\` \`${Utils.formatTime(res.tracks[0].duration, true)}\``);
                if (!player.playing) player.play()
                break;
            
            case "SEARCH_RESULT":
                let index = 1;
                const tracks = res.tracks.slice(0, 10);
                const embedf = new MessageEmbed()
                    .setAuthor(`${message.author.username}: Song Picker`, message.author.displayAvatarURL())
                    .setColor("#B44874")
                    .setDescription(tracks.map(video => `**[${index++}] -** ${video.title} ~ **__[${prettyMilliseconds(video.duration, {colonNotation: true, secondsDecimalDigits: 0})}]__**`))
                    .setFooter("Your have 30 seconds to pick a song. Type 'cancel' to cancel the selection", client.user.displayAvatarURL());
                client.query.set(message.channel.id, await message.channel.send(embedf));


                client.query.get(message.channel.id).react("⬅️")
                client.query.get(message.channel.id).react("➡️").then(() =>{
                const filter = (reaction, user) => (reaction.emoji.name === '➡️' || reaction.emoji.name === '⬅️') && user.id === message.author.id;
                const collectorR = client.query.get(message.channel.id).createReactionCollector(filter, { max: 100, time: 30000 });
                collectorR.on('collect', r => {
                    if (r.emoji.name === '➡️') {
                        const tracks = res.tracks.slice(10, 20);
                        let index = 11;
                        const embed = new MessageEmbed()
                            .setAuthor(`${message.author.username}: Enqueuing`, message.author.displayAvatarURL())
                            .setColor("#B44874")
                            .setDescription(tracks.map(video => `**[${index++}] -** ${video.title} ~ **__[${prettyMilliseconds(video.duration, {colonNotation: true, secondsDecimalDigits: 0})}]__**`))
                            .setFooter("Your response time closes within the next 30 seconds. Type 'cancel' to cancel the selection", client.user.displayAvatarURL());
                            client.query.get(message.channel.id).edit(embed);
                    }
                    else client.query.get(message.channel.id).edit(embedf);
                });
                }).catch(err => err);
                
                const collector = message.channel.createMessageCollector(m => {
                    return m.author.id === message.author.id && (new RegExp(`^([1-9]|1[0-9]|20|cancel|${prefix}leave)$`, "i").test(m.content) || m.content.toLowerCase().includes(`${prefix}search`) || m.content.toLowerCase().includes(`${prefix}play`) || m.content.toLowerCase().includes(`${prefix}p`))
                }, { time: 30000, max: 1});

                collector.on("collect", m => {
                    if (/cancel/i.test(m.content)) {
                        m.react("✅");
                        return collector.stop("cancelled") 
                    }
                    //if (/ur leave/i.test(m.content)) return collector.stop("leave")
                    if (m.content.toLowerCase().includes(`${prefix}leave`)) return collector.stop("leave");
                    if (m.content.toLowerCase().includes(`${prefix}search`)||m.content.toLowerCase().includes(`${prefix}play`) ||m.content.toLowerCase().includes(`${prefix}p`)) return collector.stop("twoSearch");
                    const tracks = res.tracks.slice(0, 20);
                    const track = tracks[Number(m.content) - 1];
                    if (track.duration>10800000) {
                        client.query.get(message.channel.id).delete();
                        return message.channel.send("`im not in the mood to listen to anything longer than 3 hours sorry nty.`")
                    }
                    player.queue.add(track)
                    client.query.get(message.channel.id).delete();
                    const asEmbed = new MessageEmbed()
                        .setAuthor(`${message.author.username}: Enqueuing`, message.author.displayAvatarURL())
                        .setURL(track.uri)
                        .setThumbnail(`https://img.youtube.com/vi/${track.identifier}/default.jpg`)
                        .setColor("#B44874")
                        .setTitle("**"+track.title+"**")
                        .addField("Duration:", `${prettyMilliseconds(track.duration, {colonNotation: true, secondsDecimalDigits: 0})}`, true)
                        .addField("Uploader:", `${track.author}`, true)
                        .setFooter(`ShanerBot: Play (${message.guild.name})`, client.user.displayAvatarURL())
                        if (player.queue.size >= 1) {
                            if (player.trackRepeat) {
                                asEmbed.addField("Position in queue:", `${player.queue.size+1}`, true)
                            }else{
                                asEmbed.addField("Position in queue:", `${player.queue.size+1}: (${prettyMilliseconds(player.queue.duration-player.position-track.duration, {colonNotation: true, secondsDecimalDigits: 0})} till played)`, true)
                            }
                        }
                    message.channel.send({embed:asEmbed});
                    //message.channel.send(`Enqueuing \`${track.title}\` \`${Utils.formatTime(track.duration, true)}\``);
                    if(!player.playing) player.play();
                });

                collector.on("end", (_, reason) => {
                    if(["time", "leave", "twoSearch"].includes(reason)) {
                        client.query.get(message.channel.id).delete();
                        return message.react("❌");
                    }
                    if(["cancelled"].includes(reason)) {
                        client.query.get(message.channel.id).delete();
                    }
                });
                break;

            case "PLAYLIST_LOADED":
                return message.channel.send("`currently not supporting playlists. sorry man.`")
                res.playlist.tracks.forEach(track => player.queue.add(track));
                const duration = prettyMilliseconds(res.playlist.tracks.reduce((acc, cur) => ({duration: acc.duration + cur.duration})).duration, {colonNotation: true, secondsDecimalDigits: 0});
                message.channel.send(`Enqueuing \`${res.playlist.tracks.length}\` \`${duration}\` tracks in playlist \`${res.playlist.info.name}\``);
                if(!player.playing) player.play()
                break;

        }       
    }).catch(err => {if (err == "Error: No tracks were found." && client.retry.get(message.author.id) < 2) {client.retry.set(message.author.id, client.retry.get(message.author.id)+1); return getMusic();} else{return message.react("❌")}}) //message.react("❌"));//err => message.channel.send("`dude, try again maybe. Weird issue: "+`${err}`+"`"));
}
  }
}