FROM node:18-alpine

WORKDIR /app

# Install dependencies before copying source
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Expose port and start
EXPOSE 5000
CMD ["node", "server.js"]
