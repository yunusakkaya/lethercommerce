import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import ProductGrid from "@/components/product/product-grid";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function CatalogPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const filteredProducts = products?.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
                         product.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || product.category === category;
    return matchesSearch && matchesCategory;
  });

  const categories = products ? Array.from(new Set(products.map(p => p.category))) : [];

  return (
    <div className="container py-8">
      <h1 className="font-playfair text-4xl mb-8">Our Collection</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="max-w-[200px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <p className="text-muted-foreground mb-6">
            {filteredProducts?.length} products found
          </p>
          <ProductGrid products={filteredProducts} />
        </>
      )}
    </div>
  );
}
