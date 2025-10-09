#!/bin/bash

# Build Docker images for all language runtimes

echo "Building Python runner..."
docker build -f python.Dockerfile -t polyglot-python-runner .

echo "Building Node.js runner..."
docker build -f nodejs.Dockerfile -t polyglot-nodejs-runner .

echo "Building Java runner..."
docker build -f java.Dockerfile -t polyglot-java-runner .

echo "Building C++ runner..."
docker build -f cpp.Dockerfile -t polyglot-cpp-runner .

echo "Building Go runner..."
docker build -f go.Dockerfile -t polyglot-go-runner .

echo "Building Rust runner..."
docker build -f rust.Dockerfile -t polyglot-rust-runner .

echo "Building Ruby runner..."
docker build -f ruby.Dockerfile -t polyglot-ruby-runner .

echo "Building PHP runner..."
docker build -f php.Dockerfile -t polyglot-php-runner .

echo "All images built successfully!"