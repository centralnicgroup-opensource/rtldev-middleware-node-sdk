FROM node:latest as nodejs
FROM mcr.microsoft.com/devcontainers/base:ubuntu

ENV DEBIAN_FRONTEND noninteractive
ENV TZ=Europe/Berlin
ENV APT_KEY_DONT_WARN_ON_DANGEROUS_USAGE=DontWarn

ENV REFRESHED_AT 2024-01-17
ENV CONFIGURATION_DIR_PATH supporting_files/configuration
ENV SCRIPTS_DIR_PATH supporting_files/scripts

# Install packages
# Suppress an apt-key warning about standard out not being a terminal. Use in this script is safe.
RUN apt-get update \
    && apt-get -y upgrade \
    && apt-get -y install software-properties-common cron
RUN apt-key adv --keyserver keyserver.ubuntu.com --recv 4F4EA0AAE5267A6C
# install apt deps (first row for puppeteer)
RUN apt-get -y install libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2 postfix python3-setuptools wget jq sudo git
# Cleanup
RUN apt-get -y autoremove && \
    apt-get -y clean

# Add image configuration and scripts
ADD ${SCRIPTS_DIR_PATH}/post-create.sh /post-create.sh

# Time Zone
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

######################### DEVELOPMENT ENVIRONMENT ADDITIONS ###############################
# install latest git & zsh
RUN add-apt-repository ppa:git-core/ppa \
    && apt-get update \
    && apt-get -y install --no-install-recommends git \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && update-locale

# specifics to user vscode
ARG USERNAME="vscode"
ARG USERHOME="/home/${USERNAME}"
RUN usermod --shell /usr/bin/zsh ${USERNAME} \
    && usermod -a -G www-data ${USERNAME} \
    && usermod -a -G staff ${USERNAME}

# Nodejs Installation
COPY --from=nodejs /usr/local/include/node /usr/local/include/node
COPY --from=nodejs /usr/local/lib/node_modules /usr/local/lib/node_modules
COPY --from=nodejs /usr/local/bin /usr/local/bin


# Clone the powerlevel10k theme for zsh and change owner
RUN git clone --depth=1 https://github.com/romkatv/powerlevel10k.git $ZSH_CUSTOM/themes/powerlevel10k \
    && chown -R ${USERNAME}:${USERNAME} $ZSH_CUSTOM/themes/powerlevel10k

# Clone the zsh-autosuggestions repository and change owner
RUN git clone https://github.com/zsh-users/zsh-autosuggestions $ZSH_CUSTOM/plugins/zsh-autosuggestions \
    && chown -R ${USERNAME}:${USERNAME} $ZSH_CUSTOM/plugins/zsh-autosuggestions

# copy zsh and committizen configuration file
COPY --chown=${USERNAME}:${USERNAME} ${CONFIGURATION_DIR_PATH}/.zshrc ${USERHOME}/.zshrc
COPY --chown=${USERNAME}:${USERNAME} ${CONFIGURATION_DIR_PATH}/.czrc ${USERHOME}/.czrc
# zsh theme powerline10k
COPY --chown=${USERNAME}:${USERNAME} ${CONFIGURATION_DIR_PATH}/.p10k.zsh ${USERHOME}/.p10k.zsh
COPY --chown=${USERNAME}:${USERNAME} ${CONFIGURATION_DIR_PATH}/p10k-instant-prompt-vscode.zsh ${USERHOME}/.cache/p10k-instant-prompt-vscode.zsh