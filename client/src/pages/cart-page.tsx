import { useQuery, useMutation } from "@tanstack/react-query";
import { CartItem, Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, Minus, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";

export default function CartPage() {
  const { toast } = useToast();

  const { data: cartItems, isLoading } = useQuery<CartItem[]>({
    queryKey: ["/api/cart"],
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      const res = await apiRequest("PATCH", `/api/cart/${id}`, { quantity });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/cart/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Item removed",
        description: "The item has been removed from your cart",
      });
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const total = calculateTotal();
      const items = cartItems?.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      const res = await apiRequest("POST", "/api/orders", {
        items,
        total,
        status: "pending",
        shippingAddress: "Test Address", // In a real app, this would come from a form
        createdAt: new Date().toISOString(),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Order placed successfully",
        description: "Thank you for your purchase!",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const getProduct = (productId: number) => {
    return products?.find(p => p.id === productId);
  };

  const calculateTotal = () => {
    return cartItems?.reduce((total, item) => {
      const product = getProduct(item.productId);
      return total + (product?.price || 0) * item.quantity;
    }, 0) || 0;
  };

  if (!cartItems?.length) {
    return (
      <div className="container py-12 text-center">
        <h1 className="font-playfair text-3xl mb-4">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-8">
          Looks like you haven't added any items to your cart yet.
        </p>
        <Link href="/catalog">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="font-playfair text-4xl mb-8">Shopping Cart</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          {cartItems?.map(item => {
            const product = getProduct(item.productId);
            if (!product) return null;

            return (
              <div
                key={item.id}
                className="flex gap-4 p-4 border rounded-lg"
              >
                <div className="w-24 h-24 bg-muted rounded-md overflow-hidden">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="flex-1">
                  <Link href={`/product/${product.id}`}>
                    <h3 className="font-medium hover:text-[#8B4513] cursor-pointer">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-muted-foreground">
                    ${product.price}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        updateQuantityMutation.mutate({
                          id: item.id,
                          quantity: Math.max(1, item.quantity - 1),
                        })
                      }
                      disabled={updateQuantityMutation.isPending}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        updateQuantityMutation.mutate({
                          id: item.id,
                          quantity: Math.min(product.stock, item.quantity + 1),
                        })
                      }
                      disabled={updateQuantityMutation.isPending}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-auto text-destructive"
                      onClick={() => removeItemMutation.mutate(item.id)}
                      disabled={removeItemMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="h-fit sticky top-20 p-6 border rounded-lg space-y-4">
          <h2 className="font-playfair text-xl">Order Summary</h2>
          <div className="flex justify-between py-4 border-t">
            <span>Total</span>
            <span className="font-semibold">${calculateTotal().toFixed(2)}</span>
          </div>
          <Button
            className="w-full bg-[#8B4513] hover:bg-[#723A0F]"
            onClick={() => checkoutMutation.mutate()}
            disabled={checkoutMutation.isPending}
          >
            {checkoutMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Proceed to Checkout
          </Button>
          <Link href="/catalog">
            <Button variant="outline" className="w-full">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}