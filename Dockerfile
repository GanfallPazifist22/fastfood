FROM node:18-alpine
WORKDIR /usr/src/app

# Copy package.json and lockfile
COPY package*.json ./

# Install only production deps
RUN npm ci --omit=dev

# Copy all source files (server.js, db.js, models, etc.)
COPY . .

EXPOSE 3000
CMD ["npm", "start"]
