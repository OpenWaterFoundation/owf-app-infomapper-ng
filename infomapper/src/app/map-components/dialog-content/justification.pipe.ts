import { Pipe,
          PipeTransform } from '@angular/core';

import { AppService }     from '../../app.service';

@Pipe({ name: 'justification' })
// A pipe that makes sure to only update and be called when something changes on the page. Otherwise, these functions will be
// called whenever a change is detected, e.g. mouse movement. This ends up calling the functions thousands and thousands of
// times. Utilizing this pipe, it is only called - to determine a table cell justification or whether the table's cell is a
// URL - when the user actually scrolls through the table. This is when the computations need to be done, and won't slow down
// the app as much as before.
export class JustificationPipe implements PipeTransform {

  constructor(private appService: AppService) { }

  transform(value: unknown, ...args: unknown[]): unknown {
    if (args[0]) {
       return this.appService.isURL(value);
    } else {
      if (this.appService.isURL(value)) {
        return 'url';
      } else if (isNaN(Number(value))) {
        return 'left';
      } else {
        return 'right';
      }
    }
  }

}
