import { PrismaClient } from "@prisma/client";

let prisma;
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.__prisma__) {
    global.__prisma__ = new PrismaClient({ log: ["query", "info", "warn", "error"] });
  }
  prisma = global.__prisma__;
}

export default prisma;
export const disconnectPrisma = async () => prisma.$disconnect();
