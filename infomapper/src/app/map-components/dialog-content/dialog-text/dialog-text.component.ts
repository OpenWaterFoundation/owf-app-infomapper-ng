import { Component,
          OnInit,
          Inject }          from '@angular/core';
import { MatDialogRef,
          MAT_DIALOG_DATA } from '@angular/material/dialog';

import * as FileSaver       from 'file-saver';

import { MapService,
          SaveFileType }    from '../../map.service';
import { WindowManager }    from '../../window-manager';


@Component({
  selector: 'app-dialog-text',
  templateUrl: './dialog-text.component.html',
  styleUrls: ['./dialog-text.component.css', '../main-dialog-style.css']
})
export class DialogTextComponent implements OnInit {

  /**
   * A string representing the button ID of the button clicked to open this dialog.
   */
  public buttonID: string;
  /**
   * The text to be displayed in the dialog.
   */
  public text: any;
  /**
   * A string representing the file extension that the text came from. Used for the Download button tooltip.
   */
  public fileExtension: string;
  /**
   * A string representing the name that the text came from.
   */
  public fileName: string;
  /**
   * The windowManager instance for managing the opening and closing of windows throughout the InfoMapper.
   */
  public windowManager: WindowManager = WindowManager.getInstance();


  /**
   * 
   * @param dialogRef 
   * @param mapService 
   * @param dataObject 
   */
  constructor(public dialogRef: MatDialogRef<DialogTextComponent>,
              public mapService: MapService,
              @Inject(MAT_DIALOG_DATA) public dataObject: any) {

    this.buttonID = dataObject.data.buttonID;
    this.text = dataObject.data.text;
    this.fileName = dataObject.data.resourcePath;
    if (this.fileName.includes('.')) {
      this.fileExtension = this.fileName.split('.').pop();
    } else {
      this.fileExtension = this.fileName;
    }
  }


  /**
   * Called once on Component initialization, right after the constructor.
   */
  ngOnInit(): void {
    var splitPath = this.fileName.split('/');
    this.fileName = splitPath[splitPath.length - 1];
    
  }

  /**
   * Closes the Mat Dialog popup when the Close button is clicked.
   */
  public onClose(): void {
    this.dialogRef.close();
    this.windowManager.removeWindow(this.buttonID);
  }

  /**
   * Downloads the text as a Blob onto the user's local machine with the same name as the original file
   */
  public saveText(): void {
    var data = new Blob([this.text], { type: 'text/plain;charset=utf-8' });
    FileSaver.saveAs(data, this.mapService.formatSaveFileName(this.fileName, SaveFileType.text));
  }

}
