import { createClient } from "@libsql/client";
import fs from "fs";
import "dotenv/config";

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    throw new Error("Missing Env");
  }

  console.log("Connecting to", url);

  const client = createClient({ url, authToken });
  const sql = fs.readFileSync("prisma/migrate.sql", "utf-8");

  await client.executeMultiple(sql);
  console.log("Migration executed!");
}

main().catch(console.error);
