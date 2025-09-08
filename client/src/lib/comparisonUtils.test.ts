import { describe, it, expect } from 'vitest';
import { compareProducts } from './comparisonUtils';
import type { Product } from '@shared/schema';

// Mock products for testing
const mockProducts: Product[] = [
  {
    id: 1,
    name: 'Dell Latitude 7420',
    brand: 'Dell',
    category: 'laptops',
    condition: 'new',
    price: 1200,
    originalPrice: null,
    description: 'Business laptop',
    specifications: { ram: '16GB', storage: '512GB SSD' },
    warrantyYears: 3,
    stockQuantity: 10,
    imageUrl: '/dell.jpg',
    isActive: true,
    createdAt: new Date()
  },
  {
    id: 2,
    name: 'HP EliteBook 850',
    brand: 'HP',
    category: 'laptops',
    condition: 'refurbished',
    price: 800,
    originalPrice: 1000,
    description: 'Refurbished business laptop',
    specifications: { ram: '8GB', storage: '256GB SSD' },
    warrantyYears: 1,
    stockQuantity: 5,
    imageUrl: '/hp.jpg',
    isActive: true,
    createdAt: new Date()
  }
];

describe('Comparison Utilities', () => {
  describe('compareProducts', () => {
    it('should compare two products successfully', () => {
      const result = compareProducts(mockProducts);

      expect(result).toHaveProperty('products');
      expect(result).toHaveProperty('results');
      expect(result).toHaveProperty('summary');
      expect(result.products).toHaveLength(2);
      expect(result.results.length).toBeGreaterThan(0);
    });

    it('should throw error for less than 2 products', () => {
      expect(() => compareProducts([mockProducts[0]])).toThrow('At least 2 products are required');
    });

    it('should include price comparison in results', () => {
      const result = compareProducts(mockProducts);
      const priceResult = result.results.find(r => r.field === 'price');

      expect(priceResult).toBeDefined();
      expect(priceResult?.values).toEqual([1200, 800]);
      expect(priceResult?.bestIndex).toBe(1); // Cheapest product index
    });

    it('should include warranty comparison', () => {
      const result = compareProducts(mockProducts);
      const warrantyResult = result.results.find(r => r.field === 'warrantyYears');

      expect(warrantyResult).toBeDefined();
      expect(warrantyResult?.values).toEqual([3, 1]);
      expect(warrantyResult?.bestIndex).toBe(0); // Longest warranty index
    });

    it('should calculate savings correctly', () => {
      const result = compareProducts(mockProducts);
      const savingsResult = result.results.find(r => r.field === 'savings');

      expect(savingsResult).toBeDefined();
      expect(savingsResult?.values).toEqual([0, 200]); // Second product has $200 savings
      expect(savingsResult?.bestIndex).toBe(1); // Most savings
    });

    it('should generate meaningful recommendations', () => {
      const result = compareProducts(mockProducts);

      expect(result.summary.recommendations).toBeDefined();
      expect(Array.isArray(result.summary.recommendations)).toBe(true);
      expect(result.summary.recommendations.length).toBeGreaterThan(0);
      expect(result.summary.recommendations[0]).toContain('Best Value');
    });

    it('should calculate price range correctly', () => {
      const result = compareProducts(mockProducts);

      expect(result.summary.priceRange.min).toBe(800);
      expect(result.summary.priceRange.max).toBe(1200);
      expect(result.summary.priceRange.avg).toBe(1000);
    });

    it('should identify best value product', () => {
      const result = compareProducts(mockProducts);

      expect(result.summary.bestValue.id).toBe(2); // Cheapest product
      expect(result.summary.bestValue.price).toBe(800);
    });

    it('should handle products with missing specifications', () => {
      const productsWithoutSpecs = mockProducts.map(p => ({
        ...p,
        specifications: undefined
      }));

      const result = compareProducts(productsWithoutSpecs);
      const specsResult = result.results.find(r => r.field === 'specifications');

      expect(specsResult?.values).toEqual(['Not available', 'Not available']);
    });

    it('should handle products with zero stock', () => {
      const productsWithNoStock = mockProducts.map(p => ({
        ...p,
        stockQuantity: 0
      }));

      const result = compareProducts(productsWithNoStock);
      const stockResult = result.results.find(r => r.field === 'stockQuantity');

      expect(stockResult?.values).toEqual([0, 0]);
    });
  });
});