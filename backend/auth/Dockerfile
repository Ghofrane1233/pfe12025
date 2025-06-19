FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production


COPY . .


EXPOSE 5000

# Lancer le serveur
CMD ["node", "server.js"]
