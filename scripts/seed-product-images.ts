import prisma from "../src/lib/prisma";
import * as fs from "fs";
import * as path from "path";
// @ts-expect-error no types for googlethis
import google from "googlethis";

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function downloadImage(url: string, filepath: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7"
      }
    });
    if (!res.ok) return false;
    
    // Check if it's an image
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.startsWith("image/")) {
      return false;
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Prevent 1px tracker images
    if (buffer.length < 5000) return false; 

    fs.writeFileSync(filepath, buffer);
    return true;
  } catch (e) {
    return false;
  }
}

async function run() {
  console.log("Fetching products from remote Turso database...");
  const products = await prisma.product.findMany();
  console.log(`Found ${products.length} products to process.`);

  let successCount = 0;

  for (const product of products) {
    // If it already has a local product image, skip it 
    if (product.imageUrl && product.imageUrl.startsWith("/products/")) {
      console.log(`Skipping [${product.name}], already has a local image.`);
      continue;
    }

    const query = `${product.brand} ${product.name} front side transparent png hardware`;
    console.log(`\n🔍 Searching: ${query}`);

    try {
      const options = {
        page: 0,
        safe: false,
        additional_params: {
          tbs: "ic:trans", // Transparent background
        },
      };

      const results = await google.image(query, options);
      if (!results || results.length === 0) {
        console.log("❌ No images found.");
        continue;
      }

      let downloaded = false;
      // Try top 3 links until one works
      for (let i = 0; i < Math.min(3, results.length); i++) {
        const url = results[i].url;
        const ext = "png"; // Force png since we know it's transparent
        const filename = `${product.id}.${ext}`;
        const filepath = path.join(process.cwd(), "public", "products", filename);

        console.log(`  Downloading attempt ${i + 1}: ${url}`);
        const success = await downloadImage(url, filepath);

        if (success) {
          downloaded = true;
          // Successfully retrieved genuine image buffer cleanly!
          // Map to database permanently.
          const localUrl = `/products/${filename}`;
          await prisma.product.update({
            where: { id: product.id },
            data: { imageUrl: localUrl },
          });
          console.log(`✅ Success! Bound image remotely to DB: ${localUrl}`);
          successCount++;
          break; // Stop trying other URLs for this product
        } else {
            console.log(`  Failed or invalid format. Trying next...`);
        }
      }

      if (!downloaded) {
        console.log(`❌ All attempts failed for ${product.name}`);
      }

    } catch (error) {
       console.error(`❌ Error scraping ${product.name}:`, error);
    }

    // Delay 2 seconds to respect Google crawl budgets and bypass 429
    await delay(2000);
  }

  console.log(`\n🎉 Finished! Successfully scraped and bound images for ${successCount} out of ${products.length} products!`);
}

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
