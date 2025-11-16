# Fix Vercel Project Name Issue

## The Problem

Vercel requires project names to be:
- ✅ **Lowercase only** (no uppercase letters)
- ✅ **No spaces** (use hyphens `-` instead)
- ✅ **Maximum 100 characters**
- ✅ **Alphanumeric and hyphens only** (no special characters except `-`)

Your folder name "Empower her" has:
- ❌ A space
- ❌ Uppercase letters

---

## The Solution

**Good News**: You don't need to rename your folder! Vercel project names are independent of your folder name.

### Option 1: Change Project Name in Vercel (Recommended)

When importing your project to Vercel:

1. **Click "Import"** your repository
2. **In the "Project Name" field**, change it to:
   - `empowerher` (no spaces, lowercase)
   - OR `empower-her` (with hyphen, lowercase)

3. **Vercel will auto-generate a URL** like:
   - `https://empowerher.vercel.app`
   - OR `https://empower-her.vercel.app`

**Important**: The project name in Vercel can be different from your folder/repo name!

---

### Option 2: Rename Repository on GitHub (Optional)

If you want to rename your GitHub repository (optional, not required):

1. Go to your GitHub repository
2. Click **Settings** tab
3. Scroll down to **Repository name**
4. Change from `Empower her` to `empowerher` or `empower-her`
5. Click **Rename**

**Note**: This doesn't affect your local folder name, and you don't need to do this.

---

### Option 3: Rename Local Folder (Optional)

If you want to rename your local folder (optional, not required):

**Windows PowerShell:**
```powershell
# Go to parent directory
cd C:\Users\Shitote\OneDrive\Desktop

# Rename folder
Rename-Item "Empower her" "empowerher"
```

Then update your Git remote (if needed):
```powershell
cd empowerher
git remote -v  # Check current remote
# If needed, update remote URL
```

**Note**: You don't need to rename your folder - Vercel only cares about the project name you set in their dashboard.

---

## Recommended Project Names for Vercel

Choose one of these when setting up in Vercel:

| Option | Project Name | URL Example |
|--------|--------------|-------------|
| Option 1 | `empowerher` | `https://empowerher.vercel.app` |
| Option 2 | `empower-her` | `https://empower-her.vercel.app` |
| Option 3 | `empowerher-app` | `https://empowerher-app.vercel.app` |
| Option 4 | `empowerher-frontend` | `https://empowerher-frontend.vercel.app` |

**I recommend**: `empowerher-frontend` - This makes it clear it's the frontend, especially if you deploy backend separately.

---

## Step-by-Step: Import to Vercel with Correct Name

1. **Go to [vercel.com](https://vercel.com)** and sign in
2. **Click "Add New..." → "Project"**
3. **Import your Git repository**:
   - Select "Import Git Repository"
   - Choose your repository (even if it's named "Empower her")
4. **Configure Project**:
   - **Project Name**: Type `empowerher-frontend` (or your preferred name)
   - **Root Directory**: Click "Edit" and set to `frontend`
   - **Framework Preset**: Should auto-detect "Next.js"
   - **Build Command**: Should auto-fill `npm run build`
   - **Output Directory**: Should auto-fill `.next`
5. **Click "Deploy"** (you can add environment variables later)
6. **After deployment**, your app will be at: `https://empowerher-frontend.vercel.app`

---

## Summary

✅ **You can keep your folder name as "Empower her"** - it doesn't matter for Vercel

✅ **Just set the project name in Vercel to something like `empowerher-frontend`** when you import

✅ **Vercel project names are separate from folder/repo names**

---

## Still Getting Error?

If you still see the error:

1. **Check the exact field** where you see the error
   - Is it the "Project Name" field in Vercel?
   - Or is it a different field?

2. **Make sure you're typing in lowercase**:
   - ❌ `EmpowerHer`
   - ❌ `Empower Her`
   - ❌ `empower her`
   - ✅ `empowerher`
   - ✅ `empower-her`
   - ✅ `empowerher-frontend`

3. **Remove all spaces** and replace with hyphens if needed

If you're still stuck, let me know exactly where you see the error and I can help!

