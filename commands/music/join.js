module.exports = { 
    config: {
        name: "join",
        description: "ok i join, hi.",
        usage: "ur join",
        category: "music",
        accessableby: "Members",
        aliases: []
    },
    run: async (client, message, args) => {

        let {channel} = message.member.voice;
        if (args[0]) {
            channel = message.guild.channels.cache.find(VoiceChannel => VoiceChannel.name === args.join(" "));
            if (!channel) return message.react("❌");
        }
        else {
            if (!channel) return message.channel.send("`ur know i cant join if ur're not in channel, right?`");
        }
            
        if (!client.music.players.get(message.guild.id)) {
            let permissions = channel.permissionsFor(client.user);
            if (!permissions.has("CONNECT")) return message.channel.send("😢 "+"`mannnn, i don't have the permission to join that channel.`");
            if (!permissions.has("SPEAK")) return message.channel.send("🤐 "+ "`dude, i can't talk in there man.`");       
            if (channel.full)
                if (permissions.has("CONNECT") && (permissions.has("MOVE_MEMBERS") || permissions.has("ADMINISTRATOR"))) {
                }else{
                    return message.channel.send("😭" + " ``there is not enough room for me man, ttyl.``");
                }
            message.react("😀")    
            client.music.players.spawn({
                guild: message.guild,
                textChannel: message.channel,
                voiceChannel: channel
            });
        }
        else {
            const player = client.music.players.get(message.guild.id);
            if (player && (player.voiceChannel.id != channel.id)) return message.channel.send("`dude, nty. I'm already in a channel.`");
        }
        
    }
}