FROM node:lts AS nodejs
FROM mcr.microsoft.com/devcontainers/base:ubuntu

ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=Europe/Berlin

ENV CONFIGURATION_DIR_PATH=supporting_files/configuration
ENV SCRIPTS_DIR_PATH=supporting_files/scripts

# Install packages and cleanup
RUN apt-get update \
    && apt-get -y upgrade \
    && apt-get -y install wget jq sudo git cron software-properties-common \
    && apt-get -y autoremove \
    && apt-get -y clean \
    && rm -rf /var/lib/apt/lists/*

# Add image configuration and scripts
ADD ${SCRIPTS_DIR_PATH}/post-create.sh /post-create.sh
RUN chmod +x /post-create.sh

# Time Zone
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

######################### DEVELOPMENT ENVIRONMENT ADDITIONS ###############################
# specifics to user vscode
ARG USERNAME="vscode"
ARG USERHOME="/home/${USERNAME}"
RUN usermod --shell /usr/bin/zsh ${USERNAME} \
    && usermod -a -G www-data ${USERNAME} \
    && usermod -a -G staff ${USERNAME}
# Set a default value for ZSH_CUSTOM if it's not already set
ENV ZSH_CUSTOM=${USERHOME}/.oh-my-zsh/custom

# Nodejs Installation
COPY --from=nodejs /usr/local/include/node /usr/local/include/node
COPY --from=nodejs /usr/local/lib/node_modules /usr/local/lib/node_modules
COPY --from=nodejs /usr/local/bin /usr/local/bin

# Clone the powerlevel10k theme for zsh and change owner
RUN git clone --depth=1 https://github.com/romkatv/powerlevel10k.git $ZSH_CUSTOM/themes/powerlevel10k \
    && chown -R ${USERNAME}:${USERNAME} $ZSH_CUSTOM/themes/powerlevel10k

# Clone the zsh-autosuggestions repository and change owner
RUN git clone --depth=1 https://github.com/zsh-users/zsh-autosuggestions $ZSH_CUSTOM/plugins/zsh-autosuggestions \
    && chown -R ${USERNAME}:${USERNAME} $ZSH_CUSTOM/plugins/zsh-autosuggestions

# copy zsh and committizen configuration file
COPY --chown=${USERNAME}:${USERNAME} ${CONFIGURATION_DIR_PATH}/.zshrc ${USERHOME}/.zshrc
COPY --chown=${USERNAME}:${USERNAME} ${CONFIGURATION_DIR_PATH}/.czrc ${USERHOME}/.czrc
# zsh theme powerline10k
COPY --chown=${USERNAME}:${USERNAME} ${CONFIGURATION_DIR_PATH}/.p10k.zsh ${USERHOME}/.p10k.zsh
COPY --chown=${USERNAME}:${USERNAME} ${CONFIGURATION_DIR_PATH}/p10k-instant-prompt-vscode.zsh ${USERHOME}/.cache/p10k-instant-prompt-vscode.zsh