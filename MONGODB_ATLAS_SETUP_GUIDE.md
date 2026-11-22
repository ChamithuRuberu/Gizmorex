# MongoDB Atlas Setup - Step-by-Step Guide (5 Minutes)

Follow these exact steps to get your database running. This is 100% FREE forever.

---

## Step 1: Create MongoDB Atlas Account (1 minute)

1. **Open your browser** and go to:
   ```
   https://www.mongodb.com/cloud/atlas/register
   ```

2. **Sign up** using one of these options:
   - Google account (fastest - 1 click)
   - Email and password

3. You'll see a welcome screen - click **"Create"** or **"Build a Database"**

---

## Step 2: Create FREE Cluster (1 minute)

1. You'll see **pricing plans**. Choose:
   ```
   M0 - FREE
   Shared RAM, 512 MB Storage
   ```
   Click **"Create"**

2. **Choose Cloud Provider & Region:**
   - Provider: **AWS** (recommended)
   - Region: **Singapore (ap-southeast-1)** or **Mumbai (ap-south-1)** 
     *(closest to Sri Lanka for fast speed)*
   - Keep cluster name as: **Cluster0**

3. Click **"Create Cluster"** (bottom right)

   ⏳ *Cluster creation takes 1-3 minutes. Continue while it creates...*

---

## Step 3: Create Database User (30 seconds)

You'll see a **"Security Quickstart"** screen:

1. **Authentication Method**: Keep as **"Username and Password"**

2. **Create a database user:**
   - Username: `gizmorex_admin` (or any name you want)
   - Password: Click **"Autogenerate Secure Password"**
   
   📋 **IMPORTANT**: Copy the password somewhere safe! You'll need it in 2 minutes.

3. Click **"Create User"**

---

## Step 4: Add IP Address (30 seconds)

Still on the Security Quickstart screen:

1. **Where would you like to connect from?**
   
   Choose: **"My Local Environment"**

2. **Add IP Address:**
   - Click **"Add My Current IP Address"** (recommended)
   - OR click **"Allow Access from Anywhere"** and use `0.0.0.0/0`
     *(this allows access from any IP - easier for development)*

3. Click **"Add Entry"**

4. Click **"Finish and Close"** at the bottom

---

## Step 5: Get Your Connection String (1 minute)

1. You'll see your **Cluster0** dashboard

2. Click the **"Connect"** button (big green/blue button)

3. Choose: **"Drivers"** (second option - for applications)

4. You'll see:
   - Driver: **Node.js**
   - Version: **6.8 or later**

5. **Copy the connection string** - it looks like:
   ```
   mongodb+srv://gizmorex_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

6. ⚠️ **Replace `<password>` with your actual password** from Step 3
   
   Example:
   ```
   Before: mongodb+srv://gizmorex_admin:<password>@cluster0.abc123.mongodb.net/
   After:  mongodb+srv://gizmorex_admin:MySecurePass123@cluster0.abc123.mongodb.net/
   ```

7. **Add database name** at the end before the `?`:
   ```
   mongodb+srv://gizmorex_admin:MySecurePass123@cluster0.abc123.mongodb.net/gizmorex?retryWrites=true&w=majority
   ```
   *(Added `/gizmorex` before the `?`)*

📋 **Copy this complete connection string** - you need it for the next step!

---

## Step 6: Update Your .env.local File (1 minute)

1. **In VS Code**, open the file:
   ```
   .env.local
   ```

2. **Find this line:**
   ```
   MONGODB_URI=mongodb://localhost:27017/gizmorex
   ```

3. **Replace it with your connection string** from Step 5:
   ```
   MONGODB_URI=mongodb+srv://gizmorex_admin:MySecurePass123@cluster0.abc123.mongodb.net/gizmorex?retryWrites=true&w=majority
   ```

4. **Save the file** (Ctrl+S)

---

## Step 7: Test the Connection (30 seconds)

1. **Open terminal** in VS Code (Ctrl+` or Terminal → New Terminal)

2. **Stop the server** if it's running (Ctrl+C)

3. **Start the server:**
   ```powershell
   npm run dev
   ```

4. You should see:
   ```
   ✓ Ready in 2.5s
   - Local: http://localhost:3000
   ✓ MongoDB connected successfully
   ```

✅ **If you see "MongoDB connected successfully" - YOU'RE DONE!**

---

## Step 8: Seed Sample Products (30 seconds)

1. **In terminal**, run:
   ```powershell
   npm run seed
   ```

2. You should see:
   ```
   ✓ MongoDB Connected
   ✓ Created 8 sample products
   ✓ Created 5 categories
   ✓ Database seeded successfully!
   ```

---

## Step 9: Access Your Store! 🎉

**Customer Site:**
```
http://localhost:3000
```

**Admin Panel:**
```
http://localhost:3000/admin
```

Now you can:
- ✅ Upload real product images via admin panel
- ✅ Add/edit products with prices in LKR
- ✅ Manage categories, orders, customers
- ✅ Everything works!

---

## Troubleshooting

### Error: "Authentication failed"
- Check password in connection string has no special characters causing issues
- Try surrounding password with quotes: `'password123'` if it has special chars
- Regenerate a simpler password in Atlas (avoid &, @, #, %)

### Error: "Could not connect to any servers"
- Check IP whitelist in Atlas (Security → Network Access)
- Add `0.0.0.0/0` to allow all IPs
- Wait 2-3 minutes for changes to apply

### Error: "User not authorized"
- Go to Atlas → Database Access
- Make sure user has "Atlas admin" or "Read and write to any database" role

### Still stuck?
- Take a screenshot of the error
- Check `.env.local` file has correct connection string
- Make sure you replaced `<password>` with actual password
- Ensure you added `/gizmorex` database name in the connection string

---

## What You Just Created (FREE Forever)

✅ **Cloud Database** - 512 MB storage (fits 10,000+ products)  
✅ **Automatic Backups** - Your data is safe  
✅ **Global Access** - Access from anywhere  
✅ **No Credit Card** - Completely free  
✅ **No Expiry** - Free tier never expires  

---

## Next Steps

Once your database is running:

1. **Upload Real Products** → http://localhost:3000/admin/products
2. **Add Categories** → http://localhost:3000/admin/categories  
3. **Configure Site Settings** → See ADMIN_GUIDE.md
4. **Deploy to Production** → See DEPLOYMENT_GUIDE.md (when ready)

---

**Need help?** Show me:
1. Screenshot of the error message
2. Your connection string (hide the password part)
3. What step you're stuck on

Let's get your store running! 🚀
