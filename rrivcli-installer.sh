#!/usr/bin/env bash
{
    set -e
    os=$(uname -s)

    case "$os" in
        Linux) os="linux" ;;
        Darwin) os="macos" ;;
        *) os="Unsupported OS";;
    esac

    if [[ $os == 'Unsupported OS' ]]; then
        echo "auto installation not supported with operating system"
        echo "contact admin for support"
        exit
    fi

    arch=$(uname -m)

    case "$arch" in
        x86_64) arch="x64" ;;
        aarch64) arch="arm64" ;;
        arm64) arch="arm64";;
        *) arch="Unsupported Architecture";;
    esac

    if [[ $arch == "Unsupported Architecture" ]]; then
        echo "auto installation not supported with architecture"
        echo "contact admin for support"
    fi

    INSTALL_DIR="$HOME/.rriv/.rrivctl"
    if [[ ! -d $INSTALL_DIR ]]; then
        mkdir -p $INSTALL_DIR
    fi
    app_location="$INSTALL_DIR/rrivcli"

    if [[ -z "$1" ]]; then
        download_url=https://github.com/rrivirr/rriv-ctl/latest/download/rriv-cli-$os-$arch
    else
        download_url=https://github.com/rrivirr/rriv-ctl/releases/download/$1/rriv-cli-$os-$arch
    fi

    curl --proto '=https' --tlsv1.2 -fSLo $app_location $download_url
    chmod +x $app_location

    line_to_add="alias rrivcli=$app_location"
    shell_rc="$HOME/.bashrc"

    if [[ ${SHELL#*zsh} != $SHELL ]]; then
        shell_rc="$HOME/.zshrc"
    fi

    check_if_line_exists()
    {
        grep -qsFx "$line_to_add" $shell_rc
    }


    add_line_to_shrc()
    {
        printf "\n" >> "$shell_rc"
        printf "# Alias for rrivcli binary app\n" >> "$shell_rc"
        printf "%s\n" "$line_to_add" >> "$shell_rc"
        echo "Please restart your shell or source $shell_rc run to make rrivcli available"
    }

    check_if_line_exists || add_line_to_shrc
    echo "success"   
}