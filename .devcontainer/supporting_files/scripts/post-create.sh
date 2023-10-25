#!/bin/bash
# NOTE: This file will be executed as remoteUser (devcontainer.json)
echo "=> Script: post-create.sh Executed by: $(whoami)"

sudo npm install --silent --progress=false --global gulp-cli commitizen@latest cz-conventional-changelog@latest semantic-release-cli@latest

# shellcheck source=/dev/null
source ~/.zshrc

# install node deps
npm ci
