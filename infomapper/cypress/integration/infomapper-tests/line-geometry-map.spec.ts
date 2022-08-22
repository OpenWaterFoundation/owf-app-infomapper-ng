/// <reference types="Cypress" />

import { MapComponent } from '@OpenWaterFoundation/common/leaflet';

declare global {
  interface Window {
      MapComponent?: MapComponent;
  }
}

/**
 * Major application elements tested:
 * 
 *   Point Map
 *   Doc Dialog
 *   Leaflet Sidebar
 */


// Test InfoMapper map features.
describe('Test InfoMapper Map Features', () => {
  var port = '4200';
  
  it('InfoMapper Home', () => {
    cy.visit('http://localhost:' + port)
    cy.url().should('match', /\/content-page\/home/)
  })

  it('InfoMapper SubMenu Line Map', () => {
    // Open the Maps dropdown menu and click on the Line Map subMenu.
    cy.get('[data-cy=Maps-dropdown-menu]').should('be.hidden')
    cy.get('[data-cy=Maps-dropdown-menu]').invoke('show').contains('Line Map').click()
    cy.get('[data-cy=Maps-dropdown-menu]').should('be.visible')
    cy.get('[data-cy=Maps-dropdown-menu]').invoke('hide')
    cy.get('[data-cy=Maps-dropdown-menu]').should('be.hidden')
    cy.url().should('match', /\/map\/*/)
    cy.wait(2000)
  })

  it('InfoMapper Line Map GeoMap Doc Dialog', () => {
    // Click on the geoMap DocDialog information button, confirm it's displaying,
    // and close the dialog.
    cy.get('[data-cy=line-geometry-geoMap-doc-dialog]').should('not.exist')
    cy.get('.geoMap-info-circle').click()
    cy.contains('Download with Markdown link')
      .should('have.attr', 'href', 'assets/app/data-maps/map-configuration-files/../../data-ts/../data-maps/map-layers/active-ditches.geojson')
      .should('have.attr', 'target', '_blank')
      .should('have.attr', 'rel', 'noopener noreferrer')
    cy.contains('Download with HTML link')
      .should('have.attr', 'href', 'assets/app/data-maps/map-layers/active-ditches.geojson')
      .should('have.attr', 'download')
    // This is what's actually determining whether the Doc Dialog is being displayed on the map.
    cy.get('[data-cy=line-geometry-geoMap-doc-dialog]').should('exist')
    cy.get('.upper-dialog-close-button').click()
    cy.get('[data-cy=line-geometry-geoMap-doc-dialog]').should('not.exist')
  })

  it('InfoMapper geoLayerViewGroup Kebab', () => {
    // Click on the geoLayerViewGroup kebab menu, click on the information button,
    // confirm it's displaying, and close the dialog.
    cy.get('[data-cy=line-map-view-group-doc-dialog]').should('not.exist')
    cy.get('[data-cy=geoLayerViewGroupKebab]').invoke('show').click()
    cy.get('[data-cy=geoLayerViewGroupInformation]').click()
    cy.contains('Open Water Foundation (OWF)').should('be.visible')
    cy.get('[data-cy=line-map-view-group-doc-dialog]').should('exist')
    cy.get('.upper-dialog-close-button').click()
    cy.get('[data-cy=line-map-view-group-doc-dialog]').should('not.exist')
  })

  it('InfoMapper geoLayerView Kebab & Information', () => {
    cy.get('[data-cy=swrf-line-layer-kebab]').click()
    cy.get('[data-cy=swrf-layer-view-doc-dialog]').should('not.exist')
    cy.get('[data-cy=swrf-line-layer-kebab-information]').click()
    cy.get('[data-cy=swrf-layer-view-doc-dialog]').should('exist')
    cy.get('[data-cy=swrf-layer-view-doc-upper-close]').click()
    cy.get('[data-cy=swrf-layer-view-doc-dialog]').should('not.exist')
  })

  it('InfoMapper geoLayerViewGroup (kebab) & backgroundViewGroup Collapse', () => {
    cy.get('[data-cy=line-map-view-group-expansion-panel-header]').click()
    cy.wait(600)
    cy.get('[data-cy=line-map-view-group-expansion-panel-header]')
    .should('have.attr', 'aria-expanded', 'false')
    cy.get('[data-cy=line-map-view-group-expansion-panel-header]').click()
    cy.wait(600)
    cy.get('[data-cy=line-map-view-group-expansion-panel-header]')
    .should('have.attr', 'aria-expanded', 'true')
    // Confirm the collapsible backgroundViewGroup button closes and opens correctly.
    cy.get('[data-cy=backgroundGroup-background-expansion-panel-header]').click()
    cy.wait(600)
    cy.get('[data-cy=backgroundGroup-background-expansion-panel-header]')
    .should('have.attr', 'aria-expanded', 'true')
    cy.get('[data-cy=backgroundGroup-background-expansion-panel-header]').click()
    cy.wait(600)
    cy.get('[data-cy=backgroundGroup-background-expansion-panel-header]')
    .should('have.attr', 'aria-expanded', 'false')
  })

  it('Sidebar Information', () => {
    cy.contains('Developed by the Open Water Foundation').should('be.hidden')
    cy.get('[data-cy=sidebar-information]').click()
    cy.contains('Developed by the Open Water Foundation').should('be.visible')
    // Go home.
    cy.get('[data-cy=sidebar-home]').click()
  })

  it('InfoMapper Sidebar', () => {
    cy.get('.leaflet-sidebar-left').should('not.have.class', 'collapsed')
    cy.get('[data-cy=sidebar-close]').click()
    cy.get('.leaflet-sidebar-left').should('have.class', 'collapsed')

    cy.get('[data-cy=sidebar-home]').click()
    cy.get('.leaflet-sidebar-left').should('not.have.class', 'collapsed')
    cy.get('[data-cy=sidebar-home]').click()
    cy.get('.leaflet-sidebar-left').should('have.class', 'collapsed')

    cy.get('[data-cy=sidebar-information]').click()
    cy.get('.leaflet-sidebar-left').should('not.have.class', 'collapsed')
    cy.get('[data-cy=sidebar-home]').click()
    cy.get('.leaflet-sidebar-left').should('not.have.class', 'collapsed')
    cy
    // cy.get('#mapID').then(($mainMap) => {
    //   console.log($mainMap[0])
    // })
    
    cy.window().then((win) => {
      const test = win.MapComponent.mainMap.getZoom();
      console.log(test);
    })
    
  })

})
