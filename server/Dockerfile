FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN cp -r static static-default
EXPOSE 5000
CMD ["node", "server.js"]
