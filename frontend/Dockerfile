FROM node:18-alpine AS build

WORKDIR /app

# Install dependencies before copying source
COPY package*.json ./
RUN npm install

# Copy source
COPY . .
RUN npm run build

FROM nginx:alpine
# Copy the build output to replace the default nginx contents.
COPY --from=build /app/dist /usr/share/nginx/html
# Copy custom nginx config if you have one, or just expose 80
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
