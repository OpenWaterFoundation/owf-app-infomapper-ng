// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
declare namespace Cypress {
  interface Chainable<Subject> {

    clickDataTableKebab(geoId: string, address: string, feature: string): Chainable<Subject>
  }
}
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })

Cypress.Commands.add('clickDataTableKebab', (geoId, address, feature) => {
  cy.get('[data-cy=' + geoId + '-data-table-kebab]').click()
  cy.get('[data-cy=' + geoId + '-zoom-to-address]').should(address)
  cy.get('[data-cy=' + geoId + '-zoom-to-feature]').should(feature)
})


//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
