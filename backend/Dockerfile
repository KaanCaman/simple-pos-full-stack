# --- Build Stage (Derleme Aşaması) ---
# Use the official Golang 1.24 image based on Debian Bookworm.
# Debian Bookworm tabanlı resmi Golang 1.24 imajını kullan.
FROM golang:1.24 AS builder

# Set the working directory inside the container.
# Konteyner içindeki çalışma dizinini ayarla.
WORKDIR /app

# Copy the Go module files first to cache dependencies.
# Bağımlılıkları önbelleğe almak için önce Go modül dosyalarını kopyala.
COPY go.mod ./
# Copy the source code into the container.
# Kaynak kodunu konteyner içine kopyala.
COPY . .

# Download dependencies and tidy up the module file.
# Bağımlılıkları indir ve modül dosyasını düzenle.
RUN go mod tidy && \
    # Enable CGO to support SQLite (requires a C compiler).
    # SQLite desteği için CGO'yu etkinleştir (C derleyicisi gerektirir).
    CGO_ENABLED=1 \
    # Set the target OS to Linux.
    # Hedef işletim sistemini Linux olarak ayarla.
    GOOS=linux \
    # Build the binary named 'main', stripping debug info (-w -s) for smaller size.
    # 'main' adında binary dosyası oluştur, boyutu küçültmek için debug bilgisini sil (-w -s).
    go build -ldflags="-w -s" -o main ./cmd/api/main.go


# --- Final Stage (Nihai Çalıştırma Aşaması) ---
# Use Debian 12 (Bookworm) Slim for a modern, small runtime environment.
# Modern ve küçük bir çalışma ortamı için Debian 12 (Bookworm) Slim kullan.
FROM debian:bookworm-slim

# Set the working directory.
# Çalışma dizinini ayarla.
WORKDIR /app

# Update package lists and install necessary runtime libraries.
# Paket listelerini güncelle ve gerekli çalışma zamanı kütüphanelerini yükle.
# ca-certificates: Required for HTTPS requests. / HTTPS istekleri için gerekli.
# libsqlite3-0: Required for SQLite database. / SQLite veritabanı için gerekli.
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    libsqlite3-0 \
    # Clean up apt cache to keep the image small.
    # İmajı küçük tutmak için apt önbelleğini temizle.
    && rm -rf /var/lib/apt/lists/*

# Copy the compiled binary from the builder stage.
# Derleyici aşamasından derlenen binary dosyasını kopyala.
COPY --from=builder /app/main .

# Expose port 3000 to the outside world.
# 3000 portunu dış dünyaya aç.
EXPOSE 3000

# Command to run the application.
# Uygulamayı çalıştırma komutu.
CMD ["./main"]
