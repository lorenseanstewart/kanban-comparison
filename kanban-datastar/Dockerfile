# Build stage
FROM golang:1.25-alpine AS builder

WORKDIR /build

# Install build dependencies including gcc for CGO (SQLite)
RUN apk add --no-cache git ca-certificates tzdata gcc musl-dev

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source
COPY . .

# Build binary with optimizations
RUN CGO_ENABLED=1 GOOS=linux GOARCH=amd64 go build \
    -ldflags="-s -w" \
    -trimpath \
    -o kanban-datastar \
    ./cmd

# UPX compression stage
FROM alpine:latest AS compressor

WORKDIR /compress

# Install UPX
RUN apk add --no-cache upx

# Copy binary from builder
COPY --from=builder /build/kanban-datastar .

# Compress with UPX (best compression)
RUN upx --best --lzma kanban-datastar

# Final stage
FROM alpine:latest

WORKDIR /app

# Install minimal runtime (musl for CGO SQLite)
RUN apk add --no-cache ca-certificates musl && \
    addgroup -g 1000 appuser && \
    adduser -D -u 1000 -G appuser appuser && \
    chown -R appuser:appuser /app

# Copy compressed binary
COPY --from=compressor /compress/kanban-datastar .

USER appuser

EXPOSE 7331

CMD ["./kanban-datastar"]
