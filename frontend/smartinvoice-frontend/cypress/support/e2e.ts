// ***********************************************************
// This support file is processed and loaded automatically before your test files.
// ***********************************************************

import './commands';

Cypress.on('uncaught:exception', (err) => {
  // returning false here prevents Cypress from failing the test
  console.error('Uncaught exception:', err.message);
  return false;
});