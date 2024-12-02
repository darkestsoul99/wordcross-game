# Use official Node.js runtime as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies and nodemon globally
RUN npm install && npm install -g nodemon

# Copy project files
COPY . .

# Expose port
EXPOSE 8080

# Start the application using nodemon
CMD ["nodemon", "server/server.js"]