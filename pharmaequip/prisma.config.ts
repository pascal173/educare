import { defineConfig } from "prisma/config";

// Note: On Vercel, environment variables are injected automatically.
// We no longer force-load .env files here to avoid build issues.

export default defineConfig({
  schema: "prisma/schema.prisma",
});
