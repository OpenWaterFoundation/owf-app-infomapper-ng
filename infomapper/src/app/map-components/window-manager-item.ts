import { MatDialogRef } from '@angular/material/dialog';
import { WindowType }   from './window-manager';


/**
 * 
 */
export class WindowManagerItem {

  public title: string = null;
  public windowType: WindowType = null;
  public dialogRef: MatDialogRef<any> = null;


  constructor(dialogRef: MatDialogRef<any>, title: string, type: WindowType) {
    this.title = title;
    this.windowType = type;
    this.dialogRef = dialogRef;
  }


}