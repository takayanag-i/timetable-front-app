FROM node:24-bullseye-slim

# Install zsh and oh-my-zsh
RUN apt update && apt install -y zsh git curl && \
    sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended

# Set zsh as default shell
ENV SHELL=/bin/zsh