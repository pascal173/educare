# EduCare Medical Supplies

## Deploy on Vercel + Neon (Recommended Free Stack)

1. Set **Root Directory** to `pharmaequip` in Vercel.
2. Create a free Neon project at https://neon.tech
3. Copy the connection string and add it as `DATABASE_URL` in Vercel Environment Variables.
4. Run `npx prisma db push` (locally or via a script) to create the tables.

Full guide: See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)

This stack (Vercel + Neon) is currently the smoothest free option for this project.
