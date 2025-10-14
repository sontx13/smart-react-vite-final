# Stage 1: Build React App
FROM node:20-alpine as build
WORKDIR /app
COPY . .

# Tăng giới hạn bộ nhớ NodeJS lên 4GB (fix lỗi heap out of memory)
ENV NODE_OPTIONS="--max-old-space-size=4096"

RUN npm install && npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
