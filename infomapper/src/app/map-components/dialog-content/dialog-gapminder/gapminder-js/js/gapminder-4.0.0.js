import  { Properties } from './gapminder-util/properties.js';
import  { Data } from './gapminder-util/data-class.js';

import $ from "jquery";
import * as d3 from 'd3'; // latest D3 V6
import 'select2'; 



var dot;
// Top level wrapper function 
export function gapminder(configPath){

var gapminderSelected = true;

/*Should try and nest these variables in some sort of object to avoid cluttering javascript namespace*/

	var bool = true;
/**
 * String containing path to  Gapminder configuration file 
 */
let configurationFile = configPath; 	

/**
 * Creating Properties {Object} from JSON Configuration, and Storing properties 
 */
window.properties = new Properties(configurationFile);

/**
 * Assigning object's properties to the local 'properties' variable
 */
properties = properties.properties;

/**
 * Object holding additional paramaters if property provided in configuration, otherwise set to null;
 */
var additionalParametersDictionary = properties.AdditionalData ? getAdditionalParameters() : null;

/**
 * Object holding variable names from configuration 
 */
var variables = properties.VariableNames;

/**
 * Object that encapsulates all the data needed for Gapminder,
 * Also parses through csv data read in and convers to JSON for Gapminder
 */
var data = new Data(properties);

/**
 * Object holding JSON data for gapminder 
 */
var json = data.json;

/**
 * Object holding demensions from data
 */
window.demensions = data.demensions;
console.log("var demensions ", demensions);
// console.log("var demensions ", demensions.dateMin);


/**
 * Object holding annotations data,
 * .GeneralAnnotaions  - Displayed below visualization if annotations exist for the specified time frame,
 * .SpecificAnnotations - Displayed on visualization through popup on mouseover 
 */
var annotations_data = data.annotations;

/**
 * D3's built in time parser, indicates what the date string should look like.
 * Used to format to format the string into date object, i.e. '%Y'
 */
var parseDate = d3.timeParse(properties.InputDateFormat);   // using d3.timeParse (D3's built in time parser) to format the string into date object 

/**
 * Used to format date object into a string
 * - Used as parameter for getAnnotations(inputFileFormat) function,
 */
var inputFileFormat = d3.timeFormat(properties.InputDateFormat);   // using d3.timeFormat to format the date object into a string.

/**
 * Used to format date object into a string
 */
var formatDate = d3.timeFormat(properties.OutputDateFormat);


window.currYear = demensions.dateMin;   //made global for back and forward functions
var topYear = demensions.dateMin;

// var precisionInt = parsePrecisionInt(properties.TimeStep);
// var precisionUnit = parsePrecisionUnits(properties.TimeStep);

/**
 * Svg container width - responsible for defining the visualization's canvas
 * ( or the area where the graph and associated bits and pieces are placed)
 */
var width = $("#chart").parent().width();  
/**
 * Svg container height - responsible for defining the visualization's canvas
 * ( or the area where the graph and associated bits and pieces are placed)
 */
var height = $("#Gapminder").parent().height() - 270;

console.log("init width: ", width);
console.log("init height: ", height);


/**
 * SVG container margin - responsible for defining the visualization's canvas 
 * ( or the area where the graph and associated bits and pieces are placed)
 */
var margin = {top:10, left:30, bottom:80, right:82};

window.displayAll = true;
window.tracer = (properties.TracerNames == "" || !properties.TracerNames) ? false : true; // made global for functions outside wrapper
var visSpeed;

// var transtionFunction;

/**
 * Used in stopAnimation() function, stops the next transition.
 */
var transition;

//og end of globals


var legendHeight;


// window.dot; // window global didn't work for some reason. made global outside of gapminder function
window.firstClick = true;


// export function gapminder(){

var precisionInt = parsePrecisionInt(properties.TimeStep);
// var precisionUnit = parsePrecisionUnits(properties.TimeStep);
window.precisionInt = parsePrecisionInt(properties.TimeStep);
window.precisionUnit = parsePrecisionUnits(properties.TimeStep);





//TODO: was used in snodas, not needed in this application, 
//need to make this more dynamic - Justin Rentie 2/13/2018
demensions.maxPopulatedDate.setHours(23, 59, 59);



if(properties.MultipleDatasets){
	$("#DatasetChoicesLabel").html(properties.DatasetChoicesLabel + ": ");
	$("#DatasetChoices").html(properties.DefaultDatasetChoice +  " <span class='caret'></span>");
	//Add date options
	d3.select("#datesList")
		.attr("class", "dropdown-menu")
		.selectAll("dropdown-menu")
		.data(properties.DatasetChoicesList)
		.enter().append("li")
		.append("a")
		.attr("href", "#")
		.attr("onclick", function(d){
			return "selectYear(" + d +")";
		})
		.text(function(d){ return d; })
}else{
	$("#DatasetChoicesLabel").remove();
	$("#DatasetChoices").remove();
}


if(properties.DataTableType.toUpperCase() == "CLUSTERIZE") d3.select("#dataTable2").remove();
if(properties.DataTableType.toUpperCase() == "JQUERY") d3.select("#dataTable1").remove();

var div = d3.select("#Gapminder").append("div")	
	    .attr("class", "tooltip")
	    .style("opacity", 0);
// $(window).click(function(e){ // .click depricated
$(window).on("click",function(e){
	if(e.button == 0){
		div.remove();
		div = d3.select("#Gapminder").append("div")	
	    		.attr("class", "tooltip")
	    		.style("opacity", 0);
	}
});

d3.select("#selectAllButton")
	.html("Select All " + variables.Label +"s")

//If no annotation file or if no annotation shapes sepcififed in annotation file, disable annotations on/off button
if(annotations_data == null){
	document.getElementById("annotationsButton").disabled = true;
}else{
	if(!annotations_data.SpecificAnnotations){
		document.getElementById("annotationsButton").disabled = true;
	}
}

//----------------------------------------ROW 1: TITLE/SUBTITLE -----------------------------------------
//create a row (bootstrap) with div's for title and subtitle
//add maintitle to index.html
d3.select("#maintitle")
    .append("text")
	.text(properties.MainTitleString) //Title configured in Config file
	.style("font-size", function(){
		return "22px";
	});

//add a location to display date
d3.select("#maintitle")
	.append("div")
	.attr("id", "currentDateDiv")
	.style("float", "right")
	.style("padding-right", "8px")
	.style("padding-top", "5px")
	.append("text")
	.text(formatDate(currYear));

//add subtitle to index.html
d3.select("#subtitle")
	.append("text")
	.attr("id", "subtitle-text")
	.text(properties.SubTitleString) //Subtitle configured in Config file
	.style("font-size", function(){
		return "15px";
	})
	.on("mouseover", () => {
		var subtitleContainer = document.getElementById("subtitle");
		if(subtitleContainer.scrollWidth > subtitleContainer.clientWidth){
			d3.select("#subtitle")
				.attr("class", "mouseover");
			d3.select("#subtitle-text")
				.attr("class", "mouseover")
		}
	})
	.on("mouseout", () => {
		d3.select("#subtitle")
			.attr("class", "");
		d3.select("#subtitle-text")
			.attr("class", "")
	})

//----------------------------------ROW 2(row.viz): GAPMINDER CHART/LEGEND/LIST---------------------------

// var selected = d3.select('#chart');
// if (selected._group[0][0] == null) { 
// 	// nothing found 
// 	console.log("'chart' element not selected");
// } else { 
// 	// found something 
// 	console.log("'chart' selected");
// } 


/**
 * SVG container for chart elements
 */
var svg = d3.select("#chart")
	.append("svg")
    .attr("class", "box")
	.attr("width", "100%")
	// .attr("width", (width + 50))
    .attr("height", height); //This is the height of only the actual chart, making room for elements above and below the chart

	console.log("create svg container: ", svg);


//set width to be width of svg container 'box'
width = $(".box").width(); //Set width to the width of the chart

console.log("width1: ", width);

/*create a div/svg container for legend*/
var legend = d3.select("#legend")
	.style("height", ((height/2) - 30) + "px");
	 //Legend is half the height of the chart

//create a div for list
var sideTools = d3.select("#sideTools")
	.style("height", (height/2) + "px");
	 //sideTools are half the height of the chart

//creates the search bar for selecting provider from a dropdown menu </p>
//utilizes [select2]{@link https://select2.github.io/} library
$(document).ready(function() {
// $(document).jQuery(function() {
  $("#providerNames").select2({
  	placeholder: "Select Individual " + variables.Label + "..."
  });
});

//-----------------------------------ROW 3: YEAR SLIDER/BUTTON CONTROLS----------------------------------
//create a timescale for year slider
var timeScale = d3.scaleTime()
	.domain([demensions.dateMin, demensions.dateMax])
	.range([0, (width - 75)]);

var dateArray = dateArray_function(demensions); //made global


var visSpeed = 20000 / (timeScale.range()[1] - timeScale.range()[0]);
//if the last data in the array isn't the last possible date, add the last date to the end of the array
if(dateArray[dateArray.length - 1].getTime() != demensions.dateMax.getTime()){
	dateArray.push(demensions.dateMax);
}

var dateLabel = d3.select(".box")
	.append("text")
	.text(formatDate(timeScale.ticks()[0]))
	.attr("fill-opacity", "0");

var dateText = dateLabel.node().getBBox();


/**
 * div and svg container for yearslider and buttons
 */
var controlSVG = d3.select("#dateSlider")
    .append("svg")
	.attr("width", "100%")
	.attr("height", "45px")
	.attr("transform", "translate(0,0)");

var slider = controlSVG.append('g')
	.attr('class', "slider")
	.attr("transform", "translate(50,15)");

var slider_tooltip = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

var handleFormat = formatHandleText();
slider.append("line")
	.attr("class", "track")
	.attr("x1", timeScale.range()[0])
	.attr("x2", timeScale.range()[1])
	.attr("stroke-linecap","round")	// CSS Styling for dateslider: rounds track edges
	.attr("stroke","#000")	// CSS Styling for dateslider: adds color to track
	.attr("stroke-opacity","0.3")	// CSS Styling for dateslider: lowers opacity of track 
	.attr("stroke-width","4px")	// CSS Styling for dateslider : adjusts track width (slightly thicker)
  .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
	.attr("class", "track-inset")
	.attr("stroke-linecap","round")	// CSS Styling for dateslider
	.attr("stroke","#ddd")	// CSS Styling for dateslider
	.attr("stroke-width","2px")	// CSS Styling for dateslider
  .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
	.attr("class", "track-overlay")
	.attr("stroke-linecap","round")	// CSS Styling for date slider
	.attr("pointer-events","stroke")	//  CSS Styling for dateslider
	.attr("stroke","transparent")	//  CSS Styling for dateslider
	.attr("cussor","crosshair")	//  CSS Styling for dateslider
    .style("cursor", "pointer")
    .on("mousemove", function(event){	// event passed as first argument to all listeners 
    	slider_tooltip.transition()
    		.duration(200)
    		.style("opacity", .9);
    	var date = timeScale.invert(Math.round(event.x - 361));// I don't understand why I have to subtract?
    	if(date <= demensions.maxPopulatedDate){
    		slider_tooltip.html(handleFormat(date))
    			.style("left", ( event.pageX - 30) + "px")		// d3.event ⇨ (event)
            	.style("top", ( event.pageY - 35) + "px");		// d3.event ⇨ (event)
    	}else{
    		slider_tooltip.html(handleFormat(date) + " (no data)")
    			.style("left", ( event.pageX - 30) + "px")		// d3.event ⇨ (event)
            	.style("top", ( event.pageY - 35) + "px");		// d3.event ⇨ (event)
    	}
    	
    })
    .on("mouseout", function(){
    	slider_tooltip.transition()
    		.duration(200)
    		.style("opacity", 0);
    })
	.call(d3.drag()
			.on("start.interrupt", function(event){slider.interrupt(); })
			.on("start drag", function(event){ draggedYear(timeScale.invert(Math.round( event.x))); }));	// event passed as first argument to all listeners 

var g = slider.insert("g", ".track-overlay")
	.attr("class", "ticks")
	.attr("transform", "translate(0," + 28 + ")");

//sliderText();
g.selectAll("text")
	.data(timeScale.ticks(getMaxXTicks(width, dateText.width)))
	.enter().append("text")
	.attr("x", function(d){
		return timeScale(d);
	})
	.attr("text-anchor", "middle")
	.style("cursor", "default")
	.text(function(d){return formatDate(d); });

/**
 * handle part of slider, handle slides across track
 */
var handle = slider.insert("circle", ".track-overlay") 
    .attr("class", "handle") 
	.attr("r", 5)
	.attr("fill","#fff")	// CSS Styling for date slider: defualt handle color is black, this makes it white
	.attr("stroke","#000")	// CSS Styling for dateslider: gives handle a black outline
	.attr("stroke-opacity","0.5")	// CSS Styling for dateslider: lowers opacity of black outline 
	.attr("stroke-width","1.25px");	// CSS Styling for dateslider:  sets outline width

	

var handleText = slider.insert("text", ".track-overlay")
	.attr("font-size", "10px")
	.text(formatDate(currYear))
	.attr("text-anchor", "middle")
	.attr("transform", "translate(0, -7)");

//Add annotations
if(annotations_data != null){
	var annotationDates = Object.keys(annotations_data.GeneralAnnotations);

	var annotationsDots = slider.append("g")
		.attr("class", "annotationDots")
		.selectAll(".annotationDots")
		.data(annotationDates)
	.enter().insert("circle", ".track-overlay")
		.attr("class", "handle")
		.attr("cx", function(d){
			return timeScale(parseDate(d))
		})
		.attr("r", 2.5)
		.on("mouseover", function(d){
			annotations.html(
					"<p class='datatable' style='text-decoration:underline;'><strong> Annotations </strong></p>" +
					"<p class='datatable' style='font-weight:bold;'> Date: " + d + "</p>" + 
					"<p class='datatable' style='font-weight:bold; display:inline;'>" + annotations_data.GeneralAnnotations[d].Title + ": " +
					"<p class='datatable'style='display:inline;'>" + annotations_data.GeneralAnnotations[d].Description + "</p>"
				)
		})
}

//------------------------------------ROW 4: DATATABLE/ANNOTATIONS----------------------------------------
// The following are the default variables to be displayed in the datatable
// which consiste of the name of the dot and the four variables this visualization 
// displays.
var tableContents = "<p><strong>" + variables.Label +  "</strong>: </p>" +
					"<p><strong>" + variables.Date + "</strong>: </p>" +
					"<p><strong>" + variables.XAxis + "</strong>: </p>" +
					"<p><strong>" + variables.YAxis + "</strong>: </p>" +
					"<p><strong>" + variables.Sizing + "</strong>: </p>" +
					"<p><strong>" + variables.Grouping + "</strong>: </p>";
// If there are additional parameters to show then add the content to the tablediv
if(additionalParametersDictionary) {
	tableContents += "<br> Additional Parameters:<br>------------------";
	for(var i = 0; i < additionalParametersDictionary.length; i++){
		tableContents += "<p><strong>" + additionalParametersDictionary[i] + "</strong>: </p>";
	}
}
//create a row and div for the datatable
 var tablediv = d3.select("#tablediv")
	.html( tableContents );
	
d3.select("#tablediv")
	.style("height", "102px");

//if Config file specifies annotationsappend a div for annotations in same row as datatable
if(annotations_data && !$.isEmptyObject(annotations_data.GeneralAnnotations)){
	var annotations = d3.select("#annotations")
		.style("height", "102px")
	    .attr("transform", "translate("+ (-70) +"," + (height) + ")")
		.html(
			"<p class='datatable' style='text-decoration:underline;'><strong> Annotations </strong></p>"
		    );	
}

//create a tip object that will display information when hovering over an annotation
// window tip 
window.tip= d3.select('body')
    .append('div')
    .attr('class', 'tip')
    .style('border', '1px solid black')
    .style('padding', '2px')
    .style('position', 'absolute')
    .style('display', 'none')
    .style('font-size', '12px')
    .style('background', 'white')
    .style('max-width', '200px')
    .on('mouseover', function(d, i) {
      tip.transition().duration(0);
    })
    .on('mouseout', function(d, i) {
      tip.style('display', 'none');
    });

//-----------------------------------------------GAPMINDER-----------------------------------------------
/**
 * A bisector for interpolating data is sparsely-defined.
 */
var bisect = d3.bisector(function(d) { return d[0]; });
/**
 * creates a scale to set the color of dots
 */
var colorScale = d3.scaleOrdinal(d3.schemeCategory10);		//d3.schemeCategory is a standard color scheme 
// var firstClick = true; //make global

var yText = d3.select(".box")
	.append("text")
	.text(d3.format(",.0f")(Math.round(demensions.yMax))) //hard-coded, needs to change
	.attr("fill-opacity", 0);
//create svg element of largest x-axis label
var xText = d3.select(".box")
	.append("g")
	.append("text")
	.text(d3.format(",.0f")(Math.round(demensions.xMax))) //hard-coded, needs to change
	.attr("fill-opacity", 0);
//bbox gets height and width attributes of labels
var yTextBox = yText.node().getBBox();
var xTextBox = xText.node().getBBox();

//creates a scale to set radius of dots											
var radiusScale = d3.scaleSqrt().domain([0, (demensions.radiusMax * 2)]).range([3, 47]);
//assign xScale according to if Config file specifies Log or Linear
if(properties.XAxisScale.toUpperCase() == "LOG"){
	var min = properties.XMin && properties.XMin != "" ? properties.XMin : demensions.xMin;
	var max = properties.XMax && properties.XMax != "" ? properties.XMax : demensions.xMax;
	/*var min = Config.setXMin != null ? Config.setXMin : Config.xMin;
	var max = Config.setXMax != null ? Config.setXMax : Config.xMax;*/
	//configure the log x scale domain and range
	
	
	var xScale = d3.scaleLog() //made global using window?
	// window.xScale = d3.scaleLog() //made global using window?
		.domain([checkMin(min), max]) //checkLogMin to make sure no negative #s
		.range([yTextBox.width + margin.left + 15, (width-25)]);


		//configure the xAxis with the xScale.
	var xAxis = d3.axisBottom()
		.scale(xScale)
		.ticks(6, d3.format(",d")) //get logTicks for log & format numbers for log
		.tickSizeInner(-(height))
		.tickSizeOuter(0)
		.tickPadding(10);
}else{ 
	var min = properties.XMin && properties.XMin != "" ? properties.XMin : demensions.xMin;
	var max = properties.XMax && properties.XMax != "" ? properties.XMax : demensions.xMax;
	/*var min = Config.setXMin != null ? Config.setXMin : Config.xMin;
	var max = Config.setXMax != null ? Config.setXMax : Config.xMax;*/
	//configure the linear x scale domain and range
	var xScale = d3.scaleLinear()
		.domain([min, max])
		.range([yTextBox.width + margin.left + 15, (width-25)]);
	//configure the xAxis using the xScale.
	var xAxis = d3.axisBottom()
		.scale(xScale)
		.ticks(getMaxXTicks(width, xTextBox.width) - 1) //get maxXTicks for linear
		.tickFormat(d3.format(",")) //format numbers for linear
		.tickSizeInner(-(height))
		.tickSizeOuter(0)
		.tickPadding(10);
}
//assign xScale according to if Config file specifies Log or Linear
if(properties.YAxisScale.toUpperCase() == "LOG"){
	var min = properties.YMin && properties.YMin != "" ? properties.YMin : demensions.yMin;
	var max = properties.YMax && properties.YMax != "" ? properties.YMax : demensions.yMax;
	/*var min = Config.setYMin != null ? Config.setYMin : Config.yMin;
	var max = Config.setYMax != null ? Config.setYMax : Config.yMax;*/
	//configure log y scale domain and range
	var yScale = d3.scaleLog()
		.domain([checkMin(min), max]) //checkLogMin to make sure no negative #s
		.range([height - 40, 0]);
	//configure yAxis using y scale
	var yAxis = d3.axisLeft()
		.scale(yScale)
		.ticks(6, d3.format(",d")) //get logTicks for log & format numbers for log
		.tickSizeInner(-(width - margin.right) + 5)
		.tickSizeOuter(0)
		.tickPadding(10);
}else{
	var min = properties.YMin && properties.YMin != "" ? properties.YMin : demensions.yMin;
	var max = properties.YMax && properties.YMax != "" ? properties.YMax : demensions.yMax;
	/*var min = Config.setYMin != null ? Config.setYMin : Config.yMin;
	var max = Config.setYMax != null ? Config.setYMax : Config.yMax;*/
	//configure linear y scale domain and range
	 var yScale = d3.scaleLinear()
	    .domain([min, max])
	    .range([height - 40, 0]);
	//configure yAxis using y scale
	 var yAxis = d3.axisLeft()
		.scale(yScale)
		.ticks(getMaxYTicks(height, yTextBox.height)) //get maxYticks for linear
		.tickFormat(d3.format(",")) //format numbers for linear
		.tickSizeInner(-(width - margin.right) + 5)
		.tickSizeOuter(0)
		.tickPadding(10);


}



//add the x-axis to svg, using xAxis
var xaxis = svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (height - 40) + ")")
    .call(xAxis);
