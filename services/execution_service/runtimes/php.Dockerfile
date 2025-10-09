FROM php:8.2-cli

# Install necessary packages
RUN apt-get update && apt-get install -y \
    php8.2-cli \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user
RUN useradd -m -s /bin/bash runner

# Set working directory
WORKDIR /app

# Copy execution script
COPY execute.php /app/

# Change ownership
RUN chown -R runner:runner /app

# Switch to non-root user
USER runner

# Default command
CMD ["php", "/app/execute.php"]