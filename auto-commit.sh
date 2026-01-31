#!/bin/bash
# Auto-commit script for Obsidian vault
# Usage: ./auto-commit.sh or set up as a cron job

cd "$(dirname "$0")"

# Check if there are changes
if [[ -n $(git status --porcelain) ]]; then
    echo "Changes detected, committing..."
    git add content/
    git commit -m "docs: auto-commit from Obsidian - $(date '+%Y-%m-%d %H:%M')"
    git push origin main  # Change 'main' to your branch name if different
    echo "✅ Changes committed and pushed"
else
    echo "No changes to commit"
fi
