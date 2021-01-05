// ----------------------------------------------------------------
// DATA CLASS: This class encapsulates all the data that is needed 
// for running Gapminder visualization. It also parses through the 
// csv data read in and converts it to JSON for Gapminder.
// ----------------------------------------------------------------
import * as $ from "jquery";
import * as d3 from 'd3';
import * as Papa from 'node_modules/papaparse/papaparse.min.js';


export class Data{
	constructor(configurationProperties){
		this.configurationProperties = configurationProperties;
		this.variables = configurationProperties.VariableNames;
		this.csv;
		this.json;
		this.annotations;
		if(configurationProperties.AnnotationsFileName && configurationProperties.AnnotationsFileName != "") this.get_annotations();
		else this.annotations = null;
		this.demensions = {
			"xMin":Infinity, 
			"xMax":-Infinity, 
			"yMin":Infinity, 
			"yMax":-Infinity, 
			"radiusMax":-Infinity, 
			"dateMin":new Date(8640000000000000), 
			"dateMax":new Date(-8640000000000000),
			"maxPopulatedDate":new Date(-8640000000000000)
		};
		this.convert_to_json();
	}

	get_annotations(){
		var _this = this;
		//ajax call to get annotation data from annotationsURL specified in Config file
		$.ajax({
			url:_this.configurationProperties.AnnotationsFileName,
			async:false,
			dataType:'json',
			error: function(error){
				throw new Error(error);
			},
			success: function(data){
				_this.annotations = data.Annotations;
			}
		})
	}

