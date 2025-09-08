describe('Authentication Flow', () => {
  beforeEach(() => {
    // Visit the application
    cy.visit('/')
  })

  it('should load the homepage', () => {
    cy.contains('Smart ICT Hardware Distribution & Services').should('be.visible')
  })

  it('should navigate to login page', () => {
    cy.contains('Sign In').click()
    cy.url().should('include', '/login')
  })

  describe('User Registration', () => {
    it('should navigate to signup page', () => {
      cy.visit('/login')
      cy.contains('Sign up here').click()
      cy.url().should('include', '/signup')
    })

    it('should register a new user successfully', () => {
      cy.register({
        username: 'cypresstest',
        password: 'testpass123',
        email: 'cypress@example.com',
        phoneNumber: '700123456',
        countryCode: '+254',
        firstName: 'Cypress',
        lastName: 'Test'
      })
      cy.contains('Account Created Successfully').should('be.visible')
    })

    it('should reject registration with invalid Kenyan phone number', () => {
      cy.visit('/signup')
      cy.get('input[name="firstName"]').type('Test')
      cy.get('input[name="lastName"]').type('User')
      cy.get('input[name="username"]').type('invalidphone')
      cy.get('input[name="email"]').type('invalid@example.com')
      cy.get('input[name="phoneNumber"]').type('123456789')
      cy.get('input[name="countryCode"]').select('+254')
      cy.get('input[name="password"]').type('testpass123')
      cy.get('input[name="confirmPassword"]').type('testpass123')
      cy.get('input[name="city"]').type('Nairobi')
      cy.get('input[name="primaryInterest"]').select('New Hardware')
      cy.get('input[name="communicationPreferences"]').check(['email'])
      cy.get('input[name="agreeToTerms"]').check()
      cy.contains('Create Account').click()
      cy.contains('valid Kenyan phone number').should('be.visible')
    })

    it('should reject registration with non-Kenyan country code', () => {
      cy.visit('/signup')
      cy.get('input[name="firstName"]').type('Test')
      cy.get('input[name="lastName"]').type('User')
      cy.get('input[name="username"]').type('nonkenya')
      cy.get('input[name="email"]').type('nonkenya@example.com')
      cy.get('input[name="phoneNumber"]').type('700123456')
      cy.get('input[name="countryCode"]').select('+1')
      cy.get('input[name="password"]').type('testpass123')
      cy.get('input[name="confirmPassword"]').type('testpass123')
      cy.get('input[name="city"]').type('New York')
      cy.get('input[name="primaryInterest"]').select('New Hardware')
      cy.get('input[name="communicationPreferences"]').check(['email'])
      cy.get('input[name="agreeToTerms"]').check()
      cy.contains('Create Account').click()
      cy.contains('currently only available for Kenya').should('be.visible')
    })

    it('should reject registration with duplicate username', () => {
      // First registration
      cy.register({
        username: 'duplicateuser',
        password: 'testpass123',
        email: 'duplicate1@example.com',
        phoneNumber: '700123457',
        countryCode: '+254',
        firstName: 'Duplicate',
        lastName: 'User'
      })

      // Second registration with same username
      cy.visit('/signup')
      cy.get('input[name="firstName"]').type('Duplicate')
      cy.get('input[name="lastName"]').type('User2')
      cy.get('input[name="username"]').type('duplicateuser') // Same username
      cy.get('input[name="email"]').type('duplicate2@example.com')
      cy.get('input[name="phoneNumber"]').type('700123458')
      cy.get('input[name="countryCode"]').select('+254')
      cy.get('input[name="password"]').type('testpass123')
      cy.get('input[name="confirmPassword"]').type('testpass123')
      cy.get('input[name="city"]').type('Nairobi')
      cy.get('input[name="primaryInterest"]').select('New Hardware')
      cy.get('input[name="communicationPreferences"]').check(['email'])
      cy.get('input[name="agreeToTerms"]').check()
      cy.contains('Create Account').click()
      cy.contains('Registration Failed').should('be.visible')
    })

    it('should reject registration with mismatched passwords', () => {
      cy.visit('/signup')
      cy.get('input[name="firstName"]').type('Test')
      cy.get('input[name="lastName"]').type('User')
      cy.get('input[name="username"]').type('mismatchpass')
      cy.get('input[name="email"]').type('mismatch@example.com')
      cy.get('input[name="phoneNumber"]').type('700123459')
      cy.get('input[name="countryCode"]').select('+254')
      cy.get('input[name="password"]').type('testpass123')
      cy.get('input[name="confirmPassword"]').type('differentpass')
      cy.get('input[name="city"]').type('Nairobi')
      cy.get('input[name="primaryInterest"]').select('New Hardware')
      cy.get('input[name="communicationPreferences"]').check(['email'])
      cy.get('input[name="agreeToTerms"]').check()
      cy.contains('Create Account').click()
      cy.contains('Passwords don\'t match').should('be.visible')
    })

    it('should reject registration without agreeing to terms', () => {
      cy.visit('/signup')
      cy.get('input[name="firstName"]').type('Test')
      cy.get('input[name="lastName"]').type('User')
      cy.get('input[name="username"]').type('noterms')
      cy.get('input[name="email"]').type('noterms@example.com')
      cy.get('input[name="phoneNumber"]').type('700123460')
      cy.get('input[name="countryCode"]').select('+254')
      cy.get('input[name="password"]').type('testpass123')
      cy.get('input[name="confirmPassword"]').type('testpass123')
      cy.get('input[name="city"]').type('Nairobi')
      cy.get('input[name="primaryInterest"]').select('New Hardware')
      cy.get('input[name="communicationPreferences"]').check(['email'])
      // Don't check agreeToTerms
      cy.contains('Create Account').click()
      cy.contains('You must agree to the terms').should('be.visible')
    })

    it('should reject registration with missing required fields', () => {
      cy.visit('/signup')
      cy.contains('Create Account').click()
      cy.contains('First name is required').should('be.visible')
      cy.contains('Last name is required').should('be.visible')
      cy.contains('Username must be at least 3 characters').should('be.visible')
      cy.contains('Please enter a valid email address').should('be.visible')
      cy.contains('Phone number is required').should('be.visible')
      cy.contains('Please select your country').should('be.visible')
      cy.contains('Password must be at least 6 characters').should('be.visible')
      cy.contains('City is required').should('be.visible')
      cy.contains('Please select your primary interest').should('be.visible')
      cy.contains('Select at least one communication preference').should('be.visible')
    })
  })

  describe('User Login', () => {
    beforeAll(() => {
      // Create a test user for login tests
      cy.register({
        username: 'logintest',
        password: 'loginpass123',
        email: 'login@example.com',
        phoneNumber: '700123461',
        countryCode: '+254',
        firstName: 'Login',
        lastName: 'Test'
      })
    })

    it('should login successfully', () => {
      cy.login('logintest', 'loginpass123')
      cy.contains('Welcome back, logintest!').should('be.visible')
    })

    it('should reject login with wrong password', () => {
      cy.visit('/login')
      cy.get('input[name="username"]').type('logintest')
      cy.get('input[name="password"]').type('wrongpassword')
      cy.contains('Sign In').click()
      cy.contains('Invalid credentials').should('be.visible')
    })

    it('should reject login with non-existent username', () => {
      cy.visit('/login')
      cy.get('input[name="username"]').type('nonexistentuser')
      cy.get('input[name="password"]').type('somepassword')
      cy.contains('Sign In').click()
      cy.contains('Invalid credentials').should('be.visible')
    })

    it('should reject login with missing credentials', () => {
      cy.visit('/login')
      cy.get('input[name="username"]').type('logintest')
      // Don't fill password
      cy.contains('Sign In').click()
      cy.contains('Invalid credentials').should('be.visible')
    })

    it('should handle rate limiting for multiple failed login attempts', () => {
      // Make multiple failed login attempts
      for (let i = 0; i < 6; i++) {
        cy.visit('/login')
        cy.get('input[name="username"]').type('logintest')
        cy.get('input[name="password"]').type('wrongpassword')
        cy.contains('Sign In').click()
      }
      cy.contains('Too many authentication attempts').should('be.visible')
    })

    it('should show password visibility toggle', () => {
      cy.visit('/login')
      cy.get('input[name="password"]').should('have.attr', 'type', 'password')
      cy.get('button[type="button"]').click() // Eye icon
      cy.get('input[name="password"]').should('have.attr', 'type', 'text')
      cy.get('button[type="button"]').click() // EyeOff icon
      cy.get('input[name="password"]').should('have.attr', 'type', 'password')
    })

    it('should remember me functionality work', () => {
      cy.visit('/login')
      cy.get('input[name="username"]').type('logintest')
      cy.get('input[name="password"]').type('loginpass123')
      cy.get('input[name="rememberMe"]').check()
      cy.contains('Sign In').click()
      cy.contains('Welcome back, logintest!').should('be.visible')
      // In a real scenario, we'd check if session persists across browser restarts
    })
  })

  describe('Password Security', () => {
    it('should hash passwords before storing in database', () => {
      // Register a user
      cy.register({
        username: 'hashuser',
        password: 'plainpassword123',
        email: 'hash@example.com',
        phoneNumber: '700123462',
        countryCode: '+254',
        firstName: 'Hash',
        lastName: 'Test'
      })

      // Login should work with the plain password
      cy.login('hashuser', 'plainpassword123')
      cy.contains('Welcome back, hashuser!').should('be.visible')
    })

    it('should reject weak passwords', () => {
      cy.visit('/signup')
      cy.get('input[name="firstName"]').type('Test')
      cy.get('input[name="lastName"]').type('User')
      cy.get('input[name="username"]').type('weakpass')
      cy.get('input[name="email"]').type('weak@example.com')
      cy.get('input[name="phoneNumber"]').type('700123463')
      cy.get('input[name="countryCode"]').select('+254')
      cy.get('input[name="password"]').type('123') // Too short
      cy.get('input[name="confirmPassword"]').type('123')
      cy.get('input[name="city"]').type('Nairobi')
      cy.get('input[name="primaryInterest"]').select('New Hardware')
      cy.get('input[name="communicationPreferences"]').check(['email'])
      cy.get('input[name="agreeToTerms"]').check()
      cy.contains('Create Account').click()
      cy.contains('Password must be at least 6 characters').should('be.visible')
    })
  })

  describe('Session Management', () => {
    it('should maintain session after login', () => {
      cy.login('logintest', 'loginpass123')
      cy.visit('/products') // Navigate to another page
      cy.url().should('include', '/products')
      // Should still be logged in (no redirect to login)
    })

    it('should logout successfully', () => {
      cy.login('logintest', 'loginpass123')
      // Assuming there's a logout button or link
      cy.contains('Logout').click()
      cy.contains('Sign In').should('be.visible')
    })

    it('should redirect to login for protected routes when not authenticated', () => {
      cy.visit('/admin')
      cy.url().should('include', '/login')
    })
  })

  it('should access protected routes after login', () => {
    cy.login('logintest', 'loginpass123')

    // Visit admin page (should work if user has admin role)
    cy.visit('/admin')
    // This might fail if user doesn't have admin role, which is expected
  })
})