//add the y-axis to svg, using yAxis
var yaxis = svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .attr("transform", "translate(" + (yTextBox.width + margin.left + 15)  + ",0)");
//add an x-axis label to below x-axis
var xlabel = svg.append("text")
    .attr("class", "xLabel")
    .attr("text-anchor", "middle")
    .attr("x", (width/2))
    .attr("y", height - 5)
    .text(properties.BottomXAxisTitleString)
    .attr("font-size", "14px");
//add a y-axis label to svg to left of y-axis
var ylabel = svg.append("text")
    .attr("class", "yLabel")
    .attr("text-anchor", "middle")
    .attr("y", 0)
    .attr("x", -((height - 100)/2))
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text(properties.LeftYAxisTitleString)
    .attr("font-size", "14px");

var legendData = getGroupingNames(json);
add_legend(legendData);
function add_legend(data){
	var selectMultiple = false;
	//initialize position 0 for adding elements to legend div.
	var pos = 0;
	//get list of names for legend based off how dots are colored/grouped on the visualization
	//set height using 20px per name
	legendHeight = (data.length + 1) * 20;

	d3.select("#legend")
		.style("height", function(){
			if(legendHeight < ((height/2) - 30)){
				return (legendHeight) +"px";
			}else{
				return (height/2) - 30 + "px";
			}
		});
	var legend = d3.select("#legend")
	//append svg to legend div using legendHeight
	legend = legend.append('svg')
		.attr("class", "legendBox")
		.attr("width", "100%")
		.attr("height", legendHeight)
	//add legend title
	legend.append('text')
		.text(variables.Grouping)
		.style("font-size", "12px")
		.style("text-decoration", "underline")
		.attr("y", "10");
	//add square for each name, color coordinated with colorScale
	var square = legend.append("g")
		.attr("class", "square")
		.selectAll(".square")
		.data(data)
	  .enter().append("rect")
	    .attr("class", "square")
	    .attr("height", "10px")
	    .attr("width", "10px")
	    .attr("y", function(d){ return pos+=20; })
	    .style("fill", function(d){
	    		return colorScale(d);
	    })
	    .attr("cursor", "pointer")
	    .on("mousedown", function(event, d){	// event passed as first argument to all listeners 
	    	if( event.ctrlKey){		// d3.event ⇨ (event) 
	    		if(firstClick){
	    			selectMultiple = false;
	    			legendButton(d, selectMultiple);
	    			firstClick = false;
	    		}else{
	    			selectMultiple = true;
	    			legendButton(d, selectMultiple);
	    		}
	    	}else{
				selectMultiple = false;
				legendButton(d, selectMultiple);
				firstClick = false;
			}
	    	
	    }); //callback function: legendButton()

	//reset position for legend div, accounting for text positioning vs. svg rect positioning
	pos = 7;
	//add the text to the legend from list of names
	var legendText = legend.append("g")
		.attr("class", "legendText")
		.selectAll("legendText")
		.data(data)
	   .enter().append("text")
	    .attr("class", function(d){
	    	return "D" + checkForSymbol(d);
	    })
	    .text(function(d){
	    	var s = " - " + d;
	    	if(s.length > 17){
	    		s = s.substring(0,17); //truncate name if too long to fit inside svg
	    		s += "...";
	    	}
	    	return s;
	    })
	    .style("font-size", "12px")
	    .attr("x","15px")
	    .attr("y", function(d){
	    	return pos+=20;
	    })
	    .style("cursor", "pointer")
	    .on("mousedown", function(event, d){	// event passed as first argument to all listeners 
	    	if( event.ctrlKey){		// d3.event ⇨ (event) 
	    		if(firstClick){
	    			selectMultiple = false;
	    			legendButton(d, selectMultiple);
	    			firstClick = false;
	    		}else{
	    			selectMultiple = true;
	    			legendButton(d, selectMultiple);
	    		}
	    	}else{
				selectMultiple = false;
				legendButton(d, selectMultiple);
				firstClick = false;
			}
	    	
	    }); //callback function: legendButton()
}

var names = getIndividualDots(json);
function add_marker_names(data){
	d3.select("#providerNames")
		.selectAll(".marker_names")
		.data(data)
		.enter().append("option")
		.attr("class", "marker_names")
		.attr("value", function(d){
			return d;
		})
		.text(function(d){
	    	return d;
		})
		.style('font-size', '12px');
}

add_marker_names(names);



/**
 * variable creates life for data line (tracer)
 */
var line = d3.line()
	.x(function(d) {return xScale(x(d));})
	.y(function(d) {return yScale(y(d));})