	convert_to_json(){
		var _this = this;
		var _Papa = Papa;
		this.parseDate = d3.timeParse(_this.configurationProperties.InputDateFormat);
		var URL;	
		if(_this.configurationProperties.MultipleDatasets){
			URL = expand_parameter_value(_this.configurationProperties.DataFileName, {"Year": _this.configurationProperties.DefaultDatasetChoice});
		}else{
			URL = _this.configurationProperties.DataFileName;
		}
		$.ajax({
			url: URL,
			async: false,
			dataType: 'text',
			error: function(error){
				throw new Error(error);
			},
			success: function(data){
				// console.log("inside convert to json success function");
				// console.log("data: ", data);
				_this.csv = data;
				// console.log("_this.csv:", _this.csv);
				var csv = _Papa.parse(data,{header:true, comments:true, dynamicTyping:true}).data,
					jsonObj = {"data":[]},
					tempJson = makeJsonObj(csv[0]);
					// console.log("var csv:", csv );

				for(var i = 0; i < csv.length - 1; i++){
					if(csv[i][_this.variables.Label] == tempJson[_this.variables.Label]){
						initializeDeminsions(csv[i]);
						updateJsonObj(tempJson, csv[i]);
					}else{
						jsonObj.data.push(tempJson);
						tempJson = makeJsonObj(csv[i]);
						initializeDeminsions(csv[i]);
						updateJsonObj(tempJson, csv[i]);
					}
				}
				jsonObj.data.push(tempJson);
				_this.json = jsonObj;
			}
		})

		/**
		 *Makes a JSON object in the correct format required for interpolating the data </p>
		 *ex: {"WaterUse_AFY":[],"GPCD":[],"Population":[],"Basin":"Metro","Provider":"Arapahoe County Water and Wastewater Authority"}
		 *
		 *@param {object} data - an object containing data from csv file
		 */
		function makeJsonObj(data){
			var json = {}
			json[_this.variables.XAxis] = [];
			json[_this.variables.YAxis] = [];
			json[_this.variables.Sizing] = [];
			json[_this.variables.Grouping] = data[_this.variables.Grouping].toString();
			json[_this.variables.Label] = data[_this.variables.Label].toString();
			return json;
		}

		/**
		 *Returns an object containing 3 new 2 element arrays of [year, data] </p>
		 *ex: {DataXAxisName:[year, var1], DataYAxisName:[year, var2], DataMarkerSizingName:[year, var3]}
		 *
		 *@param {int} year - year for which to create the arrays
		 *@param {number} var1 - data for DataXAxisName
		 *@param {number} var2 - data for DataYAxisName
		 *@param {number} var3 - data for DataMarkerSizingName
		 */ 
		function createNewObject(date, var1, var2, var3){
			var date = new Date(_this.parseDate(date));
			var data = {
				 xVar:[date, parseFloat(initializeIfEmpty(var1))],
				 yVar:[date, parseFloat(initializeIfEmpty(var2))],
			 	 size:[date, parseFloat(initializeIfEmpty(var3))]
			 };
			return data;
		}

		/**
		 *Checks that data is always slightly larger than 0 for logarithmic scaling purposes
		 *
		 *@param {number} data - a number to be checked
		 */
		function checkData(data){
			if(data == 0){
				return 0.001;
			}else{
				return 0;
			}
		}

		function initializeIfEmpty(val){
			if(val == ""){
				return 0;
			}else{
				return val;
			}
		}

		/**
		 *Pushes data returned from createNewObj() onto the JSON object
		 *
		 *@param {object} JSON - the JSON object to be udpated
		 *@param {object} data - object containing data to be added to JSON object
		 */
		function updateJsonObj(json, data){
			data = createNewObject(data[_this.variables.Date], data[_this.variables.XAxis], data[_this.variables.YAxis], data[_this.variables.Sizing]);
			json[_this.variables.XAxis].push(initializeIfEmpty(data.xVar));
			json[_this.variables.YAxis].push(initializeIfEmpty(data.yVar));
			json[_this.variables.Sizing].push(initializeIfEmpty(data.size));
		}

		function checkMin(number){
			if(number < 0){
				d3.select(".title")
					.append("text")
					.style("color", "red")
					.style("font-size", "12px")
					.text('Error: log axis with negative values');
				throw 'Error: log axis with negative values';
			}
			if(number < 1){
				number = 1;
			}
			return number;
		}

		/**
		 *Initializes variables for min and max values while parsing through the csv data file </p>
		 *ex: xMin, xMax, yMin, yMax, and radiusMax
		 *
		 *@param {object} data - object containing data
		 */
		function initializeDeminsions(data){
			if(_this.configurationProperties.XAxisScale.toUpperCase() == "LOG"){
				_this.demensions.xMin = Math.min(_this.demensions.xMin, checkMin(parseFloat(initializeIfEmpty(data[_this.variables.XAxis]))));
			}else{
				_this.demensions.xMin = Math.min(_this.demensions.xMin, parseFloat(initializeIfEmpty(data[_this.variables.XAxis])));
			}

			if(_this.configurationProperties.YAxisScale.toUpperCase() == "LOG"){
				_this.demensions.yMin = Math.min(_this.demensions.yMin, checkMin(parseFloat(initializeIfEmpty(data[_this.variables.YAxis]))));
			}else{
				_this.demensions.yMin = Math.min(_this.demensions.yMin, parseFloat(initializeIfEmpty(data[_this.variables.YAxis])));
			}	
			_this.demensions.xMax = Math.max(_this.demensions.xMax, parseFloat(initializeIfEmpty(data[_this.variables.XAxis])));
			_this.demensions.yMax = Math.max(_this.demensions.yMax, parseFloat(initializeIfEmpty(data[_this.variables.YAxis])));
			_this.demensions.radiusMax = Math.max(_this.demensions.radiusMax, parseFloat(initializeIfEmpty(data[_this.variables.Sizing])));
			_this.demensions.dateMin = new Date(Math.min(_this.demensions.dateMin.getTime(), new Date(_this.parseDate(data[_this.variables.Date])).getTime()));
			_this.demensions.dateMax = new Date(Math.max(_this.demensions.dateMax.getTime(), new Date(_this.parseDate(data[_this.variables.Date])).getTime()));
			if(populated(data) == true) _this.demensions.maxPopulatedDate = new Date(Math.max(_this.demensions.maxPopulatedDate.getTime(), new Date(_this.parseDate(data[_this.variables.Date])).getTime()));
		}

		function populated(data){
			if(data[_this.variables.XAxis] == "" && data[_this.variables.YAxis] == "" && data[_this.variables.Sizing] == ""){
				return false;
			}
			return true;
		}
	}
}