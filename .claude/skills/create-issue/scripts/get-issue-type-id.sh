#!/bin/bash
# Gets the issue type ID for a given type name in an organisation.
# Usage: ./get-issue-type-id.sh [type_name] [org]
# Outputs: The issue type node ID

TYPE_NAME="${1:-Feature}"
ORG="${2:-tradingstrategy-ai}"

gh api graphql -f query="{ organization(login: \"$ORG\") { issueTypes(first: 20) { nodes { id name } } } }" \
  --jq ".data.organization.issueTypes.nodes[] | select(.name == \"$TYPE_NAME\") | .id"
