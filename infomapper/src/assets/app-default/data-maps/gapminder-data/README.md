# Data Files #
This folder contains the data files that are used by the gapminder visualization.

## CSV Data ##
This folder doesn't contain the actual .csv data files to be used in this visualization. This folder will populated with the appropriate
data files by cloning the repository and running the TSTool command files in 
[data-prep](https://github.com/OpenWaterFoundation/owf-viz-co-snodas-gapminder/tree/master/data-prep).

## Configuration File ##
This configuration file specifies many different attributes to meet user needs. This configuration has an annotation file, but specified that the annotation shapes should default to not display on page-load. More properties are specified to customize date attributes such as an OutputDateFormat, PeriodStart, and PeriodEnd. This configuration includes properties for customizing the type of scale to use on the axes log for XAxisScale, and linear for YAxisScale. This configuration also sets TimeSeriesEnabled to true so users can right click a marker to get a time-series of the data, using a simple configuration of Highcharts

```json
{
	"Properties":{
		"DataFileName":"./data/sample-data.csv",
		"AnnotationsFileName":"./data/annotations.json",
		"MainTitleString":"Water Providers in Colorado",
		"SubTitleString":"Population(size), Basin(color), Water-Use(x), and Water-Use Rate(y).",
		"InputDateFormat":"%Y",
		"OutputDateFormat":"%Y",
		"PeriodStart":"2000",
		"PeriodEnd":"2015",
		"TimeStep":"1Year",
		"AnimationSpeed":90,
		"BottomXAxisTitleString":"Water-Use (acre-feet/year)",
		"XAxisScale":"log",
		"LeftYAxisTitleString":"Water-Use Rate (gpcd)",
		"YAxisScale":"linear",
		"VariableNames":{
			"XAxis":"WaterUse_AFY",
			"YAxis":"GPCD",
			"Date":"Year",
			"Sizing":"Population",
			"Grouping":"Basin",
			"Label":"Provider"
		},
		"TracerNames":"*",
		"AnnotationShapes":"Off",
		"YMax": 525,
		"RepositoryURL": false,
		"TimeSeriesEnabled": true,
		"MarkerName": "Marker"
	}
}
```

[documentation](https://github.com/OpenWaterFoundation/owf-lib-viz-d3-js/wiki/Gapminder-%E2%80%90-configuration-file)
