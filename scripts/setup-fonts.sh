#!/usr/bin/env bash
#
# Fetch Trading Strategy font assets and sync the locally needed files to static/fonts.
#
# Usage:
#   bash scripts/setup-fonts.sh
#   bash scripts/setup-fonts.sh /path/to/existing/fonts-checkout
#   bash scripts/setup-fonts.sh /path/to/existing/fonts-checkout <git-ref>
#
# Environment:
#   TS_FONTS_REPO_URL - override fonts repository URL
#   TS_FONTS_REF      - branch, tag, or commit to check out
#

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
fonts_repo_url="${TS_FONTS_REPO_URL:-https://github.com/tradingstrategy-ai/fonts}"
fonts_checkout_dir="${1:-$repo_root/deps/fonts}"
fonts_ref="${2:-${TS_FONTS_REF:-}}"
fonts_css="$repo_root/static/fonts/fonts5.css"

sync_dir() {
	local source_dir="$1"
	local target_dir="$2"

	if [[ ! -d "$source_dir" ]]; then
		echo "Missing source directory: $source_dir" >&2
		exit 1
	fi

	mkdir -p "$target_dir"
	rsync -a --delete --exclude='.DS_Store' "$source_dir/" "$target_dir/"
}

checkout_ref() {
	local checkout_dir="$1"
	local ref="$2"

	if [[ -z "$ref" ]]; then
		return
	fi

	echo "Checking out fonts ref: $ref"

	if git -C "$checkout_dir" show-ref --verify --quiet "refs/remotes/origin/$ref"; then
		git -C "$checkout_dir" checkout --detach "origin/$ref"
	elif git -C "$checkout_dir" rev-parse --verify --quiet "$ref^{commit}" >/dev/null; then
		git -C "$checkout_dir" checkout --detach "$ref"
	else
		git -C "$checkout_dir" fetch --depth 1 origin "$ref"
		git -C "$checkout_dir" checkout --detach FETCH_HEAD
	fi
}

if [[ -d "$fonts_checkout_dir/.git" ]]; then
	echo "Updating fonts checkout in $fonts_checkout_dir"
	git -C "$fonts_checkout_dir" fetch --tags --prune origin
	if [[ -n "$fonts_ref" ]]; then
		checkout_ref "$fonts_checkout_dir" "$fonts_ref"
	else
		git -C "$fonts_checkout_dir" pull --ff-only
	fi
elif [[ -d "$fonts_checkout_dir" ]]; then
	echo "Using existing fonts directory at $fonts_checkout_dir"
else
	echo "Cloning fonts repo to $fonts_checkout_dir"
	git clone --depth 1 "$fonts_repo_url" "$fonts_checkout_dir"
	checkout_ref "$fonts_checkout_dir" "$fonts_ref"
fi

if [[ ! -f "$fonts_css" ]]; then
	echo "Missing fonts CSS: $fonts_css" >&2
	exit 1
fi

font_paths=()
while IFS= read -r relative_path; do
	font_paths+=("$relative_path")
done < <(sed -n 's/.*url("\.\///p' "$fonts_css" | sed 's/") format.*//' | sort -u)

source_dirs=()
while IFS= read -r relative_dir; do
	source_dirs+=("$relative_dir")
done < <(printf '%s\n' "${font_paths[@]}" | xargs -n1 dirname | sort -u)

for relative_dir in "${source_dirs[@]}"; do
	source_dir="$fonts_checkout_dir/$relative_dir"
	target_dir="$repo_root/static/fonts/$relative_dir"

	if [[ -d "$source_dir" ]]; then
		echo "Syncing $relative_dir"
		sync_dir "$source_dir" "$target_dir"
	fi
done

missing_paths=()
for relative_path in "${font_paths[@]}"; do
	if [[ ! -f "$repo_root/static/fonts/$relative_path" ]]; then
		missing_paths+=("$relative_path")
	fi
done

if (( ${#missing_paths[@]} > 0 )); then
	echo "The following font assets are still missing after sync:" >&2
	printf '  - %s\n' "${missing_paths[@]}" >&2
	exit 1
fi

echo "Fonts synced to $repo_root/static/fonts"
