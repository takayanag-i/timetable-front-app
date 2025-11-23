# Simple Node.js container with npx support
FROM node:24-bullseye-slim

# Set working directory
WORKDIR /app

# Install zsh and oh-my-zsh
RUN apt update && apt install -y zsh git curl && \
    sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended

# Set zsh as default shell
ENV SHELL=/bin/zsh

# Expose port 3000 for development
EXPOSE 3000

# Default command - use zsh instead of sh
CMD ["zsh"]