//-------------------------Add different elements to DOM if specified in annotation file----------------------
if(annotations_data != null && !$.isEmptyObject(annotations_data.SpecificAnnotations)){
	var annotationShapes = svg.append("g")
		.attr("id", "annotationShapes");
	//Add line Annoations if they are sepcified in the annotation file
	var lineAnnotations = retrieveAnnotations("Line");
	if(lineAnnotations){
		var annotationLine = annotationShapes.selectAll(".line")
			.data(lineAnnotations.get('Line')) //values
			.enter().append("line")
			.attr("id", "annotationLine")
			.attr("class", "annotationShape")
			.attr('x1', function(d){
				// console.log("697 d.Properties.x1: ", d.Properties.x1);

				return xScale(d.Properties.x1);
			})
			.attr('y1', function(d){
				return yScale(d.Properties.y1);
			})
			.attr('x2', function(d){
				return xScale(d.Properties.x2);
			})
			.attr('y2', function(d){
				return yScale(d.Properties.y2);
			})
			.attr('stroke-width', function(d){
				return d.Properties.LineWidth + "px";
			})
			.attr('stroke', 'black')
			.style("cursor", "pointer")
			.on('mouseover', mouseoverAnnotation)
			.on('mouseout', function(event, d, i){
				tip.transition()
			        .style('display', 'none');
			});
	}
	//Add a rectangle if specified in the annotation file
	var rectAnnotations = retrieveAnnotations("Rectangle");
	if(rectAnnotations){
		annotationRect = annotationShapes.selectAll(".rect")
			.data(rectAnnotations.get('Rectangle'))
			.enter().append("rect")
			.attr("id", "annotationRect")
			.attr("class", "annotationShape")
			.attr('x', function(d){
				return xScale(d.Properties.x1);
			})
			.attr('y', function(d){
				return yScale(d.Properties.y1);
			})
			.attr('width', function(d){
				var x1 = xScale(d.Properties.x1);
				var x2 = xScale(d.Properties.x2);
				return x2 - x1;
			})
			.attr('height', function(d){
				var y1 = yScale(d.Properties.y1);
				var y2 = yScale(d.Properties.y2);
				return y2 - y1;
			})
			.attr('fill-opacity', 0)
			.attr('stroke-width', function(d){
				return d.Properties.LineWidth + "px";
			})
			.attr('stroke', 'black')
			.on('mouseover', mouseoverAnnotation)
			.on('mouseout', function(event, d, i){
				tip.transition()
			        .style('display', 'none');
			});
	}
	//Add a symbol if specified in the annotation file
	//Add circles from annotation file
	var symbolAnnotations = retrieveAnnotations("Symbol");
	if(symbolAnnotations){
		var circleAnnotations = retrieveByShape("Circle");
		if(circleAnnotations){
			annotationCircle = svg.append("g")
				.selectAll(".point")
				.data(circleAnnotations.get('Circle'))
				.enter().append("path")
				.attr("id", "annotationCircle")
				.attr("class", "point annotationShape")
				.attr("d", d3.symbol().type(d3.symbolCircle).size(function(d){
					return Math.pow(d.Properties.SymbolSize, 2);
				}))
				.attr("transform", function(d){ 
					return "translate(" + xScale(d.Properties.x) + "," + yScale(d.Properties.y) + ")";
				})
				.attr("stroke-width", "2px")
				.attr('stroke', 'black')
				.attr('fill-opacity', 0)
				.on('mouseover', mouseoverAnnotation)
				.on('mouseout', function(event, d, i){
					tip.transition()
				        .style('display', 'none');
				});
		}
		//Add Triangles from annotation file
		var triangleAnnotations = retrieveByShape("Triangle");
		if(triangleAnnotations){
			annotationTriangle = svg.append("g")
				.selectAll(".point")
				.data(triangleAnnotations.get('Triangle'))
				.enter().append("path")
				.attr("id", "annotationTriangle")
				.attr("class", "point annotationShape")
				.attr("d", d3.symbol().type(d3.symbolTriangle).size(function(d){
					return Math.pow(d.Properties.SymbolSize, 2);
				}))
				.attr("transform", function(d){ 
					return "translate(" + xScale(d.Properties.x) + "," + yScale(d.Properties.y) + ")";
				})
				.attr("stroke-width", "2px")
				.attr('stroke', 'black')
				.attr('fill-opacity', 0)
				.on('mouseover', mouseoverAnnotation)
				.on('mouseout', function(event, d, i){
					tip.transition()
				        .style('display', 'none');
				});
		}
		//Add Crosses from annotation file
		var crossAnnotations = retrieveByShape("Cross");
		if(crossAnnotations){
			var annotationCross = svg.append("g")
				.selectAll(".point")
				.data(crossAnnotations.get('Cross'))
				.enter().append("path")
				.attr("id", "annotationCross")
				.attr("class", "point annotationShape")
				.attr("d", d3.symbol().type(d3.symbolCross).size(function(d){
					return Math.pow(d.Properties.SymbolSize, 2);
				}))
				.attr("transform", function(d){ 
					return "translate(" + xScale(d.Properties.x) + "," + yScale(d.Properties.y) + ")rotate(45)";
				})
				.attr("stroke-width", "2px")
				.attr('stroke', 'black')
				.attr('fill-opacity', 0)
				.on('mouseover', mouseoverAnnotation)
				.on('mouseout', function(event, d, i){
					tip.transition()
				        .style('display', 'none');
				});
		}
		//Add Text from annotation file
		var textAnnotations = retrieveAnnotations("Text");
		if(textAnnotations){
			var annotationText = svg.append("g")
				.selectAll(".text")
				.data(textAnnotations.get('Text'))
				.enter().append("text")
				.attr("id", "annotationText")
				.attr("class", "annotationShape")
				.text(function(d){
					return d.Properties.Text;
				})
				.attr("text-anchor", "middle")
				.attr("x", function(d){
					return xScale(d.Properties.x);
				})
				.attr("y", function(d){
					return yScale(d.Properties.y) + 5;
				})
				.attr("font-size", function(d){
					return d.Properties.FontSize;
				})
				.on('mouseover', mouseoverAnnotation)
				.on('mouseout', function(event, d, i){
					tip.transition()
				        .style('display', 'none');
				})
				.attr("cursor", "default");
		}
	}
}
//Turn annotations off if specified 'Off' in Config file
if(properties.AnnotationShapes.toUpperCase() == "OFF"){
	if($("#annotationText").length){
		annotationText.attr("fill-opacity", 0).on("mouseover", null);
	}
	d3.selectAll(".annotationShape").attr("stroke-opacity", 0).on("mouseover", null);
	document.getElementById("annotationsButton").innerHTML = "Turn Annotations On";
}

//Add tracers to the dots on the visualization
var pathData = [];
var pathJSON = json.data;

var nested = nest(interpolatePath(demensions.dateMin), pathData);

var path;
function add_path(data){
	path = svg.append("g")
		.attr("id", "dataline")
		.selectAll(".path") 
		.data(data)
		.enter().append("path")
		.attr("class", function(d){
	
			return "tracer T" + convert_to_id(d[0].toUpperCase());	// d.key changed to d[0] 
		})
		.attr("fill","none")	// path elements by default are filled black, specify CSS fill 'none' to avoid this on tracer
		.attr("id", function(d){
			return "T" + convert_to_id(d[1][0].color);	//d.values chandes to d[1]
		})
		.style("stroke", function(d){
			console.log("tracing color: ", d[1][0].color);

			return colorScale(d[1][0].color);	//d.values chandes to d[1]
		})
		.style("stroke-width", "1.5px")
		.style("stroke-opacity", function(d){
			if(tracer){
				return .75;
			}else{
				return 0;
			}
		})
		.attr("d", function(d){
			return line(d[1]); //d[1] = values
		})
		.style("pointer-events", "none");
}

add_path(nested);

//Turn tracers off if specified 'Off' in Config file
if(!tracer){
	document.getElementById("tracerButton").innerHTML = "Turn Tracer On";
}

// var dot; // made global
function add_dots(data){
	var dot_g = svg.append("g")
	    .attr("id", "dots")
	dot  = dot_g.selectAll(".dot")
	    .data(interpolateData(demensions.dateMin))
	  .enter().append("circle")
	    .attr("class", function(d){
	    	return "dot D" + checkForSymbol(d.color); 
	    })
	    .attr("id", function(d, i){
	    	return "D" + convert_to_id(d.name);
	    })
	    .on("mouseover", mouseover) //mouseover callback function 
	    .on('mouseout', mouseout) //mouseout callback function
	    .on("mousedown", mousedown) //mousedown callback function
	    //color according to grouping variable
	    .on("contextmenu", function(event, d, i){
	    	if(properties.TimeseriesEnabled){
				event.preventDefault();		// d3.event ⇨ (event) 
		    	div	.style("opacity", 1);		
	            div	.html("<p style='margin:0px;'><a style='color:black; font-weight:bold;' href='./highchart.html?csv=" + expand_parameter_value(properties.FilePropertyName, {"Year": properties.DefaultDatasetChoice}) + "&name=" + d.name + "&nameVar=" + variables.Label +
	            	      "&xVar=" + variables.XAxis + "&yVar=" + variables.YAxis + "&size=" + variables.Sizing + "&datevariable=" + variables.Label + "', target='_blank'> Timeseries</a></p>")
	                .style("left", ( event.pageX) - 300 + "px")		// d3.event ⇨ (event) 
	                .style("top", ( event.pageY) - 65 +"px");		// d3.event ⇨ (event) 
	    	}
	    })
	    .style("fill", function(d) {return colorScale(color(d)); })
	    .attr("display", "true")
	    .call(position) //positon callback
	    //sets smaller dots on top
	    .sort(order) //order callback
	    .call(function(d){
	    	document.getElementById("loader").style.display = "none";
	    	d3.select("#contents").style("opacity", "1");
	    })
}

var data = interpolateData(demensions.dateMin);
add_dots(data);


//set default speed after all elements have been added
if(Properties.DefaultSpeed){
	setSpeed(properties.DefaultSpeed);
	document.getElementById("speedSlider").value = Properties.DefaultSpeed;
}



// wrapper function


// //---------------Various accessors that specify the four dimensions of data to visualize.-------------------
// /**
//  *Accessor function for x-variable
//  */
// function x(d) { return d.xVar; }
// /**
//  *Accessor function for y-variable
//  */
// function y(d) { return d.yVar; }
// /**
//  *Accessor function for size of dot
//  */
// function radius(d) { return d.size; }
// /**
//  *Accessor function for color of dot
//  */
// function color(d) {return d.color; }
// /**
//  *Accessor function for name of dot
//  */
// function key(d) { return d.name; }
// /**
//  *Accessor function for date
//  */
// function date(d){ return d.year; }

//--------------------------------------Callback functions for dots------------------------------------------
/**
 *Callback function: Called when user clicks on a dot </p>
 *Highlights selected dot with a yellow outline
 */
function mousedown(event, d, i){	// event passed as first argument to all listeners 
	if( event.button === 0){		// d3.event ⇨ (event) 
		if(d3.select(this).attr("display") == "true"){
			if(d3.select(this).attr("checked") == "true"){
				d3.select(this)
					.style('stroke', 'black')
			 		.attr('stroke-width', '1px')
			 		.attr('stroke-opacity', 1)
			 		.attr("checked", "false");
			}else{
				d3.select(this)
					.style('stroke', 'yellow')
			 		.attr('stroke-width', function(){
			 			if(d3.select(this).attr("display") == "true"){
			 				return 4;
			 			}else{
			 				return 0;
			 			}
			 		})
			 		.attr('stroke-opacity', .5)
			 		.attr("checked", "true");
		 	}
		}else{}
	}
	
}

/**
 *Callbcak Function: Called when user hovers over dot with the mouse </p>
 *Displays data information associated with dot on mouseover,
 *and creates a bold outline (stroke) around the selected dot
 */
