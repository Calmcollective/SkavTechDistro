import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import type { Product } from "@shared/schema";

interface ComparisonWidgetProps {
  products: Product[];
  onRemove: (productId: number) => void;
  onClear: () => void;
  onCompare: () => void;
}

export default function ComparisonWidget({ products, onRemove, onClear, onCompare }: ComparisonWidgetProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Compare Products ({products.length}/3)</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {products.map((product) => (
            <div key={product.id} className="relative p-4 border rounded-lg">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6"
                onClick={() => onRemove(product.id)}
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="pr-8">
                <h4 className="font-semibold text-sm">{product.name}</h4>
                <p className="text-primary font-bold">${product.price.toLocaleString()}</p>
                <Badge variant={product.condition === "new" ? "default" : "secondary"} className="mt-1">
                  {product.condition}
                </Badge>
              </div>
            </div>
          ))}
          
          {/* Empty slots */}
          {Array.from({ length: 3 - products.length }).map((_, index) => (
            <div key={`empty-${index}`} className="p-4 border-2 border-dashed border-neutral-200 rounded-lg flex items-center justify-center text-neutral-400">
              <span className="text-sm">Add product to compare</span>
            </div>
          ))}
        </div>
        
        <Button 
          onClick={onCompare}
          disabled={products.length < 2}
          className="w-full"
        >
          Compare Selected Products
        </Button>
      </CardContent>
    </Card>
  );
}
