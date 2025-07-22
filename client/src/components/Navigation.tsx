import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, User, ShoppingCart, Wrench, BarChart3, Truck, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import skavtechLogo from "../assets/skavtech-logo.png";

export default function Navigation() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { name: "Home", href: "/", icon: ShoppingCart },
    { name: "Products", href: "/products", icon: ShoppingCart },
    { name: "Trade-In", href: "/trade-in", icon: Truck },
    { name: "Services", href: "/services", icon: Wrench },
    { name: "Admin", href: "/admin", icon: BarChart3 },
    { name: "Fleet", href: "/fleet", icon: Truck },
  ];

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img 
              src={skavtechLogo} 
              alt="Skavtech Solutions Ltd" 
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "text-primary bg-primary/10"
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/signup">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Sign Up
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Sign In
              </Button>
            </Link>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="md:hidden">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-6 border-b">
                  <span className="text-lg font-semibold">Menu</span>
                </div>
                
                <div className="flex-1 py-6">
                  <div className="space-y-2">
                    {navigation.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center space-x-3 px-6 py-3 text-sm font-medium transition-colors ${
                            isActive(item.href)
                              ? "text-primary bg-primary/10 border-r-2 border-primary"
                              : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile Auth Buttons */}
                <div className="border-t p-6 space-y-3">
                  <Link href="/signup" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Sign Up
                    </Button>
                  </Link>
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <Button className="w-full flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}