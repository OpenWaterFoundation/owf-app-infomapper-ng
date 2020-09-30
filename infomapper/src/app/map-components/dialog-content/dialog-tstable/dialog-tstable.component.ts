import { Component,
          Inject,
          OnInit }                      from '@angular/core';
import { MatDialogRef,
          MAT_DIALOG_DATA }             from '@angular/material/dialog';
import { TableVirtualScrollDataSource } from 'ng-table-virtual-scroll';

import { MapService }                   from '../../map.service';

@Component({
  selector: 'app-dialog-tstable',
  templateUrl: './dialog-tstable.component.html',
  styleUrls: ['./dialog-tstable.component.css', '../main-dialog-style.css']
})
export class DialogTSTableComponent implements OnInit {

  public attributeTable: any;
  public displayedColumns: string[] = [];
  public units: string;

  constructor(public dialogRef: MatDialogRef<DialogTSTableComponent>,
              public mapService: MapService,
              @Inject(MAT_DIALOG_DATA) public dataObject: any) {

    this.attributeTable = new TableVirtualScrollDataSource(dataObject.data.attributeTable);
    this.displayedColumns = Object.keys(this.attributeTable.data[0]);
    this.units = dataObject.data.units;
  }


  /**
   * Function that applies the necessary trimming to a filter query from the user
   * @param event The event passed when a DOM event is detected (user inputs into filter field)
   */
  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.attributeTable.filter = filterValue.trim().toUpperCase();
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
