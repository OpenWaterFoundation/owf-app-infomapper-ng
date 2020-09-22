import { Component,
          Inject,
          OnInit }                      from '@angular/core';
import { MatDialog,
          MatDialogConfig,
          MatDialogRef,
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
  public displayedColumns: string[];

  constructor(public dialogRef: MatDialogRef<DialogTSTableComponent>,
              public mapService: MapService,
              @Inject(MAT_DIALOG_DATA) public dataObject: any) {

    this.attributeTable = new TableVirtualScrollDataSource(dataObject.data.attributeTable);
    this.displayedColumns = Object.keys(this.attributeTable.data[0]);
  }


  /**
   * Function that applies the necessary trimming to a filter query from the user
   * @param event The event passed when a DOM event is detected (user inputs into filter field)
   */
  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.attributeTable.filter = filterValue.trim().toUpperCase();
  }

  /**
   * @returns the name of the CSS class depending on if the cell's element is a URL, a number, or a string.
   * @param element The table element that is looked at to determine how the Mat table cell is styled
   */
  public determineJustification(element: any): string {

    if (this.isURL(element)) {
      return 'url';
    } else if (isNaN(Number(element))) {
      return 'left';
    } else {
      return 'right';
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
