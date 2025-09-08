import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { X, Star, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { compareProducts, getComparisonHighlight, type ProductComparison } from "@/lib/comparisonUtils";
import type { Product } from "@shared/schema";

interface ComparisonModalProps {
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
}

export default function ComparisonModal({ products, isOpen, onClose }: ComparisonModalProps) {
  const [comparison, setComparison] = useState<ProductComparison | null>(null);

  // Generate comparison when modal opens
  useState(() => {
    if (isOpen && products.length >= 2) {
      try {
        const result = compareProducts(products);
        setComparison(result);
      } catch (error) {
        console.error("Comparison error:", error);
      }
    }
  });

  if (!comparison) return null;

  const getTrendIcon = (value: any, values: any[], type: string) => {
    if (type !== 'price' && type !== 'number') return null;

    const numValues = values.map(v => Number(v) || 0);
    const min = Math.min(...numValues);
    const max = Math.max(...numValues);

    if (Number(value) === min) return <TrendingDown className="h-4 w-4 text-green-600" />;
    if (Number(value) === max) return <TrendingUp className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center justify-between">
            Product Comparison
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    ${comparison.summary.priceRange.min.toLocaleString()} - ${comparison.summary.priceRange.max.toLocaleString()}
                  </div>
                  <div className="text-sm text-neutral-600">Price Range</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">
                    ${comparison.summary.priceRange.avg.toLocaleString()}
                  </div>
                  <div className="text-sm text-neutral-600">Average Price</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Star className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                  <div className="text-sm font-semibold">Best Value</div>
                  <div className="text-xs text-neutral-600">{comparison.summary.bestValue.name}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Smart Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {comparison.summary.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div className="text-sm">{rec}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-48">Feature</TableHead>
                      {comparison.products.map((product, index) => (
                        <TableHead key={product.id} className="text-center min-w-48">
                          <div className="space-y-2">
                            <div className="font-semibold">{product.name}</div>
                            <Badge variant={product.condition === "new" ? "default" : "secondary"}>
                              {product.condition}
                            </Badge>
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comparison.results.map((result, resultIndex) => (
                      <TableRow key={resultIndex}>
                        <TableCell className="font-medium">{result.label}</TableCell>
                        {result.values.map((value, valueIndex) => {
                          const highlightClass = result.bestIndex === valueIndex
                            ? getComparisonHighlight(value, result.values, result.type)
                            : '';

                          return (
                            <TableCell
                              key={valueIndex}
                              className={`text-center ${highlightClass}`}
                            >
                              <div className="flex items-center justify-center gap-2">
                                {getTrendIcon(value, result.values, result.type)}
                                <span>
                                  {result.type === 'price' && value !== null
                                    ? `$${Number(value).toLocaleString()}`
                                    : result.type === 'boolean'
                                    ? (value ? 'Yes' : 'No')
                                    : value || 'N/A'
                                  }
                                </span>
                              </div>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Product Images */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {comparison.products.map((product) => (
              <Card key={product.id}>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <img
                      src={product.imageUrl || "/api/placeholder/200/150"}
                      alt={product.name}
                      className="w-full h-32 object-cover rounded-lg mb-4"
                    />
                    <h4 className="font-semibold mb-2">{product.name}</h4>
                    <div className="text-2xl font-bold text-primary mb-2">
                      ${product.price.toLocaleString()}
                    </div>
                    <Button className="w-full">
                      Request Quote
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}