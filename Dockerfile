# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY . .
RUN npm install && npm run build

# Stage 2: Serve bằng Nginx
FROM nginx:1.23
COPY --from=build /app/dist /usr/share/nginx/html