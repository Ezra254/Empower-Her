# Fix Git Issue with Large Files

Before deploying, you need to remove `node_modules` from Git since it contains large files (123.96 MB) that exceed GitHub's 100 MB limit.

## Quick Fix

Run these commands in PowerShell from your project root:

```powershell
# Remove node_modules from Git tracking
git rm -r --cached frontend/node_modules
git rm -r --cached backend/node_modules
git rm -r --cached node_modules

# Commit the changes
git add .gitignore
git commit -m "Remove node_modules from Git tracking - prepare for deployment"

# Push to GitHub
git push origin main
```

**Note**: If you get an error that files don't exist, that's okay - it means they were never committed. Just proceed with the commit and push.

## Alternative: If Git History Contains Large Files

If you've already pushed large files to GitHub, you may need to:

1. **Remove from history** (advanced, use with caution):
   ```powershell
   git filter-branch --tree-filter "rm -rf frontend/node_modules backend/node_modules node_modules" --prune-empty HEAD
   ```

2. **Or use BFG Repo Cleaner** (easier):
   - Download from: https://rtyley.github.io/bfg-repo-cleaner/
   - Run: `bfg --delete-folders node_modules`
   - Then: `git reflog expire --expire=now --all && git gc --prune=now --aggressive`

However, for now, just removing them from tracking and committing should be enough to proceed with deployment.

