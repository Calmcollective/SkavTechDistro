import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { path: "/products", label: "Products" },
    { path: "/trade-in", label: "Trade-In" },
    { path: "/services", label: "Services" },
    { path: "/admin", label: "Admin" },
    { path: "/fleet", label: "Fleet Portal" },
  ];

  const NavLink = ({ path, label, mobile = false }: { path: string; label: string; mobile?: boolean }) => {
    const isActive = location === path;
    const baseClasses = "nav-link transition-colors font-medium";
    const desktopClasses = "text-neutral-900 hover:text-primary px-3 py-2 rounded-md text-sm";
    const mobileClasses = "block text-neutral-900 hover:text-primary px-3 py-2 rounded-md text-base";
    const activeClasses = isActive ? "text-primary" : "";

    return (
      <Link
        href={path}
        className={`${baseClasses} ${mobile ? mobileClasses : desktopClasses} ${activeClasses}`}
        onClick={() => mobile && setIsOpen(false)}
      >
        {label}
      </Link>
    );
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="text-2xl font-bold text-primary flex items-center">
              <svg className="w-8 h-8 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 10.5V19h2v-1.5c5.16-.76 9-4.95 9-10.5V7l-10-5z"/>
              </svg>
              Skavtech
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <NavLink key={item.path} path={item.path} label={item.label} />
              ))}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col space-y-1 mt-6">
                  {navItems.map((item) => (
                    <NavLink key={item.path} path={item.path} label={item.label} mobile />
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