function mouseover(event, d, i){
	//dot outline thicker on mouseover 	// bold outline currently only displaying after selection 

	if(d3.select(this).attr("display") == "true"){
		if(displayAll){
			d3.selectAll(".dot").style("fill-opacity", .75).attr("stroke-opacity", .5);
		}else{
			d3.selectAll(".dot" + dot_class_selector(d.color)).style("fill-opacity", .75).attr("stroke-opacity", .5);
		}
		
		d3.select(this)
			.style("fill-opacity", 1)
			.attr('stroke-opacity', function(){
				if(d3.select(this).attr("checked") != "true"){return 1;}
				else{return .5;}
			})
			.attr('stroke-width',function(){
				if(d3.select(this).attr("checked") != "true"){return 2;}
				else{return 5;}
			});
		d3.select(this).moveToFront();

		if(tracer){
			if(displayAll){
				d3.selectAll("path.tracer").style("stroke-opacity", .4);
			}else{
				d3.selectAll("path" + path_id_selector(d.color)).style("stroke-opacity", .4);
			}
			//display only the tracer that is being hovered over
			d3.select("path" + path_class_selector(d.name).toString().toUpperCase())
				.style("stroke-opacity", 1);
		}
	}

	// Get the parameters from the additional parameters file 
	// var parametersFromFile = parameters[key(d)];
	// Get the list of additional parameters to display in the table
	// var additionalParameters = properties.Datatable.AdditionalParameters;

	// The following are the default variables to be displayed in the datatable
	// which consiste of the name of the dot and the four variables this visualization 
	// displays.
	var tableContents = "<p><strong>" + variables.Label +  "</strong>: " + key(d) + "</p>" +
					"<p><strong>" + variables.Date + "</strong>: " + formatDate(getClosest(date(d))) + "</p>" +
					"<p><strong>" + variables.XAxis + "</strong>: " + d3.format(".2f")(d.xVarRaw.toFixed(2)) + "</p>" +
					"<p><strong>" + variables.YAxis + "</strong>: " + d3.format(".2f")(d.yVarRaw.toFixed(2)) + "</p>" +
					"<p><strong>" + variables.Sizing + "</strong>: " + d3.format(".2f")(d.sizeRaw.toFixed(2)) + "</p>" +
					"<p><strong>" + variables.Grouping + "</strong>: " + color(d) + "</p>";
	// If there are additional parameters to show then add the content to the tablediv
	// if(parametersFromFile){
	// 	if(additionalParameters && additionalParameters.length > 0){
	// 		tableContents += "<br> Additional Parameters:<br>------------------";
	// 	}
	// 	for(var i = 0; i < additionalParameters.length; i++){
	// 		tableContents += "<p><strong>" + additionalParameters[i] + "</strong>: " + parametersFromFile[additionalParameters[i]]	 + "</p>";
	// 	}
	// }
	if(properties.AdditionalData){
		var additionalParameters = additionalParametersDictionary[key(d)];
		var showColumns = properties.AdditionalData.ShowColumns;
		// If there are additional parameters to show then add the content to the tablediv
		if(additionalParameters) {
			tableContents += "<br> Additional Parameters:<br>------------------";
			for(var i = 0; i < showColumns.length; i++){
				tableContents += "<p><strong>" + showColumns[i] + "</strong>: " + additionalParameters[showColumns[i]] + "</p>";
			}
		}
	}

	//display information in data table if Config file specifies datatable
	tablediv.html( tableContents );
}

/**
*Callback Function: Called when user moves mouse away from a dot </p>
*Removes the bolded outline (stroke) around the dot
*/
function mouseout(event, d){
	//remove thick dot outline on mouseout	// removal of outline error proned due to it not being created

	if(d3.select(this).attr("display") == "true"){
		if(displayAll){
			d3.selectAll(".dot").style("fill-opacity", 1).attr("stroke-opacity", function(){
				if(d3.select(this).attr("checked") != "true"){return 1;}
				else{return .5;}
			});
		}else{
			d3.selectAll(".dot" + dot_class_selector(d.color)).style("fill-opacity",1).attr("stroke-opacity",function(){
				if(d3.select(this).attr("checked") != "true"){return 1;}
				else{return .5;}
			});
		}

		d3.select(this)
		  .attr('stroke-width',function(){
		  		if(d3.select(this).attr("checked") != "true"){return 1;}
				else{return 4;}
		  });

		if(tracer){
			if(displayAll){
				d3.selectAll("path.tracer").style("stroke-opacity", .75);
			}else{
				d3.selectAll("path" + path_id_selector(d.color)).style("stroke-opacity", .75);
			}
		}
	}
	d3.selectAll(".dot").sort(order);
}

/**
 *postitions the dots on the screen and sets the dots radius based off data for current year
 *
 *@param {object} dot - the svg element 'dot' that gets positioned
 */
function position(dot) {
	dot .attr("cx", function(d) {
			if(properties.XAxisScale.toUpperCase() == "LOG"){
				return xScale(checkMin(checkXValue(x(d)))); 
			}else{
				return xScale(checkXValue(x(d)));
			} 
		})
	    .attr("cy", function(d) { 
	    	if(properties.YAxisScale.toUpperCase() == "LOG"){
	    		return yScale(checkMin(checkYValue(y(d)))); 
	    	}else{
	    		return yScale(checkYValue(y(d)));
	    	}
	    })
	    .attr("r", function(d) { return minRadius(radiusScale(radius(d))); });
}

/**
 *Ensures smallest dots are above larger dots
 *
 *@param {object} a - the svg dot to check against
 *@param {object} b - the svg dot to check against
 */
// function order(a, b) {
// 	return radius(b) - radius(a);
// }

//-----------------------------------Other Callback Functions for various elements----------------------------------
/**
 *Callback Function: Called when clicking and dragging the year slider </p>
 *Pauses animation and calls display year to display data associated with selected date
 *
 *@param {number} year - date selected from year slider
 */ 
function draggedYear(date) {
	slider_tooltip.style("opacity", 0);
	date.setHours(0,0,0);
	stopAnimation();
	document.getElementById("pause").disabled = true;
	document.getElementById("play").disabled = false;
	if(date >= demensions.dateMin && date < demensions.maxPopulatedDate){
		displayYear(date);
		document.getElementById("forward").disabled = false;
		document.getElementById("back").disabled = false;
		document.getElementById("play").disabled = false;
	} 
	else if(date > demensions.maxPopulatedDate){
		displayYear(demensions.maxPopulatedDate);
		document.getElementById("forward").disabled = true;
		document.getElementById("play").disabled = true;
	} 
	else if(date < demensions.dateMin){
		displayYear(demensions.dateMin);
		document.getElementById("back").disabled = true;
	} 
}

// // /**
// //  *Callback Function: Called when user mouse's over an annotation shape on the canvas </p>
// //  *Displays a tooltip with the annotation information at mouseover event
// //  */
// window.mouseoverAnnotation = function(event, d){
	
// 	// console.log("d.annotation in mouseover annotation: ", d.Annotation);

// 	console.log("mouseoverAnnotations event : ", event);
// 	console.log("mouseoverAnnotations d : ", d);
// 	console.log("mouseoverAnnotations d.Annnotation  : ", d.Annotation);


// 	tip.transition().duration(0);
// 	tip.style('top', ( event.pageY - 20) + 'px')	// d3.event ⇨ (event) 
// 		.style('left', ( event.pageX + 13) + 'px')	// d3.event ⇨ (event) 
// 		.style('display', 'block')
// 		.html(d.Annotation);
// }

/**
 *Callback Function: Called when user mouse's over an annotation shape on the canvas </p>
 *Displays a tooltip with the annotation information at mouseover event
 */
// function mouseoverAnnotation(d){
// 	tip.transition().duration(0);
// 	tip.style('top', (d3.event.pageY - 20) + 'px')
// 		.style('left', (d3.event.pageX + 13) + 'px')
// 		.style('display', 'block')
// 		.html(d.Annotation);
// }

// //BUTTON CALLBACKS:
// /**
//  *Callback Function: Called when clicking on a selection (basin) on the legend </p>
//  *Displays only dots related to that specific label
//  */
// function legendButton(d, selectMultiple){
// 	console.log("LegendButton(), d: ", d);
// 	displayAll = false;
// 	var selectedGroup = d;
// 	console.log("SelectedGroup: ", selectedGroup);
// 	if(!selectMultiple){
// 		d3.selectAll("path.tracer").style("stroke-opacity", 0);
// 		d3.selectAll(".dot").style("fill-opacity", ".2").attr("stroke-width", "0").attr("display", "false");
// 		d3.selectAll("text").style("font-weight", "normal")
// 	}
// 	d3.selectAll("text" + dot_class_selector(d)).style("font-weight", "bold");
// 	setTimeout(function(){
// 		d3.selectAll(dot_class_selector(d)).style("fill-opacity", "1").attr("stroke-width", function(){
// 			if(d3.select(this).attr("checked") != "true"){
// 				return 1;
// 			}else{
// 				return 4;
// 			}
// 		}).attr("display", "true");
// 		if(tracer){
// 			d3.selectAll("path" + path_id_selector(d)).style("stroke-opacity", .75);
// 		}
// 	}, 100);
	
// }

/**
 *Callback Function: Called when clicking on Select All button </p>
 *Displays all dots
 */
// function selectAllButton(){
// 	displayAll = true;
// 	d3.selectAll(".dot").style("fill-opacity", "1").attr("stroke-width", function(){
// 		if(d3.select(this).attr("checked") != "true"){
// 			return 1;
// 		}else{
// 			return 4;
// 		}
// 	}).attr("display", "true");
// 	dot.sort(order);
// 	d3.selectAll("text").style("font-weight", "normal")
// 	if(tracer){
// 		d3.selectAll("path.tracer").style("stroke-opacity", .75);
// 	}
// 	firstClick = true;
// }

/**
 *Callback Function: Called when clicking Turn Tracer On/ Turn Tracer Off </p>
 *Either displays all tracers or turns them all off
 */
// function tracerButton(){
// 	var elem = document.getElementById("tracerButton");
// 	if(elem.innerHTML == "Turn Tracer On"){
// 		//turn on display for all tracers
// 		if(displayAll){
// 			d3.selectAll("path.tracer").style("stroke-opacity", .75);
// 		}else{
// 			d3.selectAll("path" + path_id_selector(selectedGroup)).style("stroke-opacity", .75);
// 		}
// 		tracer = true;
// 		//if(devTools) devTools.document.getElementById("tracer").innerHTML = "<strong>tracer:</strong> true";
// 		elem.innerHTML = "Turn Tracer Off";
// 	}else{
// 		//turn off display for tracers
// 		d3.selectAll("path.tracer").style("stroke-opacity", 0);
// 		tracer = false;
// 		//if(devTools) devTools.document.getElementById("tracer").innerHTML = "<strong>tracer:</strong> false";
// 		elem.innerHTML = "Turn Tracer On";
// 	}
// }

/**
 *Callback Function: Called when clicking Turn Annotations On/ Turn Annotations Off </p>
 *Either displays the annotation shapes on the canvas or hides them
 */
// function annotationsButton(){
// 	var elem = document.getElementById("annotationsButton");
// 	if(elem.innerHTML == "Turn Annotations On"){
// 		properties.AnnotationShapes.toUpperCase() == "ON";
// 		if($("annotationText").length){annotationText.attr("fill-opacity", 1).on("mouseover", mouseoverAnnotation);}
// 		d3.selectAll(".annotationShape").attr("stroke-opacity", 1).on("mouseover", mouseoverAnnotation);
// 		//if(devTools) devTools.document.getElementById("annotations").innerHTML = "<strong>annotations:</strong> true";
// 		elem.innerHTML = "Turn Annotations Off";
// 	}else{
// 		properties.AnnotationShapes.toUpperCase() == "OFF";
// 		if($("annotationText").length){annotationText.attr("fill-opacity", 0).on("mouseover", null);}
// 		d3.selectAll(".annotationShape").attr("stroke-opacity", 0).on("mouseover", null);
// 		//if(devTools) devTools.document.getElementById("annotations").innerHTML = "<strong>annotations:</strong> false";
// 		elem.innerHTML = "Turn Annotations On";
// 	}
// }

/**
 *Callback Function: Called when clicking on play button </p>
 *Starts the animation </p>
 *Disables play button </p>
 *Enables pause button 
 */
// function playButton(){
// 	playAnimation();
// 	document.getElementById("play").disabled = true;
// 	document.getElementById("pause").disabled = false;
// 	document.getElementById("back").disabled = false;
// }

/**
 *Callback Function: Called when clicking on pause button </p>
 *Pauses the animation </p>
 *Disables pause button </p>
 *Enables play button 
 */
// function pauseButton(){
// 	stopAnimation();
// 	document.getElementById("pause").disabled = true;
// 	document.getElementById("play").disabled = false;
// }

/**
 *Callback Function: Called when clicking on replay button </p>
 *Restarts the animation from Config.yearMin </p>
 *Disables play button </p>
 *Enables pause button 
 */
function replayButton(){
	stopAnimation();
	document.getElementById("play").disabled = true;
	document.getElementById("pause").disabled = false;
	document.getElementById("back").disabled = false;
	document.getElementById("forward").disabled = false;
	end = false;
	setTimeout(function(){
		replay()
	}, 100);
}

/**
 *Called inside replayButton() </p>
 *Called seperately to create a synchronous ordering of things,
 * this way the global variables are properly configured before starting the animation agian.
 */
// function replay(){
window.replay = function (){
	pathData = [];
	updatePath(nest(interpolatePath(demensions.dateMin), pathData));
	topYear = demensions.dateMin;
	currYear = demensions.dateMin;
	playAnimation();
}

/**
 *Callback Function: Called when clicking on back button </p>
 *Displays the animation one year/date back </p>
 *Disables pause button </p>
 *Enables play button
 */