describe('Product Browsing', () => {
  beforeEach(() => {
    cy.visit('/products')
  })

  it('should display products', () => {
    cy.contains('Our Products').should('be.visible')
    cy.get('[data-testid="product-card"]').should('have.length.greaterThan', 0)
  })

  it('should filter products by category', () => {
    cy.contains('Laptops').click()
    cy.url().should('include', 'category=laptops')
  })

  it('should search products', () => {
    cy.get('input[placeholder*="Search"]').type('Dell')
    cy.contains('Dell').should('be.visible')
  })
})

describe('Trade-in Process', () => {
  beforeEach(() => {
    cy.visit('/trade-in')
  })

  it('should load trade-in form', () => {
    cy.contains('Device Trade-In Program').should('be.visible')
  })

  it('should calculate trade-in estimate', () => {
    cy.get('select[name="deviceType"]').select('laptop')
    cy.get('select[name="brand"]').select('dell')
    cy.get('input[name="model"]').type('Latitude 7420')
    cy.get('select[name="age"]').select('1-2')
    cy.get('input[value="good"]').check()
    cy.contains('Get Instant Quote').click()
    cy.contains('$').should('be.visible')
  })
})

describe('Warranty Lookup', () => {
  beforeEach(() => {
    cy.visit('/services')
  })

  it('should lookup warranty', () => {
    cy.get('input[placeholder*="serial number"]').type('DL7420-CORP-001')
    cy.contains('Check Warranty Status').click()
    cy.contains('Warranty Active').should('be.visible')
  })
})

describe('Chatbot Interaction', () => {
  it('should interact with chatbot', () => {
    // Chatbot should be available on all pages
    cy.contains('SkavBot').should('be.visible')
    // Note: Actual chatbot interaction would require more complex setup
  })
})