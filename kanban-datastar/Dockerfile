# Build stage
FROM golang:1.25-alpine AS builder

WORKDIR /build

# Install build dependencies including gcc for CGO (SQLite), npm, and task
RUN apk add --no-cache git ca-certificates tzdata gcc musl-dev npm

# Copy package files for npm dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Install sqlc-gen-zombiezen
RUN go install github.com/delaneyj/toolbelt/sqlc-gen-zombiezen@latest


# Copy source
COPY . .

# Run task build to generate all files and build binary
RUN go tool task build

# UPX compression stage
FROM alpine:latest AS compressor

WORKDIR /compress

# Install UPX
RUN apk add --no-cache upx

# Copy binary from builder
COPY --from=builder /build/bin/kanban-datastar .

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
