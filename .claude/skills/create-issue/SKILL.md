---
name: create-issue
description: Creates a new GitHub issue with structured user story format, acceptance criteria, and project integration. Use when the user wants to create a ticket, issue, or task for the tradingstrategy-ai/frontend repository.
---

# Create GitHub Issue

Creates a well-structured GitHub issue in tradingstrategy-ai/frontend with sensible defaults.

## Defaults

| Setting | Default |
|---------|---------|
| Assignee | Current GH user (if write access) |
| Issue Type | Feature |
| Project | TicketDAO (#2), status: Todo |
| Labels | `priority: P1`, `size: S` |

## Information Gathering

Prompt the user for:

1. **User Story**: Who (persona), What (capability), Why (benefit - preferred)
2. **Acceptance Criteria**: Clear, testable conditions. Use gherkin (Given/When/Then) when it improves clarity.

Optional: Background context, attachments, or default overrides.

## Issue Body Format

```markdown
# Goal

As a [who], I want [what], so that [why].

## Acceptance Criteria

1. [Condition]
2. [Condition]

## Background

[Optional context]
```

## Creating the Issue

### Step 1: Determine assignee

Run: `scripts/get-assignee.sh`

Returns the current GH user if they have write access, empty otherwise.

### Step 2: Create the issue

```bash
gh issue create \
  --repo tradingstrategy-ai/frontend \
  --title "<brief summary from user story>" \
  --body "<formatted markdown body>" \
  --label "priority: P1" \
  --label "size: S" \
  --assignee "<result from step 1, omit flag if empty>"
```

Parse the issue number from the returned URL for use in subsequent steps.

### Step 3: Set issue type

```bash
# Get Feature type ID
TYPE_ID=$(scripts/get-issue-type-id.sh Feature)

# Get issue node ID (use issue number from step 2)
ISSUE_NODE_ID=$(scripts/get-issue-node-id.sh <ISSUE_NUMBER>)

# Set the type
scripts/set-issue-type.sh "$ISSUE_NODE_ID" "$TYPE_ID"
```

### Step 4: Add to project

```bash
scripts/add-to-project.sh "<ISSUE_URL>" Todo
```

If prompted about project scope, user should run: `gh auth refresh -s project`

### Step 5: Report results

Confirm: issue URL, assignee, labels, type, project status.

## Error Handling

- Project scope missing: prompt `gh auth refresh -s project`
- Issue type fails: inform user to set manually
- Always preview and confirm before creating
