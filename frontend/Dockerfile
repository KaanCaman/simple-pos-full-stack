# --- Build Stage (Derleme Aşaması) ---
# Use Node.js 18 based on Alpine Linux for a lightweight build environment.
# Hafif bir derleme ortamı için Alpine Linux tabanlı Node.js 18 kullan.
FROM node:18-alpine AS builder

# Set the working directory.
# Çalışma dizinini ayarla.
WORKDIR /app

# Copy package.json and package-lock.json first.
# Önce package.json ve package-lock.json dosyalarını kopyala.
COPY package.json package-lock.json ./

# Install dependencies using clean install (ci).
# Temiz kurulum (ci) kullanarak bağımlılıkları yükle.
# --legacy-peer-deps: Bypass potential peer dependency conflicts.
# --legacy-peer-deps: Olası eş bağımlılık (peer dependency) çakışmalarını atla.
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# Copy the rest of the application source code.
# Uygulama kaynak kodunun geri kalanını kopyala.
COPY . .

# Build the React application for production.
# React uygulamasını canlı ortam (production) için derle.
RUN npm run build

# --- Final Stage (Nihai Çalıştırma Aşaması) ---
# Use Nginx on Alpine Linux to serve the static files.
# Statik dosyaları sunmak için Alpine Linux üzerinde Nginx kullan.
FROM nginx:alpine

# Copy our custom Nginx configuration to the container.
# Özel Nginx yapılandırmamızı konteyner içine kopyala.
# This config handles SPA routing and Proxying.
# Bu yapılandırma SPA yönlendirmesini ve Proxy işlemini yönetir.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built artifacts (dist folder) from the builder stage to Nginx's html folder.
# Builder aşamasından derlenen çıktıları (dist klasörü) Nginx'in html klasörüne kopyala.
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80.
# 80 portunu dışa aç.
EXPOSE 80

# Start Nginx in the foreground (daemon off).
# Nginx'i ön planda başlat (daemon off).
CMD ["nginx", "-g", "daemon off;"]
