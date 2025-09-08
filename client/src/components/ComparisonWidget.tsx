import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, BarChart3 } from "lucide-react";
import ComparisonModal from "./ComparisonModal";
import type { Product } from "@shared/schema";

interface ComparisonWidgetProps {
  products: Product[];
  onRemove: (productId: number) => void;
  onClear: () => void;
  onCompare: () => void;
}

export default function ComparisonWidget({ products, onRemove, onClear, onCompare }: ComparisonWidgetProps) {
  const [showComparison, setShowComparison] = useState(false);

  if (products.length === 0) {
    return null;
  }

  const handleCompare = () => {
    if (products.length >= 2) {
      setShowComparison(true);
    }
  };

  return (
    <>
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Compare Products ({products.length}/3)
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClear}>
              Clear All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {products.map((product) => (
              <div key={product.id} className="relative p-4 border rounded-lg hover:shadow-md transition-shadow">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 hover:bg-red-50 hover:text-red-600"
                  onClick={() => onRemove(product.id)}
                  title="Remove from comparison"
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="pr-8">
                  <h4 className="font-semibold text-sm mb-2 line-clamp-2">{product.name}</h4>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-primary font-bold">${product.price.toLocaleString()}</span>
                    <Badge variant={product.condition === "new" ? "default" : "secondary"} className="text-xs">
                      {product.condition}
                    </Badge>
                  </div>
                  <div className="text-xs text-neutral-600">
                    {product.brand} • {product.category}
                  </div>
                  {product.warrantyYears && (
                    <div className="text-xs text-neutral-600 mt-1">
                      {product.warrantyYears}-year warranty
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Empty slots */}
            {Array.from({ length: 3 - products.length }).map((_, index) => (
              <div key={`empty-${index}`} className="p-4 border-2 border-dashed border-neutral-200 rounded-lg flex items-center justify-center text-neutral-400 bg-neutral-50">
                <div className="text-center">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <span className="text-sm">Add another product</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleCompare}
              disabled={products.length < 2}
              className="flex-1"
              size="lg"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Compare {products.length} Products
            </Button>
            {products.length >= 2 && (
              <div className="text-sm text-neutral-600 flex items-center">
                Ready to compare!
              </div>
            )}
          </div>

          {products.length < 2 && (
            <div className="mt-3 text-sm text-neutral-500 text-center">
              Add at least one more product to enable comparison
            </div>
          )}
        </CardContent>
      </Card>

      <ComparisonModal
        products={products}
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
      />
    </>
  );
}
