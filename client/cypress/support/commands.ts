// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {
      login(username: string, password: string): Chainable<void>
      register(userData: any): Chainable<void>
    }
  }
}

// Custom command to login
Cypress.Commands.add('login', (username: string, password: string) => {
  cy.request('POST', '/api/auth/login', { username, password })
    .then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('token')
      // Store token for subsequent requests
      window.localStorage.setItem('authToken', response.body.token)
    })
})

// Custom command to register a user
Cypress.Commands.add('register', (userData: any) => {
  cy.request('POST', '/api/auth/register', userData)
    .then((response) => {
      expect(response.status).to.eq(201)
    })
})

export {}