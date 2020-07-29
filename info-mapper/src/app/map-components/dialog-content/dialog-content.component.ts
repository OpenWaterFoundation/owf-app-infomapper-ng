import { Component,
          Inject }          from '@angular/core';

import { MatDialogRef,
          MAT_DIALOG_DATA } from '@angular/material/dialog';

import { forkJoin }         from 'rxjs';

import { DateTime }         from '../statemod-classes/DateTime';
import { StateMod_TS,
          MonthTS }         from '../statemod-classes/StateMod';

import { MapService }       from '../map.service';
import { AppService }       from 'src/app/app.service';

import * as Papa            from 'papaparse';
import * as moment          from 'moment';
import { Chart }            from 'chart.js';
import                           'chartjs-plugin-zoom';

import * as Showdown        from 'showdown';

declare var Plotly: any;

@Component({
  selector: 'dialog-content',
  styleUrls: ['./dialog-content.component.css'],
  templateUrl: './dialog-content.component.html'
})
export class DialogContent {

  public chartPackage: string;
  public doc: any;
  public docText: boolean;
  public docMarkdown: boolean;
  public docHTML: boolean;
  public mainTitleString: string;
  public graphTemplateObject: any;
  public graphFilePath: string;
  public showDoc = false;
  public showText = false;
  public showGraph = false;
  public TSID_Location: string;
  public text: any;


