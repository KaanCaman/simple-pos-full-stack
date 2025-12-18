
# Build Stage (Derleme Aşaması)
# Use the official Go 1.24 image based on Debian (includes glibc)
# Go 1.24'ün Debian tabanlı (glibc içeren) resmi imajını kullanıyoruz.
FROM golang:1.24 AS builder

WORKDIR /app

# Copy go mod and source files
# go mod ve kaynak dosyaları kopyala
COPY go.mod ./
COPY . .

# Build the application
# Uygulamayı Derle
# CGO_ENABLED=1 (for SQLite) and target the correct entry point
# CGO_ENABLED=1 (SQLite için) ve doğru giriş noktasını hedefliyoruz: ./cmd/api/main.go
RUN go mod tidy && \
    CGO_ENABLED=1 GOOS=linux go build -ldflags="-w -s" -o main ./cmd/api/main.go


# Final Stage (Nihai Çalıştırma Aşaması)
# Use Debian 12 (Bookworm) slim which has newer GLIBC
# Daha yeni bir GLIBC sürümüne sahip olan Debian 12 (Bookworm) minimal sürümünü kullanıyoruz.
FROM debian:bookworm-slim

WORKDIR /app

# Install necessary system libraries (SQLite and CA certificates)
# Gerekli sistem kütüphanelerini (SQLite ve sertifikalar) yüklüyoruz
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    libsqlite3-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy binary from builder
# Builder aşamasından binary dosyasını kopyala
COPY --from=builder /app/main .

# Expose port
# Portu dışa aç
EXPOSE 3000

# Run the binary
# Binary dosyasını çalıştır
CMD ["./main"]
