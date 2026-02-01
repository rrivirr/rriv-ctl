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
    
    app_location="$INSTALL_DIR/rrivctl"
    temp_app_location="$INSTALL_DIR/rrivctl.new"
    old_app_location="$INSTALL_DIR/rrivctl.old"

    if [[ -z "$1" ]]; then
        download_url=https://github.com/rrivirr/rriv-ctl/releases/latest/download/rriv-cli-$os-$arch
    else
        download_url=https://github.com/rrivirr/rriv-ctl/releases/download/$1/rriv-cli-$os-$arch
    fi

    curl --proto '=https' --tlsv1.2 --progress-bar -fSLo $temp_app_location $download_url
    if [[ -f $app_location ]] ; then 
        mv $app_location $old_app_location 
    fi

    mv $temp_app_location $app_location
    chmod +x $app_location

    prev_line_to_add="alias rrivctlv2=$app_location"
    line_to_add="rrivctlv2()"
    shell=".bashrc"
    if [[ ${SHELL#*zsh} != $SHELL ]]; then
        shell=".zshrc"
    fi
    shell_rc="$HOME/$shell"

    add_lines_to_shrc()
    {
        cat >> $shell_rc <<EOL

function rrivctlv2() {
    $app_location "\$@"
}
EOL
    }
    
    rm_prev_alias()
    {
        if [[ ${SHELL#*zsh} != $SHELL ]]; then
            sed -i '' "/alias rrivctlv2=/d" $shell_rc
        else 
            sed -i "/alias rrivctlv2=/d" $shell_rc
        fi
    }

    setupAutoComplete()
    {
        sleep 2
        $app_location --setup-completion
        source $shell_rc
    }

    grep -qsFx "$prev_line_to_add" $shell_rc  && rm_prev_alias
    grep -qsF "$line_to_add" $shell_rc || add_lines_to_shrc
    source $shell_rc

    grep -qsFx "# begin rrivctlv2 completion" $shell_rc || setupAutoComplete
    echo "success"   
}