const {MessageEmbed} = require("discord.js");
module.exports = { 
    config: {
        name: "playplaylist",
        description: "I will play a playlist.",
        usage: "ur playplaylist",
        category: "music",
        accessableby: "Members",
        aliases: ["pp"]
    },
    run: async (client, message, args) => {
        var player = client.music.players.get(message.guild.id);
        if (!args[0]) {
            message.react("❌");
            return message.reply("please tell me what playlist to play.").then(msg => msg.delete({timeout: 5000}));
        }
        if (!(client.playlistkeys.get(message.author.id)).includes(args.join(" ").toLowerCase())) {
            message.react("❌");
            return message.reply("that playlist doesn't exist. Please check the name.").then(msg => msg.delete({timeout: 5000}));
        }
        var playlist;
        try{
            playlist = JSON.parse(client.playlist.get(message.author.id+args.join(" ").toLowerCase()))
        }catch{
            message.react("❌");
            return message.reply("You're trying to play an empty playlist you dumbo.").then(msg => msg.delete({timeout: 5000}));
        }
        if (!player) {
            let commandfile = client.commands.get("join") || client.commands.get(client.aliases.get("join"))
            if(commandfile) commandfile.run(client, message, "")
            player = client.music.players.get(message.guild.id);
            if (!player) return message.react("❌");
            return await getMusic(playlist, true);   
        }else{
            player.setQueueRepeat(false);
            if((player.voiceChannel.members.size<3 || message.member.hasPermission('MOVE_MEMBERS')) && player.queue.size>0) {
                const pEmbed = new MessageEmbed()
                .setColor("#B44874")
                .setTitle("**"+"Adding Playlist: "+"__"+args.join(" ").toUpperCase()+"__"+"**")
                .setDescription("React to this message with one of the options below to state what to do with the following playlist.")
                .addField("\u200b","🎶: Will **__add__** the playlist to the current queue. (Queue will not be looping)", false)
                .addField("\u200b", "⏏️: Will **__clear__** the current queue and start playing the playlist. (Queue will be looping)", false)
                .setFooter(`ShanerBot: QueueManager (${message.guild.name})`, client.user.displayAvatarURL())
                plembed = await message.channel.send(pEmbed);
                plembed.react("🎶")
                plembed.react("⏏️").then(()=>{
                    const filter = (reaction, user) => (reaction.emoji.name === '🎶' || reaction.emoji.name === '⏏️') && user.id == message.author.id;
                    const collectorR = plembed.createReactionCollector(filter, { max: 100, time: 30000 });
                    collectorR.on('collect', async r => {
                        if (r.emoji.name === '🎶') {
                            plembed.delete();
                            message.react("🎶");
                            if (playlist.length + player.queue.size > 20) {
                                message.react("❌");
                                return message.reply(`Sorry, the queue can only store 20 songs at a time.`).then(msg => msg.delete({timeout: 5000}));
                            }
                            return await getMusic(playlist, false);
                        }
                        if (r.emoji.name === '⏏️') {
                            plembed.delete();
                            try{
                                player.queue.removeFrom(1, player.queue.size);
                                player.stop();
                            } catch{
                                player.stop();
                            }
                            message.react("⏏️");
                            return await getMusic(playlist, true);
                        }
                    });
                    collectorR.on("end", async (_, reason) => {
                        if(["time"].includes(reason)) {
                            plembed.delete();
                            message.react("🎶");
                            if (playlist.length + player.queue.size <=20) return message.react("❌");
                            return await getMusic(playlist, false);
                        }
                    });
                    }).catch(async err => {
                        plembed.delete();
                        message.react("🎶");
                        if (playlist.length + player.queue.size <=20) return message.react("❌");
                        return await getMusic(playlist, false);
                        });
            }
            if (player.queue.size==0) {
                await getMusic(playlist, true);
            }
            if (player.voiceChannel.members.size>=3){
                await getMusic(playlist, false);
            }
        }

async function getMusic(playlist, repeat) {

    var bar = new Promise((resolve, reject) => {
        playlist.forEach((track, index, array) => {
            client.music.search(track.uri, message.author).then(async res => {
            switch (res.loadType) {
                case "TRACK_LOADED":
                    player.queue.add(res.tracks[0]);
                    if (index === array.length -1) resolve();
            }}).catch(async err => {if (err == "Error: No tracks were found.") {var temparray = []; temparray.push(playlist[index]); await getMusic(temparray);} else{console.log(err)}})
        });
    });
    bar.then(() => {
        if (!player.playing) {
            player.play();
            }
        if (repeat) {
            player.setQueueRepeat(true);
        } else{
            player.setQueueRepeat(false);
        }

    });
}
}}
