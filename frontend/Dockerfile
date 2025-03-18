# Use Node.js to build frontend assets
FROM node:18 AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the React app
RUN npm run build

# Use Nginx to serve the frontend
FROM nginx:alpine

# Copy built frontend files to Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 for web access
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
