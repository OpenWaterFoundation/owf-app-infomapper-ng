import { Component,
          Inject }          from '@angular/core';

import { MatDialogRef,
          MAT_DIALOG_DATA } from '@angular/material/dialog';

import { forkJoin }         from 'rxjs';

import { DateTime }         from '../statemod-classes/DateTime';
import { StateMod_TS,
          MonthTS }         from '../statemod-classes/StateMod';

import * as Papa            from 'papaparse';
import * as moment          from 'moment';
import { Chart }            from 'chart.js';

import { MapService }       from '../map.service';


@Component({
  selector: 'dialog-content',
  styleUrls: ['./dialog-content.component.css'],
  templateUrl: './dialog-content.component.html'
})
export class DialogContent {

  mainTitleString: string;
  graphTemplateObject: any;
  graphFilePath: string;
  TSID_Location: string;

  constructor(public dialogRef: MatDialogRef<DialogContent>,
              public mapService: MapService,
              @Inject(MAT_DIALOG_DATA) public templateGraph: any) {

                this.graphTemplateObject = templateGraph.graphTemplate;
                this.graphFilePath = templateGraph.graphFilePath;
                this.TSID_Location = templateGraph.TSID_Location;
               }


  /**
   * This function actually creates the graph canvas element to show in the dialog. One or more PopulateGraph instances
   * is given, and we take each one of the PopulateGraph attributes and use them to populate the Chart object that is
   * being created. 
   * @param config An array of PopulateGraph instances (objects?)
   */
  createChartJSGraph(config: PopulateGraph[]): void {

    // Create the graph labels array for the x axis
    var mainGraphLabels = this.createChartMainGraphLabels(config);
    
    // Typescript does not support dynamic invocation, so instead of creating ctx
    // on one line, we can cast the html element to a canvas element. Then we can
    // create the ctx variable by using getContext() on the canvas variable.
    var canvas = <HTMLCanvasElement> document.getElementById('myChart');
    var ctx = canvas.getContext('2d');

    // TODO: jpkeahey 2020.06.03 - Maybe use a *ngFor loop in the DialogContent
    // template file to create as many charts as needed. As well as a for loop
    // here obviously for going through subProducts?
    var myChart = new Chart(ctx, {
      type: validate(config[0].chartType, 'GraphType'),
      data: {
        labels: validate(mainGraphLabels, 'xAxisDataLabels'),                       // X-axis labels
        datasets: [
          {
            label: config[0].legendLabel,
            data: config[0].datasetData,                                            // Y-axis data
            backgroundColor: 'rgba(33, 145, 81, 0)',              // The graph fill color, with a = 'alpha' = 0 being 0 opacity
            borderColor: validate(config[0].datasetBackgroundColor, 'borderColor'), // Color of the border or line of the graph
            borderWidth: 1,
            spanGaps: false,
            lineTension: 0
          }
        ]
      },
      options: {
        animation: {
          duration: 0
        },
        responsive: true,
        legend: {
          position: 'bottom'
        },
        scales: {
          xAxes: [
            {
              display: true,
              distribution: 'linear',
              ticks: {
                maxTicksLimit: 10,                                                  // No more than 10 ticks
                maxRotation: 0                                                      // Don't rotate labels
              }
            }
          ],
          yAxes: [
            {
              scaleLabel: {
                display: true,
                labelString: config[0].yAxesLabelString
              }
            }
          ]
        },
        elements: {                                                                 // Show each element on the
          point: {                                                                  // graph with a small circle
            radius: 1
          }
        },
        tooltips: {
          callbacks: {
            title: function (tooltipItem, data) {                                   // Returns the date ['x'] from the
              return data.datasets[tooltipItem[0].datasetIndex].data[tooltipItem[0].index]['x']; // dataset at the clicked
            }                                                                       // tooltips index
          }                                                                         //,
                                                                                    //intersect: false,
                                                                                    //mode: 'nearest'
        },
        plugins: {                                                                  // Extra plugin for zooming
          zoom: {                                                                   // and panning.
            pan: {
              enabled: true,
              mode: 'x'
            },
            zoom: {
              enabled: true,
              drag: false,
              mode: 'x'
            }
          }
        }
      }
    });

    // If the passed in config array object has more than one PopulateGraph instance, there is more than one time series to show
    // in the graph. 
    if (config.length > 1) {
      for (let i = 1; i < config.length; i++) {
        // Push a dataset object straight into the datasets property in the current graph.
        myChart.data.datasets.push({
          label: config[i].legendLabel,
          data: config[i].datasetData,
          type: validate(config[i].chartType, 'GraphType'),
          backgroundColor: 'rgba(33, 145, 81, 0)',
          borderColor: validate(config[i].datasetBackgroundColor, 'borderColor'),
          borderWidth: 1,
          spanGaps: false,
          lineTension: 0
        });
        // Don't forget to update the graph!
        myChart.update();
      }
      
    }

    /**
     * This helper function decides if the given property in the chart config object above is defined. If it isn't, an error
     * message is created with a detailed description of which graph template attribute was incorrect. It will also let the
     * user know a default will be used instead.
     * @param property The property that is to be used to populate the graph
     * @param templateAttribute A string representing a broad description of the property being validated
     */
    function validate(property: any, templateAttribute: string): any {

      if (!property) {
        switch(templateAttribute) {
          case 'GraphType':
            console.error('[' + templateAttribute + '] not defined or incorrectly set. Using the default line graph');
            return 'line';
          case 'xAxisDataLabels':
            throw new Error('Fatal Error: [' + templateAttribute +
                              '] not set. Needed for chart creation. Check graph template file and graph data file.');
          case 'borderColor':
            console.error('[' + templateAttribute + '] not defined or incorrectly set. Using the default color black');
            return 'black';
        }
      }
      // TODO: jpkeahey 2020.06.12 - If the property exists, just return it for now. Can check if it's legit later
      else {
        return property;
      }
    }
  }

