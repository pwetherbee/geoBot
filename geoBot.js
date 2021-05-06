require("dotenv").config();

const Discord = require("discord.js");
const client = new Discord.Client();
const { prefix } = require("./config.json");
const token = process.env.DISCORD_TOKEN;

const check = (msg, cmd) => msg.content === `${cmd}`;

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", (msg) => {
  //Verify prefix
  if (!msg.content.startsWith(prefix) || msg.author.bot) return;
  const args = msg.content.slice(prefix.length).trim().split("");

  if (check(msg, "ping")) {
    msg.channel.send("pong");
  }
  if (check(msg, "flags")) {
    //execute flag game
    msg.channel.send("Flag game started, ");
  }
});

// client.on("flags");

client.login(token);
