FROM rust:1.71 as builder
WORKDIR /usr/src/app
COPY . .
RUN cargo build --release

FROM gcr.io/distroless/cc
COPY --from=builder /usr/src/app/target/release/worker_service /usr/local/bin/worker_service
CMD ["/usr/local/bin/worker_service"]