  /**
   * @constructor for the DialogContent Component
   * @param appService A reference to the top level application service AppService
   * @param dialogRef A reference to the DialogContent component. Used for creation and sending of data
   * @param mapService A reference to the map service, for sending data
   * @param data The incoming templateGraph object containing data about from the graph template file
   */
  constructor(public appService: AppService,
              public dialogRef: MatDialogRef<DialogContent>,
              public mapService: MapService,
              @Inject(MAT_DIALOG_DATA) public dataObject: any) {
                                
    if (dataObject.data.text) {
      this.showText = true;
      this.text = dataObject.data.text;
    } else if (dataObject.data.graphTemplate) {                  
      this.showGraph = true;
      this.chartPackage = dataObject.data.chartPackage;
      this.graphTemplateObject = dataObject.data.graphTemplate;
      this.graphFilePath = dataObject.data.graphFilePath;
      this.TSID_Location = dataObject.data.TSID_Location;
    } else if (dataObject.data.doc) {
      this.showDoc = true;
      this.doc = dataObject.data.doc;

      if (dataObject.data.docText) this.docText = true;
      else if (dataObject.data.docMarkdown) this.docMarkdown = true;
      else if (dataObject.data.docHtml) this.docHTML = true;
    }
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
            data: config[0].datasetData,                                     // Y-axis data
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
   * @param config The array of PopulateGraph instances created from the createTSChartJSGraph function. Contains configuration
   * metadata and data about each time series graph that needs to be created
   */
  private createChartMainGraphLabels(config: PopulateGraph[]): string[] {

    var labelStartDate = '3000-01';
    var labelEndDate = '1000-01';
    var mainGraphLabels: string[] = [];

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
  private createCSVConfig(results: any): void {

    var chartConfig: Object = this.graphTemplateObject;
    var configArray: PopulateGraph[] = [];
    var chartJSGraph: boolean;

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
    var graphType = chartConfig['product']['subProducts'][0]['properties'].GraphType.toLowerCase();
    var templateYAxisTitle = chartConfig['product']['subProducts'][0]['properties'].LeftYAxisTitleString;
    var backgroundColor = chartConfig['product']['subProducts'][0]['data'][0]['properties'].Color;
    var legendLabel = chartConfig['product']['subProducts'][0]['data'][0]['properties'].TSID.split('~')[0];
    // Create the PopulateGraph instance that will be passed to create either the Chart.js or Plotly.js graph
    var config: PopulateGraph = {
      legendLabel: legendLabel,
      chartType: graphType,
      dataLabels: x_axisLabels,
      datasetData: y_axisData,
      datasetBackgroundColor: backgroundColor,
      graphFileType: 'csv',
      yAxesLabelString: templateYAxisTitle
    }

    configArray.push(config);

    // Determine whether a chartJS graph or Plotly graph needs to be made
    // NOTE: Plotly is the default charting package
    if (!this.chartPackage) {
      chartJSGraph = false;
    } else if (this.chartPackage.toUpperCase() === 'PLOTLY') {
      chartJSGraph = false;
    } else {
      chartJSGraph = true;
    }

    if (chartJSGraph) {
      this.createChartJSGraph(configArray);
    } else {      
      this.createPlotlyGraph(configArray, true);
    }
  }

  /**
   * Sets up properties, and creates the configuration object for the Chart.js graph
   * @param timeSeries The Time Series object retrieved asynchronously from the StateMod file
   */
  private createTSConfig(timeSeries: any[]): void {    

    var templateYAxisTitle: string = '';
    var chartConfig: Object = this.graphTemplateObject;
    var configArray: PopulateGraph[] = [];
    var chartJSGraph: boolean;

    for (let i = 0; i < timeSeries.length; i++) {
      // Set up the parts of the graph that won't need to be set more than once, such as the LeftYAxisTitleString
      if (i === 0) {
        templateYAxisTitle = chartConfig['product']['subProducts'][0]['properties'].LeftYAxisTitleString;
      }
      
      var x_axisLabels: string[] = [];
      var chartJS_yAxisData: number[] = [];
      var plotly_yAxisData: number[] = [];
      
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
      // The index of the x_axisLabel array to push into the chartJS_yAxisData as the x property
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
          plotly_yAxisData.push(NaN);
        } else {
          dataObject.y = value;
          plotly_yAxisData.push(value);
        }
        chartJS_yAxisData.push(dataObject);
        // Update the interval and labelIndex now that the dataObject has been pushed onto the chartJS_yAxisData array.
        iter.addInterval(timeSeries[i].getDataIntervalBase(), timeSeries[i].getDataIntervalMult());
        labelIndex++;
        // If the month and year are equal, the end has been reached. This will only happen once.
        if (iter.getMonth() === endDate.getMonth() && iter.getYear() === endDate.getYear()) {
          dataObject = {};

          dataObject.x = x_axisLabels[labelIndex];
          if (timeSeries[i].isDataMissing(value)) {
            dataObject.y = NaN;
            plotly_yAxisData.push(NaN);
          } else {
            dataObject.y = value;
            plotly_yAxisData.push(value);
          }
          chartJS_yAxisData.push(dataObject);
        }

      } while (iter.getMonth() !== endDate.getMonth() || iter.getYear() !== endDate.getYear())      

      // Populate the rest of the properties. Validity will be check in createGraph()
      var graphType = chartConfig['product']['subProducts'][0]['properties'].GraphType.toLowerCase();
      var backgroundColor = chartConfig['product']['subProducts'][0]['data'][i]['properties'].Color;
      var legendLabel = chartConfig['product']['subProducts'][0]['data'][i]['properties'].TSID.split('~')[0];
      
      // Create the PopulateGraph object to pass to the createGraph function
      var chartConfigObject: PopulateGraph = {
        legendLabel: legendLabel,
        chartType: graphType,
        dateType: type,
        datasetData: chartJS_yAxisData,
        plotlyDatasetData: plotly_yAxisData,
        plotly_xAxisLabels: x_axisLabels,
        datasetBackgroundColor: backgroundColor,
        graphFileType: 'stm',
        startDate: start,
        endDate: end,
        yAxesLabelString: templateYAxisTitle
      }

      configArray.push(chartConfigObject);
    }
    // Determine whether a chartJS graph or Plotly graph needs to be made
    if (!this.chartPackage) {
      chartJSGraph = false;
    } else if (this.chartPackage.toUpperCase() === 'PLOTLY') {
      chartJSGraph = false;
    } else {
      chartJSGraph = true;
    }

    if (chartJSGraph) {
      this.createChartJSGraph(configArray);
    } else {
      this.createPlotlyGraph(configArray, false);
    }
    
  }

