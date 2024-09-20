
WD=`pwd`
LINE_TO_ADD="alias rrivctl='node $WD/dist/src/index.js'"

check_if_line_exists()
{
    grep -qsFx "$LINE_TO_ADD" ~/.bashrc
}

add_line_to_bashrc()
{
    bashrc=~/.bashrc
    printf "\n" >> "$bashrc"
    printf "# Alias for rrivctl\n" >> "$bashrc"
    printf "%s\n" "$LINE_TO_ADD" >> "$bashrc"
    echo "rrivctl alias added ~/.bashrc, please launch a new shell or source ./.bashrc to put rrivctl on your command path"
}

check_if_line_exists || add_line_to_bashrc

