const DiscordJS = require('discord.js')
const client = new DiscordJS.Client()
const { parsed: Config } = require('dotenv').load()
const fetch = require('node-fetch')
const Prefix = Config.Prefix
const Language = require('./language.js')[Config.Language]

client
  .on('ready', () => {
    console.log(`Logged in as ${client.user.tag} developed by DJS-JPN!`)
    client.user.setStatus('dnd')
    client.user.setPresence({
      game: {
        name: `djs-jpn.ga | Type ${Prefix}help to show help`,
        type: 1,
      },
    })
  })

  .on('message', async message => {
    if (!message.guild) return
    if (message.author.bot) return
    if (!message.content.startsWith(Prefix)) return
    const [cmd] = message.content.slice(Prefix.length).split(' ')
    switch (cmd) {
      case 'help':
        const embed = {
          'color': 0x00FF00,
          'timestamp': new Date(),
          'footer': {
            'icon_url': 'https://avatars3.githubusercontent.com/u/35397294?s=200&v=4',
            'text': 'DEVELOPED BY DJS-JPN',
          },
          'thumbnail': {
            'url': client.user.avatarURL,
          },
          'author': {
            'name': 'コマンド一覧',
            'url': 'https://djs-jpn.ga/bots/Blade',
            'icon_url': client.user.avatarURL,
          },
          'fields': [
            {
              'name': 'help',
              'value': Language.helphelp,
            },
            {
              'name': 'ping',
              'value': Language.helpping,
            },
            {
              'name': 'avatar',
              'value': Language.helpavatar,
            },
            {
              'name': 'translate | t',
              'value': Language.helptranslate,
            },
            {
              'name': 'discordstats',
              'value': Language.helpdiscordstats,
            },
            {
              'name': 'server',
              'value': Language.helpserver,
            },
            {
              'name': Language.helpofficial,
              'value': 'https://djs-jpn.ga',
              'inline': true,
            },
            {
              'name': Language.helpbugreport,
              'value': 'https://discord.gg/DbTpjXV',
              'inline': true,
            },
            {
              'name': 'GitHub',
              'value': 'https://github.com/DJS-JPN/Blade',
              'inline': true,
            },
          ],
        }
        message.channel.send({ embed })
        break
      case 'ping':
        sendEmbed(message, `ポン！Pingの確認に成功しました！ボットのPingは${Math.floor(client.ping)}msです！`)
        break
      case 'avatar':
        const Avatar = new DiscordJS.RichEmbed()
          .setImage(message.author.avatarURL)
        message.channel.send(Avatar)
        break
      case 'discordstats':
        message.channel.startTyping()
        const _summary = await fetch('https://status.discordapp.com/api/v2/summary.json')
        const _incidents = await fetch('https://status.discordapp.com/api/v2/incidents.json')
        const summary = await _summary.json()
        const incidents = await _incidents.json()
        const status = summary.components.map(component => ({
          name: component.name,
          value: (component.status === 'operational') ? Language.discordstatsnormal : Language.discordstatsabnormal,
          inline: true,
        }))
        const allstats = (summary.status.description === 'All Systems Operational')
          ? '全サーバーは正常です。'
          : 'サーバーが不安定な可能性があります。'
        const maintenance = {
          at: incidents.incidents[0].created_at,
          resolved: (incidents.incidents[0].status === 'resolved')
            ? Language.discordstatsresolved
            : Language.discordstatsreunresolved,
        }
        message.channel.stopTyping()
        message.channel.send({
          embed: {
            color: 0x00FF00,
            footer: {
              icon_url: 'https://avatars3.githubusercontent.com/u/35397294?s=200&v=4',
              text: 'DEVELOPED BY DJS-JPN',
            },
            fields: [{
              name: 'サーバーの状態',
              value: allstats,
            }, ...status, {
              name: '最後に行われたメンテナンス',
              value: `${maintenance.at}（${maintenance.resolved}）`,
            }],
          },
        })
        break
      case 'server':
        const Server = new DiscordJS.RichEmbed()
          .setColor('#0x00FF00')
          .setTitle(Language.servertitel)
          .setThumbnail(message.guild.iconURL)
          .addField(Language.serverid, message.guild.id, true)
          .addField(Language.serverowner, message.guild.owner.id, true)
          .addField(Language.servermember, message.guild.members.size, true)
          .addField(Language.serverregion, message.guild.region, true)
          .addField(Language.serverchannel, message.guild.channels.size, true)
          .addField(Language.servercreate, message.guild.createdAt)
          .setFooter('DEVELOPED BY DJS-JPN', 'https://avatars3.githubusercontent.com/u/35397294?s=200&v=4')
        message.channel.send(Server)
        break
      default:
        sendEmbed(message, `不明なコマンドです。${Prefix}helpでコマンドに誤字、脱字、コマンドが存在するか確認をお願いいたします。`)
        break
    }
  })
  .on('guildMemberAdd', member => {
    if (Config.WelcomeChannel !== 'disable') return
    if (member.user.bot === false) {
      const Embed = new DiscordJS.RichEmbed()
        .addField('新しいユーザーがサーバーに参加しました。', `参加したユーザー：${member.user.tag}`, true)
        .addField(`${member.user.tag}さん。ようこそ！`, `${Prefix}helpでコマンド一覧を確認できます！`, true)
        .addField('バグ報告などはこちらへ', 'https://discord.gg/DbTpjXV')
        .addField('このユーザーはボットではありません。', `ID：${member.id}`)
        .setFooter('DEVELOPED BY DJS-JPN', 'https://avatars3.githubusercontent.com/u/35397294?s=200&v=4')
        .setThumbnail(member.user.avatarURL)
        .setColor('#FFFFFF')
      client.channels.get(Config.WelcomeChannel).send(Embed)
    } else {
      const Embed = new DiscordJS.RichEmbed()
        .addField('新しいボットがサーバーに参加しました。', `参加したボット：${member.user.tag}`, true)
        .addField('このボットの信頼性', checkbotsafety(member), true)
        .addField(`このボットを使用して${client.user.tag}に問題が発生した場合はこちらへ`, 'https://discord.gg/DbTpjXV')
        .addField('このユーザーはボットです。', `ID：${member.id}`)
        .setFooter('DEVELOPED BY DJS-JPN', 'https://avatars3.githubusercontent.com/u/35397294?s=200&v=4')
        .setThumbnail(member.user.avatarURL)
        .setColor('#FFFFFF')
      client.channels.get(Config.WelcomeChannel).send(Embed)
    }
  })
  .on('guildMemberRemove', member => {
    if (Config.WelcomeChannel !== 'disable') return
    if (member.user.bot === false) {
      const Embed = new DiscordJS.RichEmbed()
        .addField('ユーザーがサーバーから退出しました。', `退出したユーザー：${member.user.tag}`, true)
        .addField(`${member.user.tag}さん。さようなら...`, 'またどこかでお会いしましょう！', true)
        .addField('バグ報告などはこちらへ', 'https://discord.gg/DbTpjXV')
        .addField('このユーザーはボットではありません。', `ID：${member.user.tag}`)
        .setFooter('DEVELOPED BY DJS-JPN', 'https://avatars3.githubusercontent.com/u/35397294?s=200&v=4')
        .setThumbnail(member.user.avatarURL)
        .setColor('#0x00FF00')
      client.channels.get(Config.WelcomeChannel).send(Embed)
    } else {
      const Embed = new DiscordJS.RichEmbed()
        .addField('ボットがサーバーから退出しました。', `退出したボット：${member.user.tag}`, true)
        .addField(`このボットを使用して${client.user.tag}に問題が発生した場合はこちらへ`, 'https://discord.gg/DbTpjXV')
        .addField('このボットの信頼性', checkbotsafety(member), true)
        .addField('このユーザーはボットです。', `ID：${member.id}`)
        .setFooter('DEVELOPED BY DJS-JPN', 'https://avatars3.githubusercontent.com/u/35397294?s=200&v=4')
        .setThumbnail(member.user.avatarURL)
        .setColor('#0x00FF00')
      client.channels.get(Config.WelcomeChannel).send(Embed)
    }
  })

