FROM node:16

WORKDIR /app

COPY package*.json ./

RUN npm install
RUN npm install interactjs

COPY . .

EXPOSE 80

CMD ["npm", "start"]
