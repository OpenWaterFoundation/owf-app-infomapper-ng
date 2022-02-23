/// <reference types="Cypress" />

/**
 * Major application elements tested:
 * 
 *   Point Map
 *   VVVVVV TODO VVVVVVV
 *   TSGraph Dialog
 *   Text Dialog
 *   Heatmap Dialog
 *   D3 Dialog
 *   Gapminder Dialog
 */

describe('Test Point Map & Various Dialog Features', () => {
  var port = '4200';
  
  it('InfoMapper Home', () => {
    cy.visit('http://localhost:' + port)
    cy.url().should('match', /\/#\/content-page\/home/)
  })

  it('InfoMapper SubMenu Point Map', () => {
    // Open the Maps dropdown menu and click on the Line Map subMenu.
    cy.get('.dropdown-menu').should('be.hidden')
    cy.get('.dropdown-menu').invoke('show').contains('Point Map').click()
    cy.get('.dropdown-menu').should('be.visible')
    cy.get('.dropdown-menu').invoke('hide')
    cy.get('.dropdown-menu').should('be.hidden')
    cy.url().should('match', /\/#\/map\/*/)
  })

  it('"diversions-point-layer" Kebab & Data Table', () => {
    // Open up the layer kebab menu.
    cy.get('[data-cy=diversions-point-layer-kebab]').click()
    cy.get('[data-cy=diversions-point-layer-kebab-data-table]').should('be.visible')
    cy.get('[data-cy=diversions-point-layer-kebab-data-table]').click()
    // Confirm the Data Table exists and search for the Larimer County Ditch.
    cy.get('[data-cy=diversions-point-layer-data-table-input]')
      .should('have.attr', 'data-placeholder', 'Filter all columns using the filter string. Press Enter to execute the filter.')
    cy.get('[data-cy=diversions-point-layer-data-table-input]')
      .type('Hansen Supply Canal{enter}')
    // Confirm the ditch data is accurate.
    cy.get('[id="cell-1"]').should('be.visible')
    cy.get('[id="cell-3"]').should('be.visible')
    cy.get('[id="cell-LARIMER"]').should('be.visible')
    cy.get('[id="cell-HANSEN SUPPLY CANAL TO CACHE LA POUDRE RIVER NEAR FORT COLLINS"]').should('be.visible')
    cy.get('[id="cell-NCWCD"]').should('be.visible')

    // Zoom to Larimer County Ditch feature.
    cy.get('[data-cy=diversions-point-layer-data-table-kebab]').click()
    cy.get('[data-cy=diversions-point-layer-zoom-to-feature]').click()
    // Close the Data Table dialog.
    cy.get('[data-cy=diversions-point-layer-data-table-lower-close]').click()
    // Wait 1 second in case the zoom is still being performed. If the following
    // clicks happen too soon, they can miss the feature or accidentally click
    // another feature.
    cy.wait(1000)

    // TODO: This was the only way I could find to click on a feature created from
    // Leaflet. Since Leaflet creates these on the DOM dynamically, there's no where
    // in the code for me to set the day-cy attribute. I also tried to grab the
    // element I wanted from the array like object of features, but it's not guaranteed
    // to be in the same order every time. There's not a consistent uniqueness to
    // these features, so clicking on specific pixels on the map was used instead.
    // This means the tests MUST be run on the 23" Dell monitor at OWF.

    // cy.get('path').each(($el, index, list) => {
    //   // console.log($el[0]['attributes']['fill']);
    //   if (index === 11) {
    //     cy.wrap($el).click()
    //   }
    // })
    cy.get('#mapID').click(820, 470)
    cy.get('#mapID').click(820, 450)
  })

  it('TSGraph Dialog', () => {
    cy.get('[data-cy=diversion-popup-template-Diversions-plotly-tsgraph-dialog]').should('not.exist')
    cy.get('[data-cy=diversion-popup-template-Diversions]').click()
    cy.get('[data-cy=diversion-popup-template-Diversions-plotly-tsgraph-dialog]').should('exist')
    cy.get('[data-cy=diversion-popup-template-Diversions-tsgraph-dialog-lower-close]').click()
    cy.get('[data-cy=diversion-popup-template-Diversions-plotly-tsgraph-dialog]').should('not.exist')
  })
  
  it('Text Dialog', () => {
    cy.get('[data-cy=diversion-popup-template-Report-content-text-dialog]').should('not.exist')
    cy.get('[data-cy=diversion-popup-template-Report]').click()
    cy.get('[data-cy=diversion-popup-template-Report-content-text-dialog]').should('exist')
    cy.get('[data-cy=diversion-popup-template-Report-text-dialog-lower-close]').click()
    cy.get('[data-cy=diversion-popup-template-Report-content-text-dialog]').should('not.exist')
  })

  it('Heatmap Dialog', () => {
    cy.get('[data-cy=diversions-point-layer-dialog-heatmap-content-heatmap-dialog]').should('not.exist')
    cy.get('[data-cy=diversion-popup-template-Heatmap]').click()
    cy.get('[data-cy=diversions-point-layer-dialog-heatmap-content-heatmap-dialog]').should('exist')
    cy.get('[data-cy=diversions-point-layer-dialog-heatmap-heatmap-dialog-lower-close]').click()
    cy.get('[data-cy=diversions-point-layer-dialog-heatmap-content-heatmap-dialog]').should('not.exist')
  })

  it('D3 Dialog', () => {
    cy.get('[data-cy=diversions-point-layer-d3-content]').should('not.exist')
    cy.get('[data-cy=diversion-popup-template-D3]').click()
    cy.get('[data-cy=diversions-point-layer-d3-content]').should('exist')
    cy.get('[data-cy=diversions-point-layer-d3-lower-close]').click()
    cy.get('[data-cy=diversions-point-layer-d3-content]').should('not.exist')
    
  })

  // it('Gapminder Dialog', () => {
  //   cy.get('[data-cy=diversion-popup-template-D3 Viz]').click()
  // })
})

