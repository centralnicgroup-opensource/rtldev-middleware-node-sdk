########### DOCS ###########
  # zi snippet <URL>        # Raw syntax with URL
  # zi snippet OMZ::<PATH>  # Shorthand OMZ::         (http://github.com/ohmyzsh/ohmyzsh/raw/master/)
  # zi snippet OMZL::<PATH> # Shorthand OMZ::lib      (http://github.com/ohmyzsh/ohmyzsh/raw/master/lib)
  # zi snippet OMZT::<PATH> # Shorthand OMZ::themes   (http://github.com/ohmyzsh/ohmyzsh/raw/master/themes)
  # zi snippet OMZP::<PATH> # Shorthand OMZ::plugins  (http://github.com/ohmyzsh/ohmyzsh/raw/master/plugins)
  source <(curl -sL git.io/zi-loader); zzinit
  zi snippet OMZP::git
  zi snippet OMZP::vi-mode
  zi snippet OMZP::pip
  zi snippet OMZP::golang
  zi snippet OMZP::command-not-found
  zi snippet OMZP::colored-man-pages
  zi snippet OMZP::ubuntu
  zi light zsh-users/zsh-syntax-highlighting
  zi light zsh-users/zsh-autosuggestions
  zi light zsh-users/zsh-completions
  zi light agnoster/agnoster-zsh-theme

export AGNOSTER_DISABLE_CONTEXT=1
prompt_context() {
  if [[ ! -z "$DEFAULT_USER" && "$USER" -ne "$DEFAULT_USER" ]] || [[ -n "$SSH_CLIENT" ]]; then
    prompt_segment black default "%(!.%{%F{yellow}%}.)$USER"
  fi
}

# fix $(prompt_agnoster_main)
setopt promptsubst
