import { Component,
          Inject,
          OnInit }                      from '@angular/core';
import { MatDialogRef,
          MAT_DIALOG_DATA }             from '@angular/material/dialog';
import { TableVirtualScrollDataSource } from 'ng-table-virtual-scroll';

import * as FileSaver                   from 'file-saver';

import { AppService }                   from 'src/app/app.service';
import { MapService,
          SaveFileType }                from '../../map.service';
import { SelectionModel }               from '@angular/cdk/collections';


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
  private firstPass = true;
  public geoLayerId: string;
  public geoLayerViewName: string;
  public links: {} = {};
  public leafletData: any;
  public mainMap: any;
  public matchedRows = 0;
  public selectedLayer: any;
  public selection: SelectionModel<any>;
  public selectedRows = 0;

  constructor(public appService: AppService,
              public mapService: MapService,
              public dialogRef: MatDialogRef<DialogDataTableComponent>,
              @Inject(MAT_DIALOG_DATA) public dataObject: any) {

    this.attributeTable = new TableVirtualScrollDataSource(dataObject.data.allFeatures.features);
    this.attributeTableOriginal = JSON.parse(JSON.stringify(dataObject.data.allFeatures.features));
    this.displayedColumns = Object.keys(dataObject.data.allFeatures.features[0].properties);
    // Manually add the select column to the displayed Columns. This way checkboxes can be added below
    this.displayedColumns.unshift('select');
    this.footerColSpan = this.displayedColumns.length;
    this.geoLayerId = dataObject.data.geoLayerId;
    this.geoLayerViewName = dataObject.data.geoLayerViewName;
    this.leafletData = dataObject.data.leafletData;
    this.mainMap = dataObject.data.mainMap;
    this.selection = new SelectionModel<any>(true, []);
  }


  /**
   * Function that applies the necessary trimming to a filter query from the user
   * @param event The event passed when a DOM event is detected (user inputs into filter field)
   */
  public applyFilter(event: KeyboardEvent) {
    // If the keyup event is an empty string, then the user has either selected text and deleted it, or backspaced until the
    // search field is empty. In that case, do the table search and if the selected layer exists, reset the highlighting.
    if ((event.target as HTMLInputElement).value === '') {
      const filterValue = (event.target as HTMLInputElement).value;
      this.attributeTable.filter = filterValue.trim().toUpperCase();
      this.matchedRows = 0;
      if (this.selectedLayer) {
        this.selectedLayer.setStyle({
          fillOpacity: '0',
          opacity: '0'
        });
      }
    }
    // If the keyup event is not empty, attempt to populate the selectedLayer object. If the Enter key was not pressed by the user,
    // then don't do anything else. If the Enter key was pressed, check if the selected layer exists, and highlight the correct
    // features if it does. This should hopefully help with large datasets, as it only checks when enter is pressed, and not for
    // every letter that the keyup is detected.
    else {
      this.selectedLayer = this.leafletData[this.geoLayerId];

      if (event.code.toUpperCase() === 'ENTER') {
        if (this.selectedLayer) {
          const filterValue = (event.target as HTMLInputElement).value;
          this.attributeTable.filter = filterValue.trim().toUpperCase();
          this.matchedRows = this.attributeTable.filteredData.length;

          this.highlightFeatures();
        } else {
          const filterValue = (event.target as HTMLInputElement).value;
          this.attributeTable.filter = filterValue.trim().toUpperCase();
          this.matchedRows = this.attributeTable.filteredData.length;
        }
      }
    }
  }

  /** The label for the checkbox on the passed row
   * @param row Optional row argument if naming a table cell. Not given if table header cell
   */
  public checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row`;
  }

  /**
   * Looks through each feature and each feature property to determine which feature should be highlighted on the Leaflet
   * map. Not the fastest at the moment.
   */
  private highlightFeatures(): void {

    this.selectedLayer.bringToBack();

      var radius = 0;
      // Iterate through each feature in the layer
      this.selectedLayer.eachLayer((featureLayer: any) => {
        
        if (this.firstPass) {
          radius = featureLayer.options.radius + 0.5;
          this.firstPass = false;
        }
        featureLayer.setStyle({
          fillOpacity: '0',
          opacity: '0'
        });
        // Iterate over each property in the feature
        for (let property in featureLayer.feature.properties) {
          if (featureLayer.feature.properties[property] !== null) {
            if (typeof featureLayer.feature.properties[property] === 'string') {
              if (featureLayer.feature.properties[property].toUpperCase().includes(this.attributeTable.filter)) {
                featureLayer.setStyle({
                  color: 'red',
                  fillColor: 'yellow',
                  fillOpacity: '1',
                  radius: radius,
                  opacity: '1',
                  weight: 2
                });
                break;
              }
            } else if (typeof featureLayer.feature.properties[property] === 'number') {
              if ((featureLayer.feature.properties[property] + '').indexOf(this.attributeTable.filter) > -1) {
                featureLayer.setStyle({
                  color: 'red',
                  fillColor: 'yellow',
                  fillOpacity: '1',
                  radius: radius,
                  opacity: '1',
                  weight: 2
                });
                break;
              }
            }
          }
        }
      });
  }

  /** Whether the number of selected elements matches the total number of rows. */
  public isAllSelected(): boolean {
    // If a filter has been done, check to see if all of them have been selected
    if (this.attributeTable.filteredData.length > 0) {
      const numSelected = this.selection.selected.length;
      const numRows = this.attributeTable.filteredData.length;
      return numSelected === numRows;
    }
    // Since no search has been performed, check to see if all rows have been selected
    else {
      const numSelected = this.selection.selected.length;
      const numRows = this.attributeTable.data.length;
      return numSelected === numRows;
    }
    
  }

  /** Selects all rows, or all filtered rows, if they are not all selected; otherwise clear selection. */
  public masterToggle(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
      this.selectedRows = 0;
    } else {
      if (this.attributeTable.filteredData.length > 0) {
        this.attributeTable.filteredData.forEach((filteredRow: any) => {
          this.selection.select(filteredRow);
          this.selectedRows = this.attributeTable.filteredData.length;
        });
      } else {
        this.attributeTable.data.forEach((row: any) => this.selection.select(row));
        this.selectedRows = this.attributeTableOriginal.length;
      }
    }
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

    var columnNameTemp: string[] = [];
    // Iterate over the displayedColumns and create a temporary array to add quotes around each column heading
    this.displayedColumns.forEach((str: string) => {
      columnNameTemp.push('"' + str + '"');
    });
    textToSave += columnNameTemp.join(',') + '\n';

    for (let row of this.attributeTableOriginal) {
      for (let property in row.properties) {
        // Check to see if at last property so that the delimiter (,) isn't appended
        if (propertyIndex === Object.keys(row.properties).length - 1) {
          // Check if the value is a string; if it is, surround with quotes so any potential commas will be ignored by Excel
          if (typeof row.properties[property] === 'string') {
            // Check the original value for quotes (before potentially adding them below) and if found, replace with three
            // quotes for excel CSV formatting
            if (row.properties[property].includes('"')) {
              textToSave += row.properties[property].split('"').join('"""');
            }
            if (!isNaN(row.properties[property])) {
              textToSave += row.properties[property];
            } else {
              textToSave += "\"" + row.properties[property] + "\"";
            }
          } else if (row.properties[property] === null) {
            textToSave += ','
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
            if (!isNaN(row.properties[property])) {
              textToSave += row.properties[property] + ',';
            } else {
              textToSave += '"' + row.properties[property] + '",';
            }
          } else if (row.properties[property] === null) {
            textToSave += ','
          } else {
            textToSave += row.properties[property] + ',';
          }
        }
        ++propertyIndex;
      }
      textToSave += '\n';
    }

    var data = new Blob([textToSave], { type: 'text/plain;charset=utf-8' });
    FileSaver.saveAs(data, this.mapService.formatSaveFileName(this.geoLayerId, SaveFileType.dataTable));
  }

  private setZoomBounds(lat: number, long: number, bounds: Bounds): void {

    if (lat > bounds.NEMaxLat) {
      bounds.NEMaxLat = lat;
    }
    if (lat < bounds.SWMinLat) {
      bounds.SWMinLat = lat;
    }
    if (long > bounds.NEMaxLong) {
      bounds.NEMaxLong = long;
    }
    if (long < bounds.SWMinLong) {
      bounds.SWMinLong = long;
    }
  }

  /**
   * 
   * @param event 
   * @param row 
   */
  public updateClickedRow(event: MouseEvent, row: any): void {
    event.stopPropagation();
    if (this.selection.isSelected(row)) {
      --this.selectedRows;
    } else {
      ++this.selectedRows;
    }
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

  /**
   * When the kebab Zoom button is clicked on, get the correct coordinate bounds and zoom the map to them.
   */
  public zoomToFeatures(): void {
    // Attempt to create the selectedLayer object
    this.selectedLayer = this.leafletData[this.geoLayerId];

    if (this.selectedLayer) {
      if (this.attributeTable.filteredData.length === this.attributeTableOriginal.length) {
      
        // If the selectedLayer variable is created (if the Leaflet layer supports it e.g. Points, Markers, Images) then zoom
        // to the layer bounds on the map
        this.mainMap.fitBounds(this.selectedLayer.getBounds(), {
          padding: [475, 0]
        });
        
      } else if (this.attributeTable.filteredData.length > 0) {
        var bounds: Bounds = {
          NEMaxLat : Number.NEGATIVE_INFINITY,
          NEMaxLong : Number.NEGATIVE_INFINITY,
          SWMinLat : Number.POSITIVE_INFINITY,
          SWMinLong : Number.POSITIVE_INFINITY
        }

        this.attributeTable.filteredData.forEach((feature: any) => {
          // Check to see if the bbox property exists in the feature
          if (feature.bbox) {
            this.setZoomBounds(feature.bbox[1], feature.bbox[0], bounds);
          } else if (feature.geometry.coordinates) {
            this.setZoomBounds(feature.geometry.coordinates[1], feature.geometry.coordinates[0], bounds);
          }
        });

        // The Lat and Long Bounds members have been set, and can be used as the bounds for the selected features
        var zoomBounds = [[bounds.NEMaxLat, bounds.NEMaxLong],
                          [bounds.SWMinLat, bounds.SWMinLong]];
        // Use the Leaflet map reference to zoom to the bounds
        this.mainMap.fitBounds(zoomBounds, {
          padding: [475, 0]
        });
      }
    } else {
      // console.log(this.attributeTable.filteredData);
    }
  }

}

interface Bounds {
  NEMaxLat: number;
  SWMinLat: number;
  NEMaxLong: number;
  SWMinLong: number;
}