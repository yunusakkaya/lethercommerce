import { useQuery, useMutation } from "@tanstack/react-query";
import { Product, CartItem } from "@shared/schema";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Loader2, Heart, ShoppingCart, Minus, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";

export default function ProductPage() {
  const [, params] = useRoute("/product/:id");
  const { toast } = useToast();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState(0);

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: [`/api/products/${params?.id}`],
  });

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/cart", {
        productId: product!.id,
        quantity,
      });
      return res.json() as Promise<CartItem>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: `${quantity} x ${product?.name} added to your cart`,
      });
    },
  });

  const addToWishlistMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/wishlist", {
        productId: product!.id,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({
        title: "Added to wishlist",
        description: `${product?.name} added to your wishlist`,
      });
    },
  });

  if (isLoading || !product) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="grid md:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg bg-muted">
            <img
              src={product.images[currentImage]}
              alt={product.name}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((image, i) => (
              <button
                key={i}
                onClick={() => setCurrentImage(i)}
                className={`aspect-square rounded-lg overflow-hidden bg-muted ${
                  i === currentImage ? "ring-2 ring-[#8B4513]" : ""
                }`}
              >
                <img src={image} alt="" className="object-cover w-full h-full" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="font-playfair text-3xl mb-2">{product.name}</h1>
            <p className="text-2xl font-semibold">${product.price}</p>
          </div>

          <p className="text-muted-foreground">{product.description}</p>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-4">
              <Button
                className="flex-1 bg-[#8B4513] hover:bg-[#723A0F]"
                onClick={() => addToCartMutation.mutate()}
                disabled={!user || addToCartMutation.isPending}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
              <Button
                variant="outline"
                onClick={() => addToWishlistMutation.mutate()}
                disabled={!user || addToWishlistMutation.isPending}
              >
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="pt-6 border-t">
            <h3 className="font-semibold mb-2">Product Details</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Category: {product.category}</li>
              <li>Stock: {product.stock} available</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}