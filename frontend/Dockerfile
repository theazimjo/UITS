FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

# Vite dev server default port
EXPOSE 5173

# Vite-ga barcha tarmoqlardan ulanish uchun --host 0.0.0.0 kerak
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
