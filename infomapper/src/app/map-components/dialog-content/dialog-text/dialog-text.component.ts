import { Component,
          OnInit,
          Inject }          from '@angular/core';
import { MatDialogRef,
          MAT_DIALOG_DATA } from '@angular/material/dialog';

import * as FileSaver       from 'file-saver';

import { MapService,
          SaveFileType }    from '../../map.service';


@Component({
  selector: 'app-dialog-text',
  templateUrl: './dialog-text.component.html',
  styleUrls: ['./dialog-text.component.css', '../main-dialog-style.css']
})
export class DialogTextComponent implements OnInit {

  public text: any;
  public fileExtension: string;
  public fileName: string;

  constructor(public dialogRef: MatDialogRef<DialogTextComponent>,
              public mapService: MapService,
              @Inject(MAT_DIALOG_DATA) public dataObject: any) {

    this.text = dataObject.data.text;
    this.fileName = dataObject.data.resourcePath;
    if (this.fileName.includes('.')) {
      this.fileExtension = this.fileName.split('.').pop();
    } else {
      this.fileExtension = this.fileName;
    }
  }

  ngOnInit(): void {
    var splitPath = this.fileName.split('/');
    this.fileName = splitPath[splitPath.length - 1];
    
  }

  /**
   * Closes the Mat Dialog popup when the Close button is clicked.
   */
  public onClose(): void {
    this.mapService.resetClick();
    this.dialogRef.close();
  }

  /**
   * Downloads the text as a Blob onto the user's local machine with the same name as the original file
   */
  public saveText(): void {
    var data = new Blob([this.text], { type: 'text/plain;charset=utf-8' });
    FileSaver.saveAs(data, this.mapService.formatSaveFileName(this.fileName, SaveFileType.text));
  }

}
