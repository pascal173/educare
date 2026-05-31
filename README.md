# EduCare Medical Supplies

The actual Next.js app is inside the `pharmaequip/` folder.

## Recommended Stack (Free)

- **Hosting**: Vercel (free)
- **Database**: Neon (free Postgres) – Recommended
- Alternative: Supabase (also free)

## Quick Start (Local)

```bash
cd pharmaequip
npm install
npm run dev
```

See `pharmaequip/VERCEL_DEPLOYMENT.md` for full deployment + Neon setup instructions.

## Important

- Set **Root Directory = `pharmaequip`** when deploying to Vercel.
- The project requires a Postgres database (Neon or Supabase) for orders, quotes, and the admin panel to work.
