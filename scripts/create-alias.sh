
WD=`pwd`
LINE_TO_ADD="alias rr='node $WD/dist/index.js'"

check_if_line_exists()
{
    grep -qsFx "$LINE_TO_ADD" ~/.zshrc
}

add_line_to_bashrc()
{
    bashrc=~/.zshrc
    printf "\n" >> "$bashrc"
    printf "# Alias for rrivctl\n" >> "$bashrc"
    printf "%s\n" "$LINE_TO_ADD" >> "$bashrc"
    echo "rrivctl alias added ~/.bashrc, please launch a new shell or source ./.bashrc to put rrivctl on your command path"
}

check_if_line_exists || add_line_to_bashrc

