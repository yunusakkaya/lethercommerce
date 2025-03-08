import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { ShoppingCart, Heart, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Navbar() {
  const { user, logoutMutation } = useAuth();

  const links = [
    { href: "/", label: "Home" },
    { href: "/catalog", label: "Shop" },
  ];

  const NavContent = () => (
    <>
      <div className="flex gap-6">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link href="/wishlist">
              <Heart className="h-5 w-5" />
            </Link>
            <Link href="/cart">
              <ShoppingCart className="h-5 w-5" />
            </Link>
            <Button
              variant="ghost"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              Logout
            </Button>
          </>
        ) : (
          <Link href="/auth">
            <Button className="bg-[#8B4513] hover:bg-[#723A0F]">Login</Button>
          </Link>
        )}
      </div>
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="font-playfair text-xl">
          LEATHER
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center justify-between flex-1 pl-6">
          <NavContent />
        </nav>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <nav className="flex flex-col gap-4">
              <NavContent />
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}