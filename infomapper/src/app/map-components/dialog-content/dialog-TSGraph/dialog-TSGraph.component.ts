import { Component,
          Inject }                      from '@angular/core';
import { MatDialog,
          MatDialogRef,
          MAT_DIALOG_DATA }             from '@angular/material/dialog';

import { forkJoin }                     from 'rxjs';

import { DateTime }                     from '../../statemod-classes/DateTime';
import { StateMod_TS,
          MonthTS,
          YearTS }                      from '../../statemod-classes/StateMod';
import { DateValueTS }                  from '../../statemod-classes/DateValueTS';

import { MapService }                   from '../../map.service';
import { AppService }                   from 'src/app/app.service';
import { WindowManager }                from '../../window-manager';

import * as Papa                        from 'papaparse';
import * as moment                      from 'moment';
import { Chart }                        from 'chart.js';
import                                       'chartjs-plugin-zoom';


declare var Plotly: any;

@Component({
  selector: 'dialog-TSGraph',
  styleUrls: ['./dialog-TSGraph.component.css'],
  templateUrl: './dialog-TSGraph.component.html'
})
export class DialogTSGraphComponent {

  public chartPackage: string;
  // A string representing the documentation retrieved from the txt, md, or html file to be displayed for a layer
  public mainTitleString: string;
  public graphTemplateObject: any;
  public graphFilePath: string;
  public options = { tables: true, strikethrough: true };
  public TSID_Location: string;
  public windowManager: any = null;


