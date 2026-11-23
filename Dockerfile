FROM node:20-alpine

WORKDIR /app

# Copy backend package files
COPY mobile-fixed/backend/package*.json ./

RUN npm install --omit=dev

# Copy backend source code
COPY mobile-fixed/backend/ ./

EXPOSE 5000

ENV PORT=5000
ENV NODE_ENV=production

CMD ["npm", "start"]
