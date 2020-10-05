import { Component,
          Inject,
          OnInit }                      from '@angular/core';
import { MatDialogRef,
          MAT_DIALOG_DATA }             from '@angular/material/dialog';
import { TableVirtualScrollDataSource } from 'ng-table-virtual-scroll';

import * as FileSaver                   from 'file-saver';

import { AppService }                   from 'src/app/app.service';
import { MapService }                   from '../../map.service';


@Component({
  selector: 'app-dialog-data-table',
  templateUrl: './dialog-data-table.component.html',
  styleUrls: ['./dialog-data-table.component.css', '../main-dialog-style.css']
})
export class DialogDataTableComponent implements OnInit {

  // 
  public attributeTableOriginal: any;
  // The copied object for holding the data to be displayed in a Material Table, not counting the headers
  public attributeTable: any;
  public displayedColumns: string[];
  public footerColSpan: number;
  public geoLayerViewName: string;
  public links: {} = {};

  constructor(public appService: AppService,
              public mapService: MapService,
              public dialogRef: MatDialogRef<DialogDataTableComponent>,
              @Inject(MAT_DIALOG_DATA) public dataObject: any) {

    this.geoLayerViewName = dataObject.data.geoLayerViewName;
    this.attributeTableOriginal = JSON.parse(JSON.stringify(dataObject.data.allFeatures.features));
    this.attributeTable = new TableVirtualScrollDataSource(dataObject.data.allFeatures.features);
    this.displayedColumns = Object.keys(dataObject.data.allFeatures.features[0].properties);
    this.footerColSpan = this.displayedColumns.length;
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
    this.updateFilterAlgorithm();
    this.formatAttributeTable();
  }

  /**
   * By default, go through all the fields in the Attribute Table object and if they are 'double' numbers,
   * set their precision to 4 decimal places for every one. Also truncates any URL's, since they tend to be longer
   * and don't play well with the fixed length of the table columns.
   */
  private formatAttributeTable(): void {

    for (let feature of this.attributeTable.data) {
      for (let property in feature.properties) {
        // TODO: jpkeahey 2020.09.09 - This conditional will need to be updated, since there is a special ID number that will
        // return true from this and will be incorrect. Also, this changes the data; think about making a copy somehow
        if (typeof feature.properties[property] === 'number' && !Number.isInteger(feature.properties[property])) {
          feature.properties[property] = feature.properties[property].toFixed(4);
        } else if (typeof feature.properties[property] === 'string') {
          if (feature.properties[property].startsWith('http://') || feature.properties[property].startsWith('https://')) {
            this.links[feature.properties[property]] = feature.properties[property];
          } else if (feature.properties[property].startsWith('www')) {
            // feature.properties[property] = 'http://' + feature.properties[property];
          }
        }
      }
    }
  }

  /**
   * Closes the Mat Dialog popup when the Close button is clicked.
   */
  public onClose(): void {
    this.mapService.resetClick();
    this.dialogRef.close();
  }

  /**
   * When the Save button is clicked in the data table dialog, save the table as a CSV file.
   */
  public saveDataTable(): void {

    var textToSave = '';
    var propertyIndex = 0;
    textToSave += this.displayedColumns.join(',') + '\n';

    for (let row of this.attributeTableOriginal) {
      for (let property in row.properties) {
        // Check to see if at last property so that the delimiter (,) isn't appended
        if (propertyIndex === Object.keys(row.properties).length - 1) {
          // Check if the value is a string; if it is, surround with quotes so any potential commas will be ignored by Excel
          if (typeof row.properties[property] === 'string') {
            // Check the original value for quotes (before potentially adding them below) and if it contains a 
            if (row.properties[property].includes('"')) {
              textToSave += row.properties[property].split('"').join('"""');
            }
            textToSave += "\"" + row.properties[property] + "\"";
          } else {
            textToSave += row.properties[property];
          }
        }
        // The property isn't the last, so append the delimiter (,) to the value
        else {
          if (typeof row.properties[property] === 'string') {
            if (row.properties[property].includes('"')) {
              textToSave += row.properties[property].split('"').join('"""');
            }
            textToSave += "\"" + row.properties[property] + "\",";
          } else {
            textToSave += row.properties[property] + ',';
          }
        }
        ++propertyIndex;
      }
      textToSave += '\n';
    }

    var data = new Blob([textToSave], { type: 'text/plain;charset=utf-8' });
    FileSaver.saveAs(data, this.geoLayerViewName + '.csv');
  }

  /**
   * A function that returns whether the filtered input from a user matches that in the Material Table. Can be updated so
   * that only specific columns are used.
   * Note: Right now, the default is all columns
   */
  private updateFilterAlgorithm(): void {

    // For returning all results that contain the filter in EVERY column
    this.attributeTable.filterPredicate = (data: any, filter: string) => {
      for (let property in data.properties) {
        if (data.properties[property] === null) {
          continue;
        } else {
          if (typeof data.properties[property] === 'string') {
            if (data.properties[property].toUpperCase().includes(filter)) {
              return true;
            } else continue;
          } else if (typeof data.properties[property] === 'number') {
            if (data.properties[property].toString().includes(filter)) {
              return true;
            } else continue;
          }
        }
      }
      return false;
      // For returning all results that contain the filter in the IncidentName
      // return data.properties['IncidentName'] === null ? false : data.properties['IncidentName'].toUpperCase().includes(filter);
    }
  }

}
