import { defineConfig } from "prisma/config";

// This version does not force-load .env files.
// Vercel injects environment variables automatically at build/runtime.
// Prisma will read DATABASE_URL directly from process.env.

export default defineConfig({
  schema: "prisma/schema.prisma",
});
