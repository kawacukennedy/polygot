FROM openjdk:20-slim

# Install necessary packages
RUN apt-get update && apt-get install -y \
    openjdk-20-jdk \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user
RUN useradd -m -s /bin/bash runner

# Set working directory
WORKDIR /app

# Copy execution script
COPY execute_java.sh /app/

# Change ownership
RUN chown -R runner:runner /app

# Switch to non-root user
USER runner

# Default command
CMD ["/bin/bash", "/app/execute_java.sh"]