// function backButton(){
// 	currYear = roundDate(currYear);
// 	decrementDate(currYear);
// 	document.getElementById("pause").disabled = true;
// 	document.getElementById("play").disabled = false;
// 	document.getElementById("forward").disabled = false;
// 	if(currYear >= demensions.dateMin){
// 		stopAnimation();
// 		setTimeout(function(){
// 			displayYear(currYear);
// 		}, 100);
// 	}else{
// 		displayYear(demensions.dateMin);
// 		document.getElementById("back").disabled = true;
// 	}
// }

/**
 *Callback Function: Called when clicking on the forward button </p>
 *Displays the animation one year/date forward </p>
 *Disables pause button </p>
 *Enables play button
 */
// function forwardButton(){
// 	document.getElementById("back").disabled = false;
// 	if(currYear <= demensions.maxPopulatedDate){
// 		incrementDate(currYear);
// 		document.getElementById("pause").disabled = true;
// 		document.getElementById("play").disabled = false;
// 		if(currYear <= demensions.maxPopulatedDate){
// 			stopAnimation();
// 			setTimeout(function(){
// 				displayYear(currYear);
// 			}, 100);
// 		}else{
// 			displayYear(demensions.maxPopulatedDate);
// 			console.log("here")
// 			document.getElementById("forward").disabled = true;
// 			document.getElementById("play").disabled = true;
// 		}
// 	}
// }

/**
 *Jquery event listener for when selecting a provider from the dropdown menu </p>
 *Highlights the selected provider with a yellow outline </p>
 *Utilizes [select2]{@link https://select2.github.io/} library
 */
$('select').on('select2:select', function(evt){
	console.log("dropdown menu event: ", evt);
	var provider = evt.params.data.text;
	d3.select(dot_id_selector(provider))
		.style('stroke', 'yellow')
 		.attr('stroke-width', function(){
 			if(d3.select(this).attr("display") == "true"){
 				return 4;
 			}else{
 				return 0;
 			}
 		})
 		.attr('stroke-opacity', .5)
 		.attr("checked", "true");
});

/**
 *Jquery event listener for when de-selecting a provider from the dropdown menu </p>
 *Removes the highlighted outline from the de-selected dot </p>
 *Utilizes [select2]{@link https://select2.github.io/} library
 */
$('select').on('select2:unselect', function(evt){
	var provider = evt.params.data.text;
	var checkedNames = $("#providerNames").val();
	var length = $("#providerNames").val().length;
	d3.select(dot_id_selector(provider))
		.style('stroke', null)
 		.attr('stroke-width', 1)
 		.attr('stroke-opacity', function(){
 			if(d3.select(this).attr("display") == "true"){
 				return 1;
 			}else{
 				return 0;
 			}
 		})
 		.attr("checked", "false");
})

//-------------------------------Functions for Running the animation from the visualization----------------------------------\
/**
 *Function which plays the animation starting from Config.currYear to Config.yearMax
 */
// function playAnimation(){ //made global
window.playAnimation = function(){
	//start transition
	var transitionFunction = svg.transition()
		.duration(getTimeInterpolate(currYear, demensions.maxPopulatedDate)) //call getTimeInterpolate to calculate amount of time between years transition
		.ease(d3.easeLinear)
		.tween("year", tweenYear) //tweenYear callback function
		.on("end", function(){
			var end = true;
			document.getElementById("forward").disabled = true;
			document.getElementById("play").disabled = true;
		});
}

/**
 *Resets the speed of the visualization when moving the speed slider
 *
 *@param {number} value - a value from speed slider from 0 - 100
 */
// function setSpeed(value){ //made global
window.setSpeed = function(value){

	//if(devTools) devTools.document.getElementById("speed").innerHTML = "<strong>speed:</strong> " + value + "%";
	var speedScale = d3.scaleLinear()
		.domain([100, 0])
		.range([10000, 100000]);
	
	var mill = speedScale(value);
	var len = timeScale.range()[1] - timeScale.range()[0];
	visSpeed = mill / len;
	if(document.getElementById("play").disabled == true){
		stopAnimation();
		playAnimation();
	}
}

/**
 *Function which pauses the animation
 */
// function stopAnimation(){
window.stopAnimation= function(date){

	transition = true;
	svg.transition() //pause transition
		.duration(0);
}

/**
 *Interpolates through years currYear - yearMax and calls display year on each year value
 */
function tweenYear() {
	var interpolateDate = d3.interpolateDate(currYear, demensions.maxPopulatedDate);
	return function(t) { 
		if(t == 1){
			transition = true;
		}
		displayYear(interpolateDate(t));
	};
}

/**
 *Displays animation for data of specified year
 * 
 *@param {number} year - year to display data for
 */
// function displayYear(date) {
window.displayYear= function(date){

	date.setHours(0,0,0); // This WILL prove to be an issue if dealing with hourly time.
	if(date <= demensions.maxPopulatedDate){
		//display annotations
		if(annotations_data){
			if(getAnnotations(inputFileFormat(date))){
				var d = getAnnotations(inputFileFormat(date));
				annotations.html(
					"<p class='datatable' style='text-decoration:underline;'><strong> Annotations </strong></p>" +
					"<p class='datatable' style='font-weight:bold;'> Date: " + inputFileFormat(date) + "</p>" + 
					"<p class='datatable' style='font-weight:bold; display:inline;'>" + d.Title + ": " +
					"<p class='datatable'style='display:inline;'>" + d.Description + "</p>"
				)
			}
		}
		dot.data(interpolateData(date), key).call(position)
		if(displayAll == true){
			dot.sort(order);
		}
	    handle.attr("transform", "translate(" + (timeScale(getClosest(date)) + ",0)"));
	    handle.select('text').text(Math.round(date));
	    var handleFormat = formatHandleText();
	    handleText.text(handleFormat(getClosest(date))).attr("transform", "translate(0" + (timeScale(getClosest(date)) + ", -7)"));
	    d3.select("#currentDateDiv").selectAll("text").text(formatDate(roundDate(date)));
	    if(date >= topYear){
	    	updatePath(nest(interpolatePath(date), pathData));
	    }
	   	if(date > topYear){
	   		topYear = date;
	   	}
	    currYear = new Date(date);
	}else{
		stopAnimation();
	}
    //if(devTools) devTools.document.getElementById("currdate").innerHTML = "<strong>date:</strong> " + date;
}

/**
 *Returns an object containing one interpolated data point for the current year
 *
 *@param {number} year - current year to get data for
 */
function interpolatePath(year) {
    return pathJSON.map(function(d) {
      //document.write(d[var3]);
      var x = checkXValue(interpolateValues(d[variables.XAxis], year));
      var y = checkYValue(interpolateValues(d[variables.YAxis], year));
      if(properties.XAxisScale.toUpperCase() == "LOG") x = checkMin(x);
      if(properties.YAxisScale.toUpperCase() == "LOG") y = checkMin(y);

      return { 
        //X-Axis
        xVar: x,
        //Y-Axis
        yVar: y,
        //Size of Dot
        size: interpolateValues(d[variables.Sizing], year),
        //Color of Dot
        color: d[variables.Grouping],
        //Name
        name: d[variables.Label],
        //year
        year: year
      };
    });
}

/**
 *Update all path data with new information
 *
 *@param {array} newData - an array of updated data
 */
// function updatePath(newData){
window.updatePath= function(newData){
	
	d3.select("#dataline").selectAll("path")
		.data(newData) //update path with newData
		.attr("d", function(d){
			return line(d[1]); // d[1] equivalent to d.values
		});
}

// Interpolates the dataset for the given (fractional) year.
/**
 *Returns an object containing one interpolated data point for the current year
 *
 *@param {number} year - current year to get data for
 */
function interpolateData(date) {

	
    return json.data.map(function(d) {
      return {
        //X-Axis
        xVar: interpolateValues(d[variables.XAxis], date),
        //Y-Axis
        yVar: interpolateValues(d[variables.YAxis], date),
        //Size of Dot
        size: interpolateValues(d[variables.Sizing], date),
        //original data, uninterpolated
        xVarRaw: interpolateValues(d[variables.XAxis], getClosest(date)),
        yVarRaw: interpolateValues(d[variables.YAxis], getClosest(date)),
        sizeRaw: interpolateValues(d[variables.Sizing], getClosest(date)),
        //Color of Dot
        color: d[variables.Grouping],
        //Name
        name: d[variables.Label],
        //year
        year: date
      };
    });
}

/**
 *Returns an interpolated value for the current year
 *
 *@param {array} values - an array of [year, data] pairs
 *@param {number} year - current year for which the interpolated data point corresponds to
 */
function interpolateValues(values, year) {
    var i = bisect.left(values, year, 0, values.length - 1),
        a = values[i];

    if (i > 0) {
      var b = values[i - 1],
          t = (year - a[0]) / (b[0] - a[0]);
      return a[1] * (1 - t) + b[1] * t;
    }
    return a[1];
}

//-----------------------------Helper Functions used throughout this javascript file-------------------------------
/**
 *Returns an array of dates according to precision units specified in Config file
 */
function dateArray_function(demensions){
	
	// console.log("dvar: ", dvar);

	var Date1 = new Date(demensions.dateMin);
	var Date2 = new Date(demensions.dateMax);
	var returnThis = [];
	while(Date1 <= Date2){
		var tempDate = new Date(Date1);
		returnThis.push(tempDate);
		incrementDate(Date1);
	}
	return returnThis;
}

/**
 *Parses all numbers from a string. \n
 *Meant to retreive the precision units from precision string
 *
 *@param {string} String - the string containing precision configuration.
 */
function parsePrecisionInt(String){
	return parseInt(String.match(/\d+/g));
}

/**
 *Parses all letters from a string. \n
 *Meant to retrieve the precision string from the precision string including numbers.
 *
 *@param {string} String - the string containing precision configuration.
 */
function parsePrecisionUnits(String){
	return String.match(/[a-zA-Z]+/g)[0];
}

/**
 *Returns a time format that is in relation to the precision units specified in the Config file
 */
function formatHandleText(){
	var format;
	switch(precisionUnit){
		case "Year":
			format = d3.timeFormat("%Y");
			return format;
			break;
		case "Month":
			format = d3.timeFormat("%B-%Y");
			return format;
			break;
		case "Day":
			format = d3.timeFormat("%B-%d");
			return format;
			break;
		case "Hour":
			format = d3.timeFormat("%H:%M");
			return format;
			break;
		case "Minute":
			format = d3.timeFormat("%H:%M");
			return format;
			break;
		case "Second":
			format = d3.timeFormat("%H:%M:%S");
			return format;
			break;
		default:
			break;
	}
}

function checkXValue(val){
	if(properties.XMax){
		if(val > properties.XMax){
			val = properties.XMax;
		}
	}
	if(properties.XMin){
		if(val < properties.XMin){
			val = properties.XMin;
		}
	}
	return val;
}

function checkYValue(val){
	if(properties.YMax){
		if(val > properties.YMax){
			val = properties.YMax;
		}
	}
	if(properties.YMin){
		if(val < properties.YMin){
			val = properties.YMin;
		}
	}
	return val;
}

/**
 *Calculate maximum number of ticks which will fit on the y-axis
 *
 *@param {number} areaDim - height of area for y-axis
 *@param {number} labelDim - height of largest label on y-axis
 */
function getMaxYTicks(areaDim, labelDim){
	var maxTicks = (areaDim)/(labelDim + 18);
	maxTicks = d3.format(".0f")(maxTicks);
	return parseInt(maxTicks);
}

/**Calculate maximum number of ticks which will fit on the x-axis
 *
 *@param {number} areaDim - width of area for x-axis
 *@param {number} labelDim - width of largest label on x-axis
 */
