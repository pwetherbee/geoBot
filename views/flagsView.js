const Discord = require('discord.js');
const View = require('./View.js');
class FlagsView extends View {
  renderQuestionList = async function (
    ctx,
    countryList,
    imgUrl,
    round = 1,
    score
  ) {
    const embed = this.generateEmbed(countryList, imgUrl, round, score);
    return await ctx.channel.send(embed);
  };
  updateQuestionList = async function (
    ctx,
    countryList,
    imgUrl,
    round = 1,
    score = 0
  ) {
    const embed = this.generateEmbed(countryList, imgUrl, round, score);
    return await ctx.edit(embed);
  };
  renderCredits = function (ctx, record, score) {
    try {
      const embed = this.generateCreditsEmbed(record, score);
      ctx.channel.send(embed);
    } catch (err) {
      console.error('Embed render failed', err);
    }
  };
  generateEmbed = function (countryList, imgUrl, round = 1, score = 0) {
    return new Discord.MessageEmbed()
      .setTitle(`Guess the flag!`)
      .addField('Round', `${round}/${5}`, true)
      .addField('Score', `${score}`, true)
      .setDescription(
        `Enter the number corresponding to the country you choose. \n1 minute per round!`
      )
      .setImage(imgUrl)
      .addFields(
        ...countryList.map((country, i) => {
          return { name: `${i + 1}) `, value: country };
        })
      )
      .setFooter("Stuck? Enter 'geo hint' for a hint!");
  };
  generateCreditsEmbed = function (record, score) {
    let embed = new Discord.MessageEmbed()
      .setTitle('Thanks for playing!')
      .addField(`Your score`, `${score} / 5`, ' ')
      .addFields(
        ...record.map((rec, i) => {
          const { countryName, correct, emoji } = rec;
          return {
            name: `Round ${i + 1}`,
            value: `${emoji} ${countryName}: ${correct ? '✅' : '❌'}`,
          };
        })
      );
    return embed;
  };
}

module.exports = new FlagsView();
