
FROM node:alpine

WORKDIR /usr/app

COPY ./backend/.env.example ./
RUN mv .env.example .env

COPY backend/package*.json ./
RUN npm install

COPY ./backend .

EXPOSE 3333

CMD ["npm", "start"]
