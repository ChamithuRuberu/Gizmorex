# 🗄️ MongoDB Setup Guide

## Quick Setup with MongoDB Atlas (5 minutes - FREE)

### Step 1: Create Account
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with Google or email
3. No credit card required!

### Step 2: Create Free Database
1. Click **"Build a Database"**
2. Choose **"M0 FREE"** tier
3. Select region (choose closest to Sri Lanka - Singapore or Mumbai)
4. Click **"Create Cluster"** (takes 1-3 minutes)

### Step 3: Create Database User
1. You'll see "Security Quickstart"
2. Create username and password
   - Username: `gizmorex-user`
   - Password: (create strong password)
   - **SAVE THIS PASSWORD!**

### Step 4: Add Your IP Address
1. Click **"Add My Current IP Address"**
2. Or add `0.0.0.0/0` to allow from anywhere (less secure but easier)
3. Click **"Finish and Close"**

### Step 5: Get Connection String
1. Click **"Connect"** button
2. Choose **"Connect your application"**
3. Select **"Node.js"** driver
4. Copy the connection string (looks like):
   ```
   mongodb+srv://gizmorex-user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 6: Update .env.local
1. Open `.env.local` file
2. Replace the MONGODB_URI line with your connection string
3. Replace `<password>` with your actual password
4. Add database name before the `?`:
   ```
   mongodb+srv://gizmorex-user:YourPassword@cluster0.xxxxx.mongodb.net/gizmorex?retryWrites=true&w=majority
   ```

### Example:
```env
# Before:
MONGODB_URI=mongodb://localhost:27017/gizmorex

# After (your actual values):
MONGODB_URI=mongodb+srv://gizmorex-user:MySecret123@cluster0.abc123.mongodb.net/gizmorex?retryWrites=true&w=majority
```

### Step 7: Restart Server
```bash
# Stop the server (Ctrl + C)
# Start again
npm run dev
```

### ✅ Done!

Now you can:
```bash
# Seed database
npm run seed

# Start server
npm run dev
```

---

## Alternative: Install MongoDB Locally (More Complex)

### Windows:
1. Download: https://www.mongodb.com/try/download/community
2. Install with default settings
3. MongoDB will run as a Windows service
4. Use: `MONGODB_URI=mongodb://localhost:27017/gizmorex`

### Mac:
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Linux:
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

---

## Troubleshooting

### Connection Refused Error
✅ **Solution:** Use MongoDB Atlas (cloud)

### Authentication Failed
✅ **Check:** Password is correct in connection string
✅ **Check:** Replace `<password>` with actual password

### Network Error
✅ **Check:** IP address is whitelisted in Atlas
✅ **Try:** Add `0.0.0.0/0` to allow all IPs

---

## Why MongoDB Atlas?

✅ **Free Forever** - 512MB storage
✅ **No Installation** - Cloud-based
✅ **Automatic Backups**
✅ **Easy to Use**
✅ **Perfect for Development & Small Projects**

---

## Quick Video Tutorial

Search YouTube for: "MongoDB Atlas Setup Tutorial"
(Takes 5 minutes to follow along)

---

**Recommended: Use MongoDB Atlas! It's easier and free! ☁️**
