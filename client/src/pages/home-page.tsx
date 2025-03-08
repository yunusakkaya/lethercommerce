import { Button } from "@/components/ui/button";
import ProductGrid from "@/components/product/product-grid";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative h-[70vh] flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${"https://images.unsplash.com/photo-1518112390430-f4ab02e9c2c8"})`
        }}
      >
        <div className="text-center text-white space-y-6">
          <h1 className="font-playfair text-5xl md:text-6xl">
            Artisanal Leather Craftsmanship
          </h1>
          <p className="text-lg max-w-2xl mx-auto">
            Discover our collection of handcrafted leather goods, made with precision and care
          </p>
          <Link href="/catalog">
            <Button size="lg" className="bg-[#8B4513] hover:bg-[#723A0F]">
              Shop Collection
            </Button>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-playfair text-3xl">Featured Products</h2>
          <Link href="/catalog" className="flex items-center gap-2 text-[#8B4513] hover:text-[#723A0F]">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <ProductGrid products={products?.slice(0, 4)} />
      </section>

      {/* Craftsmanship Section */}
      <section className="bg-[#D4B996] py-16">
        <div className="container grid md:grid-cols-2 gap-12 items-center">
          <div>
            <img 
              src="https://images.unsplash.com/photo-1473188588951-666fce8e7c68"
              alt="Leather craftsmanship"
              className="rounded-lg shadow-xl"
            />
          </div>
          <div className="space-y-6">
            <h2 className="font-playfair text-3xl">Our Craftsmanship</h2>
            <p className="text-lg text-gray-800">
              Each piece is meticulously handcrafted by skilled artisans using the finest leather materials.
              Our commitment to quality ensures that every product tells a story of tradition and excellence.
            </p>
            <Link href="/catalog">
              <Button variant="outline" size="lg">
                Explore Our Work
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
