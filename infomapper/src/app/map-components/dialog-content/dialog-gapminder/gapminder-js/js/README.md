# Javascript Files
* **bootstrap.min.js** - Part of the [boostrap](https://getbootstrap.com/) library. Used for designing the layout of the page.
* **data-class.js** - Javascript code written to initialize data objects for later use in [gapminder-*js](https://github.com/OpenWaterFoundation/owf-lib-viz-d3-js/wiki/gapminder-4.0.0.js) 
including:<br>
    <ul>
      <li>csv data</li>
      <li>json formatted data - converted from csv </li>
      <li>annotations data </li>
      <li>also initializes demensions which contains:</li>
        <ul>
         <li>xMin</li>
         <li>xMax</li>
         <li>yMin</li>
         <li>yMax</li>
         <li>radiusMax</li>
         <li>dateMin</li>
         <li>dateMax</li>
         <li>maxPopulatedDate</li>
        </ul>
     </ul>
   
* **data.js** - Part of the [highcharts](https://www.highcharts.com/) library used in `highchart.html` to create a timeseries graph.
* **display-data.js** - Javascript code that is called when clicking the data tab in `index.html` to display the input csv data file as a
table.
* **gapminder-4.0.0.js**  - Javascript code that creates the gapminder visualization. Dynamically adds elements to the DOM using 
[d3.js](https://d3js.org/).
* **expand-paramter.js** - Javascript code that expands a command parameter value (string) into full string.
* **highstock.js** - Part of the [highcharts](https://www.highcharts.com/) library used in `highchart.html` to create a timeseries graph.
* **highstock.src.js** - Part of the [highcharts](https://www.highcharts.com/) library used in `highchart.html` to create a timeseries graph.
* **jquery-3.2.0.min.js** - [JQuery](https://jquery.com/) library.
* **papaparse.js** - Part of the [papaparse](https://www.papaparse.com/) library. Used to parse csv files in `data-class.js`.
* **properties.js** - Javascript code to initialize the properties object with configuraiton propreties specified in the 
[configuration file](https://github.com/OpenWaterFoundation/owf-lib-viz-d3-js/wiki/Gapminder-‐-configuration-file), and check for any errors
 in configuration.
* **select2.min.js** - Part of the [Select2](https://select2.org/) library, used in `index.html` and `gapminder-*.js` to create a dropdown
 menu with different individual markers to select from.
