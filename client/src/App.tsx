import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";

import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import CatalogPage from "@/pages/catalog-page";
import ProductPage from "@/pages/product-page";
import CartPage from "@/pages/cart-page";
import CheckoutPage from "@/pages/checkout-page";
import NotFound from "@/pages/not-found";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

// Admin Pages
import AdminLayout from "@/components/layout/admin-layout";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminProducts from "@/pages/admin/products";
import AdminOrders from "@/pages/admin/orders";

function AdminRoute({ 
  component: Component 
}: { 
  component: () => React.JSX.Element;
}) {
  return (
    <ProtectedRoute
      path="*"
      component={() => (
        <AdminLayout>
          <Component />
        </AdminLayout>
      )}
    />
  );
}

function Router() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
      <Switch>
        {/* Admin Routes */}
        <Route path="/admin">
          <AdminRoute component={AdminDashboard} />
        </Route>
        <Route path="/admin/products">
          <AdminRoute component={AdminProducts} />
        </Route>
        <Route path="/admin/orders">
          <AdminRoute component={AdminOrders} />
        </Route>

        {/* Public Routes */}
        <Route>
          <Navbar />
          <main className="flex-1">
            <Switch>
              <Route path="/" component={HomePage} />
              <Route path="/auth" component={AuthPage} />
              <Route path="/catalog" component={CatalogPage} />
              <Route path="/product/:id" component={ProductPage} />
              <ProtectedRoute path="/cart" component={CartPage} />
              <ProtectedRoute path="/checkout" component={CheckoutPage} />
              <Route component={NotFound} />
            </Switch>
          </main>
          <Footer />
        </Route>
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;