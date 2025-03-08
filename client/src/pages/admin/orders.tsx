import { useQuery, useMutation } from "@tanstack/react-query";
import { Order } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

export default function AdminOrders() {
  const { toast } = useToast();

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/orders/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Order updated",
        description: "The order status has been updated successfully",
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

  return (
    <div>
      <h1 className="font-playfair text-3xl mb-8">Orders</h1>

      <div className="rounded-md border">
        <div className="p-4">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left pb-4">Order ID</th>
                <th className="text-left pb-4">Customer</th>
                <th className="text-left pb-4">Status</th>
                <th className="text-left pb-4">Total</th>
                <th className="text-left pb-4">Date</th>
                <th className="text-left pb-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders?.map((order) => (
                <tr key={order.id} className="border-b last:border-0">
                  <td className="py-4">{order.id}</td>
                  <td className="py-4">User {order.userId}</td>
                  <td className="py-4">
                    <Select
                      value={order.status}
                      onValueChange={(status) =>
                        updateOrderStatusMutation.mutate({
                          id: order.id,
                          status,
                        })
                      }
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ORDER_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="py-4">${order.total.toFixed(2)}</td>
                  <td className="py-4">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // View order details (to be implemented)
                      }}
                    >
                      View Details
                    </Button>
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