function getMaxXTicks(areaDim, labelDim){
	var maxTicks = (areaDim - 120)/(labelDim + 25);
	maxTicks = d3.format(".0f")(maxTicks);
	return parseInt(maxTicks);
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
 *Calculates maximum number of ticks that can fit on a log axis
 *
 *@param {number} areaDim - area for the given axis
 */
function logTicks(areaDim){
	if(areaDim < 650){
		if(areaDim < 350){
			if(areaDim < 150){
				return 2;
			}else{
				return 3;
			}
		}else{
			return 6;
		}
	}else{
		return 6;
	}
}

/**
 *Returns an array of names according to the grouping variable specified in Config file
 *
 *@param {object} json - json object with data 
 */
function getGroupingNames(json){

	var array = [];
	// --d3.nest Depricated--
	// var nested =  d3.nest()
	// 	.key(function(d){return d[variables.Grouping];})
	// 	.entries(json.data);

	var group = d3.group(json.data, function(d){return d[variables.Grouping];})
	// var rollup = d3.rollup(json.data, v => v.length, function(d){return d[variables.Grouping];}); // another replacement for d3.nest 

	var mapIter = group.keys();
	
	for(var i = 0; i < group.size; i++){
		array.push(mapIter.next().value);
	}

	return array.sort(naturalSort);
}

/*
 * Natural Sort algorithm for Javascript - Version 0.8.1 - Released under MIT license
 * Author: Jim Palmer (based on chunking idea from Dave Koelle)
 */
function naturalSort (a, b) {
    var re = /(^([+\-]?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?(?=\D|\s|$))|^0x[\da-fA-F]+$|\d+)/g,
        sre = /^\s+|\s+$/g,   // trim pre-post whitespace
        snre = /\s+/g,        // normalize all whitespace to single ' ' character
        dre = /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[\/\-]\d{1,4}[\/\-]\d{1,4}|^\w+, \w+ \d+, \d{4})/,
        hre = /^0x[0-9a-f]+$/i,
        ore = /^0/,
        i = function(s) {
            return (naturalSort.insensitive && ('' + s).toLowerCase() || '' + s).replace(sre, '');
        },
        // convert all to strings strip whitespace
        x = i(a),
        y = i(b),
        // chunk/tokenize
        xN = x.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
        yN = y.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
        // numeric, hex or date detection
        xD = parseInt(x.match(hre), 16) || (xN.length !== 1 && Date.parse(x)),
        yD = parseInt(y.match(hre), 16) || xD && y.match(dre) && Date.parse(y) || null,
        normChunk = function(s, l) {
            // normalize spaces; find floats not starting with '0', string or 0 if not defined (Clint Priest)
            return (!s.match(ore) || l == 1) && parseFloat(s) || s.replace(snre, ' ').replace(sre, '') || 0;
        },
        oFxNcL, oFyNcL;
    // first try and sort Hex codes or Dates
    if (yD) {
        if (xD < yD) { return -1; }
        else if (xD > yD) { return 1; }
    }
    // natural sorting through split numeric strings and default strings
    for(var cLoc = 0, xNl = xN.length, yNl = yN.length, numS = Math.max(xNl, yNl); cLoc < numS; cLoc++) {
        oFxNcL = normChunk(xN[cLoc] || '', xNl);
        oFyNcL = normChunk(yN[cLoc] || '', yNl);
        // handle numeric vs string comparison - number < string - (Kyle Adams)
        if (isNaN(oFxNcL) !== isNaN(oFyNcL)) {
            return isNaN(oFxNcL) ? 1 : -1;
        }
        // if unicode use locale comparison
        if (/[^\x00-\x80]/.test(oFxNcL + oFyNcL) && oFxNcL.localeCompare) {
            var comp = oFxNcL.localeCompare(oFyNcL);
            return comp / Math.abs(comp);
        }
        if (oFxNcL < oFyNcL) { return -1; }
        else if (oFxNcL > oFyNcL) { return 1; }
    }
}

/**
 *Return an array of the data for tracer paths
 *
 */
function specificPathData(data){
	returnThis = [];
	for(i = 0; i < tracerNames.length; i++){
		for(j = 0; j < data.length; j++){
			if(tracerNames[i] == data[j][name]){
				returnThis.push(data[j]);
				break;
			}
		}
	}
	return returnThis;
}

/**
 *Seperates annotations file into different shape types </p>
 *Returns an object of annotations given shape type or false if no annotations exist for 
 *the given parameter
 *
 *@param {String} shape - string specifying which shape data you want returned example: (line, rect, symbol, text)
 */
function retrieveAnnotations(shape){

	var returnThis;
	// var nested = d3.nest()
	// 	.key(function(d){return d.ShapeType;})
	// 	.entries(annotations_data.SpecificAnnotations);

	// group this data with this key 
	var group = d3.group(annotations_data.SpecificAnnotations, function(d){return d.ShapeType;})
	
	group.forEach(function(values, key, map){
		if(key == shape){
			returnThis = map;
		}
	})
	if(returnThis){
		return returnThis;
	}else{
		return false;
	}
}

/**
 *Acts in the same way as retrieveAnnotations() but it returns an 
 *object containing the data of the specified shape from the annotation shape type 'symbol'
 *
 *@param {String} shape - string specifiying whihc shape data you want returned example: (circle, triangle, cross)
 */
function retrieveByShape(shape){
	var returnThis;
	data = retrieveAnnotations("Symbol");

	// var nested = d3.nest()
	// 	.key(function(d){return d.Properties.SymbolStyle;})
	// 	.entries(data.values);

	var group =  d3.group(data.get('Symbol'), function(d){return d.Properties.SymbolStyle;});

	group.forEach(function(values, key, map){
		
		if(key == shape){
			returnThis = map;
		}
	})
	if(returnThis){
		return returnThis;
	}else{
		return false;
	}
}

// /**
//  *Adds data to the array and then nests that data by name </p>
//  *[d3.js nest]{@link https://github.com/d3/d3-3.x-api-reference/blob/master/Arrays.md#nest}
//  *
//  *@param {object} data - an object containing the data
//  *@param {array} array - an array containing data
//  */
// function nest(data, array){
// 	for(var i = 0; i < data.length; i++){
// 		array.push(data[i]);
// 	}
// 	var nested = d3.nest()
// 		.key(function(d){return d.name;})
// 		.entries(array);
// 	return nested;
// }

/**
 *Returns an array of names for each dot on the visualization
 *
 *@param {object} json - json object with data
 */
function getIndividualDots(json){
	var array = [];

	// Depricated
	// var nested = d3.nest()
	// 	.key(function(d){return d[variables.Label];})
	// 	.entries(json.data);

	var group = d3.group(json.data, function(d){return d[variables.Label];});

	var mapIter = group.keys();

	for(var i=0; i < group.size; i++){
		array.push(mapIter.next().value);
	}

	return array.sort();
}


/**
 *Returns a minimum value for the radius of dots (3.0px)
 *
 *@param {number} value - number to check minimum on
 */
// function minRadius(value){
// 	return value < 3.0 ? 3.0 : value;
// }

/**
 * Return the additional parameters, if any, provided from the additional parameter data file.
 * 
 */
function getAdditionalParameters() {
	var additionalDataConfigurations = properties.AdditionalData,
		additionalDataFile = additionalDataConfigurations.AdditionalDataFile,
		displayColumns = additionalDataConfigurations.DisplayColumns,
		joinColumns = additionalDataConfigurations.JoinColumns;
	var additionalParametersJoinColumn = joinColumns.AdditionalParametersJoinColumn,
		dataJoinColumn = joinColumns.DataJoinColumn;
	var variableLabel = "";
	// Find out which 'variables' key matches the data join key
	$.each(variables, (k, v) => {
		if(v == dataJoinColumn){
			variableLabel = k;
		}
	})
	var parameters = new Parameters(additionalDataFile, variableLabel);
	parameters = parameters.json;
	return parameters;
}

/**
 *Checks to see if annotations exist for current time frame, if so return them
 *
 *@param {number} year
 */
function getAnnotations(year){
	if(annotations_data.GeneralAnnotations[year] != "undefined"){
		return annotations_data.GeneralAnnotations[year];
	}else{
		return null;
	}
}

/**
 *Parses through dateArray to return value closest to date.
 *
 *@param {object} date - date object which we want the closest date to.
 */
function getClosest(date) {
    var close;
    var distance;
    for (var i = 0; i < dateArray.length; i++) {
        if(timeDiff(date, dateArray[i]) < distance || distance === undefined){
        	distance = timeDiff(date, dateArray[i]);
        	close = dateArray[i];
        }
    };
    return close;
}

/**
 *Calculates total time that should elapse between two time points, set at 1.33 seconds between each year
 *
 *@param {number} start - the starting year
 *@param {number} end - the ending year
 */
function getTimeInterpolate(startDate, endDate){
	var distance = timeScale(endDate) - timeScale(startDate);
	return distance * visSpeed;
}

/**
 *Returns an integer representing the difference between two dates
 *
 *@param {object} date1 - a date object
 *@param {object} date2 - a date object
 */
function timeDiff(date1, date2){
	return Math.abs(date2.getTime() - date1.getTime());
}

// /**
//  *Depending on precision units from Config file, incremments the date 
//  */
// function incrementDate(date){
// 	switch(precisionUnit){
// 		case "Year":
// 			date.setFullYear(date.getFullYear() + precisionInt);
// 			break;
// 		case "Month":
// 			date.setMonth(date.getMonth() + precisionInt);
// 			break;
// 		case "Day":
// 			date.setDate(date.getDate() + precisionInt);
// 			break;
// 		case "Hour":
// 			date.setHours(date.getHours() + precisionInt);
// 			break;
// 		case "Minute":
// 			date.setMinutes(date.getMinutes() + precisionInt);
// 			break;
// 		case "Second":
// 			date.setSeconds(date.getSeconds() + precisionInt);
// 			break;
// 		default:
// 			break;
// 	}
// }

/**
 *Depending on precision units from Config file, decrements the date
 */
// function decrementDate(date){
window.decrementDate = function(date){

	switch(precisionUnit){
		case "Year":
			date.setFullYear(date.getFullYear() - precisionInt);
			break;
		case "Month":
			date.setMonth(date.getMonth() - precisionInt);
			break;
		case "Day":
			date.setDate(date.getDate() - precisionInt);
			break;
		case "Hour":
			date.setHours(date.getHours() - precisionInt);
			break;
		case "Minute":
			date.setMinutes(date.getMinutes() - precisionInt);
			break;
		case "Second":
			date.setSeconds(date.getSeconds() - precisionInt);
			break;
		default:
			break;
	}
}

// function roundDate(date){
window.roundDate = function(date){

	switch(precisionUnit){
		case "Year":
			var returnThis = new Date(date);
			var currMonth = date.getMonth();
			returnThis.setMonth(0);
			returnThis.setDate(1);
			returnThis.setHours(0);
			returnThis.setMinutes(0);
			returnThis.setSeconds(0);
			if(currMonth > 5){
				returnThis.setFullYear(date.getFullYear() + 1);
			}
			return returnThis;
			break;
		case "Month":
			currDay = date.getDate();
			date.setDate(1);
			date.setHours(0);
			date.setMinutes(0);
			date.setSeconds(0);
			if(currDay > 15){
				date.setMonth(date.getMonth() + 1);
			}
			return date;
			break;
		case "Day":
			currHour = date.getHours();
			date.setHours(0);
			date.setMinutes(0);
			date.setSeconds(0);
			if(currHour > 12){
				date.setDate(date.getDate() + 1);
			}
			return date;
			break;
		case "Hour":
			currMinute = date.getMinutes();
			date.setMinutes(0);
			date.setSeconds(0);
			if(currMinute > 30){
				date.setHours(date.getHours() + 1);
			}
			return date;
			break;
		case "Minute":
			currSecond = date.getSeconds();
			date.setSeconds(0);
			if(currSecond > 30){
				date.setMinutes(date.getMinutes() + 1);
			}
			return date;
			break;
		//NOT READY TO ROUND FOR SECONDS OR MILLISECONDS. CAN BE ADDED IF NECESSARY
		default:
			break;
	}
}
// //----------------------------Helper Functions that minipulate strings for d3.select() purposes-------------------------
// /**
//  *Removes symbols form string, returns the string with no symbols
//  *
//  *@param {string} string - a string
//  */
// function checkForSymbol(string){
// 	return string.replace(/[^A-Za-z0-9]/g, '');
// }  

// /**
//  *Converts the string into a selector name </p>
//  *ex: 'Denver Water' -> '.Denver.Water'
//  */
// function class_selector(inputString){
// 	var string = inputString.split(" ");
// 	var returnThis = ".";
// 	for(i = 0; i < string.length - 1; i++){
// 		if(checkForSymbol(string[i]) != ""){
// 			returnThis = returnThis + string[i].replace(/[^A-Za-z0-9]/g, '')// + ".";
// 		}
// 	}
// 	returnThis = returnThis + string[string.length-1].replace(/[^A-Za-z0-9]/g, '');
// 	return returnThis.toString();
// }

// /**
//  *Converts the string into a selector name </p>
//  *ex: 'Denver Water' -> '.Denver.Water'
//  */
// function convert_to_id(inputString){
// 	var string = inputString.split(" ");
// 	var returnThis = "";
// 	for(var i = 0; i < string.length - 1; i++){
// 		if(checkForSymbol(string[i]) != ""){
// 			returnThis = returnThis + string[i].replace(/[^A-Za-z0-9]/g, '') + "";
// 		}
// 	}
// 	returnThis = returnThis + string[string.length-1].replace(/[^A-Za-z0-9]/g, '');
// 	return returnThis;
// }

// /**
//  *Converts the string into an id selector name </p>
//  *ex: 'Denver Water' -> '.Denver.Water'
//  */
// function dot_id_selector(inputString){
// 	var string = inputString.split(" ");
// 	var returnThis = "#D";
// 	for(i = 0; i < string.length - 1; i++){
// 		if(checkForSymbol(string[i]) != ""){
// 			returnThis = returnThis + string[i].replace(/[^A-Za-z0-9]/g, '') + "";
// 		}
// 	}
// 	returnThis = returnThis + string[string.length-1].replace(/[^A-Za-z0-9]/g, '');
// 	return returnThis.toString();
// }

