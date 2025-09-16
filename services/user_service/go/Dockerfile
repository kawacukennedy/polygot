FROM golang:1.20-alpine AS build
WORKDIR /src
COPY . .
RUN go build -o /bin/service ./main.go
FROM alpine:3.18
COPY --from=build /bin/service /bin/service
EXPOSE 8080
CMD ["/bin/service"]