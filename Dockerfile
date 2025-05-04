# Use the official lightweight Node.js 18 image.
# https://hub.docker.com/_/node
FROM node:18-slim

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure both package.json AND package-lock.json are copied.
# Copying this first prevents re-running npm install on every code change.
COPY package*.json ./

# Install production dependencies.
# If you need to run development dependencies, change production to development.
RUN npm install --only=production

# Copy local code to the container image.
COPY . .

# Build TypeScript code (if applicable)
# RUN npm run build # Uncomment if you have a build script in package.json

# Run the web service on container startup.
CMD [ "node", "server.js" ] # Or your built JS file e.g., dist/server.js