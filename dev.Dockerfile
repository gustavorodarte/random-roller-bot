FROM zrpaplicacoes/docker-in-node:lts-alpine


COPY ./bot.js ./bot.js
COPY ./package.json ./package.json

# Configure container network
EXPOSE 3000
