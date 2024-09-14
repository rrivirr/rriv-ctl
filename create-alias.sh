
WD=`pwd`
LINE_TO_ADD="alias rrivctl='node $WD/dist/src/index.js'"

check_if_line_exists()
{
    # grep wont care if one or both files dont exist.
    grep -qsFx "$LINE_TO_ADD" ~/.profile ~/.bash_profile
}

add_line_to_profile()
{
    profile=~/.profile
    printf "\n" >> "$profile"
    printf "# Alias for rrivctl\n" >> "$profile"
    printf "%s\n" "$LINE_TO_ADD" >> "$profile"
    echo "rrivctl alias added ~/.profile, please launch a new shell or source ./.profile to put rrivctl on your command path"
}

check_if_line_exists || add_line_to_profile

