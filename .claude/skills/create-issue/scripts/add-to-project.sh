#!/bin/bash
# Adds an issue to a GitHub project and sets its status.
# Usage: ./add-to-project.sh <issue_url> [status] [project_number] [owner]
# Outputs: Success message with item ID, or error

ISSUE_URL="$1"
STATUS="${2:-Todo}"
PROJECT_NUMBER="${3:-2}"
OWNER="${4:-tradingstrategy-ai}"

if [ -z "$ISSUE_URL" ]; then
  echo "Error: issue URL required" >&2
  exit 1
fi

# Add issue to project
ITEM_RESULT=$(gh project item-add "$PROJECT_NUMBER" --owner "$OWNER" --url "$ISSUE_URL" --format json 2>&1)
if [ $? -ne 0 ]; then
  if echo "$ITEM_RESULT" | grep -q "project.*scope"; then
    echo "Error: Project scope not authorised. Run: gh auth refresh -s project" >&2
    exit 1
  fi
  echo "Error adding to project: $ITEM_RESULT" >&2
  exit 1
fi

ITEM_ID=$(echo "$ITEM_RESULT" | jq -r '.id')

# Get project info to find field IDs
PROJECT_INFO=$(gh project view "$PROJECT_NUMBER" --owner "$OWNER" --format json 2>/dev/null)
PROJECT_ID=$(echo "$PROJECT_INFO" | jq -r '.id')

# Get field list to find Status field and option IDs
FIELDS=$(gh project field-list "$PROJECT_NUMBER" --owner "$OWNER" --format json 2>/dev/null)
STATUS_FIELD_ID=$(echo "$FIELDS" | jq -r '.fields[] | select(.name == "Status") | .id')
STATUS_OPTION_ID=$(echo "$FIELDS" | jq -r ".fields[] | select(.name == \"Status\") | .options[]? | select(.name == \"$STATUS\") | .id")

if [ -n "$STATUS_FIELD_ID" ] && [ -n "$STATUS_OPTION_ID" ]; then
  gh project item-edit --project-id "$PROJECT_ID" --id "$ITEM_ID" --field-id "$STATUS_FIELD_ID" --single-select-option-id "$STATUS_OPTION_ID" >/dev/null 2>&1
  echo "Added to project #$PROJECT_NUMBER with status: $STATUS"
else
  echo "Added to project #$PROJECT_NUMBER (status field not found, set manually)"
fi
