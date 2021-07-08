require('dotenv').config();

const helpers = require('./helpers.js');
const model = require('./model.js');
const FlagsView = require('./views/flagsView.js');
const Discord = require('discord.js');
const client = new Discord.Client();
const token = process.env.DISCORD_TOKEN_TEST;
const streetViewToken = process.env.GOOGLE_API_KEY;
const { prefix, quizTimeout, mTimeout } = require('./config.json');
const flagsView = require('./views/flagsView.js');
const { default: fetch } = require('node-fetch');
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
    model.reset();
    await flagRound(msg, args);
    // for (i = 0; i < 5; i++) await flagGame(msg, args, i + 1);
  }
  if (command === 'world') {
    const imageURL = await model.getStreetViewImage(streetViewToken);
    await msg.channel.send(imageURL);
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

const countryGuess = async function (msg, args) {};

const flagRound = async function (msg, args, prev = null) {
  try {
    const country = model.getRandomCountry();
    await model.loadCountryData(country);
  } catch {
    await flagRound(msg, args);
    return;
  }
  const mcList =
    args[0] === 'hard'
      ? []
      : model.getListOfRandomCountries(model.state.country.name, 3);
  const params = [prev ? prev : msg, mcList, model.state];

  if (!prev) {
    prev = await FlagsView.renderQuestionList(...params);
  } else {
    try {
      console.log(prev.author, msg.author);
      prev = await FlagsView.updateQuestionList(...params);
    } catch (err) {
      console.error('Couldnt update embed message: ', err);
    }
  }
  const filter = m =>
    m.author.id === msg.author.id &&
    ((args[0] === 'hard' && m.content != prefix + 'hint') || !isNaN(m.content));
  msg.channel
    .awaitMessages(filter, {
      max: 1,
      time: quizTimeout,
      errors: ['time'],
    })
    .then(collected =>
      handleResult(
        msg,
        collected,
        (args[0] === 'hard'
          ? collected.first().content
          : mcList[collected.first().content - 1]) === model.state.country.name
      )
    )
    .then(async () => {
      if (model.state.round < numRounds) {
        model.state.round++;
        setTimeout(async () => await flagRound(msg, args, prev), mTimeout);
      } else {
        flagsView.renderCredits(msg, model.state);
        model.state.inProgress = false;
      }
    })
    .catch(err => {
      console.error(err);
      msg.channel.send('Times up!');
      model.state.inProgress = false;
    });
};

const handleResult = function (msg, collected, isCorrect) {
  msg.channel
    .send(
      `${isCorrect ? 'Correct!' : 'Wrong answer!'} That flag belongs to ${
        model.state.country.name
      }!`
    )
    .then(m => setTimeout(() => m.delete(), mTimeout));
  collected.first().react(isCorrect ? '✅' : '❌');
  model.state.score = model.state.score + isCorrect ? 1 : 0;
  setTimeout(() => collected.first().delete(), mTimeout);
  model.addToRecord(model.state.country, isCorrect);
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
