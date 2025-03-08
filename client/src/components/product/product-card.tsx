import { Product } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/product/${product.id}`}>
      <Card className="group cursor-pointer overflow-hidden">
        <div className="aspect-square overflow-hidden bg-muted">
          <img
            src={product.images[0]}
            alt={product.name}
            className="object-cover w-full h-full transition-transform group-hover:scale-105"
          />
        </div>
        <CardContent className="p-4">
          <h3 className="font-medium truncate">{product.name}</h3>
          <p className="text-muted-foreground">${product.price}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
