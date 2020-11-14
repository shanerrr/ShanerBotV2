const mongoose = require('mongoose');
const Guild = require('../../models/guild');
module.exports = async (client, guild) => {
    Guild.findOneAndDelete({
        guildID: guild.id
    }, (err, res) => {
        if(err) console.log(err);
    })
    const player = client.manager.players.get(guild.id);
    if (player)
        player.destroy();
}
