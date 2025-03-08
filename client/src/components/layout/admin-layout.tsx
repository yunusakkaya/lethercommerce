import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { 
  PackageSearch, 
  ShoppingBag, 
  LayoutDashboard,
  ChevronRight
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin",
  },
  {
    title: "Products",
    icon: PackageSearch,
    href: "/admin/products",
  },
  {
    title: "Orders",
    icon: ShoppingBag,
    href: "/admin/orders",
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen flex bg-[#F5F5F5]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r">
        <div className="p-6">
          <h2 className="font-playfair text-xl">Admin Panel</h2>
          <p className="text-sm text-muted-foreground">Welcome, {user.username}</p>
        </div>
        <nav className="px-4 pb-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <a
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg mb-1 transition-colors ${
                    isActive
                      ? "bg-[#8B4513] text-white"
                      : "hover:bg-muted"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.title}
                  {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
                </a>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
