import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Search, ChevronDown } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { FilterSidebar } from "@/components/FilterSidebar";
import { CategorySwitcher } from "@/components/CategorySwitcher";
import { CatalogSearch } from "@/components/CatalogSearch";
import { CatalogSort } from "@/components/CatalogSort";
import { Pagination } from "@/components/catalog/Pagination";
import { notFound } from "next/navigation";

// Explicit type boundary bridging Prisma's output to the Component props
export interface ProductPayload {
  id: string;
  name: string;
  brand: string;
  price: number;
  imageUrl: string;
  specsJson: string;
  categoryId: string;
  isActive: boolean;
  discountPercent?: number | null;
  discountEndsAt?: Date | null;
  category: {
    id: string;
    name: string;
    icon: string;
    description: string | null;
  };
}

export type FilterConfig = {
  brands: string[];
  checkboxes: Record<string, string[]>;
  ranges: Record<string, { min: number, max: number }>;
};

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { category } = await params;
  const currentSearchParams = await searchParams;
  
  // Transform URL slug back to name (e.g. "cpu-cooler" -> "CPU Cooler")
  const decodedCategory = decodeURIComponent(category).replace(/-/g, ' ');

  // 1. Identify category ID securely and case-insensitively using the database engine directly
  const dbMatch = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM Category WHERE LOWER(name) = LOWER(${decodedCategory}) LIMIT 1
  `;

  if (!dbMatch || dbMatch.length === 0) return notFound();

  // Extract array of active brand filters from URL
  const activeBrands = currentSearchParams.brand 
    ? (Array.isArray(currentSearchParams.brand) ? currentSearchParams.brand : [currentSearchParams.brand]) 
    : [];

  // Build dynamic Prisma where clause
  const productFilter: any = { isActive: true };
  if (activeBrands.length > 0) {
    productFilter.brand = { in: activeBrands };
  }

  const categoryBase = await prisma.category.findUnique({
     where: { id: dbMatch[0].id }
  });

  if (!categoryBase) return notFound();

  const pass1Products = await prisma.product.findMany({
    where: { categoryId: dbMatch[0].id, ...productFilter },
    select: { id: true, name: true, brand: true, price: true, discountPercent: true, specsJson: true }
  });

  const finalData = { ...categoryBase, products: pass1Products };

  // Determine all permanent brands & specs for the sidebar regardless of current filter selection
  const absoluteProductsQuery = await prisma.product.findMany({
    where: { categoryId: dbMatch[0].id, isActive: true },
    select: { brand: true, specsJson: true }
  });

  const allBrands = Array.from(new Set<string>(absoluteProductsQuery.map((b: { brand: string }) => b.brand)));

  // Fetch all categories for the dropdown switcher
  const allCategories = await prisma.category.findMany({ select: { name: true } });
  const categoryOptions = allCategories.map(c => ({
    name: c.name,
    slug: c.name.toLowerCase().replace(/ /g, '-')
  }));

  // Dynamic Deducer
  const dynamicCheckboxes: Record<string, Set<string>> = {};
  const dynamicRanges: Record<string, { min: number, max: number }> = {};

  absoluteProductsQuery.forEach((p: { brand: string, specsJson: string }) => {
    let specs: Record<string, any> = {};
    if (p.specsJson) {
      try { specs = JSON.parse(p.specsJson); } catch(e) {}
    }
    
    Object.entries(specs).forEach(([key, value]) => {
      if (key === 'type') return; // Core structural routing field, ignore for UI
      if (typeof value === 'string') {
        if (!dynamicCheckboxes[key]) dynamicCheckboxes[key] = new Set();
        dynamicCheckboxes[key].add(value);
      } else if (typeof value === 'number') {
        if (!dynamicRanges[key]) {
           dynamicRanges[key] = { min: value, max: value };
        } else {
           if (value < dynamicRanges[key].min) dynamicRanges[key].min = value;
           if (value > dynamicRanges[key].max) dynamicRanges[key].max = value;
        }
      }
    });
  });

  const filterConfig: FilterConfig = {
    brands: allBrands,
    checkboxes: Object.fromEntries(Object.entries(dynamicCheckboxes).map(([k, v]) => [k, Array.from<string>(v as Set<string>)])),
    ranges: Object.fromEntries(Object.entries(dynamicRanges).filter(([, bounds]) => bounds.min !== bounds.max))
  };

  const searchQuery = currentSearchParams['q'] ? (currentSearchParams['q'] as string).toLowerCase() : '';
  const sortParam = currentSearchParams['sort'] as string;

  // In-memory Filter for Dynamic Specs driven by URL
  // We use this because SQLite cannot query nested JSON cleanly
  const finalFilteredProducts = finalData.products.filter((product: any) => {
    let specs: Record<string, any> = {};
    if (product.specsJson) {
       try { specs = JSON.parse(product.specsJson); } catch (e) {}
    }

    // 0. Name/Brand text match
    if (searchQuery) {
       if (!product.name.toLowerCase().includes(searchQuery) && !product.brand.toLowerCase().includes(searchQuery)) {
          return false;
       }
    }

    // 1. Check dynamic strings (Checkbox arrays)
    for (const key of Object.keys(filterConfig.checkboxes)) {
      const activeParam = currentSearchParams[key];
      if (!activeParam) continue;
      
      const activeValues = Array.isArray(activeParam) ? activeParam : [activeParam];
      if (activeValues.length === 0) continue;
      
      const productValue = specs[key];
      if (!productValue || !activeValues.includes(productValue as string)) {
        return false; // Automatically prunes out products failing any URL string filter
      }
    }

    // 2. Check dynamic numbers (Range parameters)
    for (const key of Object.keys(filterConfig.ranges)) {
      const minParam = currentSearchParams[`min_${key}`];
      const maxParam = currentSearchParams[`max_${key}`];
      
      if (!minParam && !maxParam) continue;
      
      const productValue = specs[key] as number;
      if (productValue === undefined) return false;

      if (minParam) {
        const minVal = parseFloat(minParam as string);
        if (!isNaN(minVal) && productValue < minVal) return false;
      }
      if (maxParam) {
        const maxVal = parseFloat(maxParam as string);
        if (!isNaN(maxVal) && productValue > maxVal) return false;
      }
    }

    return true;
  });

  // 3. Sort override execution
  if (sortParam) {
    if (sortParam === 'price_asc') {
      finalFilteredProducts.sort((a, b) => {
        const aPrice = a.discountPercent ? a.price * (1 - a.discountPercent / 100) : a.price;
        const bPrice = b.discountPercent ? b.price * (1 - b.discountPercent / 100) : b.price;
        return aPrice - bPrice;
      });
    } else if (sortParam === 'price_desc') {
      finalFilteredProducts.sort((a, b) => {
        const aPrice = a.discountPercent ? a.price * (1 - a.discountPercent / 100) : a.price;
        const bPrice = b.discountPercent ? b.price * (1 - b.discountPercent / 100) : b.price;
        return bPrice - aPrice;
      });
    } else if (sortParam === 'name_asc') {
      finalFilteredProducts.sort((a, b) => a.name.localeCompare(b.name));
    }
  }

  const ITEMS_PER_PAGE = 24;
  const pageParam = currentSearchParams['page'];
  const currentPage = pageParam ? Math.max(1, parseInt(pageParam as string) || 1) : 1;
  const totalItems = finalFilteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  const paginatedLightweightProducts = finalFilteredProducts.slice(offset, offset + ITEMS_PER_PAGE);
  const paginatedIds = paginatedLightweightProducts.map((p: any) => p.id);

  const heavyProducts = await prisma.product.findMany({
    where: { id: { in: paginatedIds } },
    include: { category: true }
  });

  // Re-sort the heavy products to match the precisely sorted paginatedIds
  const orderedHeavyProducts = paginatedIds.map((id: string) => heavyProducts.find(p => p.id === id)!).filter(Boolean) as ProductPayload[];

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
      {/* Left Filter Sidebar */}
      <FilterSidebar config={filterConfig} />

      {/* Main Product Area */}
      <div className="flex-1 space-y-6 min-w-0 w-full">
        
        {/* Top Header Controls */}
        <div className="flex items-center justify-between gap-2 bg-surface p-2 rounded-lg border border-border relative z-40">
          <Link href="/catalog" className="flex items-center gap-2 text-zinc-400 hover:text-white font-medium text-sm px-2 sm:px-4 shrink-0" aria-label="Back to Categories">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden md:inline">Back to Categories</span>
          </Link>
          
          <div className="flex items-center gap-2 min-w-0">
            <CategorySwitcher 
              currentCategoryName={finalData.name} 
              categories={categoryOptions} 
            />
            <CatalogSort />
            <CatalogSearch />
          </div>
        </div>

        {/* Active Search Indicator */}
        {searchQuery && (
          <div className="flex items-center gap-2 px-2 text-sm text-zinc-400 mt-2 mb-4 animate-in fade-in duration-300">
            <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full border border-border bg-surface text-brand">
              <Search className="w-3 h-3" />
            </span>
            <span className="truncate">
              Showing results containing <strong className="text-white font-medium">"{searchQuery}"</strong>
            </span>
          </div>
        )}

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
           {orderedHeavyProducts.map((product: ProductPayload) => (
              <ProductCard key={product.id} product={product} />
           ))}
        </div>
        
        <Pagination currentPage={currentPage} totalPages={totalPages} />
        
      </div>
    </div>
  );
}