  /**
   * Determine the full length of days to create on the chart to be shown
   * @param config The array of PopulateGraph instances created from the createTSGraph function. Contains configuration
   * metadata and data about each time series graph that needs to be created
   */
  private createChartMainGraphLabels(config: PopulateGraph[]): Array<string> {

    var labelStartDate = '3000-01';
    var labelEndDate = '1000-01';
    var mainGraphLabels = new Array<string>();

    // If the files read were StateMod files, go through them all and determine the absolute first and last dates
    if (config[0].graphFileType === 'stm') {
      
      for (let instance of config) {
        if (new Date(instance.startDate) < new Date(labelStartDate)) {
          labelStartDate = instance.startDate;
        }
        if (new Date(instance.endDate) > new Date(labelEndDate)) {
          labelEndDate = instance.endDate;
        }
      }
      // Create the array and populate with dates in between the two dates given
      // TODO: jpkeahey 2020.07.02 - This only uses months right now, and nothing else
      mainGraphLabels = this.getDates(labelStartDate, labelEndDate, 'months');
    } else if (config[0].graphFileType === 'csv') {
      mainGraphLabels = config[0].dataLabels;
    }
    return mainGraphLabels;
  }

  /**
   * Takes the results given from Papa Parse and creates a PopulateGraph instance by assigning its members. It then adds the
   * PopulateGraph instance to an array, in case in the future more than one CSV files need to be shown on a graph
   * @param results The results object returned asynchronously from Papa Parse
   */
  private createCSVGraph(results: any): void {

    var graphType: string = '';
    var templateYAxisTitle: string = '';
    var backgroundColor: string = '';
    var legendLabel = '';
    var chartConfig: Object = this.graphTemplateObject;
    var configArray = new Array<PopulateGraph>();

    let x_axis = Object.keys(results[0])[0];
    let y_axis = Object.keys(results[0])[1];
    // Populate the arrays needed for the x- and y-axes
    var x_axisLabels: string[] = [];
    var y_axisData: number[] = [];
    for (let resultObj of results) {      
      x_axisLabels.push(resultObj[x_axis]);
      y_axisData.push(parseFloat(resultObj[y_axis]));
    }
    // Populate various other chart properties. They will be checked for validity in createGraph()
    graphType = chartConfig['product']['subProducts'][0]['properties'].GraphType.toLowerCase();
    templateYAxisTitle = chartConfig['product']['subProducts'][0]['properties'].LeftYAxisTitleString;
    backgroundColor = chartConfig['product']['subProducts'][0]['data'][0]['properties'].Color;
    
    var config: PopulateGraph = {
      legendLabel: legendLabel,
      chartType: graphType,
      dataLabels: x_axisLabels,
      datasetData: y_axisData,
      datasetBackgroundColor: backgroundColor,
      graphFileType: 'csv',
      xAxesTicksMin: x_axisLabels[0],
      xAxesTicksMax: x_axisLabels[x_axisLabels.length - 1],
      yAxesLabelString: templateYAxisTitle
    }

    configArray.push(config);
    this.createChartJSGraph(configArray);
  }

