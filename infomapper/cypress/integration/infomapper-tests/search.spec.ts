/// <reference types="Cypress" />

// Test the InfoMapper global search feature.
describe('Test InfoMapper Search', () => {

    const port = '4200';
    
    it('should navigate to InfoMapper Home', () => {
      cy.visit('http://localhost:' + port)
      cy.url().should('match', /\/content-page\/home/)
    })
  
    it('should open up the Search dialog', () => {
      cy.get('[data-cy="global-meatball-menu"]').click()

      cy.get('[data-cy=global-search-main-container]').should('not.exist')
      cy.get('[data-cy="global-search-option"]').click()
      cy.get('[data-cy=global-search-main-container]').should('exist')
    })
  
    it('should make a successful search', () => {
        cy.get('[data-cy="global-search-keyword-checkbox"] input').should('be.checked')
        cy.get('[data-cy="global-search-fuzzy-checkbox"] input').should('not.be.checked')
        
        cy.get('[data-cy="global-search-input"]').type('map{enter}')
        cy.contains('results in').should('exist')
        cy.contains('Did not find anything that matched').should('not.exist')
    });

    it('should reset the search and make an unsuccessful search', () => {
        cy.get('[data-cy="global-search-keyword-checkbox"] input').should('be.checked')
        cy.get('[data-cy="global-search-fuzzy-checkbox"] input').should('not.be.checked')
        
        cy.get('[data-cy="global-search-input"]').type('{backspace}{backspace}{backspace}lap{enter}')
        cy.contains('Did not find anything that matched').should('exist')
        cy.contains('results in').should('not.exist')
    });

    it('should turn on fuzzy searching and make a successful search', () => {
        cy.get('[data-cy="global-search-keyword-checkbox"] input').should('be.checked')
        cy.get('[data-cy="global-search-fuzzy-checkbox"] input').should('not.be.checked')
        cy.get('[data-cy="global-search-fuzzy-checkbox"] input').click({force: true})
        cy.get('[data-cy="global-search-fuzzy-checkbox"] input').should('be.checked')
        
        cy.get('[data-cy="global-search-input"]').type('{enter}')
        cy.contains('Did not find anything that matched').should('not.exist')
        cy.contains('results in').should('exist')
    });

    it('should reset the search', () => {
        cy.get('[data-cy="global-search-keyword-checkbox"] input').should('be.checked')
        cy.get('[data-cy="global-search-fuzzy-checkbox"] input').should('be.checked')
        cy.get('[data-cy="global-search-input"]').type('{backspace}{backspace}{backspace}')

        cy.contains('Did not find anything that matched').should('not.exist')
        cy.contains('results in').should('not.exist')

        cy.get('[data-cy="global-search-keyword-checkbox"] input').click({force: true})
        cy.get('[data-cy="global-search-fuzzy-checkbox"] input').click({force: true})
        cy.get('[data-cy="global-search-keyword-checkbox"] input').should('not.be.checked')
        cy.get('[data-cy="global-search-fuzzy-checkbox"] input').should('not.be.checked')
    });

  })
  