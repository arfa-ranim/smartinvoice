/// <reference types="cypress" />

describe('Login Flow', () => {
  beforeEach(() => {
    cy.visit('/auth/sign-in');
  });

  it('should display login form', () => {
    cy.get('input[formControlName="email"]').should('be.visible');
    cy.get('input[formControlName="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should show validation errors for empty fields', () => {
    // Try to submit without filling fields
    cy.get('button[type="submit"]').click({ force: true });
    // Check for error messages
    cy.get('.error-msg').should('be.visible');
  });

  it('should show error for invalid email', () => {
    cy.get('input[formControlName="email"]').type('invalid-email');
    cy.get('input[formControlName="password"]').type('password123');
    // Click with force since button might be disabled until form is valid
    cy.get('button[type="submit"]').click({ force: true });
    cy.contains('Valid email required').should('be.visible');
  });

  it('should login successfully with valid credentials', () => {
    cy.get('input[formControlName="email"]').type('test@example.com');
    cy.get('input[formControlName="password"]').type('password123');
    // Wait for button to become enabled
    cy.get('button[type="submit"]').should('not.be.disabled');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should remember email when remember me is checked', () => {
    // Fix: The checkbox selector might be different
    cy.get('input[formControlName="email"]').type('remembered@example.com');
    cy.get('input[formControlName="password"]').type('password123');
    // Try different selectors for remember me checkbox
    cy.get('input[formControlName="rememberMe"], .mat-mdc-checkbox input, .mat-checkbox input')
      .first()
      .check({ force: true });
    cy.get('button[type="submit"]').should('not.be.disabled');
    cy.get('button[type="submit"]').click();
    
    cy.reload();
    cy.get('input[formControlName="email"]').should('have.value', 'remembered@example.com');
  });

  it('should navigate to forgot password page', () => {
    cy.get('.forgot-link').click();
    cy.url().should('include', '/auth/forgot-password');
  });

  it('should navigate to sign up page', () => {
    cy.get('.signup-link a').click();
    cy.url().should('include', '/auth/sign-up');
  });
});