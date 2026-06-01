# EduCare Medical Supplies

> **Important**: The actual Next.js application is inside the `pharmaequip/` folder.

## Quick Start (Local Testing)

```bash
cd pharmaequip

npm install
npm run dev
```

See [pharmaequip/VERCEL_DEPLOYMENT.md](./pharmaequip/VERCEL_DEPLOYMENT.md) for full deployment instructions.

---

## Deploying to Vercel (Free)

**This project is configured for Vercel.**

### Critical Step
When importing the project on Vercel, you **must** set:

- **Root Directory** = `pharmaequip`

See the detailed guide here:  
[pharmaequip/VERCEL_DEPLOYMENT.md](./pharmaequip/VERCEL_DEPLOYMENT.md)

### What Was Prepared for Vercel
- `vercel.json` added with production headers
- `postinstall` script for Prisma
- Security headers in `next.config.ts`
- Clear deployment instructions

---

## Current Status (May 2026)

- The app requires a database (Supabase or Neon recommended) for orders, quotes, and the admin panel.
- You are currently on a free stack path (Vercel + Supabase/Neon).
- Hostinger domain can be kept — just point DNS to Vercel later.

For full instructions on moving from Hostinger to Vercel, read the deployment guide.
