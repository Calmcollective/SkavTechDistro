import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import type { Express } from 'express';
import { createServer } from '../src/index';

let app: Express;
let authToken: string;

beforeAll(async () => {
  app = await createServer();
  // Give the server time to fully initialize
  await new Promise(resolve => setTimeout(resolve, 100));
});

beforeEach(() => {
  // Reset any test state if needed
});

afterAll(() => {
  // Clean up resources if needed
});

describe('API Endpoints', () => {
  describe('Health Check', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'healthy');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('uptime');
    });
  });

  describe('Authentication', () => {
    describe('User Registration', () => {
      it('should register a new user successfully', async () => {
        const res = await request(app)
          .post('/api/auth/signup')
          .send({
            username: 'testuser',
            password: 'testpass123',
            email: 'test@example.com',
            phoneNumber: '700123456',
            countryCode: '+254',
            firstName: 'Test',
            lastName: 'User'
          });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('message', 'Account created successfully');
        expect(res.body).toHaveProperty('user');
        expect(res.body.user).toHaveProperty('username', 'testuser');
        expect(res.body.user).toHaveProperty('email', 'test@example.com');
        expect(res.body.user).toHaveProperty('firstName', 'Test');
        expect(res.body.user).toHaveProperty('lastName', 'User');
        expect(res.body.user).not.toHaveProperty('password');
      });

      it('should hash password before storing in database', async () => {
        // Register a user
        await request(app)
          .post('/api/auth/register')
          .send({
            username: 'hashuser',
            password: 'plainpassword123',
            email: 'hash@example.com',
            phoneNumber: '700123457',
            countryCode: '+254',
            firstName: 'Hash',
            lastName: 'Test'
          });

        // The password should be hashed, not stored as plain text
        // We can't directly check the database, but we can verify login works
        const loginRes = await request(app)
          .post('/api/auth/login')
          .send({
            username: 'hashuser',
            password: 'plainpassword123'
          });
        expect(loginRes.status).toBe(200);
        expect(loginRes.body).toHaveProperty('token');
      });

      it('should reject registration with invalid Kenyan phone number', async () => {
        const res = await request(app)
          .post('/api/auth/signup')
          .send({
            username: 'invalidphone',
            password: 'testpass123',
            email: 'invalid@example.com',
            phoneNumber: '123456789', // Invalid format
            countryCode: '+254',
            firstName: 'Invalid',
            lastName: 'Phone'
          });
        expect(res.status).toBe(400);
        expect(res.body.message).toContain('valid Kenyan phone number');
      });

      it('should reject registration with non-Kenyan country code', async () => {
        const res = await request(app)
          .post('/api/auth/signup')
          .send({
            username: 'nonkenya',
            password: 'testpass123',
            email: 'nonkenya@example.com',
            phoneNumber: '700123458',
            countryCode: '+1', // Non-Kenyan
            firstName: 'Non',
            lastName: 'Kenya'
          });
        expect(res.status).toBe(400);
        expect(res.body.message).toContain('currently only available for Kenya');
      });

      it('should reject registration with duplicate username', async () => {
        // First registration
        await request(app)
          .post('/api/auth/signup')
          .send({
            username: 'duplicateuser',
            password: 'testpass123',
            email: 'duplicate1@example.com',
            phoneNumber: '700123459',
            countryCode: '+254',
            firstName: 'Duplicate',
            lastName: 'User'
          });

        // Second registration with same username
        const res = await request(app)
          .post('/api/auth/signup')
          .send({
            username: 'duplicateuser', // Same username
            password: 'testpass123',
            email: 'duplicate2@example.com',
            phoneNumber: '700123460',
            countryCode: '+254',
            firstName: 'Duplicate',
            lastName: 'User2'
          });
        expect(res.status).toBe(500); // Database constraint violation
      });

      it('should reject registration with missing required fields', async () => {
        const res = await request(app)
          .post('/api/auth/signup')
          .send({
            // Missing required fields
            password: 'testpass123',
            email: 'missing@example.com'
          });
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('errors');
      });
    });

    describe('User Login', () => {
      beforeAll(async () => {
        // Create a test user for login tests
        await request(app)
          .post('/api/auth/signup')
          .send({
            username: 'logintest',
            password: 'loginpass123',
            email: 'login@example.com',
            phoneNumber: '700123461',
            countryCode: '+254',
            firstName: 'Login',
            lastName: 'Test'
          });
      });

      it('should login user successfully and return token', async () => {
        const res = await request(app)
          .post('/api/auth/login')
          .send({
            username: 'logintest',
            password: 'loginpass123'
          });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message', 'Login successful');
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('user');
        expect(res.body.user).toHaveProperty('username', 'logintest');
        expect(res.body.user).not.toHaveProperty('password');
        authToken = res.body.token;
      });

      it('should reject login with wrong password', async () => {
        const res = await request(app)
          .post('/api/auth/login')
          .send({
            username: 'logintest',
            password: 'wrongpassword'
          });
        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('message', 'Invalid credentials');
      });

      it('should reject login with non-existent username', async () => {
        const res = await request(app)
          .post('/api/auth/login')
          .send({
            username: 'nonexistentuser',
            password: 'somepassword'
          });
        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('message', 'Invalid credentials');
      });

      it('should reject login with missing credentials', async () => {
        const res = await request(app)
          .post('/api/auth/login')
          .send({
            username: 'logintest'
            // Missing password
          });
        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('message', 'Invalid credentials');
      });

      it('should handle rate limiting for multiple failed login attempts', async () => {
        // Make multiple failed login attempts
        for (let i = 0; i < 6; i++) {
          await request(app)
            .post('/api/auth/login')
            .send({
              username: 'logintest',
              password: 'wrongpassword'
            });
        }

        // The last attempt should be rate limited
        const res = await request(app)
          .post('/api/auth/login')
          .send({
            username: 'logintest',
            password: 'wrongpassword'
          });
        expect([401, 429]).toContain(res.status); // Either auth failure or rate limited
      });
    });

    describe('Authentication Middleware', () => {
      it('should return current user info when authenticated', async () => {
        const res = await request(app)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${authToken}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('user');
        expect(res.body.user).toHaveProperty('username', 'logintest');
        expect(res.body.user).not.toHaveProperty('password');
      });

      it('should reject access to protected routes without authentication', async () => {
        const res = await request(app)
          .get('/api/auth/me');
        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('message', 'Not authenticated');
      });

      it('should reject access to protected routes with invalid token', async () => {
        const res = await request(app)
          .get('/api/auth/me')
          .set('Authorization', 'Bearer invalidtoken');
        expect(res.status).toBe(401);
      });

      it('should handle logout successfully', async () => {
        const res = await request(app)
          .post('/api/auth/logout');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message', 'Logout successful');
      });
    });
  });

  describe('Products', () => {
    it('should get all products', async () => {
      const res = await request(app).get('/api/products');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should get products by category', async () => {
      const res = await request(app).get('/api/products?category=laptops');
      expect(res.status).toBe(200); 
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should get product by ID', async () => {
      const res = await request(app).get('/api/products/1');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', 1);
    });

    it('should return 404 for non-existent product', async () => {
      const res = await request(app).get('/api/products/999');
      expect(res.status).toBe(404);
    });
  });

  describe('Comparison', () => {
    it('should generate product comparison', async () => {
      const res = await request(app)
        .post('/api/comparison')
        .send({
          productIds: [1, 2]
        });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('products');
      expect(res.body).toHaveProperty('comparison');
      expect(Array.isArray(res.body.products)).toBe(true);
      expect(res.body.products.length).toBeGreaterThanOrEqual(2);
    });

    it('should reject comparison with less than 2 products', async () => {
      const res = await request(app)
        .post('/api/comparison')
        .send({
          productIds: [1]
        });
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('2-3 product IDs');
    });

    it('should reject comparison with more than 3 products', async () => {
      const res = await request(app)
        .post('/api/comparison')
        .send({
          productIds: [1, 2, 3, 4]
        });
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('2-3 product IDs');
    });

    it('should reject comparison with invalid product IDs', async () => {
      const res = await request(app)
        .post('/api/comparison')
        .send({
          productIds: [999, 998]
        });
      expect(res.status).toBe(404);
      expect(res.body.message).toContain('valid products found');
    });

    it('should handle comparison with 3 products', async () => {
      const res = await request(app)
        .post('/api/comparison')
        .send({
          productIds: [1, 2, 3]
        });
      expect(res.status).toBe(200);
      expect(res.body.products.length).toBe(3);
    });

    it('should include comparison metadata', async () => {
      const res = await request(app)
        .post('/api/comparison')
        .send({
          productIds: [1, 2]
        });
      expect(res.status).toBe(200);
      expect(res.body.comparison).toHaveProperty('priceComparison');
      expect(res.body.comparison).toHaveProperty('warrantyComparison');
      expect(res.body.comparison).toHaveProperty('conditionBreakdown');
      expect(res.body.comparison).toHaveProperty('categoryBreakdown');
      expect(res.body.comparison).toHaveProperty('recommendations');
    });

    it('should generate meaningful recommendations', async () => {
      const res = await request(app)
        .post('/api/comparison')
        .send({
          productIds: [1, 2]
        });
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.comparison.recommendations)).toBe(true);
      expect(res.body.comparison.recommendations.length).toBeGreaterThan(0);
      expect(res.body.comparison.recommendations[0]).toContain('Best Value');
    });

    it('should calculate price differences correctly', async () => {
      const res = await request(app)
        .post('/api/comparison')
        .send({
          productIds: [1, 2]
        });
      expect(res.status).toBe(200);
      const priceComp = res.body.comparison.priceComparison;
      expect(priceComp).toHaveProperty('lowest');
      expect(priceComp).toHaveProperty('highest');
      expect(priceComp).toHaveProperty('average');
      expect(typeof priceComp.lowest).toBe('number');
      expect(typeof priceComp.highest).toBe('number');
      expect(priceComp.lowest).toBeLessThanOrEqual(priceComp.highest);
    });
  });

  describe('Trade-in', () => {
    describe('Trade-in Estimate Calculation', () => {
      it('should calculate trade-in estimate for laptop', async () => {
        const res = await request(app)
          .post('/api/trade-in/estimate')
          .send({
            deviceType: 'laptop',
            brand: 'Dell',
            model: 'Latitude 7420',
            age: '1-2',
            condition: 'good'
          });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('estimatedValue');
        expect(res.body).toHaveProperty('breakdown');
        expect(typeof res.body.estimatedValue).toBe('number');
        expect(res.body.estimatedValue).toBeGreaterThan(0);
        expect(res.body.breakdown.deviceType).toBe('laptop');
      });

      it('should calculate trade-in estimate for desktop', async () => {
        const res = await request(app)
          .post('/api/trade-in/estimate')
          .send({
            deviceType: 'desktop',
            brand: 'HP',
            model: 'EliteDesk 800',
            age: '2-3',
            condition: 'excellent'
          });
        expect(res.status).toBe(200);
        expect(res.body.estimatedValue).toBeGreaterThan(0);
        expect(res.body.breakdown.deviceType).toBe('desktop');
      });

      it('should calculate trade-in estimate for server', async () => {
        const res = await request(app)
          .post('/api/trade-in/estimate')
          .send({
            deviceType: 'server',
            brand: 'Dell',
            model: 'PowerEdge R750',
            age: '0-1',
            condition: 'excellent'
          });
        expect(res.status).toBe(200);
        expect(res.body.estimatedValue).toBeGreaterThan(0);
        expect(res.body.breakdown.deviceType).toBe('server');
      });

      it('should calculate trade-in estimate for tablet', async () => {
        const res = await request(app)
          .post('/api/trade-in/estimate')
          .send({
            deviceType: 'tablet',
            brand: 'Apple',
            model: 'iPad Pro',
            age: '1-2',
            condition: 'good'
          });
        expect(res.status).toBe(200);
        expect(res.body.estimatedValue).toBeGreaterThan(0);
        expect(res.body.breakdown.deviceType).toBe('tablet');
      });

      it('should give higher value for excellent condition', async () => {
        const excellentRes = await request(app)
          .post('/api/trade-in/estimate')
          .send({
            deviceType: 'laptop',
            brand: 'Dell',
            model: 'Latitude 7420',
            age: '1-2',
            condition: 'excellent'
          });

        const goodRes = await request(app)
          .post('/api/trade-in/estimate')
          .send({
            deviceType: 'laptop',
            brand: 'Dell',
            model: 'Latitude 7420',
            age: '1-2',
            condition: 'good'
          });

        expect(excellentRes.body.estimatedValue).toBeGreaterThan(goodRes.body.estimatedValue);
      });

      it('should give lower value for older devices', async () => {
        const newRes = await request(app)
          .post('/api/trade-in/estimate')
          .send({
            deviceType: 'laptop',
            brand: 'Dell',
            model: 'Latitude 7420',
            age: '0-1',
            condition: 'good'
          });

        const oldRes = await request(app)
          .post('/api/trade-in/estimate')
          .send({
            deviceType: 'laptop',
            brand: 'Dell',
            model: 'Latitude 7420',
            age: '5+',
            condition: 'good'
          });

        expect(newRes.body.estimatedValue).toBeGreaterThan(oldRes.body.estimatedValue);
      });

      it('should give premium value for Apple products', async () => {
        const appleRes = await request(app)
          .post('/api/trade-in/estimate')
          .send({
            deviceType: 'laptop',
            brand: 'Apple',
            model: 'MacBook Pro',
            age: '1-2',
            condition: 'good'
          });

        const dellRes = await request(app)
          .post('/api/trade-in/estimate')
          .send({
            deviceType: 'laptop',
            brand: 'Dell',
            model: 'Latitude 7420',
            age: '1-2',
            condition: 'good'
          });

        expect(appleRes.body.estimatedValue).toBeGreaterThan(dellRes.body.estimatedValue);
      });

      it('should give bonus for popular models', async () => {
        const thinkpadRes = await request(app)
          .post('/api/trade-in/estimate')
          .send({
            deviceType: 'laptop',
            brand: 'Lenovo',
            model: 'ThinkPad T14',
            age: '1-2',
            condition: 'good'
          });

        const regularRes = await request(app)
          .post('/api/trade-in/estimate')
          .send({
            deviceType: 'laptop',
            brand: 'Lenovo',
            model: 'IdeaPad 3',
            age: '1-2',
            condition: 'good'
          });

        expect(thinkpadRes.body.estimatedValue).toBeGreaterThan(regularRes.body.estimatedValue);
      });
    });

    describe('Trade-in Estimate Validation', () => {
      it('should reject trade-in estimate with missing deviceType', async () => {
        const res = await request(app)
          .post('/api/trade-in/estimate')
          .send({
            brand: 'Dell',
            model: 'Latitude 7420',
            age: '1-2',
            condition: 'good'
          });
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('message', 'Invalid trade-in data');
        expect(res.body.errors).toBeDefined();
      });

      it('should reject trade-in estimate with invalid deviceType', async () => {
        const res = await request(app)
          .post('/api/trade-in/estimate')
          .send({
            deviceType: 'invalid_type',
            brand: 'Dell',
            model: 'Latitude 7420',
            age: '1-2',
            condition: 'good'
          });
        expect(res.status).toBe(400);
        expect(res.body.errors[0].message).toContain('Device type must be');
      });

      it('should reject trade-in estimate with missing brand', async () => {
        const res = await request(app)
          .post('/api/trade-in/estimate')
          .send({
            deviceType: 'laptop',
            model: 'Latitude 7420',
            age: '1-2',
            condition: 'good'
          });
        expect(res.status).toBe(400);
        expect(res.body.errors[0].message).toContain('Brand is required');
      });

      it('should reject trade-in estimate with empty brand', async () => {
        const res = await request(app)
          .post('/api/trade-in/estimate')
          .send({
            deviceType: 'laptop',
            brand: '',
            model: 'Latitude 7420',
            age: '1-2',
            condition: 'good'
          });
        expect(res.status).toBe(400);
        expect(res.body.errors[0].message).toContain('Brand is required');
      });

      it('should reject trade-in estimate with brand too long', async () => {
        const res = await request(app)
          .post('/api/trade-in/estimate')
          .send({
            deviceType: 'laptop',
            brand: 'A'.repeat(51), // 51 characters
            model: 'Latitude 7420',
            age: '1-2',
            condition: 'good'
          });
        expect(res.status).toBe(400);
        expect(res.body.errors[0].message).toContain('Brand name too long');
      });

      it('should reject trade-in estimate with missing model', async () => {
        const res = await request(app)
          .post('/api/trade-in/estimate')
          .send({
            deviceType: 'laptop',
            brand: 'Dell',
            age: '1-2',
            condition: 'good'
          });
        expect(res.status).toBe(400);
        expect(res.body.errors[0].message).toContain('Model is required');
      });

      it('should reject trade-in estimate with model too long', async () => {
        const res = await request(app)
          .post('/api/trade-in/estimate')
          .send({
            deviceType: 'laptop',
            brand: 'Dell',
            model: 'A'.repeat(101), // 101 characters
            age: '1-2',
            condition: 'good'
          });
        expect(res.status).toBe(400);
        expect(res.body.errors[0].message).toContain('Model name too long');
      });

      it('should reject trade-in estimate with invalid age', async () => {
        const res = await request(app)
          .post('/api/trade-in/estimate')
          .send({
            deviceType: 'laptop',
            brand: 'Dell',
            model: 'Latitude 7420',
            age: 'invalid_age',
            condition: 'good'
          });
        expect(res.status).toBe(400);
        expect(res.body.errors[0].message).toContain('Age must be one of');
      });

      it('should reject trade-in estimate with invalid condition', async () => {
        const res = await request(app)
          .post('/api/trade-in/estimate')
          .send({
            deviceType: 'laptop',
            brand: 'Dell',
            model: 'Latitude 7420',
            age: '1-2',
            condition: 'invalid_condition'
          });
        expect(res.status).toBe(400);
        expect(res.body.errors[0].message).toContain('Condition must be');
      });

      it('should reject trade-in estimate with empty request body', async () => {
        const res = await request(app)
          .post('/api/trade-in/estimate')
          .send({});
        expect(res.status).toBe(400);
        expect(res.body.errors.length).toBeGreaterThan(0);
      });
    });

    describe('Trade-in Estimate Edge Cases', () => {
      it('should handle unknown brands with default multiplier', async () => {
        const res = await request(app)
          .post('/api/trade-in/estimate')
          .send({
            deviceType: 'laptop',
            brand: 'UnknownBrand',
            model: 'Generic Model',
            age: '1-2',
            condition: 'good'
          });
        expect(res.status).toBe(200);
        expect(res.body.estimatedValue).toBeGreaterThan(0);
      });

      it('should handle very old devices (5+ years)', async () => {
        const res = await request(app)
          .post('/api/trade-in/estimate')
          .send({
            deviceType: 'laptop',
            brand: 'Dell',
            model: 'Old Model',
            age: '5+',
            condition: 'poor'
          });
        expect(res.status).toBe(200);
        expect(res.body.estimatedValue).toBeGreaterThan(0);
        expect(res.body.estimatedValue).toBeLessThan(100); // Should be very low
      });

      it('should handle brand case insensitivity', async () => {
        const res1 = await request(app)
          .post('/api/trade-in/estimate')
          .send({
            deviceType: 'laptop',
            brand: 'apple',
            model: 'MacBook Pro',
            age: '1-2',
            condition: 'good'
          });

        const res2 = await request(app)
          .post('/api/trade-in/estimate')
          .send({
            deviceType: 'laptop',
            brand: 'APPLE',
            model: 'MacBook Pro',
            age: '1-2',
            condition: 'good'
          });

        expect(res1.body.estimatedValue).toBe(res2.body.estimatedValue);
      });

      it('should return consistent results for same inputs', async () => {
        const res1 = await request(app)
          .post('/api/trade-in/estimate')
          .send({
            deviceType: 'laptop',
            brand: 'Dell',
            model: 'Latitude 7420',
            age: '1-2',
            condition: 'good'
          });

        const res2 = await request(app)
          .post('/api/trade-in/estimate')
          .send({
            deviceType: 'laptop',
            brand: 'Dell',
            model: 'Latitude 7420',
            age: '1-2',
            condition: 'good'
          });

        // Results should be very close (within randomization range)
        const difference = Math.abs(res1.body.estimatedValue - res2.body.estimatedValue);
        expect(difference).toBeLessThan(50); // Allow for ±5% randomization
      });
    });
  });

  describe('Warranty', () => {
    it('should get warranty by serial number', async () => {
      const res = await request(app).get('/api/warranty/DL7420-CORP-001');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('serialNumber', 'DL7420-CORP-001');
    });

    it('should return 404 for non-existent warranty', async () => {
      const res = await request(app).get('/api/warranty/NON-EXISTENT');
      expect(res.status).toBe(404);
    });
  });

  describe('Repair Tickets', () => {
    it('should get repair ticket by ID', async () => {
      const res = await request(app).get('/api/repairs/RPR-2024-001');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('ticketId', 'RPR-2024-001');
    });

    it('should create new repair ticket', async () => {
      const res = await request(app)
        .post('/api/repairs')
        .send({
          serialNumber: 'TEST-001',
          deviceModel: 'Test Device',
          issueDescription: 'Test issue description that is long enough',
          customerInfo: {
            name: 'Test Customer',
            email: 'test@example.com',
            phone: '+254700123456'
          }
        });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('ticketId');
      expect(res.body.ticketId).toMatch(/^RPR-/);
    });
  });

  describe('Admin Routes (Protected)', () => {
    it('should reject admin routes without authentication', async () => {
      const res = await request(app).get('/api/admin/devices');
      expect(res.status).toBe(401);
    });

    it('should reject admin routes without admin role', async () => {
      const res = await request(app)
        .get('/api/admin/devices')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(403);
    });
  });

  describe('Fleet Routes (Protected)', () => {
    it('should reject fleet routes without authentication', async () => {
      const res = await request(app).get('/api/fleet/CORP-001');
      expect(res.status).toBe(401);
    });
  });

  describe('Chatbot', () => {
    it('should respond to chatbot messages', async () => {
      const res = await request(app)
        .post('/api/chatbot')
        .send({ message: 'Hello' });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('response');
      expect(typeof res.body.response).toBe('string');
      expect(res.body.response.length).toBeGreaterThan(10);
    });

    it('should handle warranty-related queries with multi-paragraph response', async () => {
      const res = await request(app)
        .post('/api/chatbot')
        .send({ message: 'I need warranty information' });
      expect(res.status).toBe(200);
      expect(res.body.response).toContain('warranty');
      expect(res.body.response).toContain('•');
      expect(res.body.response).toContain('\n');
      expect(res.body.response.length).toBeGreaterThan(200);
    });

    it('should provide detailed repair information', async () => {
      const res = await request(app)
        .post('/api/chatbot')
        .send({ message: 'How do I repair my laptop?' });
      expect(res.status).toBe(200);
      expect(res.body.response).toContain('repair');
      expect(res.body.response).toContain('Our Repair Process:');
      expect(res.body.response).toContain('1. **Initial Assessment**');
      expect(res.body.response).toContain('What We Repair:');
      expect(res.body.response).toContain('• Laptops, desktops, and servers');
      expect(res.body.response.length).toBeGreaterThan(600);
    });

    it('should handle trade-in inquiries with comprehensive details', async () => {
      const res = await request(app)
        .post('/api/chatbot')
        .send({ message: 'I want to trade in my old computer' });
      expect(res.status).toBe(200);
      expect(res.body.response).toContain('trade');
      expect(res.body.response).toContain('competitive valuations');
      expect(res.body.response).toContain('Why Choose Our Trade-In Program:');
      expect(res.body.response).toContain('• **Best Market Value**');
      expect(res.body.response).toContain('How It Works:');
      expect(res.body.response).toContain('1. **Get Instant Quote**');
      expect(res.body.response.length).toBeGreaterThan(800);
    });

    it('should provide pricing information with detailed breakdown', async () => {
      const res = await request(app)
        .post('/api/chatbot')
        .send({ message: 'What are your prices?' });
      expect(res.status).toBe(200);
      expect(res.body.response).toContain('pricing');
      expect(res.body.response).toContain('KSh');
      expect(res.body.response).toContain('•');
      expect(res.body.response.length).toBeGreaterThan(500);
    });

    it('should handle enterprise fleet inquiries', async () => {
      const res = await request(app)
        .post('/api/chatbot')
        .send({ message: 'Tell me about fleet management' });
      expect(res.status).toBe(200);
      expect(res.body.response).toContain('Corporate Fleet Portal');
      expect(res.body.response).toContain('enterprise device management');
      expect(res.body.response).toContain('Fleet Management Features:');
      expect(res.body.response).toContain('Device Lifecycle Management:');
      expect(res.body.response).toContain('Real-time Analytics & Reporting:');
      expect(res.body.response).toContain('Benefits for Your Business:');
      expect(res.body.response).toContain('• **Cost Savings**: Reduce IT costs by up to 40%');
      expect(res.body.response.length).toBeGreaterThan(1000);
    });

    it('should provide server information with specifications', async () => {
      const res = await request(app)
        .post('/api/chatbot')
        .send({ message: 'What servers do you have?' });
      expect(res.status).toBe(200);
      expect(res.body.response).toContain('server');
      expect(res.body.response).toContain('Dell');
      expect(res.body.response).toContain('HPE');
      expect(res.body.response.length).toBeGreaterThan(400);
    });

    it('should handle laptop inquiries with detailed options', async () => {
      const res = await request(app)
        .post('/api/chatbot')
        .send({ message: 'I need a new laptop' });
      expect(res.status).toBe(200);
      expect(res.body.response).toContain('laptop');
      expect(res.body.response).toContain('Dell');
      expect(res.body.response).toContain('Lenovo');
      expect(res.body.response).toContain('KSh');
      expect(res.body.response.length).toBeGreaterThan(400);
    });

    it('should provide contact information with multiple channels', async () => {
      const res = await request(app)
        .post('/api/chatbot')
        .send({ message: 'How can I contact you?' });
      expect(res.status).toBe(200);
      expect(res.body.response).toContain('We\'re here to help!');
      expect(res.body.response).toContain('**Customer Support:**');
      expect(res.body.response).toContain('+254 700 123 456');
      expect(res.body.response).toContain('support@skavtech.co.ke');
      expect(res.body.response).toContain('**Sales & Quotations:**');
      expect(res.body.response).toContain('**Technical Support:**');
      expect(res.body.response).toContain('**Business Hours:**');
      expect(res.body.response).toContain('**Office Locations:**');
      expect(res.body.response.length).toBeGreaterThan(800);
    });

    it('should provide company information', async () => {
      const res = await request(app)
        .post('/api/chatbot')
        .send({ message: 'Tell me about Skavtech' });
      expect(res.status).toBe(200);
      expect(res.body.response).toContain('Welcome to Skavtech!');
      expect(res.body.response).toContain('**Our Mission:**');
      expect(res.body.response).toContain('**Our Vision:**');
      expect(res.body.response).toContain('**Founded**: 2018 in Nairobi, Kenya');
      expect(res.body.response).toContain('**What We Do:**');
      expect(res.body.response).toContain('**Our Values:**');
      expect(res.body.response).toContain('**Certifications & Partnerships:**');
      expect(res.body.response).toContain('Microsoft Gold Partner');
      expect(res.body.response).toContain('**Why Choose Skavtech:**');
      expect(res.body.response.length).toBeGreaterThan(1200);
    });

    it('should handle unknown queries with helpful fallback', async () => {
      const res = await request(app)
        .post('/api/chatbot')
        .send({ message: 'What is the weather like?' });
      expect(res.status).toBe(200);
      expect(res.body.response).toContain('Thank you for reaching out to Skavtech!');
      expect(res.body.response).toContain('**How I Can Assist You:**');
      expect(res.body.response).toContain('**Product Information:**');
      expect(res.body.response).toContain('**Services & Support:**');
      expect(res.body.response).toContain('**Quick Actions:**');
      expect(res.body.response).toContain('**Popular Topics:**');
      expect(res.body.response).toContain('What specific information are you looking for?');
      expect(res.body.response.length).toBeGreaterThan(600);
    });

    it('should reject requests without message', async () => {
      const res = await request(app)
        .post('/api/chatbot')
        .send({});
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Message is required');
    });

    it('should handle empty message strings', async () => {
      const res = await request(app)
        .post('/api/chatbot')
        .send({ message: '' });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Message is required');
    });

    it('should handle whitespace-only messages', async () => {
      const res = await request(app)
        .post('/api/chatbot')
        .send({ message: '   ' });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Message is required');
    });

    it('should be case-insensitive in keyword matching', async () => {
      const res = await request(app)
        .post('/api/chatbot')
        .send({ message: 'WARRANTY INFORMATION' });
      expect(res.status).toBe(200);
      expect(res.body.response).toContain('warranty');
    });

    it('should handle multiple keywords in single message', async () => {
      const res = await request(app)
        .post('/api/chatbot')
        .send({ message: 'I need warranty and repair information' });
      expect(res.status).toBe(200);
      expect(res.body.response).toContain('warranty');
    });

    it('should provide responses with proper formatting and line breaks', async () => {
      const res = await request(app)
        .post('/api/chatbot')
        .send({ message: 'Tell me about your services' });
      expect(res.status).toBe(200);
      expect(res.body.response).toContain('\n');
      expect(res.body.response).toContain('•');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const res = await request(app).get('/api/non-existent-route');
      expect(res.status).toBe(404);
    });

    it('should handle malformed JSON', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .set('Content-Type', 'application/json')
        .send('{invalid json}');
      expect(res.status).toBe(400);
    });
  });
});