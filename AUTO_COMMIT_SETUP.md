# Auto-commit Setup for Obsidian

## Option 1: Obsidian Git Plugin (Recommended)

The easiest way to auto-commit from Obsidian without opening VS Code.

### Setup:
1. Install "Obsidian Git" plugin from Community plugins
2. Configure in Settings → Obsidian Git:
   - ✅ Enable "Auto backup"
   - Set interval (e.g., 10-30 minutes)
   - ✅ Enable "Auto push"
   - ✅ Enable "Pull updates on startup"

### Commands:
- `Ctrl/Cmd + P` → "Obsidian Git: Commit all changes"
- `Ctrl/Cmd + P` → "Obsidian Git: Push"

## Option 2: Cron Job (Linux)

Use the provided `auto-commit.sh` script with cron:

\`\`\`bash
# Edit crontab
crontab -e

# Add line to run every 15 minutes:
*/15 * * * * cd /home/jbi-laptop/Git/009-baena.blog-personal-pkm && ./auto-commit.sh >> /tmp/obsidian-autocommit.log 2>&1
\`\`\`

## Option 3: Systemd Timer (Linux)

More reliable than cron for desktop use. Let me know if you want me to set this up.

## Option 4: Manual Script

Run `./auto-commit.sh` whenever you want to commit changes.
