// Products listing page — fetches all data once server-side, delegates filtering to client.
import { getProducts, getCategoryTree } from '../../lib/api';
import { ProductsPageClient } from '../../components/ProductsPageClient';

interface ProductsPageProps {
  searchParams: Promise<{ region?: string; type?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { region, type } = await searchParams;
  const [allProducts, categoryTree] = await Promise.all([
    getProducts(),
    getCategoryTree(),
  ]);

  return (
    <ProductsPageClient
      allProducts={allProducts}
      categoryTree={categoryTree}
      initialRegion={region}
      initialType={type}
    />
  );
}