  /**
   * Sets up properties, and creates the configuration object for the Chart.js graph
   * @param timeSeries The Time Series object retrieved asynchronously from the StateMod file
   */
  private createTSGraph(timeSeries: any[]): void {    

    var graphType: string = '';
    var templateYAxisTitle: string = '';
    var backgroundColor: string = '';
    var legendLabel: string;
    var chartConfig: Object = this.graphTemplateObject;
    var configArray = new Array<PopulateGraph>();

    for (let i = 0; i < timeSeries.length; i++) {
      // Set up the parts of the graph that won't need to be set more than once, such as the LeftYAxisTitleString
      if (i === 0) {
        templateYAxisTitle = chartConfig['product']['subProducts'][0]['properties'].LeftYAxisTitleString;
      }
      
      var x_axisLabels: string[] = new Array<string>();
      var y_axisData: number[] = new Array<number>();
      
      if (timeSeries[i] instanceof MonthTS) {      
        x_axisLabels = this.getDates(timeSeries[i].getDate1().getYear() + "-" +
                                                    this.zeroPad(timeSeries[i].getDate1().getMonth(), 2),
                                      timeSeries[i].getDate2().getYear() + "-" +
                                                    this.zeroPad(timeSeries[i].getDate2().getMonth(), 2),
                                      'months');
      } else {
        // This is a PLACEHOLDER for the x axis labels right now.
        for (let i = 0; i < timeSeries[i]._data.length; i++) {
          for (let j = 0; j < timeSeries[i]._data[i].length; j++) {
            x_axisLabels.push('Y:' + (i + 1) + ' M:' + (j + 1));
          }
        }
      }

      var start = timeSeries[i].getDate1().getYear() + "-" + this.zeroPad(timeSeries[i].getDate1().getMonth(), 2);      
      var end = timeSeries[i].getDate2().getYear() + "-" + this.zeroPad(timeSeries[i].getDate2().getMonth(), 2);
      var type = '';
      if (timeSeries[i] instanceof MonthTS) type = 'months';

      let startDate: DateTime = timeSeries[i].getDate1();
      let endDate: DateTime = timeSeries[i].getDate2();
      // The DateTime iterator for the the while loop
      let iter: DateTime = startDate;
      // The index of the x_axisLabel array to push into the y_axisData as the x property
      var labelIndex = 0;      
      
      do {
        // Grab the value from the current Time Series that's being looked at
        let value = timeSeries[i].getDataValue(iter);
        // This object will hold both the x and y values so the ChartJS object explicitly knows what value goes with what label
        // This is very useful for displaying multiple Time Series on one graph with different dates used for both
        var dataObject: any = {};

        // Set the x value as the current date
        dataObject.x = x_axisLabels[labelIndex];
        // If it's missing, replace value with NaN and push onto the array. If not just push the value onto the array.
        if (timeSeries[i].isDataMissing(value)) {
          dataObject.y = NaN;
        } else {
          dataObject.y = value;
        }
        y_axisData.push(dataObject);
        // Update the interval and labelIndex now that the dataObject has been pushed onto the y_axisData array.
        iter.addInterval(timeSeries[i].getDataIntervalBase(), timeSeries[i].getDataIntervalMult());
        labelIndex++;
        // If the month and year are equal, the end has been reached. This will only happen once.
        if (iter.getMonth() === endDate.getMonth() && iter.getYear() === endDate.getYear()) {
          dataObject = {};

          dataObject.x = x_axisLabels[labelIndex];
          if (timeSeries[i].isDataMissing(value)) {
            dataObject.y = NaN;
          } else {
            dataObject.y = value;
          }
          y_axisData.push(dataObject);
        }

      } while (iter.getMonth() !== endDate.getMonth() || iter.getYear() !== endDate.getYear())      

      // Populate the rest of the properties. Validity will be check in createGraph()
      graphType = chartConfig['product']['subProducts'][0]['properties'].GraphType.toLowerCase();
      backgroundColor = chartConfig['product']['subProducts'][0]['data'][i]['properties'].Color;
      legendLabel = chartConfig['product']['subProducts'][0]['data'][i]['properties'].TSID.split('~')[0];
      
      // Create the PopulateGraph object to pass to the createGraph function
      var config: PopulateGraph = {
        legendLabel: legendLabel,
        chartType: graphType,
        dateType: type,
        datasetData: y_axisData,
        datasetBackgroundColor: backgroundColor,
        graphFileType: 'stm',
        startDate: start,
        endDate: end,
        xAxesTicksMin: x_axisLabels[0],
        xAxesTicksMax: x_axisLabels[x_axisLabels.length - 1],
        yAxesLabelString: templateYAxisTitle
      }

      configArray.push(config);
    }
    this.createChartJSGraph(configArray);
    
  }

