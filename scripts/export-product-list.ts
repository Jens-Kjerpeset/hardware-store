import prisma from "../src/lib/prisma";
import * as fs from "fs";
import * as path from "path";

async function run() {
  console.log("Fetching products from remote Turso database...");
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: [
      { category: { name: 'asc' } },
      { brand: 'asc' },
      { name: 'asc' }
    ]
  });

  console.log(`Found ${products.length} products. Generating document...`);

  let content = "=== HARDWARE STORE: PRODUCTS NEEDING IMAGES ===\n\n";
  
  let currentCategory = "";
  
  for (const p of products) {
    const catName = p.category?.name || "Uncategorized";
    if (catName !== currentCategory) {
      if (currentCategory !== "") content += "\n";
      content += `[ ${catName.toUpperCase()} ]\n`;
      content += `------------------------------------------------\n`;
      currentCategory = catName;
    }
    content += `- ${p.brand} ${p.name}\n`;
  }

  const outputPath = path.join(process.cwd(), "products_needing_images.txt");
  fs.writeFileSync(outputPath, content, "utf-8");
  
  console.log(`Successfully wrote to ${outputPath}`);
}

run()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
