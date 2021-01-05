import * as $ from "jquery";
export class Properties{
	
	constructor(configurationFile){
		this.properties;
		var that = this;
		/*Get configuration properties*/
		$.ajax({
			url: configurationFile,
			async: false,
			dataType: 'json',
			error: function(error){
				obj.err = "(*)Config file not found, or Config file has error as JSON format";
				console.log(obj.err);
				throwErrorButton();
				throw new Error(error);
			},
			success: function(data){
				that.check_properties(data.Properties);
				that.properties = data.Properties;
			}
		})
		return this;
	}

	/**
	 * Assigns default option to the properties that are not specified in JSON Configuration 
	 * Throws error if variable names are not provided 
	 * @param {Object} properties - object specifying properties obtained from Gapminder JSON Configuration
	 */

	check_properties(properties){
		if(!properties.AnimationSpeed || properties.AnimationSpeed == "") properties.AnimationSpeed = 90;
		if(!properties.BottomXAxisTitleString || properties.BottomXAxisTitleString == "") properties.BottomXAxisTitleString = "";
		if(properties.MultipleDatasets && (!properties.DatasetChoicesLabel || properties.DatasetChoicesLabel == "")) properties.DatasetChoicesLabel = "Choices";
		if(properties.MultipleDatasets && (!properties.DefaultDatasetChoice || properties.DefaultDatasetChoice == "")) properties.DefaultDatasetChoice = properties.DatasetChoicesList[0];
		if(!properties.DataFileName || properties.DataFileName == "") throw new Error("DataFileName: No csv file specified in configuration file.");
		if(!properties.LeftYAxisTitleString || properties.LeftYAxisTitleString == "") properties.LeftYAxisTitleString = ""
		if(!properties.MainTitleString || properties.MainTitleString == "") properties.MainTitleString = "Gapminder";
		if(!properties.SubTitleString || properties.SubTitleString == "") properties.SubTitleString = "Gapminder Visualization.";
		if(!properties.DataTableType || properties.DataTableType == "") properties.DataTableType = "Clusterize";
		if(!properties.AnnotationShapes || properties.AnnotationShapes == "") properties.AnnotationShapes = "Off";
		if(properties.XAxisScale){
			if(!(properties.XAxisScale.toUpperCase() == "LOG" || properties.XAxisScale.toUpperCase() == "LINEAR")){
				throw new Error("XAxisScale: expected either 'log' or 'linear', not '" + properties.XAxisScale + "' in confiugration file.");
			}
		}else{
			properties.XAxisScale = "linear";
		}
		if(properties.YAxisScale){
			if(!(properties.YAxisScale.toUpperCase() == "LOG" || properties.YAxisScale.toUpperCase() == "LINEAR")){
				throw new Error("YAxisScale: expected either 'log' or 'linear', not '" + properties.YAxisScale + "' in confiugration file.");
			}
		}else{
			properties.YAxisScale = "linear";
		}
		if(!properties.VariableNames || properties.VariableNames == "") throw new Error("Variable Names: No variable names specified in configuration file.");
		else{
			var variables = properties.VariableNames;
			if(!variables.Date || variables.Data == "") throw new Error("Date: No variable name for date specified in configuration file.");
			if(!variables.Grouping || variables.Grouping == "") throw new Error("Grouping: No variable name for grouping markers specified in configuration file.");
			if(!variables.Label || variables.Label == "") throw new Error("Label: No variable name for labeling markers sepcified in configuration file.");
			if(!variables.Sizing || variables.Sizing == "") throw new Error("Sizing: No variable name for sizing of markers specified in configuration file.");
			if(!variables.XAxis || variables.XAxis == "") throw new Error("XAxis: No variable name specified for X-Axis in configuration file.");
			if(!variables.YAxis || variables.YAxis == "") throw new Error("YAxis: No variable name specified for Y-Axis in configuration file.");
		}
		if(!properties.TimeStep || properties.TimeStep == "") throw new Error("TimeStep: no precision of time step specified in configuration file.");	
		if(!properties.OutputDateFormat || properties.OutputDateFormat == "") properties.OutputDateFormat = properties.InputDateFormat;	
	}

}