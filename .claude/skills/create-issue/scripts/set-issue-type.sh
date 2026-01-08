#!/bin/bash
# Sets the issue type for an issue.
# Usage: ./set-issue-type.sh <issue_node_id> <type_node_id>
# Outputs: The updated issue ID on success

ISSUE_NODE_ID="$1"
TYPE_NODE_ID="$2"

if [ -z "$ISSUE_NODE_ID" ] || [ -z "$TYPE_NODE_ID" ]; then
  echo "Error: issue_node_id and type_node_id required" >&2
  exit 1
fi

gh api graphql -f query="mutation { updateIssue(input: {id: \"$ISSUE_NODE_ID\", issueTypeId: \"$TYPE_NODE_ID\"}) { issue { id } } }" \
  --jq '.data.updateIssue.issue.id'