  /**
   * @constructor for the DialogTSGraph Component
   * @param appService A reference to the top level application service AppService
   * @param dialogRef A reference to the DialogTSGraphComponent. Used for creation and sending of data
   * @param mapService A reference to the map service, for sending data
   * @param data The incoming templateGraph object containing data about from the graph template file
   */
  constructor(public appService: AppService,
              public dialog: MatDialog,
              public dialogRef: MatDialogRef<DialogTSGraphComponent>,
              public mapService: MapService,
              @Inject(MAT_DIALOG_DATA) public dataObject: any) {

      this.chartPackage = dataObject.data.chartPackage;
      this.graphTemplateObject = dataObject.data.graphTemplate;
      this.graphFilePath = dataObject.data.graphFilePath;
      this.TSID_Location = dataObject.data.TSID_Location;
      this.windowManager = WindowManager.getInstance();
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

    // TODO: jpkeahey 2020.06.03 - Maybe use a *ngFor loop in the DialogTSGraphComponent
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
    if (config[0].graphFileType === 'TS') {
      
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
   * PopulateGraph instance to an array for each CSV file found in the graph config file
   * @param results The results array returned asynchronously from Papa Parse. Contains at least one result object
   */
  private createCSVConfig(results: any[]): void {

    var chartConfig: Object = this.graphTemplateObject;
    var configArray: PopulateGraph[] = [];
    var templateYAxisTitle: string;
    var chartJSGraph: boolean;

    for (let rIndex = 0; rIndex < results.length; rIndex++) {

      // Set up the parts of the graph that won't need to be set more than once, such as the LeftYAxisTitleString
      if (rIndex === 0) {
        templateYAxisTitle = chartConfig['product']['subProducts'][0]['properties'].LeftYAxisTitleString;
      }
      // These two are the string representing the keys in the current result.
      // They will be used to populate the x- and y-axis arrays
      let x_axis = Object.keys(results[rIndex].data[0])[0];
      let y_axis = Object.keys(results[rIndex].data[0])[1];

      // Populate the arrays needed for the x- and y-axes
      var x_axisLabels: string[] = [];
      var y_axisData: number[] = [];
      for (let resultObj of results[rIndex].data) {
        x_axisLabels.push(resultObj[x_axis]);
        y_axisData.push(parseFloat(resultObj[y_axis]));
      }
      // Populate various other chart properties. They will be checked for validity in createGraph()
      var graphType = chartConfig['product']['subProducts'][0]['data'][rIndex]['properties'].GraphType.toLowerCase();
      var backgroundColor = chartConfig['product']['subProducts'][0]['data'][rIndex]['properties'].Color;
      var legendLabel = chartConfig['product']['subProducts'][0]['data'][rIndex]['properties'].TSID.split('~')[0];
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
      // Push the config instance into the configArray to be sent to createXXXGraph()
      configArray.push(config);
    }    

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

    // Go through each time series object in the timeSeries array and create a PopulateGraph instance for each
    // graph that needs to be made
    for (let i = 0; i < timeSeries.length; i++) {
      // Set up the parts of the graph that won't need to be set more than once, such as the LeftYAxisTitleString
      if (i === 0) {
        templateYAxisTitle = chartConfig['product']['subProducts'][0]['properties'].LeftYAxisTitleString;
      }

      var x_axisLabels: string[] = [];
      var type = '';
      
      if (timeSeries[i] instanceof MonthTS) {
        type = 'months';
        x_axisLabels = this.getDates(timeSeries[i].getDate1().getYear() + "-" + this.zeroPad(timeSeries[i].getDate1().getMonth(), 2),
                                      timeSeries[i].getDate2().getYear() + "-" + this.zeroPad(timeSeries[i].getDate2().getMonth(), 2),
                                      type);
      } else if (timeSeries[i] instanceof YearTS) {
        type = 'years';
        x_axisLabels = this.getDates(timeSeries[i].getDate1().getYear(),
                                      timeSeries[i].getDate2().getYear(),
                                      type);
      }
      else {
        // This is a PLACEHOLDER for the x axis labels right now.
        for (let i = 0; i < timeSeries[i]._data.length; i++) {
          for (let j = 0; j < timeSeries[i]._data[i].length; j++) {
            x_axisLabels.push('Y:' + (i + 1) + ' M:' + (j + 1));
          }
        }
      }

      var start = timeSeries[i].getDate1().getYear() + "-" + this.zeroPad(timeSeries[i].getDate1().getMonth(), 2);      
      var end = timeSeries[i].getDate2().getYear() + "-" + this.zeroPad(timeSeries[i].getDate2().getMonth(), 2);

      var axisObject = this.setAxisObject(timeSeries[i], x_axisLabels, type);      
      // Populate the rest of the properties from the graph config file. This uses the more granular graphType for each time series
      var chartType = chartConfig['product']['subProducts'][0]['data'][i]['properties'].GraphType.toLowerCase();
      var backgroundColor = chartConfig['product']['subProducts'][0]['data'][i]['properties'].Color;
      var legendLabel = chartConfig['product']['subProducts'][0]['data'][i]['properties'].TSID.split('~')[0];
      
      // Create the PopulateGraph object to pass to the createGraph function
      var chartConfigObject: PopulateGraph = {
        legendLabel: legendLabel,
        chartMode: this.verifyPlotlyProp(chartType, 'cm'),
        chartType: this.verifyPlotlyProp(chartType, 'ct'),
        dateType: type,
        datasetData: axisObject.chartJS_yAxisData,
        plotlyDatasetData: axisObject.plotly_yAxisData,
        plotly_xAxisLabels: x_axisLabels,
        datasetBackgroundColor: this.verifyPlotlyProp(backgroundColor, 'bc'),
        graphFileType: 'TS',
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
    // The final data array of objects that is given to Plotly.react() to create the graph
    var finalData: { x: number[], y: number[], type: string }[] = [];
    // The data object being pushed onto the finalData array
    var data: any;
    // The array containing the colors of each graph being displayed, in the order in which they appear
    var colorwayArray: string[] = [];
    
    // Go through the config array and add the necessary configuration data into the data object that will be added to the
    // finalData array. The finalData array is what's given as the second argument to Plotly.plot();
    for (let i = 0; i < config.length; i++) {
      data = {};
      
      data.name = config[i].legendLabel;
      
      data.mode = config[i].chartMode;
      // data.connectgaps = true;
      
      if (data.mode === 'lines+markers') {
        data.line = {
          width: 1
        };
        data.marker = {
          size: 4
        };
      } else if (data.mode === 'lines') {
        data.line = {
          width: 1.5
        }
      }

      data.type =  config[i].chartType;
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
      height: 565,
      // Create the legend inside the graph and display it in the upper right
      legend: {
        x: 1,
        xanchor: 'right',
        y: 1
      },
      showlegend: true,
      width: 900,
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
    // NOTE: For the plotly DOM id, the TSID is used for near uniqueness. A window manager will need to be created to help
    // organize and maintain multiple opened dialogs in the future.
    // (https://plotly.com/javascript/plotlyjs-function-reference/#plotlyplot)
    // const dialogWindow = WindowManager.getInstance();
    // console.log(dialogWindow.windows[this.TSID_Location])
    Plotly.react(this.windowManager.windows[this.TSID_Location].title, finalData, layout, plotlyConfig);
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
            dates.push( moment(currentDate).format('MMM YYYY') );
            currentDate = moment(currentDate).add(1, 'months');
        }
        return dates;
      case 'years':
        currentDate = moment(startDate.toString());
        var stopDate = moment(endDate.toString());
        
        while (currentDate <= stopDate) {
          dates.push(moment(currentDate).format('YYYY'));
          currentDate = moment(currentDate).add(1, 'y');
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

    this.mapService.setChartTemplateObject(this.graphTemplateObject);
    this.mapService.setGraphFilePath(this.graphFilePath);
    this.mapService.setTSIDLocation(this.TSID_Location);
    // Set the mainTitleString to be used by the map template file to display as the TSID location (for now)
    this.mainTitleString = this.graphTemplateObject['product']['properties'].MainTitleString;

    if (this.graphFilePath.includes('.csv'))
      this.parseCSVFile();
    else if (this.graphFilePath.includes('.stm'))
      this.parseTSFile('stateModPath');
    else if (this.graphFilePath.includes('.dv'))
      this.parseTSFile('dateValuePath');
    
  }

  /**
   * Closes the Mat Dialog popup when the Close button is clicked.
   */
  onClose(): void {
    this.mapService.resetClick();
    this.dialogRef.close();
  }

  /**
   * Calls Papa Parse to asynchronously read in a CSV file.
   */
  parseCSVFile(): void {

    var templateObject: Object = this.mapService.getChartTemplateObject();
    // The array of each data object in the graph config file
    var dataArray: any[] = templateObject['product']['subProducts'][0]['data'];
    // This array will hold all results returned from Papa Parse, whether one CSV is used, or multiple
    var allResults: any[] = [];
    // The file path string to the TS File
    var filePath: string;

    // Go through each data object in the templateObject from the graph config file
    for (let data of dataArray) {

      // Depending on whether it's a full TSID used in the graph template file, determine what the file path of the StateMod
      // file is. (TSIDLocation~/path/to/filename.stm OR TSIDLocation~StateMod~/path/to/filename.stm)
      if (data.properties.TSID.split('~').length === 2) {
        filePath = data.properties.TSID.split('~')[1];
      } else if (data.properties.TSID.split('~').length === 3) {
        filePath = data.properties.TSID.split('~')[2];
      }

      Papa.parse(this.appService.buildPath('csvPath', [filePath]), {
        delimiter: ",",
        download: true,
        comments: "#",
        skipEmptyLines: true,
        header: true,
        complete: (result: any, file: any) => {
          allResults.push(result);

          if (allResults.length === dataArray.length) {
            this.createCSVConfig(allResults);
          }
        }
      });

    }
    
  }

  /**
   * A StateMod file is being processed here. Get the template object to determine if there is more than one time series to
   * display. So either one StateMod file is read, or a forkJoin needs to be used to read multiple StateMod files asynchronously.
   * @param TSFile A string defining whether the TSFile to be created is StateMod or DateValue
   */
  parseTSFile(TSFile: string): void {

    var templateObject = this.mapService.getChartTemplateObject();
    // Instantiate a StateMod_TS instance so we can subscribe to its returned Observable later
    var TSObject: any;
    // Create an array to hold our Observables of each file read
    var dataArray: any[] = [];
    // The file path string to the TS File
    var filePath: string;
    // The TSID used by the readTimeSeries function in the converted Java code that utilizes it as a TS identifier
    var TSIDLocation: string;

    switch (TSFile) {
      case 'stateModPath': TSObject = new StateMod_TS(this.appService); break;
      case 'dateValuePath': TSObject = new DateValueTS(this.appService); break;
    }

    
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
      dataArray.push(TSObject.readTimeSeries(TSIDLocation, this.appService.buildPath(TSFile, [filePath]),
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

  /**
   * @returns an array of the data values to display on the y Axis of the time series graph being created
   * @param timeSeries The current time series to use to extract the y axis data for the graph
   * @param x_axisLabels The x Axis labels created for the graph
   * @param type The interval type of the time series ('years', 'months', etc...)
   */
  private setAxisObject(timeSeries: any, x_axisLabels: string[], type: string): any {

    var chartJS_yAxisData: number[] = [];
    var plotly_yAxisData: number[] = [];

    let startDate: DateTime = timeSeries.getDate1();
    let endDate: DateTime = timeSeries.getDate2();
    // The DateTime iterator for the the while loop
    let iter: DateTime = startDate;
    // The index of the x_axisLabel array to push into the chartJS_yAxisData as the x property
    var labelIndex = 0;      
    
    do {
      // Grab the value from the current Time Series that's being looked at
      let value = timeSeries.getDataValue(iter);
      // This object will hold both the x and y values so the ChartJS object explicitly knows what value goes with what label
      // This is very useful for displaying multiple Time Series on one graph with different dates used for both
      var dataObject: any = {};

      // Set the x value as the current date      
      dataObject.x = x_axisLabels[labelIndex];
      // If it's missing, replace value with NaN and push onto the array. If not just push the value onto the array.
      if (timeSeries.isDataMissing(value)) {
        dataObject.y = NaN;
        plotly_yAxisData.push(NaN);
      } else {
        dataObject.y = value;
        plotly_yAxisData.push(value);
      }
      chartJS_yAxisData.push(dataObject);
      // Update the interval and labelIndex now that the dataObject has been pushed onto the chartJS_yAxisData array.
      iter.addInterval(timeSeries.getDataIntervalBase(), timeSeries.getDataIntervalMult());
      labelIndex++;
      // If the month and year are equal, the end has been reached. This will only happen once.
      if (type === 'months') {
        if (iter.getMonth() === endDate.getMonth() && iter.getYear() === endDate.getYear()) {
          dataObject = {};
  
          dataObject.x = x_axisLabels[labelIndex];
          if (timeSeries.isDataMissing(value)) {
            dataObject.y = NaN;
            plotly_yAxisData.push(NaN);
          } else {
            dataObject.y = value;
            plotly_yAxisData.push(value);
          }
          chartJS_yAxisData.push(dataObject);
        }
      }
      else if (type === 'years') {
        if (iter.getYear() === endDate.getYear()) {
          dataObject = {};
  
          dataObject.x = x_axisLabels[labelIndex];
          if (timeSeries.isDataMissing(value)) {
            dataObject.y = NaN;
            plotly_yAxisData.push(NaN);
          } else {
            dataObject.y = value;
            plotly_yAxisData.push(value);
          }
          chartJS_yAxisData.push(dataObject);
        }
      }

    } while (iter.getMonth() !== endDate.getMonth() || iter.getYear() !== endDate.getYear())

    return {chartJS_yAxisData: chartJS_yAxisData,
            plotly_yAxisData: plotly_yAxisData }
  }

  /**
   * Verifies that a potential property being given to a plotly config object will not produce any errors
   * @param property The variable obtained from the graph config file trying to be implemented as a Plotly property
   * @param type The type of property being scrutinized
   */
  private verifyPlotlyProp(property: any, type: string): any {

    switch(type) {
      // Verifying the plotly graph type property
      case 'cm':
        if (property.toUpperCase() === 'LINE') { return 'lines'; }
        else if (property.toUpperCase() === 'POINT') { return 'markers' }
        else {
          console.warn('Unknown property "' + property.toUpperCase() + '" - Not Line or Point. Using default Graph Type Line');
          return 'lines';
        }
      case 'ct':
        if (property.toUpperCase() === 'LINE' || property.toUpperCase() === 'POINT')
          return 'scatter';
        else return 'scatter';
      case 'bc':
        if (property !== '') return property;
        else {
          console.warn('No graph property Color detected. Using the default graph color black');
          return 'black';
        }
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
  chartMode?: string;
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
