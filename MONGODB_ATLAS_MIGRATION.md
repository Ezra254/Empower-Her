# MongoDB Atlas Migration Guide

## Understanding MongoDB Atlas vs Local MongoDB

### Important: They Are Separate Databases

When you connect your backend to MongoDB Atlas:
- ✅ Your backend will use the **cloud database** (MongoDB Atlas)
- ❌ Your **local MongoDB data is NOT automatically copied**
- ❌ The databases are **completely independent**
- ❌ There is **no automatic sync** between them

### What Happens When You Switch?

1. **Before**: Backend connects to `mongodb://localhost:27017/empowerher` (local)
2. **After**: Backend connects to `mongodb+srv://user:pass@cluster.mongodb.net/empowerher` (Atlas)
3. **Result**: Your backend now reads/writes to the Atlas database (which starts empty)

---

## Do You Need to Migrate Data?

### If Your Local Database Has Important Data:

You need to **export from local** and **import to Atlas** manually.

### If Your Local Database is Empty/Test Data:

You can skip migration and start fresh with Atlas.

---

## How to Migrate Data from Local to Atlas

### Method 1: Using MongoDB Compass (Easiest - Recommended)

1. **Export from Local MongoDB:**
   - Open MongoDB Compass
   - Connect to your local MongoDB: `mongodb://localhost:27017`
   - Select your `empowerher` database
   - For each collection:
     - Click on the collection (e.g., `users`, `reports`, `subscriptions`)
     - Click "Export Collection"
     - Choose format: **JSON** or **CSV**
     - Save the file

2. **Import to MongoDB Atlas:**
   - Open MongoDB Compass
   - Connect to Atlas: `mongodb+srv://username:password@cluster.mongodb.net/empowerher`
   - For each collection:
     - Click "Add Data" → "Import File"
     - Select the exported JSON/CSV file
     - Map fields if needed
     - Click "Import"

### Method 2: Using mongodump and mongorestore (Command Line)

**Prerequisites**: Install MongoDB Database Tools
- Download: https://www.mongodb.com/try/download/database-tools

**Steps:**

1. **Export from Local MongoDB:**
   ```powershell
   # Export entire database
   mongodump --uri="mongodb://localhost:27017/empowerher" --out=./mongodb-backup
   
   # Or export specific collections
   mongodump --uri="mongodb://localhost:27017/empowerher" --collection=users --out=./mongodb-backup
   mongodump --uri="mongodb://localhost:27017/empowerher" --collection=reports --out=./mongodb-backup
   mongodump --uri="mongodb://localhost:27017/empowerher" --collection=subscriptions --out=./mongodb-backup
   ```

2. **Import to MongoDB Atlas:**
   ```powershell
   # Replace with your Atlas connection string
   $ATLAS_URI = "mongodb+srv://username:password@cluster.mongodb.net/empowerher?retryWrites=true&w=majority"
   
   # Restore entire database
   mongorestore --uri="$ATLAS_URI" ./mongodb-backup/empowerher
   
   # Or restore specific collections
   mongorestore --uri="$ATLAS_URI" --collection=users ./mongodb-backup/empowerher/users.bson
   mongorestore --uri="$ATLAS_URI" --collection=reports ./mongodb-backup/empowerher/reports.bson
   ```

### Method 3: Using mongoexport and mongoimport (JSON/CSV)

1. **Export from Local:**
   ```powershell
   # Export users collection
   mongoexport --uri="mongodb://localhost:27017/empowerher" --collection=users --out=users.json
   
   # Export reports collection
   mongoexport --uri="mongodb://localhost:27017/empowerher" --collection=reports --out=reports.json
   
   # Export subscriptions collection
   mongoexport --uri="mongodb://localhost:27017/empowerher" --collection=subscriptions --out=subscriptions.json
   ```

