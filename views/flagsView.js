const Discord = require("discord.js");
const View = require("./View.js");
class FlagsView extends View {
  renderQuestionList = function (ctx, countryList, imgUrl, round = 1) {
    const embed = new Discord.MessageEmbed()
      .setTitle(`Guess the flag! Round ${round}/${5}`)
      .setDescription(
        `Enter the number corresponding to the country you choose`
      )
      .setImage(imgUrl)
      .addFields(
        ...countryList.map((country, i) => {
          return { name: `${i + 1}) `, value: country };
        })
      )
      .setFooter("Enter quit to quit!");
    ctx.channel.send(embed);
  };
}

module.exports = new FlagsView();
