# Vercel + Neon Deployment Guide

This project is configured for **Vercel (free)** + **Neon (free Postgres)**.

## 1. Deploy to Vercel

1. Push your code to GitHub (already done).
2. Go to [vercel.com](https://vercel.com) → Add New Project.
3. Import your repo.
4. **Critical**: Set **Root Directory** to `pharmaequip`.
5. Deploy.

## 2. Set Up Neon Database (Free)

1. Go to https://neon.tech and log in (you already have an account).
2. Create a new project (free tier is fine).
3. In your Neon project, copy the **Connection string**.
4. Add it in two places:
   - Locally: `.env.local` (or `.env`)
   - On Vercel: Project → Settings → Environment Variables → `DATABASE_URL`

Example connection string from Neon:
`postgresql://neondb_owner:xxxx@ep-xxx.region.aws.neon.tech/neondb?sslmode=require&channel_binding=require`

## 3. Apply Database Schema

After adding the `DATABASE_URL`:

```bash
npx prisma generate
npx prisma db push
```

This will create the tables (Order, QuoteRequest, etc.) in Neon.

## 4. Add Environment Variables on Vercel

In Vercel, add these:

- `DATABASE_URL` → Your full Neon connection string
- `NEXT_PUBLIC_ADMIN_USERNAME` → educare-owner (or change it)
- `NEXT_PUBLIC_ADMIN_PASSWORD` → Your chosen password

Redeploy after adding the variables.

## 5. Connect Custom Domain (Hostinger)

After the site is live on Vercel:
- Go to Vercel → Domains
- Add your domain
- Update the DNS records in Hostinger (A records + CNAME)

## Files Already Prepared

- `vercel.json` included
- Clean `prisma.config.ts`
- `.env.example` with Neon instructions
- Proper icon and metadata setup

## Current Limitations (Free Tier)

- Vercel: 100 GB bandwidth + 100 GB-hours functions per month
- Neon: 0.5 GB storage + limited compute on free plan

This is sufficient for a new/low-traffic site.

## Next Steps After Database is Connected

- Test the Admin page: `/a9kl4mq7zr2xp8vn`
- Test quote requests and checkout

Once the database is linked, the admin and order system will work properly.
