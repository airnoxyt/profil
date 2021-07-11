const {Discord , MessageEmbed } = require('discord.js')
const client = new Discord.Client
const json = require('./db.json')
const db = require('quick.db')
const Levels = require("discord-xp");
Levels.setURL(settings.mongodbconnect)
const fs = require('fs')

client.on('message' , (message) => {
/*Message System*/
 if(!json["users"][message.author.id]){
        json["users"][message.author.id] = {
            name: message.author.username,
            msg: 0,
        }
    }
    fs.writeFile("db.json", JSON.stringify(json, null , 4), (err) => {
        if(err) console.log(err)})
   if(message.channel.type === "DM") return;
   json["users"][message.author.id].msg = json["users"][message.author.id].msg + 1
   
 /*Level System*/
           const randomXP = Math.floor(Math.random()* 25) + 10;;
         const hasLevelUp = await Levels.appendXp(message.author.id, message.guild.id, randomXP)
         if(hasLevelUp){
             const users = await Levels.fetch(message.author.id, message.guild.id)
             const levelUp = new MessageEmbed()
             .setTitle(`Bravo ${message.author.username}`)
             .setDescription(`${message.member}, tu est passé au niveau ${users.level} ! Bonne chance pour avoir le niveaux ${users.level +1}`)
             message.channel.send(levelUp)
         }
if(message.content.startsWith('-addxp')){
   message.delete()
  const member = message.mentions.members.first()
  const number = parseInt(args[1]);
  if(!member) return message.reply('merci de mettre un membre !') 
  if(!number || isNaN(number)) {
      message.reply('Merci de mettre un nombre')
      return;
  }
  if(number){
    console.log(number)
      if(number > 100000000000) message.reply('Le nombre est trop grand...')
  }
  if(number < 100000000000){ 
    
    await Levels.appendXp(member.id, message.guild.id, number)
    const target = await Levels.fetch(member.user.id, message.guild.id)
      const add = new Discord.MessageEmbed()
      .setTitle('XP ajouté')
      .setDescription(`${member} à obtenue ${number}xp en plus ! Il a ${target.xp}xp`)
      .setTimestamp()
      message.channel.send(add)
  }
  }
  if(message.content.startWith('-removexp')){
    message.delete()
  const member = message.mentions.members.first()
  const number = parseInt(args[1]);
 
  if(!member) return message.reply('merci de mettre un membre !') 
   const target = await Levels.fetch(member.user.id, message.guild.id)
  if(!number || isNaN(number)) {
      message.reply('Merci de mettre un nombre')
      return;
  }
  if(number){
      if(number > target.xp) message.reply('Le nombre est trop grand par rapport au nombre d\'xp que la personne possède')
  }
  if(number < target.xp){ 
    await Levels.appendXp(member.id, message.guild.id, number*-1)
      const add = new Discord.MessageEmbed()
      .setTitle('XP supprimé')
      .setDescription(`${member} à moins ${number}xp ! Il a ${target.xp + number*-1}xp`)
      .setTimestamp()
      message.channel.send(add)
  }}
  if(message.content.startWith('-leaderboard')){
      message.delete()
    const rawLearboard = await Levels.fetchLeaderboard(message.guild.id , 5)
    if(rawLearboard.length < 1) message.reply('Personne est dans le classement')
    const leaderboard  = await Levels.computeLeaderboard(client, rawLearboard, true)
    const lb = leaderboard.map(e => `${e.position}. ${e.username}#${e.discriminator}\nLevel: ${e.level}\nXp : ${e.xp}`)
    const embed = new Discord.MessageEmbed()
    .setTitle('Top 5 des utilisateur')
    .setDescription(lb.join("\n\n"))
    .setTimestamp()
    message.channel.send(embed)
  }
  if(message.content.startWith('-rank')){
      message.delete()
  const target = message.mentions.members.first() || message.author
  const user = await Levels.fetch(target.id, message.guild.id)
  if(!target) return message.channel.send(`Cette personne n'a pas de levels sur ce serveur :( `)
  const embed = new Discord.MessageEmbed()
  .setTitle('Rank de :' + `${member.user.tag}`)
  .setDescription(`${member.user.tag} est au niveaux ${target.level} et à ${target.xp}xp/${Levels.xpFor(target.level +1)}xp`)
  .setTimestamp()
  message.channel.send(embed)
  }

 /*Economy system*/
 //J'ai que la commande pour voir son budget 
 const economy =  new db.table("Economy")
 if(mesage.content.startWith('-money')){
   message.delete()
  const user = message.mentions.users.first() || message.author
  let argent = economy.fetch(`money_${message.guild.id}_${user.id}`)
  if(argent === null){argent = 0}
 return message.channel.send(`Vous avez ${argent} ApoCoins`)}
 /*Profil*/
 if(message.content.startWith('-profil')){
     const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
    const target = await Levels.fetch(member.id, message.guild.id)
    let argent = economy.fetch(`money_${message.guild.id}_${member.id}`)
    if(argent === null){argent = 0}
    const us = new MessageEmbed()
    .setThumbnail(member.user.displayAvatarURL({dynamic : true}))
    .setColor('#cd57ff')
    .setTitle('Profil de ' + member.user.username)
    .setDescription(`<a:793882152785805373:846140506164690946> **__Général__ :
    > Surnom sur le serveur : ${member.nickname !== null ? `${member.nickname}` : "Aucun"}
    > A rejoint le serveur : ${ms(member.joinedAt).format('DD/MM/YYYY HH:mm:ss')}
    > Joue à : ${member.presence.game ? member.presence.game.name : "Rien"}
    > Rôles:** \n ${member.roles.cache.map(roles => `${roles}`).join(" ")}
    <a:793882152785805373:846140506164690946>  **__Stats__ :
    > Niveaux : ${target.level}
    > Experience : ${target.xp}
    > Message Envoyé : ${db["users"][member.id].msg}
    > ApoCoin : ${argent}
    **
    
    `)
    .setImage("https://cdn.discordapp.com/attachments/837280407535353877/863715319650058240/standard_2.gif")
   

    message.channel.send(us)

    }})
