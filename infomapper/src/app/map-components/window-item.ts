import { MatDialogRef } from '@angular/material/dialog';
import { WindowType }   from './window-manager';


/**
 * 
 */
export class WindowItem {

  public dialogRef: MatDialogRef<any> = null;
  public windowID: string = null;
  public windowType: WindowType = null;


  constructor(windowID: string, type: WindowType, dialogRef?: MatDialogRef<any>) {
    this.windowID = windowID;
    this.windowType = type;
    this.dialogRef = dialogRef;
  }


}