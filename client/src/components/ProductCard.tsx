import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scale, MessageSquare, Shield } from "lucide-react";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
  onCompare: (product: Product) => void;
  isComparing: boolean;
}

export default function ProductCard({ product, onCompare, isComparing }: ProductCardProps) {
  const [isImageLoading, setIsImageLoading] = useState(true);

  const handleRequestQuote = () => {
    // TODO: Implement quote request modal or navigation
    console.log("Request quote for", product.name);
  };

  return (
    <Card className="product-card overflow-hidden hover:shadow-xl transition-shadow">
      <div className="relative">
        {isImageLoading && (
          <div className="w-full h-48 bg-neutral-200 animate-pulse" />
        )}
        <img 
          src={product.imageUrl || "/api/placeholder/400/300"} 
          alt={product.name}
          className={`w-full h-48 object-cover ${isImageLoading ? 'hidden' : 'block'}`}
          onLoad={() => setIsImageLoading(false)}
          onError={() => setIsImageLoading(false)}
        />
      </div>
      
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold text-neutral-900">{product.name}</h3>
          <Badge variant={product.condition === "new" ? "default" : "secondary"}>
            {product.condition === "new" ? "New" : "Refurbished"}
          </Badge>
        </div>
        
        <p className="text-neutral-600 mb-4 text-sm">{product.description}</p>
        
        <div className="flex justify-between items-center mb-4">
          <span className="text-2xl font-bold text-primary">${product.price.toLocaleString()}</span>
          {product.originalPrice && (
            <span className="text-neutral-500 line-through">${product.originalPrice.toLocaleString()}</span>
          )}
        </div>
        
        <div className="flex gap-2 mb-4">
          <Button onClick={handleRequestQuote} className="flex-1">
            <MessageSquare className="mr-2 h-4 w-4" />
            Request Quote
          </Button>
          <Button 
            variant={isComparing ? "default" : "outline"}
            size="icon"
            onClick={() => onCompare(product)}
            title="Add to Compare"
          >
            <Scale className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center text-sm text-neutral-600">
          <Shield className="h-4 w-4 text-secondary mr-2" />
          <span>{product.warrantyYears}-Year Warranty</span>
        </div>
      </CardContent>
    </Card>
  );
}
