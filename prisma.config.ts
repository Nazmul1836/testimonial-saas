import 'dotenv/config';
import { definePrismaConfig } from "prisma/config";
import { defineConfig as orm } from "@prisma/orm-postgres/config";

export default definePrismaConfig({
  orm: orm({ 
    contract: "./src/prisma/contract.prisma",
    db: { connection: process.env.DATABASE_URL! },
  }),
  skills: {
    agents: ["claude", "cursor", "agents", "devin"],
  },
});
