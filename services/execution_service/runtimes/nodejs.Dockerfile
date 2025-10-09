FROM node:20-slim

# Install necessary packages
RUN apt-get update && apt-get install -y \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user
RUN useradd -m -s /bin/bash runner

# Set working directory
WORKDIR /app

# Copy execution script
COPY execute.js /app/

# Change ownership
RUN chown -R runner:runner /app

# Switch to non-root user
USER runner

# Default command
CMD ["node", "/app/execute.js"]