# Stage 1: Build
FROM node:20-alpine as build-stage

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Run
FROM node:20-alpine

WORKDIR /app

COPY --from=build-stage /app/package*.json ./
COPY --from=build-stage /app/dist ./dist

# Install only production dependencies
RUN npm install --omit=dev

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
