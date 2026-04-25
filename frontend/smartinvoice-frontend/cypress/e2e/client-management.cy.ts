/// <reference types="cypress" />

describe('Client Management Flow', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/clients');
    cy.wait(2000);
  });

  it('should display clients list', () => {
    cy.get('.clients-table').should('be.visible');
    cy.get('tbody tr').should('have.length.at.least', 1);
  });

  it('should search clients', () => {
    cy.get('.search-field input').type('Jane');
    cy.get('tbody tr').should('have.length', 1);
    cy.get('.client-name').should('contain', 'Jane Doe');
  });

  it('should filter clients by status', () => {
    cy.get('.filter-btn').contains('Active').click();
    cy.get('tbody tr').each(($row) => {
      cy.wrap($row).find('.status-badge').should('have.class', 'active');
    });
  });

  it('should navigate to create client page', () => {
    cy.get('.new-client-btn').click();
    cy.url().should('include', '/clients/create');
  });

  it('should create a new client', () => {
    cy.get('.new-client-btn').click();
    
    cy.get('input[formControlName="fullName"]').type('New Test Client');
    cy.get('input[formControlName="email"]').type('new@test.com');
    cy.get('input[formControlName="phone"]').type('+1234567890');
    cy.get('input[formControlName="companyName"]').type('New Test Corp');
    cy.get('input[formControlName="street"]').type('123 Test St');
    cy.get('input[formControlName="city"]').type('Test City');
    cy.get('mat-select[formControlName="country"]').click();
    cy.get('mat-option').contains('United States').click();
    
    cy.get('.save-btn').first().click();
    cy.url().should('include', '/clients');
  });

  it('should edit an existing client', () => {
    cy.get('tbody tr').first().find('.more-btn').click({ force: true });
    cy.wait(500);
    cy.get('.cdk-overlay-container .mat-mdc-menu-item').contains('Edit').click();
    cy.url().should('include', '/clients/edit');
    
    cy.get('input[formControlName="fullName"]').clear().type('Updated Client Name');
    cy.get('.save-btn').first().click();
    cy.url().should('include', '/clients');
  });

it('should delete a client', () => {
  // Get the first client name
  let clientName = '';
  cy.get('tbody tr').first().find('.client-name').then(($el) => {
    clientName = $el.text();
  });
  
  // Count initial rows
  let initialRowCount = 0;
  cy.get('tbody tr').then(($rows) => {
    initialRowCount = $rows.length;
  });
  
  // Click more button
  cy.get('tbody tr').first().find('.more-btn').click({ force: true });
  cy.wait(500);
  
  // Click Delete
  cy.get('.cdk-overlay-container .mat-mdc-menu-item').contains('Delete').click();
  cy.wait(1000);
  
  // Confirm and delete
  cy.get('.mat-mdc-dialog-container').should('be.visible');
  cy.get('.mat-mdc-dialog-container input').type(clientName);
  cy.get('.mat-mdc-dialog-container button').contains('Delete').click();
  
  // Wait for deletion to complete
  cy.wait(3000);
  
  // Verify row count decreased by 1
  cy.get('tbody tr').should('have.length', initialRowCount - 1);
  
  // Verify the client name is no longer in the table
  cy.contains(clientName).should('not.exist');
});
});