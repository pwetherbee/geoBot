const Discord = require('discord.js');
const View = require('./View.js');
class FlagsView extends View {
  renderQuestionList = async function (ctx, countryList, info) {
    const embed = this.generateEmbed(countryList, info);
    return await ctx.channel.send(embed);
  };
  updateQuestionList = async function (ctx, countryList, info) {
    const embed = this.generateEmbed(countryList, info);
    return await ctx.edit(embed);
  };
  renderCredits = function (ctx, info) {
    try {
      const embed = this.generateCreditsEmbed(info);
      ctx.channel.send(embed);
    } catch (err) {
      console.error('Embed render failed', err);
    }
  };
  generateEmbed = function (countryList, info) {
    return new Discord.MessageEmbed()
      .setTitle(`Guess the flag!`)
      .addField('Round', `${info.round}/${5}`, true)
      .addField('Score', `${info.score}`, true)
      .setDescription(
        `Enter the number corresponding to the country you choose. \n1 minute per round!`
      )
      .setImage(info.country.flag)
      .addFields(
        ...countryList.map((country, i) => {
          return { name: `${i + 1}) `, value: country };
        })
      )
      .setFooter("Stuck? Enter 'geo hint' for a hint!");
  };
  generateCreditsEmbed = function (info) {
    let embed = new Discord.MessageEmbed()
      .setTitle('Thanks for playing!')
      .addField(`Your score`, `${info.score} / 5`, ' ')
      .addFields(
        ...info.record.map((rec, i) => {
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