// /**
//  *Converts the string into a selector name </p>
//  *ex: 'Denver Water' -> '.Denver.Water'
//  */
// function dot_class_selector(inputString){
// 	var string = inputString.split(" ");
// 	var returnThis = ".D";
// 	for(i = 0; i < string.length - 1; i++){
// 		if(checkForSymbol(string[i]) != ""){
// 			returnThis = returnThis + string[i].replace(/[^A-Za-z0-9]/g, '')// + ".";
// 		}
// 	}
// 	returnThis = returnThis + string[string.length-1].replace(/[^A-Za-z0-9]/g, '');
// 	return returnThis.toString();
// }

// /**
//  *Converts the string into a selector name </p>
//  *ex: 'Denver Water' -> '.Denver.Water'
//  */
// function path_class_selector(inputString){
// 	var string = inputString.split(" ");
// 	var returnThis = ".T";
// 	for(i = 0; i < string.length - 1; i++){
// 		if(checkForSymbol(string[i]) != ""){
// 			returnThis = returnThis + string[i]//.replace(/[^A-Za-z0-9]/g, '') + ".";
// 		}
// 	}
// 	returnThis = returnThis + string[string.length-1].replace(/[^A-Za-z0-9]/g, '');
// 	return returnThis.toString();
// }

// /**
//  *Converts the string into an id selector name </p>
//  *ex: 'Denver Water' -> '.Denver.Water'
//  */
// function path_id_selector(inputString){
// 	var string = inputString.split(" ");
// 	var returnThis = "#T";
// 	for(i = 0; i < string.length - 1; i++){
// 		if(checkForSymbol(string[i]) != ""){
// 			returnThis = returnThis + string[i].replace(/[^A-Za-z0-9]/g, '') + "";
// 		}
// 	}
// 	returnThis = returnThis + string[string.length-1].replace(/[^A-Za-z0-9]/g, '');
// 	return returnThis.toString();
// }

//-----------------------Helper functions that move elements forward or back in the svg canvas-------------------------
/*
 *Moves selected elements to front of SVG canvas
 */
d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

//--------------------------------------------------Resize------------------------------------------------------------
//upate Table if windows is resized
//in ./javascript/resize.js
// d3.select(window).on('resize', function(){
// 	if(gapminderSelected){
// 		resize();
// 	}
// });

window.onunload = function(){
	devTools.close();
};

/**
 *Resizes the chart elements when window is resized
 */
function resize() {
    let height = $("#Gapminder").parent().height() - 270;
	let width = $(".box").width();

	console.log("width: ", width);
	console.log("height: ", height);


	d3.select("svg.box").attr("height", height);

	xScale.range([yTextBox.width + margin.left + 15, (width-25)]);
	yScale.range([height - 40, 0]);

	if(properties.XAxisScale.toUpperCase() == "LOG"){
		xAxis.scale(xScale)
			.ticks(6, d3.format(",d"))
			.tickSizeInner(-height)
	}else{
		xAxis.scale(xScale)
			.ticks(getMaxXTicks(width, xTextBox.width) - 1)
			.tickFormat(d3.format(","))
			.tickSizeInner(-height)
	}

	if(properties.YAxisScale.toUpperCase() == "LOG"){
		yAxis.scale(yScale)
			.ticks(6, d3.format(",d"))
			.tickSizeInner(-(width - margin.right) + 30);
	}else{
		yAxis.scale(yScale)
			.ticks(getMaxYTicks(height, yTextBox.height))
			.tickSizeInner(-(width - margin.right) + 30);
	}

	xaxis.call(xAxis).attr("transform", "translate(0," + (height - 40) + ")");
   	yaxis.call(yAxis).attr("transform", "translate(" + (yTextBox.width + margin.left + 15)  + ",0)");

    xlabel.attr("x", (width/2)).attr("y", height - 5);

    ylabel.attr("y", 0).attr("x", -((height - 100)/2));

    //update dot
	dot.call(position);

	//update line paths (tracers) for dots
	if(tracer){
		line.x(function(d) {return xScale(x(d));}).y(function(d) {return yScale(y(d));})	
		path.attr("d", function(d){
			return line(d[1]); // data value accessed using d[1]
		});
	}

	if($("#annotationLine").length){
		annotationLine
			.attr('x1', function(d){
				return xScale(d.Properties.x1);
			})
			.attr('y1', function(d){
				return yScale(d.Properties.y1);
			})
			.attr('x2', function(d){
				return xScale(d.Properties.x2);
			})
			.attr('y2', function(d){
				return yScale(d.Properties.y2);
			})
	}

	if($("#annotationRect").length){
		annotationRect
			.attr('x', function(d){
				return xScale(d.Properties.x1);
			})
			.attr('y', function(d){
				return yScale(d.Properties.y1);
			})
			.attr('width', function(d){
				var x1 = xScale(d.Properties.x1);
				var x2 = xScale(d.Properties.x2);
				return x2 - x1;
			})
			.attr('height', function(d){
				var y1 = yScale(d.Properties.y1);
				var y2 = yScale(d.Properties.y2);
				return y2 - y1;
			})
	}

	if($("#annotationCircle").length){
		annotationCircle
			.attr("transform", function(d){ 
				return "translate(" + xScale(d.Properties.x) + "," + yScale(d.Properties.y) + ")";
			})
	}
	if($("#annotationTriangle").length){
		annotationTriangle
			.attr("transform", function(d){ 
				return "translate(" + xScale(d.Properties.x) + "," + yScale(d.Properties.y) + ")";
			})
	}
	if($("#annotationCross").length){
		annotationCross
			.attr("transform", function(d){ 
				return "translate(" + xScale(d.Properties.x) + "," + yScale(d.Properties.y) + ")rotate(45)";
			})
	}
	if($("#annotationText").length){
		annotationText
			.attr("x", function(d){
				return xScale(d.Properties.x);
			})
			.attr("y", function(d){
				return yScale(d.Properties.y) + 5;
			})
	}

	d3.select("#legend").style("height", function(){
			if(legendHeight < ((height/2) - 30)){
				return legendHeight + "px";
			}else{
				return (height/2) - 30 + "px";
			}
		});
	d3.select("#sideTools").style("height", (height/2) + "px");

	timeScale.range([0, (width - 75)]);

	d3.select(".track").attr("x1", timeScale.range()[0]).attr("x2", timeScale.range()[1]);
	d3.select(".track-inset").attr("x1", timeScale.range()[0]).attr("x2", timeScale.range()[1]);
	d3.select(".track-overlay").attr("x1", timeScale.range()[0]).attr("x2", timeScale.range()[1]);
	handle.attr("transform", "translate(" + (timeScale(getClosest(currYear)) + ",0)"));
	handleText.attr("transform", "translate(" + (timeScale(getClosest(currYear)) + ",-7)"));
	var slidertext = g.selectAll("text").data(timeScale.ticks(getMaxXTicks(width, dateText.width)));
	slidertext.exit().remove();
	slidertext.enter().append("text");
	slidertext
		.attr("x", function(d){
			return timeScale(d);
		})
		.attr("text-anchor", "middle")
		.text(function(d){return formatDate(d); });
}

//-------------------------------------TEST FUNCTION----------------------------------//
function selectYear(date){
	document.getElementById("loader").style.display = "block";
    d3.select("#contents").style("opacity", "0");

    d3.timeout(function(){
    	updateGapminder(date);
    }, 50);
}

function updateGapminder(date){
	properties.DefaultDatasetChoice = date;

	$("#headers").empty();
	$("#contentArea").empty();
	d3.select("#contentArea")
		.append("tr")
		.attr("class", "clusterize-no-data")
		.append("td")
		.text("Loading data...");

	$("#DatasetChoices").html(date +  " <span class='caret'></span>");

	data = new Data(properties);
	json = data.json;
	demensions = data.demensions;

	currYear = demensions.dateMin;
	topYear = demensions.dateMin;

	//update timeSlider
	//create a timescale for year slider
	timeScale.domain([demensions.dateMin, demensions.dateMax]);
	dateArray = dateArray_function();
	//if the last data in the array isn't the last possible date add the last date to the end of the array
	if(dateArray[dateArray.length - 1].getTime() != demensions.dateMax.getTime()){
		dateArray.push(demensions.dateMax);
	}
	dateLabel
		.text(formatDate(timeScale.ticks()[0]));

	//sliderText();
	var slidertext = g.selectAll("text").data(timeScale.ticks(getMaxXTicks(width, dateText.width)));
	slidertext.exit().remove();
	slidertext.enter().append("text");
	slidertext
		.attr("x", function(d){
			return timeScale(d);
		})
		.attr("text-anchor", "middle")
		.text(function(d){return formatDate(d); });


	handleText.attr("transform", "translate(" + (timeScale(getClosest(currYear)) + ",-7)"));
	//UPDATE LEGEND:
	$("#legend").empty();
	legendData = getGroupingNames(json);
	add_legend(legendData);

	//UPDATE SELECTION BAR:
	$("#providerNames").empty();
	names = getIndividualDots(json);
	add_marker_names(names);

	//UPDATE PATH:
	pathData = [];
	if(properties.TracerNames != "*" && properties.TracerNames != ""){
		pathJSON = specificPathData(json.data);
	}else{
		pathJSON = json.data;
	}
	nested = nest(interpolatePath(demensions.dateMin), pathData);
	add_path(nested); // path is missing???

	pauseButton();
	displayYear(demensions.dateMin);
	/*pathData = [];
	updatePath(interpolatePath(demensions.dateMin), pathData);*/

	if(!tracer){
		document.getElementById("tracerButton").innerHTML = "Turn Tracer On";
	}

	d3.selectAll(".dot").remove();
	var data = interpolateData(demensions.dateMin);
	add_dots();
}

// /**
//  *Callback Function: Called when clicking Turn Annotations On/ Turn Annotations Off </p>
//  *Either displays the annotation shapes on the canvas or hides them
//  */
// function annotationsButton(){
// 	var elem = document.getElementById("annotationsButton");
// 	if(elem.innerHTML == "Turn Annotations On"){
// 		properties.AnnotationShapes.toUpperCase() == "ON";
// 		if($("annotationText").length){annotationText.attr("fill-opacity", 1).on("mouseover", mouseoverAnnotation);}
// 		d3.selectAll(".annotationShape").attr("stroke-opacity", 1).on("mouseover", mouseoverAnnotation);
// 		//if(devTools) devTools.document.getElementById("annotations").innerHTML = "<strong>annotations:</strong> true";
// 		elem.innerHTML = "Turn Annotations Off";
// 	}else{
// 		properties.AnnotationShapes.toUpperCase() == "OFF";
// 		if($("annotationText").length){annotationText.attr("fill-opacity", 0).on("mouseover", null);}
// 		d3.selectAll(".annotationShape").attr("stroke-opacity", 0).on("mouseover", null);
// 		//if(devTools) devTools.document.getElementById("annotations").innerHTML = "<strong>annotations:</strong> false";
// 		elem.innerHTML = "Turn Annotations On";
// 	}
// }

// end wrapper function
}


/**
 *Callback Function: Called when clicking on Select All button </p>
 *Displays all dots
 */
export function selectAllButton(){

	displayAll = true;
	d3.selectAll(".dot").style("fill-opacity", "1").attr("stroke-width", function(){
		if(d3.select(this).attr("checked") != "true"){
			return 1;
		}else{
			return 4;
		}
	}).attr("display", "true");
	// console.log("Dot: ", dot);
	dot.sort(order);
	d3.selectAll("text").style("font-weight", "normal")
	if(tracer){
		d3.selectAll("path.tracer").style("stroke-opacity", .75);
	}
	firstClick = true;
}

/**
 *Callback Function: Called when clicking Turn Tracer On/ Turn Tracer Off </p>
 *Either displays all tracers or turns them all off
 */
export function tracerButton(){
	var elem = document.getElementById("tracerButton");
	if(elem.innerHTML == "Turn Tracer On"){
		//turn on display for all tracers
		if(displayAll){
			d3.selectAll("path.tracer").style("stroke-opacity", .75);
		}else{
			d3.selectAll("path" + path_id_selector(selectedGroup)).style("stroke-opacity", .75);
		}
		tracer = true;
		//if(devTools) devTools.document.getElementById("tracer").innerHTML = "<strong>tracer:</strong> true";
		elem.innerHTML = "Turn Tracer Off";
	}else{
		//turn off display for tracers
		d3.selectAll("path.tracer").style("stroke-opacity", 0);
		tracer = false;
		//if(devTools) devTools.document.getElementById("tracer").innerHTML = "<strong>tracer:</strong> false";
		elem.innerHTML = "Turn Tracer On";
	}
}


/**
 *Callback Function: Called when clicking Turn Annotations On/ Turn Annotations Off </p>
 *Either displays the annotation shapes on the canvas or hides them
 */
