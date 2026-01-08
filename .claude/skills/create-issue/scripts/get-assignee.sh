#!/bin/bash
# Returns the current GitHub user if they have write access to the repo, otherwise empty.
# Usage: ./get-assignee.sh [owner] [repo]
# Outputs: username if has write access, empty string otherwise

OWNER="${1:-tradingstrategy-ai}"
REPO="${2:-frontend}"

CURRENT_USER=$(gh api user --jq '.login' 2>/dev/null)
if [ -z "$CURRENT_USER" ]; then
  exit 0
fi

PERMISSION=$(gh api "repos/$OWNER/$REPO/collaborators/$CURRENT_USER/permission" --jq '.permission' 2>/dev/null || echo "none")

case "$PERMISSION" in
  admin|maintain|write)
    echo "$CURRENT_USER"
    ;;
  *)
    echo ""
    ;;
esac
