import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "@/components/ProductCard";
import ComparisonWidget from "@/components/ComparisonWidget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [comparedProducts, setComparedProducts] = useState<Product[]>([]);
  const { toast } = useToast();

  const { data: products, isLoading, error } = useQuery({
    queryKey: ["/api/products", selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") {
        params.append("category", selectedCategory);
      }
      
      const response = await fetch(`/api/products?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      return response.json();
    },
  });

  const categories = [
    { id: "all", label: "All Products", count: products?.length || 0 },
    { id: "servers", label: "Servers", count: products?.filter((p: Product) => p.category === "servers").length || 0 },
    { id: "laptops", label: "Laptops", count: products?.filter((p: Product) => p.category === "laptops").length || 0 },
    { id: "desktops", label: "PCs", count: products?.filter((p: Product) => p.category === "desktops").length || 0 },
    { id: "accessories", label: "Accessories", count: products?.filter((p: Product) => p.category === "accessories").length || 0 },
  ];

  const filteredProducts = products?.filter((product: Product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }) || [];

  const handleCompare = (product: Product) => {
    const isAlreadyComparing = comparedProducts.some(p => p.id === product.id);
    
    if (isAlreadyComparing) {
      setComparedProducts(prev => prev.filter(p => p.id !== product.id));
    } else if (comparedProducts.length < 3) {
      setComparedProducts(prev => [...prev, product]);
    } else {
      toast({
        title: "Comparison Limit Reached",
        description: "You can only compare up to 3 products at once.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveFromComparison = (productId: number) => {
    setComparedProducts(prev => prev.filter(p => p.id !== productId));
  };

  const handleClearComparison = () => {
    setComparedProducts([]);
  };

  const handleCompareProducts = () => {
    if (comparedProducts.length >= 2) {
      // The ComparisonWidget now handles the modal internally
      // This function is called when the "Compare Selected Products" button is clicked
      // The actual comparison logic is handled in the ComparisonWidget component
      console.log("Comparing products:", comparedProducts.map(p => p.name));
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-red-600 mb-4">Failed to load products. Please try again later.</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">Our Products</h1>
          <p className="text-xl text-neutral-600">Professional ICT hardware and refurbished devices</p>
        </div>

        {/* Search and Filter */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="category-btn"
                >
                  {category.label}
                  {category.count > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {category.count}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Comparison Widget */}
        <ComparisonWidget
          products={comparedProducts}
          onRemove={handleRemoveFromComparison}
          onClear={handleClearComparison}
          onCompare={handleCompareProducts}
        />

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="w-full h-48 bg-neutral-200 animate-pulse" />
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-6 bg-neutral-200 rounded mb-2" />
                    <div className="h-4 bg-neutral-200 rounded mb-4" />
                    <div className="h-8 bg-neutral-200 rounded mb-4" />
                    <div className="h-10 bg-neutral-200 rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product: Product) => (
              <ProductCard
                key={product.id}
                product={product}
                onCompare={handleCompare}
                isComparing={comparedProducts.some(p => p.id === product.id)}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <div className="text-neutral-500">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No products found</h3>
                <p>Try adjusting your search criteria or selecting a different category.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Product Count */}
        {!isLoading && filteredProducts.length > 0 && (
          <div className="mt-8 text-center text-neutral-600">
            Showing {filteredProducts.length} of {products?.length || 0} products
          </div>
        )}
      </div>
    </div>
  );
}
