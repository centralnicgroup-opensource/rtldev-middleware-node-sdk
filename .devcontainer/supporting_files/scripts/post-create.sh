#!/bin/bash
# NOTE: This file will be executed as remoteUser (devcontainer.json)
echo "=> Script: post-create.sh Executed by: $(whoami)"

# shellcheck source=/dev/null
source ~/.zshrc

# install pnpm and global packages
sudo npm i -g pnpm@latest
sudo npm add -g commitizen@latest cz-conventional-changelog@latest semantic-release-cli@latest

# install node deps
pnpm i --frozen-lockfile
