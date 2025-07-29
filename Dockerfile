FROM node:20.14.0-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8888

RUN npm run build
CMD ["node", "dist/main"]
