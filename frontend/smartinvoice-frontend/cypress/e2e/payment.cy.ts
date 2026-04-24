/// <reference types="cypress" />

describe('Payment Flow', () => {
  beforeEach(() => {
    cy.login();
  });

  it('should display payment page for an invoice', () => {
    cy.visit('/payments/invoice/INV-2024-001');
    cy.wait(2000); // Wait for page to load
    cy.get('body').then(($body) => {
      cy.log('Page URL:', window.location.href);
      cy.log('Body HTML snippet:', $body.html().substring(0, 500));
    });
    cy.get('.payment-card', { timeout: 10000 }).should('be.visible');
    cy.contains('Invoice Details').should('be.visible');
    cy.contains('Total Amount Due').should('be.visible');
  });

  it('should show invoice not found for invalid ID', () => {
    cy.visit('/payments/invoice/invalid-id-12345');
    cy.wait(2000);
    cy.contains('Invoice not found', { timeout: 5000 }).should('be.visible');
  });

  it('should display order summary with line items', () => {
    cy.visit('/payments/invoice/INV-2024-001');
    cy.wait(2000);
    cy.contains('Order Summary', { timeout: 10000 }).should('be.visible');
    cy.get('.summary-row').should('have.length.at.least', 1);
  });

  it('should fill payment form and process payment', () => {
    cy.visit('/payments/invoice/INV-2024-001');
    cy.wait(2000);
    cy.get('#cardNumber', { timeout: 10000 }).should('be.visible').type('4242424242424242');
    cy.get('#cardExpiry').type('1228');
    cy.get('#cardCvc').type('123');
    cy.get('.stripe-btn').click();
    cy.contains('Payment successful', { timeout: 10000 }).should('be.visible');
    cy.url().should('include', '/invoices');
  });

  it('should show error for invalid card number', () => {
    cy.visit('/payments/invoice/INV-2024-001');
    cy.wait(2000);
    cy.get('#cardNumber', { timeout: 10000 }).should('be.visible').type('1111111111111111');
    cy.get('#cardExpiry').type('1228');
    cy.get('#cardCvc').type('123');
    cy.get('.stripe-btn').click();
    cy.contains('Invalid card number', { timeout: 5000 }).should('be.visible');
  });

  it('should generate QR code for payment', () => {
    cy.visit('/payments/invoice/INV-2024-001');
    cy.wait(2000);
    cy.get('.qr-btn', { timeout: 10000 }).should('be.visible').click();
    cy.get('.modal-content', { timeout: 5000 }).should('be.visible');
    cy.get('.modal-content img').should('be.visible');
    cy.get('.close-btn').click();
    cy.get('.modal-content').should('not.exist');
  });

  it('should download QR code', () => {
    cy.visit('/payments/invoice/INV-2024-001');
    cy.wait(2000);
    cy.get('.qr-btn', { timeout: 10000 }).should('be.visible').click();
    cy.get('.download-btn').click();
    cy.get('.close-btn').click();
  });
  it('debug - list all invoices', () => {
  cy.visit('/payments/invoice/INV-2024-001');
  cy.wait(2000);
  cy.get('body').then(($body) => {
    cy.log('Current URL:', window.location.href);
    // If redirected to home, the invoice wasn't found
  });
});
});