  /**
   * Returns an array of dates between the start and end dates, either per day or month. Skeleton code obtained from
   * https://gist.github.com/miguelmota/7905510
   * @param startDate Date to be the first index in the returned array of dates
   * @param endDate Date to be the last index in the returned array of dates
   * @param interval String describing the interval of how far apart each date should be
   */
  private getDates(startDate: any, endDate: any, interval: string): any[] {

    var dates = [];
    var currentDate: any;    

    switch (interval) {
      case 'days':
        currentDate = startDate;

        let addDays = function(days: any) {
          let date = new Date(this.valueOf());
          date.setDate(date.getDate() + days);
          return date;
        };
        while (currentDate <= endDate) {
          dates.push(currentDate);
          currentDate = addDays.call(currentDate, 1);
        }        
        return dates;
      case 'months':
        currentDate = moment(startDate);
        var stopDate = moment(endDate);        
        while (currentDate <= stopDate) {
            dates.push( moment(currentDate).format('MMM YYYY') )
            currentDate = moment(currentDate).add(1, 'months');
        }
        return dates;
    }
    
  };

   /**
    * Initial function call when the Dialog component is created. Determines whether a CSV or StateMod file is to be read
    * for graph creation.
    */
   // TODO: jpkeahey 2020.07.02 - Might need to change how this is implemented, since Steve said both CSV and StateMod (or other)
   // files could be in the same popup template file. They might not be mutually exclusive in the future
  ngOnInit(): void {
    
    this.mapService.setChartTemplateObject(this.templateGraph.graphTemplate);
    this.mapService.setGraphFilePath(this.graphFilePath);
    this.mapService.setTSIDLocation(this.TSID_Location);
    // Set the mainTitleString to be used by the map template file to display as the TSID location (for now)
    this.mainTitleString = this.templateGraph.graphTemplate['product']['properties'].MainTitleString;

    if (this.graphFilePath.includes('.csv'))
      this.parseCSVFile();
    else if (this.graphFilePath.includes('.stm'))
      this.parseStateModFile();
  }

