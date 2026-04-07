FROM node:20-alpine

WORKDIR /app

# package.json copy qilib, devDependencies ham o'rnatiladi (nest CLI uchun kerak)
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

# nest start --watch — real-time o'zgarishlar uchun
CMD ["npm", "run", "start:dev"]
