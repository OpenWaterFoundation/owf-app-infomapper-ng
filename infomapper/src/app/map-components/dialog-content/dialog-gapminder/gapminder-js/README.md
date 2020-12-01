# Gapminder

This repository contains an Open Water Foundation  D3.js- based Gapminder integrated within an Angular application to provide a visualization within larger applications such as OWF's Infomapper.  The Gapminder is an implementation of the [Gapminder.org tool](https://www.gapminder.org/) developed using the [D3.js](https://d3js.org/) JavaScript library. A D3 approach was taken because no suitable solution was available at the time and D3 provided a dynamic option, and even today there may not be an appropriate solution from Gapminder.org that can be used.

### Gapminder Fundementals  

This gapminder visualization requires an input data set of .csv format, that contains a header with variable names. The expected data format will contain at least 6 columns; although fewer may be provided if the same data are re-used where it seems appropriate.
For example, it is possible to group the markers by the same data as the labels for specific markers. 6 columns is preferable, however, for a configuration that utilizes the visualization to it's fullest extent.

For more detail on the data file see [CSV file](https://github.com/OpenWaterFoundation/owf-lib-viz-d3-js/blob/master/v4/gapminder/Gapminder-‐-CSV-Data-File)

#### Configuration:

The Gapminder visualization requires that a configuration file is specified at the top of [index.html](https://github.com/OpenWaterFoundation/owf-lib-viz-d3-js/blob/master/v4/gapminder/Gapminder-‐-index.html).

```
<script> ConfigurationFile = "path/to/configuration_file"; </script>
```

These configuration properties specify necessary information that the Gapminder Visualization requires to operate, as well as offers the user many options for customizing the visualization to meet their preferences. This visualization was developed, and based off of, [The Health & Wealth of Nations](https://bost.ocks.org/mike/nations/), created by [Mike Bostock](https://bost.ocks.org/mike/).

For more detail on the configuration file see [Configuration File](https://github.com/OpenWaterFoundation/owf-lib-viz-d3-js/blob/master/v4/gapminder/Gapminder-‐-configuration-file).

Given the appropriate input data and configuration file, the gapminder visualization should now be ready to deploy, which will result in a visualization as seen below.

This project is open source and can be cloned for deployment as well as development.



## Gapminder Angular Environment 

To integrate the Gapminder into the an Angular application the following files will be required and must be placed within respected locations in ``assets`` of the angular application 

``src/assets``

```
css/
	style.css
gapminder-data/
	annotations.json
	sample-data.csv
	viz-config.json 
js/
	gapminder-util/
	gapminder-4.0.0
	
```



