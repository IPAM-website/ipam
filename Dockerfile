FROM node:22.9.0-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
COPY errors .
RUN npm run build

FROM node:22.9.0-alpine
WORKDIR /app
COPY --from=builder /app .
ENV NODE_ENV=production
COPY .env .
EXPOSE 3000
CMD ["npm","run","serve"]