  /**
   * Closes the Mat Dialog popup when the Close button is clicked.
   */
  onClose(): void { this.dialogRef.close(); }


  /**
   * Calls Papa Parse to asynchronously read in a CSV file.
   */
  parseCSVFile(): void {

    Papa.parse(this.mapService.getAppPath() + this.mapService.getGraphFilePath(),
              {
                delimiter: ",",
                download: true,
                comments: "#",
                skipEmptyLines: true,
                header: true,
                complete: (result: any, file: any) => {
                  this.createCSVGraph(result.data);
                }
              });
  }

  /**
   * A StateMod file is being processed here. Get the template object to determine if there is more than one time series to
   * display. So either one StateMod file is read, or a forkJoin needs to be used to read multiple StateMod files asynchronously.
   */
  parseStateModFile(): void {

    var templateObject = this.mapService.getChartTemplateObject();
    // Instantiate a StateMod_TS instance so we can subscribe to its returned Observable later
    var stateMod = new StateMod_TS(this.mapService);
    
    if (templateObject['product']['subProducts'][0]['data'].length === 1) {
      // Call the stateMod's readTimeSeries method to read a StateMod file, and subscribe to wait for the result to come back.
      stateMod.readTimeSeries(this.mapService.getTSIDLocation(),
      this.mapService.getAppPath() + this.mapService.getGraphFilePath().substring(1),
      null,
      null,
      null,
      true).subscribe((results: any) => {
        // The results are normally returned as an Object. An new Array is created and passed to createTSGraph so that it can
        // always treat the given results as such and loop as many times as needed, whether one or more time series is given.
        this.createTSGraph(new Array<any>(results));
      });
    } 
    // More than one time series needs to be displayed on this graph, and therefore more than one StateMod files need to be
    // asynchronously read.
    else if (templateObject['product']['subProducts'][0]['data'].length > 1) {
      // Create an array to hold our Observables of each file read
      var dataArray = new Array<any>();
      var filePath: string;
      var TSIDLocation: string;
      for (let data of templateObject['product']['subProducts'][0]['data']) { 
        // Obtain the TSID location for the readTimeSeries method
        TSIDLocation = data.properties.TSID.split('~')[0];
        // Depending on whether it's a full TSID used in the graph template file, determine what the file path of the StateMod
        // file is. (TSIDLocation~/data-ts/filename.stm OR TSIDLocation~StateMod~/data-ts/filename.stm)
        if (data.properties.TSID.split('~').length === 2) {
          filePath = data.properties.TSID.split('~')[1];
        } else if (data.properties.TSID.split('~').length === 3) {
          filePath = data.properties.TSID.split('~')[2];
        }
        // Don't subscribe yet!  
        dataArray.push(stateMod.readTimeSeries(TSIDLocation,
        this.mapService.getAppPath() + filePath.substring(1),
        null,
        null,
        null,
        true));
      }
      // Now that the array has all the Observables needed, forkJoin and subscribe to them all. Their results will now be
      // returned as an Array with each index corresponding to the order in which they were pushed onto the array.
      forkJoin(dataArray).subscribe((resultsArray: any) => {
        this.createTSGraph(resultsArray);
      });
    }
    
  }

  /**
   * Helper function that left pads a number by a given amount of places, e.g. num = 1, places = 2, returns 01
   * @param num The number that needs padding
   * @param places The amount the padding will go out to the left
   */
  private zeroPad(num: number, places: number) {    
    return String(num).padStart(places, '0');
  }

}

/**
 * Passes an interface as an argument instead of many 
 * arguments when a graph object is created
 */
interface PopulateGraph {
  legendLabel: string;
  chartType: string;
  dateType?: string;
  dataLabels?: string[];
  datasetData: number[];
  datasetBackgroundColor?: string;
  graphFileType: string;
  startDate?: string;
  endDate?: string;
  xAxesTicksMin: string;
  xAxesTicksMax: string;
  yAxesLabelString: string;
}
