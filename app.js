'use strict';

const rp = require('request-promise-native');

const Discord = require('discord.js');
const Moment = require('moment');

const config = require('./config.js');
const nodeBot = require('./nodeBot');

// Login to Discord
const bot = new Discord.Client();
bot.login(config.discord.token);

// Discord Helpers
const sendEmbedToRole = (guild, roleName, embed) => {
    // Find the role
    const role = guild.roles.find('name', roleName);

    // Send the members of the overwatch role the announcement
    if (role && role.members)
        role.members
        .filter(x => x.user.presence.status === 'online')
        .forEach(member => member.sendEmbed(embed).catch(e => console.dir(e)));
};

// General Display messages
bot.on('ready', () => {
    console.log('Connected to Discord');
    bot.user.setGame(null);
    bot.user.setGame('with himself');
});

bot.on('reconnecting', () => console.log('Reconnected to Discord'));

// Handle Discord Message
bot.on('message', message => {
    // Disregard self messages
    if (message.author.username == bot.user.username) return;

    // Check to see if I was mentioned
    let mentioned = message.mentions.users.find('username', config.watchFor);

    // No Need to continue
    if (!mentioned) return;

    let content = message.content;
    message.mentions.users.forEach(user => content = content.replace(`@${user.id}`, user.username));

    // Parse the time with moment
    const time = Moment(message.createdTimestamp).format('dddd, MMMM Do YYYY, h:mm:ss a');

    // Format the response
    const response = `[Discord ${time} ${message.channel.guild.name}->#${message.channel.name}->${message.author.username}] ${content}`;

    // Notify
    nodeBot(config.notify, response).catch(e => console.dir);
});

// User Presence Updates
bot.on('presenceUpdate', (oldMem, newMem) => {
    // User is not playing a game, or is a bot, bail
    if (!newMem || !newMem.user.presence.game || newMem.user.bot) return;

    // Default message
    const message = `${newMem.user.username} is now playing ${newMem.user.presence.game.name}`;

    // Channel to report back to
    const channel = bot.channels.find('name', 'nodebot');

    // Switch between supported games
    switch (newMem.user.presence.game.name) {
        case 'Overwatch':
            // Grab the overwatch players role
            sendEmbedToRole(newMem.guild, 'overwatch_players', new Discord.RichEmbed()
                .setTitle(`${newMem.user.username} is now playing Overwatch`)
                .setAuthor('MrOverwatchBot', 'https://static.eurheilu.com/themes/eurheilu/img/games/overwatch.png')
                .setColor(3447003)
                .setDescription('Group up! Invite them to the voice channel, be social, and most of all have fun!')
                .setFooter('A MrNodeBot communication')
                .setImage('https://mms.businesswire.com/media/20160602006554/en/512909/5/Overwatch_Heroes.jpg')
                .setThumbnail('https://pbs.twimg.com/profile_images/631057390830530560/hzVHWPVV.png'));
            break;
        case 'Factorio':
            // Grab the overwatch players role
            sendEmbedToRole(newMem.guild, 'factorio_players', new Discord.RichEmbed()
                .setTitle(`${newMem.user.username} is now playing Factorio`)
                .setAuthor('MrFactorioBot', 'https://s-media-cache-ak0.pinimg.com/avatars/factorio_1365629224_140.jpg')
                .setColor(3447003)
                .setDescription('See if they are playing Multiplayer! Invite them to the voice channel, be social, and most of all have fun!')
                .setFooter('A MrNodeBot communication')
                .setImage('http://cdn.akamai.steamstatic.com/steam/apps/427520/header.jpg?t=1489159190')
                .setThumbnail('https://i.imgur.com/8OSnAuk.jpg'));
        default:
            channel.sendMessage(message).catch(e => console.dir(e));
            break;
    };

});
