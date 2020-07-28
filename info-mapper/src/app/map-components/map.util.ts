/**
 * This MapUtil class is a utilization class for the Map Component Class. It helps with data manipulation and other computational
 * helper functions that take up quite a bit of space in the map.component.ts class. To keep the size of that file in check, this
 * class takes a large chunk of that size into itself. This will hopefully clean up code and keep it easier to read and manage
 * in the future. Also, it's good practice in the exporting and importing of functions for components.
 */


export class MapUtil {

  public static sayHello(): void {
    console.log('Say hello!');
    
  }
}