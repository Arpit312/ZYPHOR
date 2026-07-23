FROM node:20-alpine

WORKDIR /app

# Copy backend package files from server/ directory
COPY server/package*.json ./

RUN npm install --omit=dev

# Copy backend source code from server/ directory
COPY server/ ./

EXPOSE 5000

ENV PORT=5000
ENV NODE_ENV=production

CMD ["npm", "start"]
