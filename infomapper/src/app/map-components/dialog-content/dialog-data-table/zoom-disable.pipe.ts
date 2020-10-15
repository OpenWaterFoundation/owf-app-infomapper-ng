import { Pipe, PipeTransform } from '@angular/core';

/**
 * Use the @var leafletData from the DialogDataTableComponent and the layer's @var geoLayerId to determine whether the layer has
 * a selected (or highlighted) layer. If it doesn't, return true to tell the button to become disabled, and false otherwise.
 */
@Pipe({ name: 'zoomDisable' })
export class ZoomDisablePipe implements PipeTransform {

  transform(value: unknown, ...args: any[]): boolean {
    var isSelectedLayer = value[args[0]];

    if (isSelectedLayer) {
      // If the selected layer exists, then we don't want the button to be disabled, so return false
      return false;
    } else {
      // If no selected layer exists, then we DO want the button disabled, so return true
      return true;
    }
  }
}
