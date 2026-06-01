# Vercel Deployment Guide (Free Tier)

This project is ready to be deployed on Vercel (free Hobby plan).

## Important: Project Structure

The actual Next.js app lives inside the `pharmaequip/` folder.

When connecting this project to Vercel, you **must** set the **Root Directory** to:

```
pharmaequip
```

If you don't do this, the build will fail.

---

## Step-by-Step Deployment Instructions

### 1. Push your code to GitHub (Recommended)

- Create a new repository on GitHub.
- Push the entire `educare` folder (or at least the `pharmaequip` folder + root files).

### 2. Import Project on Vercel

1. Go to [vercel.com](https://vercel.com) and log in (use GitHub).
2. Click **"Add New Project"**.
3. Import your GitHub repository.
4. **Critical Step**: In the project settings, set:
   - **Root Directory**: `pharmaequip`
   - Framework Preset: Next.js (should auto-detect)
5. Click **Deploy**.

### 3. Add Environment Variables (Later)

You will need to add these in Vercel → Project → Settings → Environment Variables:

- `DATABASE_URL` → Your Supabase (or Neon) connection string with pooler settings.
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET` → Long random string (generate locally with `openssl rand -base64 32`)
- `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` (optional for now)

After deploying the secure admin auth changes, you can safely remove the old `NEXT_PUBLIC_ADMIN_*` variables from Vercel.

After adding variables, redeploy.

### 4. Connect Your Custom Domain (Hostinger)

After the site is live on Vercel:

1. In Vercel → Project → Settings → Domains
2. Add your domain.
3. Vercel will give you A records and a CNAME.
4. Go to your Hostinger domain DNS settings and update the records (do **not** cancel the domain).

---

## Files Already Configured for Vercel

- `package.json` has correct build script + `postinstall` for Prisma.
- `next.config.ts` has security headers.
- `vercel.json` (see below) is included for production optimizations.

---

## Current Limitations on Free Tier

- 100 GB bandwidth/month
- 100 GB-hours of function execution
- No free database (you still need Supabase or Neon free tier)

For a new/low-traffic site this is usually sufficient.

---

## After Deployment

Test these pages:
- Homepage
- `/a9kl4mq7zr2xp8vn` (Admin)
- `/request-quote`
- `/checkout`

Once the database is connected, the admin will start showing real data.

---

## Need Help?

When you return, continue from here. The main remaining tasks are:

1. Deploy to Vercel (set Root Directory = `pharmaequip`)
2. Connect Supabase/Neon database
3. Point your Hostinger domain to Vercel

Good luck!