  /**
   * The final function that, when it reaches its end, will plot the plotly graph with the given data
   * @param config The configuration array that contains all time series data planned to show on the plotly graph
   */
  private createPlotlyGraph(config: PopulateGraph[], CSV: boolean): void {
    
    var finalData: {x: number[], y: number[], type: string}[] = [];
    var data: any;
    var colorwayArray: string[] = [];
    
    // Go through the config array and add the necessary configuration data into the data object that will be added to the
    // finalData array. The finalData array is what's given as the second argument to Plotly.plot();
    for (let i = 0; i < config.length; i++) {
      data = {};
      
      data.name = config[i].legendLabel;
      
      data.mode = this.setPlotlyGraphMode(config[i].chartType);
      
      if (this.setPlotlyGraphMode(config[i].chartType) === 'lines+markers') {
        data.line = {
          width: 1
        };
        data.marker = {
          size: 4
        };
      }

      data.type =  this.setPlotlyGraphType(config[i].chartType);
      data.x = CSV ? config[i].dataLabels : config[i].plotly_xAxisLabels;
      data.y = CSV ? config[i].datasetData : config[i].plotlyDatasetData;

      colorwayArray.push(config[i].datasetBackgroundColor);
      finalData.push(data);
    }
    // Builds the layout object that will be given as the third argument to the Plotly.plot() function. Creates the graph layout
    // such as graph height and width, legend and axes options, etc.
    var layout = {
      // An array of strings describing the color to display the graph as for each time series
      colorway: colorwayArray,
      height: 600,
      // Create the legend inside the graph and display it in the upper right
      legend: {
        x: 1,
        xanchor: 'right',
        y: 1
      },
      showlegend: true,
      width: 1000,
      xaxis: {
        // Maximum amount of ticks on the x-axis
        nticks: 8,
        tickangle: 0
      },
      yaxis: {
        // 'r' removes the k from the thousands place for large numbers
        tickformat: 'r',
        title: config[0].yAxesLabelString,
        // Keeps the y-axis at a fixed range, so when the user zooms, an x-axis zoom takes place
        fixedrange: true
      }
    };
    
    // The fourth and last argument in the Plotly.plot() function, this object contains the graph configuration options
    var plotlyConfig = {
      responsive: true,
      scrollZoom: true
    };
    // Plots the actual plotly graph with the given <div> id, data array, layout and configuration objects
    // NOTE: Plotly.plot() might be deprecated per the plotly website
    // (https://plotly.com/javascript/plotlyjs-function-reference/#plotlyplot)
    Plotly.react('plotlyDiv', finalData, layout, plotlyConfig);
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
    
  }

   /**
    * Initial function call when the Dialog component is created. Determines whether a CSV or StateMod file is to be read
    * for graph creation.
    */
   // TODO: jpkeahey 2020.07.02 - Might need to change how this is implemented, since Steve said both CSV and StateMod (or other)
   // files could be in the same popup template file. They might not be mutually exclusive in the future
  ngOnInit(): void {

    if (this.showGraph) {
      this.mapService.setChartTemplateObject(this.graphTemplateObject);
      this.mapService.setGraphFilePath(this.graphFilePath);
      this.mapService.setTSIDLocation(this.TSID_Location);
      // Set the mainTitleString to be used by the map template file to display as the TSID location (for now)
      this.mainTitleString = this.graphTemplateObject['product']['properties'].MainTitleString;

      if (this.graphFilePath.includes('.csv'))
        this.parseCSVFile();
      else if (this.graphFilePath.includes('.stm'))
        this.parseStateModFile();
      // else if (this.graphFilePath.includes('.dv'))
      //   create a plotly graph for a dateValue file

    } else if (this.showText) {
      
    } else if (this.showDoc) {

      if (this.docMarkdown) {
        let converter = new Showdown.Converter({ tables: true, strikethrough: true });
        setTimeout(() => {
          document.getElementById('docDiv').innerHTML = converter.makeHtml(this.doc);
        });
      } else if (this.docHTML) {
        setTimeout(() => {
          document.getElementById('docDiv').innerHTML = this.doc;
        });
      }
      
    }
    
  }

