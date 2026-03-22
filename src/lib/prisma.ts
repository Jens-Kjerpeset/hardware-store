import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const prismaClientSingleton = () => {
  const adapter = new PrismaLibSql({
    url: process.env.TURSO_DATABASE_URL || "libsql://hardware-store-jens-kjerpeset.aws-eu-west-1.turso.io",
    authToken: process.env.TURSO_AUTH_TOKEN || "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzM3MDA3NTksImlkIjoiMDE5Y2Y4Y2MtNzAwMS03Y2NmLWIzZGQtN2MzYTU2M2YwNTdjIiwicmlkIjoiOGQ3YjZlNTUtZTc5Ny00ZjJlLWExNmItZjkwMTY0OTVkYTgwIn0._zIe_AptGz9NhnLZM4YXRX6MIivfIZhPw_uus0L0sg00FRAOjFeqwC_Nccp59DYFOAmaxAhZNnq9PyXef9RBDQ",
  });
  return new PrismaClient({ adapter });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
