const Discord = require('discord.io');
const RandomOrg = require('random-org');
const auth = require('./auth.json');

// Initialize Discord Bot
const bot = new Discord.Client({
  token: auth.token,
  autorun: true,
});

const random = new RandomOrg({
  apiKey: auth.random,
});

const successCount = (dicesValues, targertNunber) => dicesValues.reduce((success, dice) => {
  let result = success;
  if (dice === 10) result += 2;
  else {
    result = dice >= targertNunber ? result += 1 : success;
  }
  console.log(result);
  return result;
}, 0);
const getBotResponse = (dicesValues, targertNunber) => {
  if (targertNunber) {
    const numberOfSuccess = successCount(dicesValues, targertNunber);
    return `${dicesValues} = ${numberOfSuccess} sucessos`;
  }
  const totalValue = dicesValues.reduce((accum, curr) => accum + curr);
  return `${dicesValues} = ${totalValue}`;
};

const botResponse = (message, channelID, user) => {
  bot.sendMessage({
    to: channelID,
    message: `@${user}: ${message}`,
  });
};

const getDicesValues = async (dicesAmount, diceType) => {
  let result;
  try {
    result = await random.generateIntegers({
      min: 1,
      max: diceType,
      n: dicesAmount,
    });
    return result.random.data;
  } catch (error) {
    console.error(error);
  }
  return result;
};

bot.on('message', async (user, userID, channelID, message, event) => {
  if (message.substring(0, 1) === '#') {
    const diceType = message.match(/(?<=d)\d*/)[0];
    const dyceAmount = message.match(/\d*(?=d)/)[0];
    const targertNunberMatch = message.match(/(?<=x)\d*/);
    const dicesValues = await getDicesValues(dyceAmount, diceType);
    if (targertNunberMatch) {
      botResponse(getBotResponse(dicesValues, targertNunberMatch[0]), channelID, user);
    } else {
      botResponse(getBotResponse(dicesValues), channelID, user);
    }
  }
});

bot.on('ready', () => {
  console.log('AEE');
  console.info('Connected');
  console.info('Logged in as: ');
  console.info(`${bot.username} - (${bot.id})`);
});
