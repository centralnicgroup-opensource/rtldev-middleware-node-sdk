# Development image for this repository.
#
# Deliberately thin. The apt block, timezone, zsh configuration (prompt,
# autosuggestions) and commitizen setup that used to live here are now in the
# devbase Feature, which also brings Node LTS as a dependency — so this file
# pins no language image either:
# https://github.com/centralnicgroup-opensource/rtldev-middleware-devcontainer-features

FROM mcr.microsoft.com/devcontainers/base:2-ubuntu-24.04

# No ENV DEBIAN_FRONTEND here on purpose: set at image level it persists into the
# running container, so an interactive `apt` in a shell session also loses its
# frontend. A layer that needs it sets it for itself.
ENV TERM=xterm-256color
