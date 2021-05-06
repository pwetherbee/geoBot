// import { strict } from "node:assert";
// import { state } from "./model.js";
// import view from "./views/View.js";
// import "view.js";

require("dotenv").config();

const helpers = require("./helpers.js");
const model = require("./model.js");
const FlagsView = require("./views/flagsView.js");
const Discord = require("discord.js");
const client = new Discord.Client();
const token = process.env.DISCORD_TOKEN;
const { prefix } = require("./config.json");

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", async (msg) => {
  if (!msg.content.startsWith(prefix) || msg.author.bot) return;
  const args = msg.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();
  if (command === "flags") {
    await flagGame(msg, args, 1);
    // for (i = 0; i < 5; i++) await flagGame(msg, args, i + 1);
  }
  if (msg.content === "ping") {
    msg.reply("");
  }
});

const flagGame = async function (msg, args, round = 1) {
  const country = model.getRandomCountry();
  await model.loadCountryData(country);
  let mcList = [model.state.country.name];
  for (i = 0; i < 3; i++) {
    mcList.push(model.getRandomCountry(false));
  }
  //   console.log(mcList);
  mcList = helpers.shuffleArray(mcList);
  FlagsView.renderQuestionList(msg, mcList, model.state.country.flag);
  const filter1 = (m) => m.author.id === msg.author.id && m.content === "hint";
  const filter2 = (m) => m.author.id === msg.author.id && !isNaN(m.content);

  msg.channel
    .awaitMessages(filter1, { max: 1, time: 30000 })
    .then((collected) => {
      if (!collected.first().content == "hint") return;
      msg.channel.send(
        `The language of the country is ${model.state.country.language}`
      );
    })
    .catch();
  msg.channel
    .awaitMessages(filter2, {
      max: 1,
      time: 30000,
      errors: ["time"],
    })
    .then((collected) => {
      if (mcList[collected.first().content - 1] === model.state.country.name) {
        msg.channel.send(
          `Correct! This is the flag of ${model.state.country.name}!`
        );
        return;
      }
      msg.channel.send(
        `Wrong answer! This flag belongs to ${model.state.country.name}`
      );
    })
    .catch(() => msg.channel.send("Times up!"));
};

client.login(token);
