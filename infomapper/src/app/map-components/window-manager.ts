import { WindowManagerItem } from './window-manager-item';
import { MatDialogRef }      from '@angular/material/dialog';

/**
 * A helper singleton class for creating, managing and maintaining multiple opened Material Dialogs (WindowManagerItem object)
 * while viewing a map in the Infomapper. The fact that it is singleton is important, as it allows the building of a unique
 * name using a number to signify how many windows have been opened.
 */
export class WindowManager {
  // The number of the window that's been opened, starting at 0
  private windowNumber = 0;
  // The instance of this WindowManager object
  private static instance: WindowManager;
  // The object to hold each WindowManagerItem, with the Item's title as a key
  public windows: {} = {};

  // A private constructor is declared so any instance of the class cannot be created elsewhere, getInstance must be called
  private constructor() { }


  public static getInstance(): WindowManager {
    if (!WindowManager.instance) { WindowManager.instance = new WindowManager(); }
    return WindowManager.instance;
  }

  /**
   * 
   * @param dialogRef 
   * @param title 
   * @param type 
   */
  public addWindow(dialogRef: MatDialogRef<any>, title: string, type: WindowType): void {
    var window = new WindowManagerItem(dialogRef, title + this.windowNumber, type);
    this.windowNumber++;
    this.windows[title] = window;
  }


  public closeWindow(): void {

  }

}


export enum WindowType {
  TSGRAPH,
  DOCS,
  TEXT,
  TABLE
}