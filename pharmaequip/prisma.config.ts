import { defineConfig } from "prisma/config";
import dotenv from "dotenv";

// Load environment variables explicitly.
// This ensures DATABASE_URL is available during prisma generate on Vercel and locally.
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" }); // fallback

export default defineConfig({
  schema: "prisma/schema.prisma",
});
