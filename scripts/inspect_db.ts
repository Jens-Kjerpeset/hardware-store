import { PrismaClient } from "@prisma/client";
import { createClient } from "@libsql/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import * as dotenv from "dotenv";

dotenv.config();

const url = process.env.TURSO_DATABASE_URL || "file:./dev.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

const libsql = createClient({ url, authToken: authToken || undefined });
const adapter = new PrismaLibSQL(libsql);
const prisma = new PrismaClient({ adapter });

async function main() {
  const products = await prisma.product.findMany({
    where: { category: { name: "Storage" } }
  });

  products.forEach((p: any) => {
    console.log(`- ${p.name}: ${p.specsJson}`);
  });
}
main().catch(console.error).finally(() => prisma.$disconnect());
