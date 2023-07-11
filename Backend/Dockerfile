# Use the official Node.js 14 image as the base image
FROM node:14

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json file to the working directory
COPY package.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application files to the working directory
COPY . .

# Copy the .env file to the working directory
COPY .env ./

# Copy the service_account_key folder to the working directory
COPY service_account_key/ ./service_account_key/

# Expose the port your app listens on
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=production

# Start the app
ENTRYPOINT [ "node", "app.js" ]
