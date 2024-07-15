# Use Node.js 18.x.x Alpine base image
FROM node:18-alpine

# Set working directory inside the container
WORKDIR /employeesystemsfromend

# Add node_modules binaries to PATH
ENV PATH="/employeesystemsfromend/node_modules/.bin:$PATH"

# Copy package.json and package-lock.json to work directory
COPY package.json ./
COPY package-lock.json ./

# Install dependencies
RUN npm install

# Copy environment variables
COPY .env ./

# Copy the rest of the application code
COPY . .

# Build the React app
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Command to run the application
CMD ["npm", "run", "start"]
