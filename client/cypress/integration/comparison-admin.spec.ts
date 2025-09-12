/// <reference types="cypress" />

describe('Product Comparison and Admin Dashboard', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  describe('Product Comparison', () => {
    it('should allow selecting products for comparison', () => {
      cy.visit('/products')
      cy.get('[data-testid="product-card"]').first().find('input[type="checkbox"]').check()
      cy.get('[data-testid="product-card"]').eq(1).find('input[type="checkbox"]').check()
      cy.contains('Compare Selected').click()
      cy.url().should('include', '/comparison')
    })

    it('should display comparison results', () => {
      cy.visit('/products')
      // Select 2 products
      cy.get('[data-testid="product-card"]').first().find('input[type="checkbox"]').check()
      cy.get('[data-testid="product-card"]').eq(1).find('input[type="checkbox"]').check()
      cy.contains('Compare Selected').click()

      // Should show comparison data
      cy.contains('Product Comparison').should('be.visible')
      cy.contains('Price Comparison').should('be.visible')
      cy.contains('Warranty Comparison').should('be.visible')
    })

    it('should show recommendations based on comparison', () => {
      cy.visit('/products')
      cy.get('[data-testid="product-card"]').first().find('input[type="checkbox"]').check()
      cy.get('[data-testid="product-card"]').eq(1).find('input[type="checkbox"]').check()
      cy.contains('Compare Selected').click()

      // Should show recommendations
      cy.contains('Best Value').should('be.visible')
    })

    it('should handle comparison with 3 products', () => {
      cy.visit('/products')
      cy.get('[data-testid="product-card"]').first().find('input[type="checkbox"]').check()
      cy.get('[data-testid="product-card"]').eq(1).find('input[type="checkbox"]').check()
      cy.get('[data-testid="product-card"]').eq(2).find('input[type="checkbox"]').check()
      cy.contains('Compare Selected').click()

      cy.contains('Product Comparison').should('be.visible')
      cy.get('[data-testid="product-card"]').should('have.length', 3)
    })

    it('should reject comparison with less than 2 products', () => {
      cy.visit('/products')
      cy.get('[data-testid="product-card"]').first().find('input[type="checkbox"]').check()
      cy.contains('Compare Selected').click()

      cy.contains('Please select at least 2 products').should('be.visible')
    })
  })

  describe('Admin Dashboard', () => {
    beforeEach(() => {
      // Login as admin
      cy.request('POST', '/api/auth/login', {
        username: 'admin',
        password: 'admin123'
      }).then((response) => {
        expect(response.status).to.eq(200)
        window.localStorage.setItem('authToken', response.body.token)
      })
      cy.visit('/admin')
    })

    it('should load admin dashboard for admin user', () => {
      cy.contains('Admin Dashboard').should('be.visible')
      cy.contains('Device Management').should('be.visible')
    })

    it('should display device statistics', () => {
      cy.contains('Total Devices').should('be.visible')
      cy.contains('Devices in Repair').should('be.visible')
      cy.contains('Ready for Pickup').should('be.visible')
    })

    it('should allow viewing device details', () => {
      cy.contains('View Details').first().click()
      cy.contains('Device Information').should('be.visible')
    })

    it('should allow updating device status', () => {
      cy.contains('Update Status').first().click()
      cy.get('select[name="status"]').select('repaired')
      cy.contains('Save Changes').click()
      cy.contains('Status updated successfully').should('be.visible')
    })

    it('should show repair statistics', () => {
      cy.contains('Repair Statistics').should('be.visible')
      cy.contains('Average Repair Time').should('be.visible')
    })

    it('should allow admin to manage users', () => {
      cy.contains('User Management').click()
      cy.contains('Active Users').should('be.visible')
    })

    it('should display system logs', () => {
      cy.contains('System Logs').click()
      cy.contains('Recent Activity').should('be.visible')
    })
  })

  describe('Admin Access Control', () => {
    it('should redirect non-admin users from admin dashboard', () => {
      // Login as regular user
      cy.request('POST', '/api/auth/login', {
        username: 'logintest',
        password: 'loginpass123'
      }).then((response) => {
        expect(response.status).to.eq(200)
        window.localStorage.setItem('authToken', response.body.token)
      })

      cy.visit('/admin')
      cy.url().should('include', '/login')
      cy.contains('Access denied').should('be.visible')
    })

    it('should show admin navigation for admin users', () => {
      cy.request('POST', '/api/auth/login', {
        username: 'admin',
        password: 'admin123'
      }).then((response) => {
        expect(response.status).to.eq(200)
        window.localStorage.setItem('authToken', response.body.token)
      })

      cy.visit('/')
      cy.contains('Admin Panel').should('be.visible')
    })
  })
})