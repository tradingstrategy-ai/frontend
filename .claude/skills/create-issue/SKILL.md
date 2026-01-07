---
name: create-issue
description: Creates a new GitHub issue with structured user story format, acceptance criteria, and project integration. Use when the user wants to create a ticket, issue, or task for the tradingstrategy-ai/frontend repository.
---

# Create GitHub Issue

Creates a well-structured GitHub issue in the tradingstrategy-ai/frontend repository with sensible defaults and interactive information gathering.

**Important**: Enable the GitHub MCP server for this task: @github

## Defaults

Apply these defaults unless the user explicitly requests otherwise:

| Setting | Default Value |
|---------|---------------|
| Assignee | Current GitHub user (if they have write access, otherwise blank) |
| Issue Type | Feature |
| Project | [TicketDAO](https://github.com/orgs/tradingstrategy-ai/projects/2) (project #2) |
| Project Status | Todo |
| Labels | `priority: P1`, `size: S` |
| Repository | tradingstrategy-ai/frontend |

## Information Gathering

Interactively prompt the user for the following before creating the issue:

### Required

1. **User Story Components** (for the Goal section):
   - **Who**: What type of user/persona? (e.g., "a trader", "an admin", "a developer")
   - **What**: What capability or feature do they want?
   - **Why** (preferred): What benefit does this provide?

2. **Acceptance Criteria**: What conditions must be met for completion? Help refine vague criteria into clear, testable items. Use gherkin format (Given/When/Then) when it significantly improves clarity.

### Optional

Ask if the user wants to add:

3. **Background**: Discord links, business context, related issues/PRs, technical constraints
4. **Attachments**: Mockups, screenshots, or images
5. **Override defaults**: Different assignee, priority, size, issue type, or project status

## Issue Body Format

```markdown
# Goal

As a [who], I want [what], so that [why].

## Acceptance Criteria

1. [Clear, verifiable condition]
2. [Another condition]

## Background

[Optional - only if user provides context]
```

## Creating the Issue

### Step 1: Determine the assignee

Use the @github MCP to get current user info and check repository permissions. If the user has write access to tradingstrategy-ai/frontend, use them as the assignee. Otherwise, leave assignee blank.

### Step 2: Create the issue

Use the @github MCP `create_issue` tool with:
- **owner**: tradingstrategy-ai
- **repo**: frontend
- **title**: Brief summary derived from the user story
- **body**: The formatted markdown body
- **labels**: ["priority: P1", "size: S"] (or overrides)
- **assignees**: [current user] if they have write access

### Step 3: Set issue type to "Feature"

The GitHub MCP may not support issue types directly. If not, use the `gh` CLI.

**Important**: Use single-line GraphQL queries with inline values (not variables) to avoid parsing errors.

```bash
# Get organisation's issue type IDs (find the Feature type ID)
gh api graphql -f query='{ organization(login: "tradingstrategy-ai") { issueTypes(first: 20) { nodes { id name } } } }' --jq '.data.organization.issueTypes.nodes[] | select(.name == "Feature") | .id'

# Get the issue's node ID (replace 123 with actual issue number)
gh api graphql -f query='{ repository(owner: "tradingstrategy-ai", name: "frontend") { issue(number: 123) { id } } }' --jq '.data.repository.issue.id'

# Update issue with Feature type (replace IDs with actual values from above)
gh api graphql -f query='mutation { updateIssue(input: {id: "<ISSUE_NODE_ID>", issueTypeId: "<FEATURE_TYPE_ID>"}) { issue { id } } }'
```

### Step 4: Add to project and set status

```bash
# Ensure project scope is authorised
gh auth refresh -s project

# Add issue to project #2
ITEM_ID=$(gh project item-add 2 --owner "tradingstrategy-ai" --url "<ISSUE_URL>" --format json | jq -r '.id')

# Get project field information to find Status field and Todo option IDs
gh project field-list 2 --owner "tradingstrategy-ai" --format json

# Set status to "Todo"
gh project item-edit --project-id "<PROJECT_ID>" --id "$ITEM_ID" --field-id "<STATUS_FIELD_ID>" --single-select-option-id "<TODO_OPTION_ID>"
```

### Step 5: Report results

Confirm to the user:
- Issue URL
- Applied settings (assignee, labels, type, project, status)

## Error Handling

- If project scope missing: prompt user to run `gh auth refresh -s project`
- If issue type setting fails: inform user to set manually via GitHub UI
- Always preview the issue and ask for confirmation before creating
