import { Product } from "@shared/schema";
import ProductCard from "./product-card";
import { Loader2 } from "lucide-react";

interface ProductGridProps {
  products?: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  if (!products) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
