import prisma from "@/lib/prisma";
import CategoryHubClient from "./CategoryHubClient";

export default async function CatalogPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return <CategoryHubClient categories={categories} />;
}
