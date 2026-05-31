import { defineConfig } from "prisma/config";
import dotenv from "dotenv";

// Load environment variables from .env.local first, then .env
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" }); // fallback

export default defineConfig({
  schema: "prisma/schema.prisma",
});
