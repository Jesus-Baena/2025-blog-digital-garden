# Branch Protection Fix for Daily Build

## Problem
The `daily-build.yaml` workflow was failing because it couldn't push commits to the protected main branch using the default `GITHUB_TOKEN`.

## Solution Implemented
Updated [.github/workflows/daily-build.yaml](.github/workflows/daily-build.yaml) to use a Personal Access Token (PAT) that can bypass branch protection rules.

## Required Setup

### Create a Personal Access Token (PAT)
1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a descriptive name: `Daily Build Workflow Token`
4. Set expiration (recommend 90 days or no expiration)
5. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
6. Click "Generate token" and **copy the token immediately**

### Add Token to Repository Secrets
1. Go to your repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `PAT_TOKEN`
4. Value: Paste the token you just created
5. Click "Add secret"

## Alternative Solutions

### Option 1: Remove Branch Protection (Not Recommended)
Remove the branch protection rules that prevent GitHub Actions from pushing.

### Option 2: Allow GitHub Actions to Bypass
In repository Settings → Branches → Edit main branch protection:
- Enable "Allow specified actors to bypass required pull requests"
- Add `github-actions[bot]` to the bypass list

### Option 3: Use Deployment Branches
Instead of committing to main, deploy the built site to a separate `gh-pages` or `deploy` branch:
```yaml
- name: Deploy to GitHub Pages
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./public
```

## Current Implementation
The workflow now:
1. Tries to use `PAT_TOKEN` secret if available
2. Falls back to `github.token` if PAT is not set
3. This allows gradual migration without breaking existing functionality

## Testing
After adding the PAT_TOKEN secret:
1. Go to Actions tab
2. Find "Daily Build" workflow
3. Click "Run workflow" to manually trigger
4. Verify it completes successfully without branch protection errors

## Maintenance
- Monitor PAT expiration and renew before it expires
- Consider using GitHub Apps for better security and no expiration
- Review branch protection rules periodically to ensure they align with workflow needs
