import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ShoppingCart, Calculator } from "lucide-react";

export default function Hero() {
  return (
    <section className="gradient-bg text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
            Smart ICT Hardware Distribution & Services
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 text-balance">
            Professional refurbishment, enterprise solutions, and cutting-edge technology services
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Shop Products
              </Button>
            </Link>
            <Link href="/trade-in">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-primary bg-transparent"
              >
                <Calculator className="mr-2 h-5 w-5" />
                Get Trade-In Quote
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
