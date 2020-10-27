import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'menuDisable' })
/**
 * A Pipe that determines whether a menu item in the kebab dropdown should be disabled. If the value exists
 * (e.g. layerView.properties.docPath) then return false since the menu button should NOT be disabled.
 */
export class MenuDisablePipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    if (value) {
      return false;
    } else {
      return true;
    }
  }

}
