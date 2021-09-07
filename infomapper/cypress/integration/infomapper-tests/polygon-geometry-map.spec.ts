/// <reference types="Cypress" />

import { MapComponent } from '@OpenWaterFoundation/common/leaflet';

declare global {
  interface Window {
      MapComponent?: MapComponent;
  }
}

// Test InfoMapper map features.
describe('Test InfoMapper Map Features', () => {

  /**
   * Click and drag an element x & y pixels around the browser screen.
   * @param moveable String representing 
   * @param x 
   * @param y 
   */
  function movePiece (moveable, x, y) {
    // cy.wait(5000)
    // movePiece('.cdk-drag', 400, 100)
    cy.get(moveable)
      .trigger('mousedown', 'top') // , { which: 1 }
      .trigger('mousemove', { clientX: x, clientY: y })
      .trigger('mouseup', { force: true })
  }

  var port = '4201';

  it('InfoMapper Home', () => {
    cy.visit('http://localhost:' + port)
    cy.url().should('match', /\/#\/content-page\/home/)
  })

  it('InfoMapper SubMenu Polygon Map', () => {
    // Open the Maps dropdown menu and click on the Polygon Map subMenu.
    cy.get('.dropdown-menu').should('be.hidden')
    cy.get('.dropdown-menu').invoke('show').contains('Polygon Map').click()
    cy.get('.dropdown-menu').should('be.visible')
    cy.get('.dropdown-menu').invoke('hide')
    cy.get('.dropdown-menu').should('be.hidden')
    cy.url().should('match', /\/#\/map\/*/)
    // cy.wait(2000)
  })

  it('"ditch-service-areas" Kebab & Data Table', () => {
    // Open up the layer kebab menu.
    cy.get('[data-cy=ditch-service-areas-kebab]').click()
    cy.get('[data-cy=ditch-service-areas-kebab-data-table]').should('be.visible')
    cy.get('[data-cy=ditch-service-areas-kebab-data-table]').click()
    // Check if Fisk Ditch is correct, and Arthur Ditch does not exist.
    cy.get('[data-cy=ditch-service-areas-data-table-input]')
      .should('have.attr', 'data-placeholder', 'Filter all columns using the filter string. Press Enter to execute the filter.')
    cy.get('[data-cy=ditch-service-areas-data-table-input]')
      .type('Fisk Ditch{enter}')
    cy.get('[id="cell-470"]').should('be.visible')
    cy.get('[id="cell-0300797"]').should('be.visible')
    cy.get('[id="cell-Fisk Ditch"]').should('be.visible')
    cy.get('[id="cell-11.8835"]').should('be.visible')
    cy.get('[id="cell-Arthur Ditch"]').should('not.exist')
    cy.contains('No data matching the filter "Arthur Ditch"').should('not.exist')
    // How to test if this worked? ^^^
    // Confirm a bad query returns
    cy.get('[data-cy=ditch-service-areas-data-table-input]').clear()
    cy.get('[data-cy=ditch-service-areas-data-table-input]')
      .type('Kaladin Stormblessed{enter}')
    cy.contains('No data matching the filter "Kaladin Stormblessed"').should('exist')
    // Confirm both zoom to address and feature are disabled under the data table kebab.
    cy.clickDataTableKebab('ditch-service-areas', 'be.disabled', 'be.disabled')
    cy.get('body').click(0, 0)
    // Check if Arthur Ditch is correct, and Fisk Ditch does not exist.
    cy.get('[data-cy=ditch-service-areas-data-table-input]').clear()
    cy.get('[data-cy=ditch-service-areas-data-table-input]')
      .type('Arthur Ditch{enter}')
    cy.get('[id="cell-318"]').should('be.visible')
    cy.get('[id="cell-0300918"]').should('be.visible')
    cy.get('[id="cell-Arthur Ditch"]').should('be.visible')
    cy.get('[id="cell-5315.9009"]').should('be.visible')
    cy.get('[id="cell-Fisk Ditch"]').should('not.exist')
    cy.contains('No data matching the filter "Fisk Ditch"').should('not.exist')
    // Zoom to feature.
    cy.clickDataTableKebab('ditch-service-areas', 'be.disabled', 'be.enabled')
    cy.get('[data-cy=ditch-service-areas-zoom-to-feature]').click()
    // Close the Data Table dialog.
    cy.get('[data-cy=ditch-service-areas-data-table-lower-close]').click()

    // Open up the layer kebab menu.
    cy.get('[data-cy=ditch-service-areas-kebab]').click()
    // TODO: How to confirm the selection is cleared?
    cy.get('[data-cy="ditch-service-areas-kebab-clear-selection"]').click()
    
    cy.get('.leaflet-control-zoomhome-home').click()
    // Open the Data Table back up.
    cy.get('[data-cy=ditch-service-areas-kebab]').click()
    cy.get('[data-cy=ditch-service-areas-kebab-data-table]').click()
    // Switch to the Find from address with the radio button.
    // TODO: How to confirm a radio button is checked when using Angular Material?
    // cy.get('[data-cy=ditch-service-areas-radio-address]').should('not.have.class', '.mat-radio-checked')
    cy.get('[data-cy=ditch-service-areas-radio-address]').click()
    cy.get('[data-cy=ditch-service-areas-data-table-input]')
      .should('have.attr', 'data-placeholder', 'Filter by an address. Press Enter to execute the filter.')
    
    // Search for the Innosphere building by address.
    cy.get('[data-cy=ditch-service-areas-data-table-input]')
      .type('320 East Vine Dr. Fort Collins CO{enter}')
    cy.wait(2000)
    cy.get('[id="cell-35"]').should('be.visible')
    cy.get('[id="cell-0300919"]').should('be.visible')
    cy.get('[id="cell-Larimer & Weld Reservoir"]').should('be.visible')
    cy.get('[id="cell-85630.7928"]').should('be.visible')
    cy.contains('320 E Vine Dr, Fort Collins, CO 80524').should('exist')
    cy.get('[id="cell-Jackson Ditch"]').should('not.exist')
    // Confirm both zoom to address and feature exist and are enabled.
    cy.clickDataTableKebab('ditch-service-areas', 'be.enabled', 'be.enabled')
    // TODO: How to check zoom is correct?
    cy.get('[data-cy=ditch-service-areas-zoom-to-address]').click()
    
    
    cy.get('[data-cy=ditch-service-areas-data-table-lower-close]').click()
    // Mouseover the base layers Leaflet Control, and confirm they exist and are visible.
    cy.get('.leaflet-control-layers').trigger('mouseover')
    cy.get('.leaflet-control-layers-base').contains('Topographic')
      .should('exist').and('be.visible')
    cy.get('.leaflet-control-layers-base').contains('Satellite')
    .should('exist').and('be.visible')
    cy.get('.leaflet-control-layers-base').contains('Streets')
      .should('exist').and('be.visible')
    cy.get('.leaflet-control-layers-base').contains('Streets & Satellite')
      .should('exist').and('be.visible')
    // cy.get('.leaflet-control-layers-base').contains('Topographic').should('be.visible')
    // cy.get('.leaflet-control-layers-base').contains('Satellite').should('be.visible')
    // cy.get('.leaflet-control-layers-base').contains('Streets').should('be.visible')
    // cy.get('.leaflet-control-layers-base').contains('Streets & Satellite').should('be.visible')
    // Check the Satellite base layer.
    // TODO: How to confirm the radio was checked?
    cy.get('.leaflet-control-layers-selector').eq(1).check()

    cy.get('.leaflet-control-layers').trigger('mouseout')

    // Open the Data Table back up.
    cy.get('[data-cy=ditch-service-areas-kebab]').click()
    cy.get('[data-cy=ditch-service-areas-kebab-data-table]').click()
    cy.get('[data-cy=ditch-service-areas-radio-address]').click()
    cy.get('[data-cy=ditch-service-areas-data-table-input]')
      .type('320 East Vine Dr. Fort Collins CO{enter}')
    cy.get('[data-cy=ditch-service-areas-data-table-kebab]').click()
    cy.window().then((win) => {
      const currentMapZoom = win.MapComponent.mainMap.getZoom();
      expect(currentMapZoom).to.equal(16)
    })
    cy.get('[data-cy=ditch-service-areas-zoom-to-feature]').click()
    // Close the Date Table Dialog with the upper close button.
    cy.get('[data-cy=ditch-service-areas-data-table-upper-close]').click()
  })

  it('"ditch-service-areas" Kebab & Properties', () => {
    cy.get('[data-cy=ditch-service-areas-kebab]').click()
    cy.get('[data-cy=ditch-service-areas-kebab-properties]').click()
    cy.get('[data-cy=ditch-service-areas-property-content]')
      .scrollTo(0, 1000)
    cy.contains('assets/app/data-maps/map-layers/ditchserviceareas-district03.geojson')
      .should('exist').and('be.visible')
    cy.get('[data-cy=ditch-service-areas-property-lower-close]').click()
  })

  it('"water-district-boundaries-1" Kebab & useless Clear Selection', () => {
    cy.get('[data-cy=water-district-boundaries-1-kebab]').click()
    cy.get('[data-cy="water-district-boundaries-1-kebab-clear-selection"]').click()
    cy.contains('320 E Vine Dr, Fort Collins, CO 80524').should('exist')
  })

  // Finally clear the Innosphere marker and polygon highlighting off the map.
  it('"ditch-service-areas" Kebab & Clear Selection', () => {
    cy.get('[data-cy=ditch-service-areas-kebab]').click()
    cy.get('[data-cy="ditch-service-areas-kebab-clear-selection"]').click()
    // TODO: How to check that selection was cleared?
  })

  it('Ending Map Properties', () => {
    cy.window().then((win) => {
      const currentMapZoom = win.MapComponent.mainMap.getZoom();
      expect(currentMapZoom).to.equal(9.3)

      // var layerItem = win.MapComponent.mapLayerManager.getLayerItem('ditch-service-areas')
      // layerItem.hasSelectedLayer()
    })
  })

})
