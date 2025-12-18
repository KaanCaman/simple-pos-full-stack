# Build Stage
# Derleme Aşaması
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
# Paket dosyalarını kopyala
COPY package.json package-lock.json ./

# Install dependencies
# Bağımlılıkları yükle
# Using --legacy-peer-deps to avoid the eslint conflict we saw earlier
# Daha önce gördüğümüz eslint çakışmasını önlemek için --legacy-peer-deps kullanıyoruz
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# Copy source code
# Kaynak kodunu kopyala
COPY . .

# Build the application
# Uygulamayı derle
RUN npm run build

# Final Stage
# Nihai Aşama
FROM nginx:alpine

# Copy custom nginx config
# Özel nginx yapılandırmasını kopyala
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts to Nginx html directory
# Derleme çıktılarını Nginx html dizinine kopyala
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
# 80 portunu dışa aç
EXPOSE 80

# Start Nginx
# Nginx'i başlat
CMD ["nginx", "-g", "daemon off;"]
