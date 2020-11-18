import { Pipe, PipeTransform } from '@angular/core';
import { MapLayerManager }     from './map-layer-manager';

@Pipe({ name: 'menuDisable' })
/**
 * A Pipe that determines whether a menu item in the kebab dropdown should be disabled or completely hidden. If the value exists
 * (e.g. layerView.properties.docPath) AND is a path, then return false since the menu button should NOT be disabled or hidden.
 */
export class MenuDisablePipe implements PipeTransform {

  public mapLayerManager: MapLayerManager = MapLayerManager.getInstance();

  transform(value: string, ...args: any[]): unknown {
    var disableType = args[0];
    var geoLayerId = args[1];

    // Selected Initial
    if (geoLayerId) {
      if (disableType === 'toggleCheck') {
        if (value === undefined || value === 'true') {
          return true;
        } else if (value === 'false') {
  
          // Callback executed when the description and symbols elements are found
          function handleCanvas(description: HTMLElement, symbols: HTMLElement) { 
            description.style.visibility = 'hidden';
            description.style.height = '0';
            symbols.style.visibility = 'hidden';
            symbols.style.height = '0';
          }
          // Set up the mutation observer
          var observer = new MutationObserver(function (mutations, me) {
            // `mutations` is an array of mutations that occurred
            // `me` is the MutationObserver instance
            let description = document.getElementById('description-' + geoLayerId);
            let symbols = document.getElementById('symbols-' + geoLayerId);
  
            if (description && symbols) {
              handleCanvas(description, symbols);
              me.disconnect(); // stop observing
              return;
            }
          });
          // Start observing
          observer.observe(document, {
            childList: true,
            subtree: true
          });
        } 

      } else if (disableType === 'dataTableCheck') {
        let isDisplayed = this.mapLayerManager.getLayerItem(value).isItemDisplayedOnMainMap();
        if (isDisplayed === true) {
          return false;
        } else {
          return true;
        }
      }
    }
    // Menu disable or hide
    else {
      if (value) {
        return false;
      } else {
        return true;
      }
    }

  }
}
