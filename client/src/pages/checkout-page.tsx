import { useQuery } from "@tanstack/react-query";
import { CartItem, Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";

const shippingSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "ZIP code is required"),
  phone: z.string().min(1, "Phone number is required"),
});

export default function CheckoutPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: cartItems, isLoading: isLoadingCart } = useQuery<CartItem[]>({
    queryKey: ["/api/cart"],
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const form = useForm({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      fullName: "",
      email: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
    },
  });

  const getProduct = (productId: number) => {
    return products?.find(p => p.id === productId);
  };

  const calculateTotal = () => {
    return cartItems?.reduce((total, item) => {
      const product = getProduct(item.productId);
      return total + (product?.price || 0) * item.quantity;
    }, 0) || 0;
  };

  const onSubmit = async (data: z.infer<typeof shippingSchema>) => {
    try {
      // Create order
      await apiRequest("POST", "/api/orders", {
        items: cartItems?.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        total: calculateTotal(),
        status: "pending",
        shippingAddress: `${data.address}, ${data.city}, ${data.state} ${data.zipCode}`,
        createdAt: new Date().toISOString(),
      });

      toast({
        title: "Order placed successfully",
        description: "Thank you for your purchase!",
      });

      // Clear cart and redirect to confirmation
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      setLocation("/");
    } catch (error) {
      toast({
        title: "Error placing order",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  if (isLoadingCart) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!cartItems?.length) {
    setLocation("/cart");
    return null;
  }

  return (
    <div className="container py-8">
      <h1 className="font-playfair text-3xl mb-8">Checkout</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Shipping Information */}
        <div>
          <h2 className="font-playfair text-xl mb-4">Shipping Information</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP Code</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-[#8B4513] hover:bg-[#723A0F]"
              >
                Place Order
              </Button>
            </form>
          </Form>
        </div>

        {/* Order Summary */}
        <div>
          <h2 className="font-playfair text-xl mb-4">Order Summary</h2>
          <div className="border rounded-lg p-6 space-y-4">
            {cartItems?.map(item => {
              const product = getProduct(item.productId);
              if (!product) return null;

              return (
                <div key={item.id} className="flex justify-between">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <p>${(product.price * item.quantity).toFixed(2)}</p>
                </div>
              );
            })}
            <div className="border-t pt-4 flex justify-between font-semibold">
              <span>Total</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
