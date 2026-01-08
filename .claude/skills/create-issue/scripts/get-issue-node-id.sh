#!/bin/bash
# Gets the node ID for an issue given its number.
# Usage: ./get-issue-node-id.sh <issue_number> [owner] [repo]
# Outputs: The issue node ID

ISSUE_NUMBER="$1"
OWNER="${2:-tradingstrategy-ai}"
REPO="${3:-frontend}"

if [ -z "$ISSUE_NUMBER" ]; then
  echo "Error: issue number required" >&2
  exit 1
fi

gh api graphql -f query="{ repository(owner: \"$OWNER\", name: \"$REPO\") { issue(number: $ISSUE_NUMBER) { id } } }" \
  --jq '.data.repository.issue.id'
