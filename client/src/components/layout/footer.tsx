import { Facebook, Instagram } from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-white border-t mt-auto">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="font-playfair text-lg mb-4">About Us</h3>
            <p className="text-muted-foreground">
              Crafting premium leather goods with passion and dedication to quality since 1995.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-playfair text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/catalog">
                  <a className="text-muted-foreground hover:text-foreground transition-colors">
                    Shop Collection
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/about">
                  <a className="text-muted-foreground hover:text-foreground transition-colors">
                    Our Story
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <a className="text-muted-foreground hover:text-foreground transition-colors">
                    Contact Us
                  </a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Social & Contact */}
          <div>
            <h3 className="font-playfair text-lg mb-4">Connect With Us</h3>
            <div className="flex gap-4 mb-4">
              <a
                href="https://instagram.com/leathergoods"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-[#E1306C] transition-colors"
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a
                href="https://facebook.com/leathergoods"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-[#1877F2] transition-colors"
              >
                <Facebook className="h-6 w-6" />
              </a>
            </div>
            <p className="text-muted-foreground">
              Email: contact@leathergoods.com<br />
              Phone: +1 (555) 123-4567
            </p>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Leather Goods. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
