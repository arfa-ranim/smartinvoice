/// <reference types="cypress" />

describe('Create Invoice Flow', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/invoices/create');
    cy.wait(3000); // Increased wait time
    cy.waitForAngular();
  });

  it('should display create invoice form', () => {
    cy.get('h1').should('contain', 'Create New Invoice');
    cy.get('input[formControlName="clientId"]').should('be.visible');
    cy.get('input[formControlName="invoiceDate"]').should('be.visible');
    cy.get('table.line-items-table').should('be.visible');
  });

  it('should allow selecting a client', () => {
    cy.selectClient('Jane Doe');
    cy.get('input[formControlName="clientId"]').should('not.have.value', '');
  });

  it('should allow adding line items', () => {
    const initialCount = 1; // Starts with 1 line item
    cy.get('button').contains('Add Line').click();
    cy.wait(500);
    cy.get('tbody tr').should('have.length.at.least', 2);
  });

  it('should allow removing line items', () => {
    // Add a second line item first
    cy.get('button').contains('Add Line').click();
    cy.wait(500);
    
    // Get initial count
    let initialCount = 0;
    cy.get('tbody tr').then(($rows) => {
      initialCount = $rows.length;
      cy.log(`Initial count: ${initialCount}`);
    });
    
    // Delete first row
    cy.get('tbody tr').first().find('button[type="button"]').first().click();
    
    // Handle confirm dialog
    cy.on('window:confirm', () => true);
    
    cy.wait(500);
    
    // Verify count decreased
    cy.get('tbody tr').should('have.length', initialCount - 1);
  });

  it('should calculate totals correctly', () => {
    cy.selectClient('Jane Doe');
    cy.addLineItem('Product 1', 2, 100);
    cy.addLineItem('Product 2', 1, 50);
    
    cy.wait(1000); // Wait for calculations
    
    // Check totals - adjust selectors based on your actual DOM
    cy.contains('Subtotal').parent().should('contain', '250.00');
    cy.contains('VAT').parent().should('contain', '47.50');
    cy.contains('Grand Total').parent().should('contain', '297.50');
  });

  it('should save invoice as draft', () => {
    cy.selectClient('Jane Doe');
    cy.addLineItem('Test Draft', 1, 100);
    cy.get('button').contains('Save as Draft').click();
    cy.contains('Draft saved', { timeout: 5000 }).should('be.visible');
  });

  it('should create invoice successfully', () => {
    cy.selectClient('Jane Doe');
    cy.addLineItem('Consulting Services', 5, 150);
    cy.get('button').contains('Save Invoice').click();
    cy.contains('Invoice created successfully', { timeout: 5000 }).should('be.visible');
    cy.url().should('include', '/invoices');
  });

  it('should show validation errors when required fields missing', () => {
    cy.get('button').contains('Save Invoice').click();
    cy.get('.error-message, mat-error, .mat-mdc-snack-bar-container', { timeout: 5000 })
      .should('be.visible');
  });

  it('debug autocomplete', () => {
    cy.get('input[formControlName="clientId"]').click();
    cy.wait(1000);
    cy.get('body').then(($body) => {
      cy.log('Body HTML contains mat-option?', $body.find('mat-option').length);
      cy.log('Body HTML contains .mat-mdc-option?', $body.find('.mat-mdc-option').length);
      cy.log('Body HTML contains .cdk-overlay-pane?', $body.find('.cdk-overlay-pane').length);
    });
  });
  
});