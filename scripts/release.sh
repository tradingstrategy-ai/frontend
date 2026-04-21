#!/bin/bash
#
# Create a new releease
#
# - increment version number by 1
# - push a new release to Github
# - trigger new image build
#

set -e

auto_confirm=false
for arg in "$@"; do
  [[ "$arg" == "--auto-confirm" ]] && auto_confirm=true
done

# Get tags locally
git fetch --all

# https://gist.github.com/rponte/fdc0724dd984088606b0
latest_tag=`git tag --sort=committerdate | tail -1`

latest_version=${latest_tag:1}

latest_commit=`git log --oneline -1`

build_url="https://github.com/tradingstrategy-ai/frontend/pkgs/container/frontend"

# https://ryanstutorials.net/bash-scripting-tutorial/bash-arithmetic.php
let "new_version = $latest_version + 1"

new_tag="v$new_version"

echo "Latest commit is $latest_commit"

if $auto_confirm; then
    echo "New tag is $new_tag - auto-confirming release"
    response="y"
else
    # https://stackoverflow.com/a/3232082/315168
    read -r -p "New tag is $new_tag - make a release? [y/N] " response
fi

case "$response" in
    [yY][eE][sS]|[yY])
        git tag $new_tag
        git push origin $new_tag
        echo "Pushed $new_tag - please find the build to complete at $build_url"
        ;;
    *)
        echo "No release :("
        exit
        ;;
esac

