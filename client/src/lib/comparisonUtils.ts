import type { Product } from "@shared/schema";

export interface ComparisonResult {
  field: string;
  label: string;
  values: (string | number | null)[];
  bestIndex?: number;
  type: 'price' | 'number' | 'text' | 'boolean' | 'date';
}

export interface ProductComparison {
  products: Product[];
  results: ComparisonResult[];
  summary: {
    priceRange: { min: number; max: number; avg: number };
    bestValue: Product;
    recommendations: string[];
  };
}

/**
 * Compare two or more products and generate detailed comparison data
 */
export function compareProducts(products: Product[]): ProductComparison {
  if (products.length < 2) {
    throw new Error("At least 2 products are required for comparison");
  }

  const results: ComparisonResult[] = [];

  // Basic information comparison
  results.push({
    field: 'name',
    label: 'Product Name',
    values: products.map(p => p.name),
    type: 'text'
  });

  results.push({
    field: 'brand',
    label: 'Brand',
    values: products.map(p => p.brand),
    type: 'text'
  });

  results.push({
    field: 'category',
    label: 'Category',
    values: products.map(p => p.category),
    type: 'text'
  });

  results.push({
    field: 'condition',
    label: 'Condition',
    values: products.map(p => p.condition),
    type: 'text'
  });

  // Price comparison with best value highlighting
  const prices = products.map(p => p.price);
  const minPrice = Math.min(...prices);
  const bestPriceIndex = prices.indexOf(minPrice);

  results.push({
    field: 'price',
    label: 'Price ($)',
    values: products.map(p => p.price),
    bestIndex: bestPriceIndex,
    type: 'price'
  });

  // Original price comparison
  results.push({
    field: 'originalPrice',
    label: 'Original Price ($)',
    values: products.map(p => p.originalPrice || null),
    type: 'price'
  });

  // Savings calculation
  const savings = products.map(p => {
    if (p.originalPrice && p.originalPrice > p.price) {
      return p.originalPrice - p.price;
    }
    return 0;
  });

  if (savings.some(s => s > 0)) {
    const maxSavingsIndex = savings.indexOf(Math.max(...savings));
    results.push({
      field: 'savings',
      label: 'Savings ($)',
      values: savings,
      bestIndex: maxSavingsIndex,
      type: 'price'
    });
  }

  // Warranty comparison
  const warranties = products.map(p => p.warrantyYears || 0);
  const maxWarrantyIndex = warranties.indexOf(Math.max(...warranties));

  results.push({
    field: 'warrantyYears',
    label: 'Warranty (Years)',
    values: products.map(p => p.warrantyYears || 0),
    bestIndex: maxWarrantyIndex,
    type: 'number'
  });

  // Stock comparison
  results.push({
    field: 'stockQuantity',
    label: 'Stock Quantity',
    values: products.map(p => p.stockQuantity || 0),
    type: 'number'
  });

  // Description comparison
  results.push({
    field: 'description',
    label: 'Description',
    values: products.map(p => p.description || 'No description'),
    type: 'text'
  });

  // Specifications comparison (always include, even if empty)
  results.push({
    field: 'specifications',
    label: 'Specifications',
    values: products.map(p => formatSpecifications(p.specifications)),
    type: 'text'
  });

  // Generate summary
  const priceRange = {
    min: Math.min(...prices),
    max: Math.max(...prices),
    avg: Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length)
  };

  const bestValue = products[bestPriceIndex];
  const recommendations = generateRecommendations(products, priceRange);

  return {
    products,
    results,
    summary: {
      priceRange,
      bestValue,
      recommendations
    }
  };
}

/**
 * Format specifications object for display
 */
function formatSpecifications(specs: any): string {
  if (!specs || typeof specs !== 'object') {
    return 'Not available';
  }

  const formatted = Object.entries(specs)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');

  return formatted || 'Not available';
}

/**
 * Generate smart recommendations based on product comparison
 */
function generateRecommendations(products: Product[], priceRange: { min: number; max: number; avg: number }): string[] {
  const recommendations: string[] = [];

  // Best value recommendation
  const cheapest = products.reduce((min, p) => p.price < min.price ? p : min);
  recommendations.push(`💰 Best Value: ${cheapest.name} at $${cheapest.price.toLocaleString()}`);

  // Warranty recommendation
  const bestWarranty = products.reduce((best, p) =>
    (p.warrantyYears || 0) > (best.warrantyYears || 0) ? p : best
  );
  if (bestWarranty.warrantyYears && bestWarranty.warrantyYears > 1) {
    recommendations.push(`🛡️ Best Warranty: ${bestWarranty.name} (${bestWarranty.warrantyYears} years)`);
  }

  // New condition recommendation
  const newProducts = products.filter(p => p.condition === 'new');
  if (newProducts.length > 0) {
    const newest = newProducts[0];
    recommendations.push(`✨ Brand New: ${newest.name} - Never used`);
  }

  // Price range analysis
  const priceSpread = priceRange.max - priceRange.min;
  if (priceSpread > priceRange.avg * 0.5) {
    recommendations.push(`📊 Price Range: $${priceSpread.toLocaleString()} difference between cheapest and most expensive`);
  }

  // Stock availability
  const inStock = products.filter(p => (p.stockQuantity || 0) > 0);
  if (inStock.length < products.length) {
    recommendations.push(`⚠️ Stock Alert: ${products.length - inStock.length} product(s) currently out of stock`);
  }

  return recommendations;
}

/**
 * Get comparison highlight color based on value ranking
 */
export function getComparisonHighlight(value: any, values: any[], type: string): string {
  if (type === 'price' || type === 'number') {
    const numValues = values.map(v => Number(v) || 0);
    const min = Math.min(...numValues);
    const max = Math.max(...numValues);

    if (Number(value) === min) return 'text-green-600 font-semibold bg-green-50';
    if (Number(value) === max && type === 'price') return 'text-red-600 bg-red-50';
    if (Number(value) === max && type === 'number') return 'text-green-600 font-semibold bg-green-50';
  }

  return '';
}