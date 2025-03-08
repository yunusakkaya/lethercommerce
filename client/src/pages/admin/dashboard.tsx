import { useQuery } from "@tanstack/react-query";
import { Product, Order } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Package, ShoppingBag, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const { data: products, isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: orders, isLoading: isLoadingOrders } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  if (isLoadingProducts || isLoadingOrders) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const totalProducts = products?.length || 0;
  const totalOrders = orders?.length || 0;
  const totalRevenue = orders?.reduce((sum, order) => sum + order.total, 0) || 0;

  const stats = [
    {
      title: "Total Products",
      value: totalProducts,
      icon: Package,
    },
    {
      title: "Total Orders",
      value: totalOrders,
      icon: ShoppingBag,
    },
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toFixed(2)}`,
      icon: TrendingUp,
    },
  ];

  return (
    <div>
      <h1 className="font-playfair text-3xl mb-8">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Orders */}
      <h2 className="font-playfair text-2xl mt-8 mb-4">Recent Orders</h2>
      <div className="rounded-md border">
        <div className="p-4">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left pb-4">Order ID</th>
                <th className="text-left pb-4">Status</th>
                <th className="text-left pb-4">Total</th>
                <th className="text-left pb-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders?.slice(0, 5).map((order) => (
                <tr key={order.id} className="border-b last:border-0">
                  <td className="py-4">{order.id}</td>
                  <td className="py-4">{order.status}</td>
                  <td className="py-4">${order.total.toFixed(2)}</td>
                  <td className="py-4">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
