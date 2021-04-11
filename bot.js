/* eslint-disable max-len */
const Discord = require('discord.io');
const RandomOrg = require('random-org');

// Initialize Discord Bot
const bot = new Discord.Client({
  token: process.env.DISCORD_TOKEN,
  autorun: true,
});

const random = new RandomOrg({
  apiKey: process.env.RANDOM_TOKEN,
});

const successCount = (dicesValues, targetNumber, isDamageRoll) => dicesValues.reduce((success, dice) => {
  let result = success;
  if (dice === 10 && !isDamageRoll) result += 2;
  else {
    result = dice >= targetNumber ? result += 1 : success;
  }
  return result;
}, 0);

const getBotResponse = (diceRoll, dicesValues, targetNumber, isDamageRoll) => {
  if (targetNumber) {
    const numberOfSuccess = successCount(dicesValues, targetNumber, isDamageRoll);
    return `\`${diceRoll}\` = ${dicesValues.join(', ')} = **${numberOfSuccess} sucessos**`;
  }
  const totalValue = dicesValues.reduce((accum, curr) => accum + curr);
  return `\`${diceRoll}\` = ${dicesValues.join(', ')} = **${totalValue}**`;
};

const botResponse = (message, channelID, user) => {
  bot.sendMessage({
    to: channelID,
    message: `**${user}** rolls ${message}`,
  });
};

const getDicesValues = async (dicesAmount, diceType) => {
  try {
    const { random: { data } } = await random.generateIntegers({
      min: 1,
      max: diceType,
      n: dicesAmount,
    });
    return data;
  } catch (error) {
    console.error(error);
  }
};

bot.on('message', async (user, userID, channelID, message) => {
  try {
    if (message.substring(0, 1) === '#') {
      const [diceType] = message.match(/(?<=d)\d*/) || [];
      const [diceAmount] = message.match(/\d*(?=d)/) || [];
      const [targetNumberMatch] = message.match(/(?<=(x|e))\d*/) || [];
      const [successCounterTypeMatch] = message.match(/[xe]/) || [];

      const dicesValues = await getDicesValues(diceAmount, diceType);
      const isDamageRoll = Boolean(successCounterTypeMatch === 'e');
      const diceRoll = `${diceAmount}d${diceType}`;

      if (targetNumberMatch) {
        botResponse(getBotResponse(diceRoll, dicesValues, targetNumberMatch, isDamageRoll), channelID, user);
      } else {
        botResponse(getBotResponse(diceRoll, dicesValues), channelID, user);
      }
    }
  } catch (error) {
    console.error(error);
  }
});

bot.on('ready', () => {
  console.info('Connected');
  console.info('Logged in as: ');
  console.info(`${bot.username} - (${bot.id})`);
});
