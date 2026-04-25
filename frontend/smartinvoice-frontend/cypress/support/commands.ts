// ***********************************************
// This commands.ts shows you how to create custom commands for Cypress.
// ***********************************************

// Login command
Cypress.Commands.add('login', (email = 'test@example.com', password = 'password123') => {
  cy.visit('/auth/sign-in');
  cy.get('input[formControlName="email"]').type(email);
  cy.get('input[formControlName="password"]').type(password);
  cy.get('button[type="submit"]').should('not.be.disabled');
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/dashboard');
  cy.wait(1000);
});

// Create invoice command
Cypress.Commands.add('createInvoice', (clientName = 'Jane Doe') => {
  cy.visit('/invoices/create');
  cy.wait(2000); // Wait for form to load
  cy.selectClient(clientName);
  cy.get('input[formControlName="invoiceDate"]').click();
  cy.get('.mat-calendar-body-today').click();
  cy.addLineItem('Test Product', 2, 100);
  cy.get('button').contains('Save Invoice').click();
});

// Improved select client command for Angular Material
Cypress.Commands.add('selectClient', (clientName: string) => {
  // Click to open autocomplete
  cy.get('input[formControlName="clientId"]').click();
  cy.wait(1000);
  
  // Wait for options panel to appear
  cy.get('.mat-autocomplete-panel, .cdk-overlay-pane', { timeout: 10000 })
    .should('be.visible');
  
  // Find and click the option
  cy.get('mat-option, .mat-mdc-option', { timeout: 10000 })
    .should('have.length.at.least', 1)
    .contains(clientName, { timeout: 10000 })
    .click({ force: true });
  
  // Verify client was selected
  cy.get('input[formControlName="clientId"]').should('not.have.value', '');
});

// Improved add line item command
Cypress.Commands.add('addLineItem', (description: string, quantity: number, price: number) => {
  // Click add line button
  cy.get('button').contains('Add Line').click();
  cy.wait(500);
  
  // Get the last row and fill in the values
  cy.get('tbody tr').last().within(() => {
    cy.get('input[formControlName="description"]').type(description);
    cy.get('input[formControlName="quantity"]').clear().type(quantity.toString());
    cy.get('input[formControlName="price"]').clear().type(price.toString());
  });
  
  cy.wait(500); // Wait for calculations
});

// Fill payment details command
Cypress.Commands.add('fillPaymentDetails', () => {
  cy.get('#cardNumber').type('4242424242424242');
  cy.get('#cardExpiry').type('12/28');
  cy.get('#cardCvc').type('123');
});

// Get by data-testid
Cypress.Commands.add('getByDataTestId', (testId: string) => {
  return cy.get(`[data-testid="${testId}"]`);
});

// Wait for Angular to stabilize
Cypress.Commands.add('waitForAngular', () => {
  cy.wait(500); // Simple wait
  cy.get('body').should('be.visible');
});
Cypress.Commands.add('waitForAutocomplete', () => {
  cy.get('.cdk-overlay-pane', { timeout: 10000 }).should('be.visible');
  cy.get('mat-option, .mat-mdc-option', { timeout: 10000 })
    .should('have.length.at.least', 1);
});
// Add TypeScript declarations
declare global {
  namespace Cypress {
    interface Chainable {
      login(email?: string, password?: string): Chainable<void>;
      createInvoice(clientName?: string): Chainable<void>;
      selectClient(clientName: string): Chainable<void>;
      addLineItem(description: string, quantity: number, price: number): Chainable<void>;
      fillPaymentDetails(): Chainable<void>;
      getByDataTestId(testId: string): Chainable<JQuery<HTMLElement>>;
      waitForAngular(): Chainable<void>;
    }
  }
}

export {};