import { Component,
          OnInit,
          Inject }          from '@angular/core';
import { MatDialogRef,
          MAT_DIALOG_DATA } from '@angular/material/dialog';

import { MapService }       from '../../map.service';

@Component({
  selector: 'app-dialog-text',
  templateUrl: './dialog-text.component.html',
  styleUrls: ['./dialog-text.component.css', '../main-dialog-style.css']
})
export class DialogTextComponent implements OnInit {

  public text: any;

  constructor(public dialogRef: MatDialogRef<DialogTextComponent>,
              public mapService: MapService,
              @Inject(MAT_DIALOG_DATA) public dataObject: any) {

    this.text = dataObject.data.text;
  }

  ngOnInit(): void {
  }

  /**
   * Closes the Mat Dialog popup when the Close button is clicked.
   */
  public onClose(): void {
    this.mapService.resetClick();
    this.dialogRef.close();
  }

}
