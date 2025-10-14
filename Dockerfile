# ==========================================
# 🧱 Stage 1: Build frontend (Node 20 Alpine)
# ==========================================
FROM node:20-alpine AS build

WORKDIR /app

# Cài đặt các thư viện cần thiết (và cache npm)
COPY package*.json ./

# Dùng cache npm để build nhanh hơn ở lần sau
RUN npm ci --legacy-peer-deps

# Tăng bộ nhớ node khi build (fix lỗi heap out of memory)
ENV NODE_OPTIONS="--max-old-space-size=2048"

# Copy toàn bộ source vào container
COPY . .

# Build Vite app ở chế độ production
RUN npm run build


# ==========================================
# 🌐 Stage 2: Serve build bằng Nginx
# ==========================================
FROM nginx:alpine

# Copy build output từ stage 1
COPY --from=build /app/dist /usr/share/nginx/html

# Xóa file default và copy config mới (nếu bạn có)
# COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
