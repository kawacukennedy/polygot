FROM ruby:3.4-slim

# Install necessary packages
RUN apt-get update && apt-get install -y \
    ruby \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user
RUN useradd -m -s /bin/bash runner

# Set working directory
WORKDIR /app

# Copy execution script
COPY execute.rb /app/

# Change ownership
RUN chown -R runner:runner /app

# Switch to non-root user
USER runner

# Default command
CMD ["ruby", "/app/execute.rb"]