  /**
   * Closes the Mat Dialog popup when the Close button is clicked.
   */
  onClose(): void { this.dialogRef.close(); }

  /**
   * Calls Papa Parse to asynchronously read in a CSV file.
   */
  parseCSVFile(): void {

    Papa.parse(this.appService.buildPath('csvPath', [this.mapService.getGraphFilePath()]),
              {
                delimiter: ",",
                download: true,
                comments: "#",
                skipEmptyLines: true,
                header: true,
                complete: (result: any, file: any) => {
                  this.createCSVConfig(result.data);
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
    var stateMod = new StateMod_TS(this.appService);

    if (templateObject['product']['subProducts'][0]['data'].length === 1) {
      // Call the stateMod's readTimeSeries method to read a StateMod file, and subscribe to wait for the result to come back.
      stateMod.readTimeSeries(this.mapService.getTSIDLocation(),
      this.appService.buildPath('stateModPath', [this.mapService.getGraphFilePath()]),
      null,
      null,
      null,
      true).subscribe((results: any) => {
        // The results are normally returned as an Object. A new Array is created and passed to createTSChartJSGraph so that it can
        // always treat the given results as such and loop as many times as needed, whether one or more time series is given.
        // No chartPackage attribute is given
        this.createTSConfig(new Array<any>(results));
      });
    } 
    // More than one time series needs to be displayed on this graph, and therefore more than one StateMod files need to be
    // asynchronously read.
    else if (templateObject['product']['subProducts'][0]['data'].length > 1) {
      // Create an array to hold our Observables of each file read
      var dataArray: any[] = [];
      var filePath: string;
      var TSIDLocation: string;
      for (let data of templateObject['product']['subProducts'][0]['data']) { 
        // Obtain the TSID location for the readTimeSeries method
        TSIDLocation = data.properties.TSID.split('~')[0];
        // Depending on whether it's a full TSID used in the graph template file, determine what the file path of the StateMod
        // file is. (TSIDLocation~/path/to/filename.stm OR TSIDLocation~StateMod~/path/to/filename.stm)
        if (data.properties.TSID.split('~').length === 2) {
          filePath = data.properties.TSID.split('~')[1];
        } else if (data.properties.TSID.split('~').length === 3) {
          filePath = data.properties.TSID.split('~')[2];
        }
        // Don't subscribe yet!  
        dataArray.push(stateMod.readTimeSeries(TSIDLocation, this.appService.buildPath('stateModPath', [filePath]),
        null,
        null,
        null,
        true));
      }
      
      // Now that the array has all the Observables needed, forkJoin and subscribe to them all. Their results will now be
      // returned as an Array with each index corresponding to the order in which they were pushed onto the array.
      forkJoin(dataArray).subscribe((resultsArray: any) => {
        this.createTSConfig(resultsArray);
      });
    }
    
  }

  /**
   * @returns the plotly specific type so that plotly knows what type of graph to create
   * @param chartType The chart type string obtained from the chart template file
   */
  private setPlotlyGraphType(chartType: string): string {
    switch(chartType.toUpperCase()) {
      case 'LINE':
        return 'scatter';
      default:
        return 'scatter';
    }
  }

  /**
   * @returns the plotly specific mode so that plotly knows to create a line with markers on the graph
   * @param chartType The chart type string obtained from the chart template file
   */
  private setPlotlyGraphMode(chartType: string): string {
    switch(chartType.toUpperCase()) {
      case 'LINE':
        return 'lines+markers';
      default:
        return 'lines+markers';
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
  chartType: string;
  datasetBackgroundColor?: string;
  datasetData?: number[];
  dataLabels?: string[];
  dateType?: string;
  endDate?: string;
  graphFileType: string;
  legendLabel: string;
  plotlyDatasetData?: number[];
  plotly_xAxisLabels?: any[];
  startDate?: string;
  yAxesLabelString: string;
}
