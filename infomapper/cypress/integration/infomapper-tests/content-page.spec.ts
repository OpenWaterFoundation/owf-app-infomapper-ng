/// <reference types="Cypress" />

describe('Test Content Page Features', () => {
  var port = '4201';
  
  it('InfoMapper Home', () => {
    cy.visit('http://localhost:' + port)
    cy.url().should('match', /\/#\/content-page\/home/)
  })

  it('InfoMapper MainMenu Content Page', () => {
    cy.get('.nav-link').contains('About the Project').click()
    cy.url().should('match', /\/#\/content-page\/about-the-project/)
  })

  it('Content Page Link 1', () => {
    cy.contains('Open Water Foundation (OWF)')
      .should('have.attr', 'href', 'https://openwaterfoundation.org')
      .should('have.attr', 'target', '_blank')
      .should('have.attr', 'rel', 'noopener noreferrer')
    cy.url().should('match', /\/#\/content-page\/about-the-project/)
  })

  it('Content Page Link 2', () => {
    cy.contains('Poudre Runs Through It')
      .should('have.attr', 'href', 'https://watercenter.colostate.edu/prti/')
      .should('have.attr', 'target', '_blank')
      .should('have.attr', 'rel', 'noopener noreferrer')
    cy.url().should('match', /\/#\/content-page\/about-the-project/)
  })
})

