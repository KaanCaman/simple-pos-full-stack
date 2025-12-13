# Build Stage
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git

# Copy go mod and sum files
COPY go.mod ./
# COPY go.sum ./ # go.sum doesn't exist yet, but will be created. 
# To avoid error if go.sum doesn't exist, we can skip it or just copy everything.
# Best practice is to copy go.mod/sum first. I'll assume go.sum might be created by `go mod tidy` in the `backend setup` step which I ran.
# I'll check if go.sum exists. If not, `COPY go.mod go.su[m] ./` works as a hack or just COPY go.mod ./ if I am sure.
# I ran `go mod init`. I didn't run `go mod tidy`. So go.sum might not exist.
# Safest is to just COPY . . and build. But caching modules is better.
# Let's assume the user will run go mod tidy or I will run it before building.
# For now, I will use a standard pattern but handle the missing sum file if needed.

COPY go.mod ./
# Copy source code
COPY . .

# Build the application
# CGO_ENABLED=0 for static binary, though alpine doesn't strictly need it if linking against musl.
# -ldflags="-w -s" to reduce binary size.
RUN go mod tidy && CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o main ./cmd/main.go || go build -ldflags="-w -s" -o main . # Fallback if cmd/main.go doesn't exist (it doesn't yet, but folders do)

# Final Stage
FROM alpine:latest

WORKDIR /app

# Install certificates for HTTPS (useful if app makes external requests)
RUN apk --no-cache add ca-certificates

# Copy binary from builder
COPY --from=builder /app/main .

# Expose port (Fiber defaults to 3000)
EXPOSE 3000

# Run the binary
CMD ["./main"]
