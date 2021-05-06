require('dotenv').config();

const helpers = require('./helpers.js');
const model = require('./model.js');
const FlagsView = require('./views/flagsView.js');
const Discord = require('discord.js');
const client = new Discord.Client();
const token = process.env.DISCORD_TOKEN;
const { prefix, quizTimeout, mTimeout } = require('./config.json');
const flagsView = require('./views/flagsView.js');
let numRounds = 5;

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async msg => {
  if (!msg.content.startsWith(prefix) || msg.author.bot) return;
  const args = msg.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();
  if (command === 'flags') {
    //reset score
    model.state.score = 0;
    model.state.inProgress = true;
    model.state.record = [];
    await flagRound(msg, args, 1);
    // for (i = 0; i < 5; i++) await flagGame(msg, args, i + 1);
  }

  if (command === 'hint') {
    if (!model.state.inProgress) {
      await msg.channel.send(
        "You can only ask for hints when there's a game in progress!"
      );
      return;
    }
    const message = getHint();
    const m = await msg.reply(message);
    setTimeout(() => {
      msg.delete();
      m.delete();
    }, 5000);
  }

  if (msg.content === 'ping') {
    msg.reply('pong');
  }
});

// const flagGame = async function (msg, args) {};

const flagRound = async function (
  msg,
  args,
  round = 1,
  score = 0,
  prev = null
) {
  try {
    const country = model.getRandomCountry();
    await model.loadCountryData(country);
  } catch {
    await flagRound(msg, args, round);
    return;
  }

  let mcList = [model.state.country.name];
  for (i = 0; i < 3; i++) {
    mcList.push(model.getRandomCountry(false));
  }
  mcList = helpers.shuffleArray(mcList);
  if (!prev) {
    prev = await FlagsView.renderQuestionList(
      msg,
      mcList,
      model.state.country.flag,
      round,
      score
    );
  } else {
    try {
      prev = await FlagsView.updateQuestionList(
        prev,
        mcList,
        model.state.country.flag,
        round,
        score
      );
    } catch {
      console.error('Couldnt update embed message');
    }
  }
  const filter = m => m.author.id === msg.author.id && !isNaN(m.content);
  msg.channel
    .awaitMessages(filter, {
      max: 1,
      time: quizTimeout,
      errors: ['time'],
    })
    .then(collected => {
      if (mcList[collected.first().content - 1] === model.state.country.name) {
        msg.channel
          .send(`Correct! That is the flag of ${model.state.country.name}!`)
          .then(m => setTimeout(() => m.delete(), mTimeout));
        collected.first().react('✅');
        score++;
        setTimeout(() => collected.first().delete(), mTimeout);
        model.addToRecord(model.state.country, true);
        return;
      }
      msg.channel
        .send(`Wrong answer! That flag belongs to ${model.state.country.name}`)
        .then(m => setTimeout(() => m.delete(), mTimeout));
      collected.first().react('❌');
      model.addToRecord(model.state.country, false);
      setTimeout(() => collected.first().delete(), mTimeout);
    })
    .then(async () => {
      if (round < numRounds) {
        setTimeout(
          async () => await flagRound(msg, args, round + 1, score, prev),
          mTimeout
        );
      } else {
        flagsView.renderCredits(msg, model.state.record, score);
        model.state.inProgress = false;
      }
    })
    .catch(() => {
      msg.channel.send('Times up!');
      model.state.inProgress = false;
    });
};

const getHint = function () {
  const country = model.state.country;
  console.log(country.currency);
  const hints = [
    `the currency of the country is the ${country.currency}`,
    `the language of the country is ${country.language}`,
    `the region of the country is ${country.region}`,
  ];
  return hints[Math.floor(Math.random() * hints.length)];
};

client.login(token);