export function annotationsButton(){
	var elem = document.getElementById("annotationsButton");
	if(elem.innerHTML == "Turn Annotations On"){
		properties.AnnotationShapes.toUpperCase() == "ON";
		if($("annotationText").length){annotationText.attr("fill-opacity", 1).on("mouseover", mouseoverAnnotation);}
		d3.selectAll(".annotationShape").attr("stroke-opacity", 1).on("mouseover", mouseoverAnnotation);
		//if(devTools) devTools.document.getElementById("annotations").innerHTML = "<strong>annotations:</strong> true";
		elem.innerHTML = "Turn Annotations Off";
	}else{
		properties.AnnotationShapes.toUpperCase() == "OFF";
		if($("annotationText").length){annotationText.attr("fill-opacity", 0).on("mouseover", null);}
		d3.selectAll(".annotationShape").attr("stroke-opacity", 0).on("mouseover", null);
		//if(devTools) devTools.document.getElementById("annotations").innerHTML = "<strong>annotations:</strong> false";
		elem.innerHTML = "Turn Annotations On";
	}
}


/**
 *Callback Function: Called when clicking on play button </p>
 *Starts the animation </p>
 *Disables play button </p>
 *Enables pause button 
 */
export function playButton(){
	playAnimation();
	document.getElementById("play").disabled = true;
	document.getElementById("pause").disabled = false;
	document.getElementById("back").disabled = false;
}

/**
 *Callback Function: Called when clicking on pause button </p>
 *Pauses the animation </p>
 *Disables pause button </p>
 *Enables play button 
 */
export function pauseButton(){
	stopAnimation();
	document.getElementById("pause").disabled = true;
	document.getElementById("play").disabled = false;
}


/**
 *Callback Function: Called when clicking on replay button </p>
 *Restarts the animation from Config.yearMin </p>
 *Disables play button </p>
 *Enables pause button 
 */
export function replayButton(){
	stopAnimation();
	document.getElementById("play").disabled = true;
	document.getElementById("pause").disabled = false;
	document.getElementById("back").disabled = false;
	document.getElementById("forward").disabled = false;
	var end = false;
	setTimeout(function(){
		replay()
	}, 100);
}

/**
 *Callback Function: Called when clicking on back button </p>
 *Displays the animation one year/date back </p>
 *Disables pause button </p>
 *Enables play button
 */
export function backButton(){
	currYear = roundDate(currYear);
	decrementDate(currYear);
	document.getElementById("pause").disabled = true;
	document.getElementById("play").disabled = false;
	document.getElementById("forward").disabled = false;
	if(currYear >= demensions.dateMin){
		stopAnimation();
		setTimeout(function(){
			displayYear(currYear);
		}, 100);
	}else{
		displayYear(demensions.dateMin);
		document.getElementById("back").disabled = true;
	}
}

/**
 *Callback Function: Called when clicking on the forward button </p>
 *Displays the animation one year/date forward </p>
 *Disables pause button </p>
 *Enables play button
 */
export function forwardButton(){
	document.getElementById("back").disabled = false;
	if(currYear <= demensions.maxPopulatedDate){
		incrementDate(currYear);
		document.getElementById("pause").disabled = true;
		document.getElementById("play").disabled = false;
		if(currYear <= demensions.maxPopulatedDate){
			stopAnimation();
			setTimeout(function(){
				displayYear(currYear);
			}, 100);
		}else{
			displayYear(demensions.maxPopulatedDate);
			document.getElementById("forward").disabled = true;
			document.getElementById("play").disabled = true;
		}
	}
}

/**
 *Called inside replayButton() </p>
 *Called seperately to create a synchronous ordering of things,
 * this way the global variables are properly configured before starting the animation agian.
 */
// export function replay(){
// 	var pathData = [];
// 	console.log()
// 	updatePath(nest(interpolatePath(demensions.dateMin), pathData));
// 	topYear = demensions.dateMin;
// 	currYear = demensions.dateMin;
// 	playAnimation();
// }

/**
 *Ensures smallest dots are above larger dots
 *
 *@param {object} a - the svg dot to check against
 *@param {object} b - the svg dot to check against
 */
function order(a, b) {
	return radius(b) - radius(a);
}


/**
 *Returns a minimum value for the radius of dots (3.0px)
 *
 *@param {number} value - number to check minimum on
 */
function minRadius(value){
	return value < 3.0 ? 3.0 : value;
}

//-----------------------------------Other Callback Functions for various elements----------------------------------
// /**
//  *Callback Function: Called when clicking and dragging the year slider </p>
//  *Pauses animation and calls display year to display data associated with selected date
//  *
//  *@param {number} year - date selected from year slider
//  */ 
// function draggedYear(date) {
// 	slider_tooltip.style("opacity", 0);
// 	date.setHours(0,0,0);
// 	stopAnimation();
// 	document.getElementById("pause").disabled = true;
// 	document.getElementById("play").disabled = false;
// 	if(date >= demensions.dateMin && date < demensions.maxPopulatedDate){
// 		displayYear(date);
// 		document.getElementById("forward").disabled = false;
// 		document.getElementById("back").disabled = false;
// 		document.getElementById("play").disabled = false;
// 	} 
// 	else if(date > demensions.maxPopulatedDate){
// 		displayYear(demensions.maxPopulatedDate);
// 		document.getElementById("forward").disabled = true;
// 		document.getElementById("play").disabled = true;
// 	} 
// 	else if(date < demensions.dateMin){
// 		displayYear(demensions.dateMin);
// 		document.getElementById("back").disabled = true;
// 	} 
// }

// /**
//  *Callback Function: Called when user mouse's over an annotation shape on the canvas </p>
//  *Displays a tooltip with the annotation information at mouseover event
//  */
function mouseoverAnnotation(event, d){
	
	// console.log("d.annotation in mouseover annotation: ", d.Annotation);

	console.log("mouseoverAnnotations event : ", event);
	console.log("mouseoverAnnotations d : ", d);
	console.log("mouseoverAnnotations d.Annnotation  : ", d.Annotation);


	tip.transition().duration(0);
	tip.style('top', ( event.pageY - 20) + 'px')	// d3.event ⇨ (event) 
		.style('left', ( event.pageX + 13) + 'px')	// d3.event ⇨ (event) 
		.style('display', 'block')
		.html(d.Annotation);
}

//BUTTON CALLBACKS:
/**
 *Callback Function: Called when clicking on a selection (basin) on the legend </p>
 *Displays only dots related to that specific label
 */
function legendButton(d, selectMultiple){
	// console.log("LegendButton(), d: ", d);
	displayAll = false;
	var selectedGroup = d;
	console.log("SelectedGroup: ", selectedGroup);
	if(!selectMultiple){
		d3.selectAll("path.tracer").style("stroke-opacity", 0);
		d3.selectAll(".dot").style("fill-opacity", ".2").attr("stroke-width", "0").attr("display", "false");
		d3.selectAll("text").style("font-weight", "normal")
	}
	d3.selectAll("text" + dot_class_selector(d)).style("font-weight", "bold");
	setTimeout(function(){
		d3.selectAll(dot_class_selector(d)).style("fill-opacity", "1").attr("stroke-width", function(){
			if(d3.select(this).attr("checked") != "true"){
				return 1;
			}else{
				return 4;
			}
		}).attr("display", "true");
		if(tracer){
			d3.selectAll("path" + path_id_selector(d)).style("stroke-opacity", .75);
		}
	}, 100);
	
}

//---------------Various accessors that specify the four dimensions of data to visualize.-------------------
/**
 *Accessor function for x-variable
 */
function x(d) { return d.xVar; }
/**
 *Accessor function for y-variable
 */
function y(d) { return d.yVar; }
/**
 *Accessor function for size of dot
 */
function radius(d) { return d.size; }
/**
 *Accessor function for color of dot
 */
function color(d) {return d.color; }
/**
 *Accessor function for name of dot
 */
function key(d) { return d.name; }
/**
 *Accessor function for date
 */
function date(d){ return d.year; }

//----------------------------Helper Functions that minipulate strings for d3.select() purposes-------------------------
/**
 *Removes symbols form string, returns the string with no symbols
 *
 *@param {string} string - a string
 */
function checkForSymbol(string){
	return string.replace(/[^A-Za-z0-9]/g, '');
}  

/**
 *Converts the string into a selector name </p>
 *ex: 'Denver Water' -> '.Denver.Water'
 */
function class_selector(inputString){
	var string = inputString.split(" ");
	var returnThis = ".";
	for(var i = 0; i < string.length - 1; i++){
		if(checkForSymbol(string[i]) != ""){
			returnThis = returnThis + string[i].replace(/[^A-Za-z0-9]/g, '')// + ".";
		}
	}
	returnThis = returnThis + string[string.length-1].replace(/[^A-Za-z0-9]/g, '');
	return returnThis.toString();
}

/**
 *Converts the string into a selector name </p>
 *ex: 'Denver Water' -> '.Denver.Water'
 */
function convert_to_id(inputString){
	var string = inputString.split(" ");
	var returnThis = "";
	for(var i = 0; i < string.length - 1; i++){
		if(checkForSymbol(string[i]) != ""){
			returnThis = returnThis + string[i].replace(/[^A-Za-z0-9]/g, '') + "";
		}
	}
	returnThis = returnThis + string[string.length-1].replace(/[^A-Za-z0-9]/g, '');
	return returnThis;
}

/**
 *Converts the string into an id selector name </p>
 *ex: 'Denver Water' -> '.Denver.Water'
 */
function dot_id_selector(inputString){
	var string = inputString.split(" ");
	var returnThis = "#D";
	for(var i = 0; i < string.length - 1; i++){
		if(checkForSymbol(string[i]) != ""){
			returnThis = returnThis + string[i].replace(/[^A-Za-z0-9]/g, '') + "";
		}
	}
	returnThis = returnThis + string[string.length-1].replace(/[^A-Za-z0-9]/g, '');
	return returnThis.toString();
}

/**
 *Converts the string into a selector name </p>
 *ex: 'Denver Water' -> '.Denver.Water'
 */
function dot_class_selector(inputString){
	var string = inputString.split(" ");
	var returnThis = ".D";
	for(var i = 0; i < string.length - 1; i++){
		if(checkForSymbol(string[i]) != ""){
			returnThis = returnThis + string[i].replace(/[^A-Za-z0-9]/g, '')// + ".";
		}
	}
	returnThis = returnThis + string[string.length-1].replace(/[^A-Za-z0-9]/g, '');
	return returnThis.toString();
}

/**
 *Converts the string into a selector name </p>
 *ex: 'Denver Water' -> '.Denver.Water'
 */
function path_class_selector(inputString){
	var string = inputString.split(" ");
	var returnThis = ".T";
	for(var i = 0; i < string.length - 1; i++){
		if(checkForSymbol(string[i]) != ""){
			returnThis = returnThis + string[i]//.replace(/[^A-Za-z0-9]/g, '') + ".";
		}
	}
	returnThis = returnThis + string[string.length-1].replace(/[^A-Za-z0-9]/g, '');
	return returnThis.toString();
}

/**
 *Converts the string into an id selector name </p>
 *ex: 'Denver Water' -> '.Denver.Water'
 */
function path_id_selector(inputString){
	var string = inputString.split(" ");
	var returnThis = "#T";
	for(var i = 0; i < string.length - 1; i++){
		if(checkForSymbol(string[i]) != ""){
			returnThis = returnThis + string[i].replace(/[^A-Za-z0-9]/g, '') + "";
		}
	}
	returnThis = returnThis + string[string.length-1].replace(/[^A-Za-z0-9]/g, '');
	return returnThis.toString();
}


/**
 *Depending on precision units from Config file, incremments the date 
 */
function incrementDate(date){
	switch(precisionUnit){
		case "Year":
			date.setFullYear(date.getFullYear() + precisionInt);
			break;
		case "Month":
			date.setMonth(date.getMonth() + precisionInt);
			break;
		case "Day":
			date.setDate(date.getDate() + precisionInt);
			break;
		case "Hour":
			date.setHours(date.getHours() + precisionInt);
			break;
		case "Minute":
			date.setMinutes(date.getMinutes() + precisionInt);
			break;
		case "Second":
			date.setSeconds(date.getSeconds() + precisionInt);
			break;
		default:
			break;
	}
}



/**
 *Adds data to the array and then nests that data by name </p>
 *[d3.js nest]{@link https://github.com/d3/d3-3.x-api-reference/blob/master/Arrays.md#nest}
 *
 *@param {object} data - an object containing the data
 *@param {array} array - an array containing data
 */
function nest(data, array){
	for(var i = 0; i < data.length; i++){
		array.push(data[i]);
	}

	// depricated
	// var nested = d3.group()
	// 	.key(function(d){return d.name;})
	// 	.entries(array);
	
	var group = d3.group(array, function(d){return d.name;});
	return group;
}