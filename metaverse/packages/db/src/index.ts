// lib/prisma.ts

import { PrismaClient } from "./generated/prisma";



const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const dbClient =
  globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = dbClient;