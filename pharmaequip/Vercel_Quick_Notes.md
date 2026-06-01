# Vercel Quick Notes (For When You Return)

## What I Configured For Vercel

1. Created `vercel.json` with production settings
2. Cleaned up `prisma.config.ts` (removed dependency on missing `dotenv` package)
3. Created detailed deployment guide: `VERCEL_DEPLOYMENT.md`
4. Updated root `README.md` and `pharmaequip/README.md`
5. Confirmed `postinstall` script for Prisma is already correct

## When You Come Back - Next Steps

### 1. Deploy to Vercel First (Test Without Database)

- Push code to GitHub
- Import on Vercel
- **Set Root Directory = `pharmaequip`**
- Deploy (it should build successfully even without DATABASE_URL)

### 2. Add Environment Variables Later

In Vercel dashboard, add (server-only for admin):
- DATABASE_URL (from Supabase or Neon)
- ADMIN_USERNAME
- ADMIN_PASSWORD
- ADMIN_SESSION_SECRET   (strong random string, e.g. output of `openssl rand -base64 32`)

After this secure admin change you can remove any old `NEXT_PUBLIC_ADMIN_*` variables.

### 3. Connect Your Hostinger Domain

After the site is live on Vercel, update DNS records at Hostinger.

## Current State of Database

The app still requires a database for the admin to work. 
You can deploy first, then connect the database in a second step.

Good luck!
