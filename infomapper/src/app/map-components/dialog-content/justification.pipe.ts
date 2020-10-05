import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'justification' })
// A pipe that makes sure to only update and be called when something changes on the page. Otherwise, these functions will be
// called whenever a change is detected, e.g. mouse movement. This ends up calling the functions thousands and thousands of
// times. Utilizing this pipe, it is only called - to determine a table cell justification or whether the table's cell is a
// URL - when the user actually scrolls through the table. This is when the computations need to be done, and won't slow down
// the app as much as before.
export class JustificationPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    if (args[0]) {
       return this.isURL(value);
    } else {
      if (this.isURL(value)) {
        return 'url';
      } else if (isNaN(Number(value))) {
        return 'left';
      } else {
        return 'right';
      }
    }
  }

  /**
   * @returns true if the given property to be displayed in the Mat Table cell is a URL.
   * @param property The Mat Table cell property to check
   */
  public isURL(property: any): boolean {
    if (typeof property === 'string') {
      if (property.startsWith('http://') || property.startsWith('https://') || property.startsWith('www.')) {
        return true;
      }
    } else return false;
  }

}
