FROM rust:1.71 as builder
WORKDIR /usr/src/app
COPY . .
RUN cargo build --release
FROM gcr.io/distroless/cc
COPY --from=builder /usr/src/app/target/release/my_service /usr/local/bin/my_service
EXPOSE 8080
CMD ["/usr/local/bin/my_service"]