function sendEmbed (context, message) {
  const Embed = new DiscordJS.RichEmbed()
    .setTitle(message)
    .setColor('#0x00FF00')
    .setFooter('DEVELOPED BY DJS-JPN', 'https://avatars3.githubusercontent.com/u/35397294?s=200&v=4')
  context.channel.send(Embed)
}

function checkbotsafety (member) {
  if ([
    '235088799074484224', // Rythm
    '155149108183695360', // Dyno
    '222853335877812224', // Server Hound
    '294882584201003009', // Giveaway bot
    '245675252821000193', // Gaius Cicereius
    '367317166573355008', // うううさんのRPGⅡ
    '346650373613682688', // ボットちゃん
    '378929559862640650', // sou-trade
    '404873188947001355', // C-Coin
    '406292122963017749', // C-Casino
    '394876010438328321', // Greeting Bot
    '83010416610906112',  // Night Bot
    '153613756348366849', // Typical Bot
    '265218275451863041', // GuideBot
    '241694957490929664', // MDN Duh
    '172002275412279296', // Tatsumaki
    '376433393262526476', // DSL Bot
    '324829950639341568', // Discordちゃんねる
    '302050872383242240', // Disboard
    '240545475118235648', // BugBot
  ].includes(member.id)) return '認証済み'
  else if ([
    '410775769980338177', // Coded Beta
    '407775279642050560', // Coded
    '411900942577827840', // Blade
    '399018614382133248', // Red Music
    '388258872395300865', // Red Return
  ].includes(member.id)) return '信頼'
  else return '不明'
}

client.login(Config.Token)

process.on('uncaughtException', error => console.log(error))
process.on('unhandledRejection', error => console.log(error))
