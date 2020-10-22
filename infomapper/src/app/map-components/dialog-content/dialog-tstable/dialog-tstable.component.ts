import { Component,
          Inject,
          OnInit }                      from '@angular/core';
import { MatDialogRef,
          MAT_DIALOG_DATA }             from '@angular/material/dialog';
import { TableVirtualScrollDataSource } from 'ng-table-virtual-scroll';

import * as FileSaver                   from 'file-saver';

import { MapService,
          SaveFileType }                from '../../map.service';

import { WriteDelimitedFile_Command }   from '../../owf/ts-command-processor/commands/delimited/WriteDelimitedFile_Command';
import { DateTimeFormatterType }        from '../../owf/Util/Time/DateTimeFormatterType';
import { TS }                           from '../../owf/TS/TS';


@Component({
  selector: 'app-dialog-tstable',
  templateUrl: './dialog-tstable.component.html',
  styleUrls: ['./dialog-tstable.component.css', '../main-dialog-style.css']
})
export class DialogTSTableComponent implements OnInit {

  public attributeTable: any;
  // The name of the first column, which could be Date or Date / Time
  public dateTimeColumnName: string;
  public displayedColumns: string[] = [];
  public downloadFileName: string;
  // The object containing the selected feature's properties as the key, and the description/value as the value
  public featureProperties: any;
  private isTSFile: boolean;
  public TSArrayRef: TS[];
  public units: string;
  public valueColumns: string[];

  constructor(public dialogRef: MatDialogRef<DialogTSTableComponent>,
              public mapService: MapService,
              @Inject(MAT_DIALOG_DATA) public dataObject: any) {

    this.attributeTable = new TableVirtualScrollDataSource(dataObject.data.attributeTable);
    this.dateTimeColumnName = dataObject.data.dateTimeColumnName;
    this.displayedColumns = Object.keys(this.attributeTable.data[0]);
    this.downloadFileName = dataObject.data.downloadFileName ? dataObject.data.downloadFileName : undefined;
    this.featureProperties = dataObject.data.featureProperties;
    this.isTSFile = dataObject.data.isTSFile;
    this.units = dataObject.data.units;
    this.TSArrayRef = dataObject.data.TSArrayRef;
    this.valueColumns = dataObject.data.valueColumns;
  }


  /**
   * Function that applies the necessary trimming to a filter query from the user
   * @param event The event passed when a DOM event is detected (user inputs into filter field)
   */
  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.attributeTable.filter = filterValue.trim().toUpperCase();
  }

  ngOnInit(): void { }

  /**
   * Closes the Mat Dialog popup when the Close button is clicked.
   */
  public onClose(): void {
    this.mapService.resetClick();
    this.dialogRef.close();
  }

  /**
   * When the Save button is clicked in the time series data table, call the writeTimeSeries function with the correct arguments
   * so the CSV string can be created to be written to a file.
   */
  public saveDataTable(): void {
    // If the file read in was a Time Series file, call the imported TSTool code to deal with creating the right string for CSV creation
    if (this.isTSFile) {
      var writeDelimited: WriteDelimitedFile_Command = new WriteDelimitedFile_Command();
      var textToSave: string = writeDelimited.writeTimeSeries(this.TSArrayRef, this.dateTimeColumnName, DateTimeFormatterType.C, null,
      this.valueColumns.join(','), null, ',', 2, 'NaN', null, null, [''], ['problems']);
      var data = new Blob([textToSave], { type: 'text/plain;charset=utf-8' });
      // Send the download file name to format it correctly, along with the SaveFileType enum
      FileSaver.saveAs(data, this.mapService.formatSaveFileName(this.downloadFileName, SaveFileType.tstable, this.featureProperties));
    }
    // If the file read in was itself a CSV file, create the correct string for downloading the file again. This is similar
    // to regular data table dialog download
    else {
      var textToSave = '';
      var propertyIndex = 0;
      var columnNameTemp: string[] = [];
      // Iterate over the displayedColumns and create a temporary array to add quotes around each column heading
      this.displayedColumns.forEach((str: string) => {
        columnNameTemp.push('"' + str + '"');
      });
      textToSave += columnNameTemp.join(',') + '\n';

      for (let row of this.attributeTable.data) {
        for (let property in row) {
          // Check to see if at last property so that the delimiter (,) isn't appended
          if (propertyIndex === Object.keys(row).length - 1) {
            // Check if the value is a string; if it is, surround with quotes so any potential commas will be ignored by Excel
            if (typeof row[property] === 'string') {
              // Check the original value for quotes (before potentially adding them below) and if it contains a 
              if (row[property].includes('"')) {
                textToSave += row[property].split('"').join('"""');
              }
              textToSave += "\"" + row[property] + "\"";
            } else {
              textToSave += row[property];
            }
          }
          // The property isn't the last, so append the delimiter (,) to the value
          else {
            if (typeof row[property] === 'string') {
              if (row[property].includes('"')) {
                textToSave += row[property].split('"').join('"""');
              }
              textToSave += "\"" + row[property] + "\",";
            } else {
              textToSave += row[property] + ',';
            }
          }
          ++propertyIndex;
        }
        textToSave += '\n';
      }

      var data = new Blob([textToSave], { type: 'text/plain;charset=utf-8' });
      // Send the download file name to format, along with the SaveFileType enum
      FileSaver.saveAs(data, this.mapService.formatSaveFileName(this.downloadFileName, SaveFileType.tstable));
    }
    
  }

}