2. **Import to Atlas:**
   ```powershell
   # Replace with your Atlas connection string
   $ATLAS_URI = "mongodb+srv://username:password@cluster.mongodb.net/empowerher?retryWrites=true&w=majority"
   
   # Import each collection
   mongoimport --uri="$ATLAS_URI" --collection=users --file=users.json
   mongoimport --uri="$ATLAS_URI" --collection=reports --file=reports.json
   mongoimport --uri="$ATLAS_URI" --collection=subscriptions --file=subscriptions.json
   ```

---

## Step-by-Step: Complete Migration Process

### Step 1: Check What Data You Have Locally

1. Open MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. Check the `empowerher` database
4. Note which collections have data and how much

### Step 2: Set Up MongoDB Atlas (If Not Done)

1. Go to https://mongodb.com/cloud/atlas
2. Create a cluster (Free tier is fine)
3. Create a database user
4. Whitelist your IP: `0.0.0.0/0` (all IPs) or your specific IP
5. Get your connection string

### Step 3: Update Backend Connection String

1. Open `backend/.env`
2. Update `MONGODB_URI`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/empowerher?retryWrites=true&w=majority
   ```
3. **Don't start your backend yet** (keep using local for now)

### Step 4: Migrate Data (Choose Method Above)

Use one of the methods (Compass is easiest) to export from local and import to Atlas.

### Step 5: Verify Data in Atlas

1. Connect MongoDB Compass to Atlas
2. Check that all collections and data are present
3. Verify record counts match your local database

### Step 6: Switch Backend to Atlas

1. Your `MONGODB_URI` should already be updated
2. Restart your backend:
   ```powershell
   cd backend
   npm run dev
   ```
3. Test that your app works with Atlas data

### Step 7: Initialize Required Data (If Needed)

After migrating, you may need to initialize some data:

```powershell
cd backend

# Create admin user (if needed)
npm run create-admin

# Initialize subscription plans (if needed)
npm run init-plans
```

**Note**: These scripts will add data, so check if you already have this data from migration first.

---

## What Collections Should You Migrate?

Based on your codebase, these are the main collections:

- ✅ **users** - User accounts
- ✅ **reports** - Incident reports
- ✅ **cases** - Case records
- ✅ **subscriptions** - User subscriptions
- ✅ **plans** - Subscription plans
- ✅ **resources** - Resource data

### Check Before Migrating:

```powershell
# Connect to local MongoDB and list collections
mongosh "mongodb://localhost:27017/empowerher"
show collections
db.users.countDocuments()
db.reports.countDocuments()
# etc.
```

---

## Important Notes

### ⚠️ Data Loss Warning

- After switching to Atlas, your backend **will not access local data anymore**
- Local data remains in your local MongoDB (it's not deleted)
- But your app won't use it unless you switch back

### 🔄 One-Way Migration

- Migration is typically **one-way** (local → Atlas)
- If you need to sync back, you'd need to export from Atlas and import to local

### 📊 Data Consistency

- Make sure to migrate **all collections** at once
- Data relationships (IDs, references) should remain intact
- Consider stopping your backend during migration to avoid data conflicts

### 🧪 Testing After Migration

1. Verify all collections are present
2. Check a few records manually
3. Test your app functionality
4. Verify relationships between collections still work

---

## Quick Checklist

- [ ] Check local database for important data
- [ ] Set up MongoDB Atlas account
- [ ] Create Atlas cluster
- [ ] Create database user
- [ ] Whitelist IP addresses
- [ ] Get Atlas connection string
- [ ] Export data from local MongoDB
- [ ] Import data to MongoDB Atlas
- [ ] Verify data in Atlas
- [ ] Update backend `.env` with Atlas URI
- [ ] Test backend connection to Atlas
- [ ] Run initialization scripts if needed
- [ ] Test your application

---

## Need Help?

If you encounter issues:

1. **Connection errors**: Check IP whitelist in Atlas
2. **Authentication errors**: Verify username/password
3. **Import errors**: Check data format (JSON vs BSON)
4. **Missing data**: Verify all collections were migrated

Check MongoDB Atlas logs for detailed error messages.

