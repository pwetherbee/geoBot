const db = require("dotenv").config();

const Discord = require("discord.js");
const client = new Discord.Client();

db.connect({
  token: process.env.DISCORD_TOKEN,
});

client.on("ready", () => {
  console.log("Logged in as ${client.user.tag}!");
});

client.on("message", (msg) => {
  if (msg.content === "ping") {
    msg.reply("pong");
  }
});

client.login("ODM5NDEzMzAzMzc3MDAyNDk2.YJJSjw.zQna5I6_a8APE5OjEnuFHCOdlxc");
