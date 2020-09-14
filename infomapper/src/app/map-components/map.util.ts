import * as moment from 'moment';

/**
 * This MapUtil class is a utilization class for the Map and its child Dialog Component Class. It helps with data manipulation and other computational
 * helper functions that take up quite a bit of space in the map.component.ts class. To keep the size of that file in check, this
 * class takes a large chunk of that size into itself. This will hopefully clean up code and keep it easier to read and manage
 * in the future. Also, it's good practice in the exporting and importing of functions for components.
 */
export class MapUtil {

  public static readonly defaultColorTable =
  ['#b30000', '#ff6600', '#ffb366', '#ffff00', '#59b300', '#33cc33', '#b3ff66', '#00ffff',
  '#66a3ff', '#003cb3', '#3400b3', '#6a00b3', '#9b00b3', '#b30092', '#b30062', '#b30029'];

  /**
   * 
   * @param sp The object being passed with Style Property data
   */
  public static addStyle(sp: any): any {    

    if (sp.symbol.properties.symbolShape) {
      sp.symbol.properties.symbolShape = sp.symbol.properties.symbolShape.toLowerCase();
    }
    
    // TODO: jpkeahey 2020.08.14 - Classification file might not be the best way to determine whether or not
    // the layer is a categorized polygon
    if (sp.symbol.properties.classificationFile) {
      // Before the classification attribute is used, check to see if it exists,
      // and complain if it doesn't.
      if (!sp.feature['properties'][sp.symbol.classificationAttribute]) {
        console.error("The classification file property 'classificationAttribute' value '" +
        sp.symbol.classificationAttribute +
        "' was not found. Confirm that the specified attribute exists in the layer attribute table.");
      }
      // TODO: jpkeahey 2020.08.24 - Instead of using a conditional to determine what to return, I think I can just return one
      // style object, and if it contains an attribute that doesn't exist in the layer that's trying to use it (think radius for
      // polygon layer), it will ignore it. I'm not totally confident, but it's worth a shot when I have the time        
      for (let i = 0; i < sp.results.length; i++) {
        // If the classificationAttribute is a string, check to see if it's the same as the variable returned
        // from Papaparse.
        if (typeof sp.feature['properties'][sp.symbol.classificationAttribute] ==
            'string'
            &&
            sp.feature['properties'][sp.symbol.classificationAttribute].toUpperCase() ==
            sp.results[i]['value'].toUpperCase()) {
          
          return {
            color: this.verify(sp.results[i]['color'], 'color'),
            fillOpacity: this.verify(sp.results[i]['fillOpacity'], 'fillOpacity'),
            opacity: this.verify(sp.results[i]['opacity'], 'opacity'),
            stroke: sp.symbol.properties.outlineColor == "" ? false : true,
            weight: this.verify(parseInt(sp.results[i]['weight']), 'weight')
          }
        }
        // If the classificationAttribute is a number, compare it with the results
        else if (sp.feature['properties'][sp.symbol.classificationAttribute] == sp.results[i]['value']) {
          return {
            color: this.verify(sp.results[i]['color'], 'color'),
            fillOpacity: this.verify(sp.results[i]['fillOpacity'], 'fillOpacity'),
            opacity: this.verify(sp.results[i]['opacity'], 'opacity'),
            stroke: sp.symbol.properties.outlineColor == "" ? false : true,
            weight: this.verify(parseInt(sp.results[i]['weight']), 'weight')
          }
        }
      }
    } else { // Return all possible style properties, and if the layer doesn't have a use for one, it will be ignored
        return {
        color: this.verify(sp.symbol.properties.color, 'color'),
        fillColor: this.verify(sp.symbol.properties.fillColor, 'fillColor'),
        fillOpacity: this.verify(sp.symbol.properties.fillOpacity, 'fillOpacity'),
        opacity: this.verify(sp.symbol.properties.opacity, 'opacity'),
        radius: this.verify(parseInt(sp.symbol.properties.symbolSize), 'size'),
        stroke: sp.symbol.properties.outlineColor == "" ? false : true,
        shape: this.verify(sp.symbol.properties.symbolShape, 'shape'),
        weight: this.verify(parseInt(sp.symbol.properties.weight), 'weight')
      }
    }

  }

  /**
   * Goes through each feature in the selected layer and assigns an arbitrary hex number color to display both on the map
   * and the legend. NOTE: There cannot be more than 16 default colors for the Info Mapper.
   * @returns an string array containing the feature label, followed by the feature color e.g. colorTable = ['Bear Creek', '#003cb3'];
   * @param features An array of all features of the selected layer
   * @param symbol The symbol object containing data about the selected layer
   */
  public static assignColor(features: any[], symbol: any): string[] {
    let colors: string[] = MapUtil.defaultColorTable;
    let colorTable: any[] = [];
    
    // Before the classification attribute is used, check to see if it exists,
    // and complain if it doesn't.
    if (!features[0]['properties'][symbol.classificationAttribute]) {
      console.error("The classification file property 'classificationAttribute' value",
      features[0]['properties'][symbol.classificationAttribute],
      "was not found. Confirm that the specified attribute exists in the layer attribute table.");
    }   

    // TODO: jpkeahey 2020.04.30 - Let people know that no more than 16 default
    // colors can be used
    for (let i = 0; i < features.length; i++) {
      if (typeof features[i]['properties'][symbol.classificationAttribute] == 'string') {
        colorTable.push(features[i]['properties'][symbol.classificationAttribute].toUpperCase());
      }
      else {
        colorTable.push(features[i]['properties'][symbol.classificationAttribute]);
      }
      colorTable.push(colors[i]);
    }    
    return colorTable;
  }

  // TODO: jpkeahey 2020.07.20 - This isn't being used, and therefore the legend colors aren't being set. What to do?
  /**
   * If no color table is given, create your own for populating the legend colors
   * @param features All features on the Leaflet layer
   * @param symbol The geoLayerSymbol data from the geoLayer
   */
  private assignLegendColor(features: any[], symbol: any) {
    let colors: string[] = MapUtil.defaultColorTable;
    let colorTable: any[] = [];
    // TODO: jpkeahey 2020.04.30 - Make sure you take care of more than 16
    for (let i = 0; i < features.length; i++) {
      colorTable.push(symbol.classificationAttribute + ' ' +
                      features[i]['properties'][symbol.classificationAttribute]);
      colorTable.push(colors[i]);
    }
    return colorTable;
  }

  /**
   * Converts a Linux epoch number to a date and formats it in a semi-human readable form
   * @param epochTime The amount of seconds or milliseconds since January 1st, 1970 to be converted
   */
  public static convertEpochToFormattedDate(epochTime: number): any {
    // Convert the epoch time to an ISO 8601 string with an offset and return it
    return moment(epochTime).format('YYYY-MM-DD HH:mm:ss Z');
  }

  /**
   * @returns the number array for the icon anchor so the image is displayed so that the point is in
   * the correct location on the map, whether the user is zoomed far in or out.
   * @param symbolPath The path to the image to show on the map
   */
  public static createAnchorArray(symbolPath: any, imageAnchorPoint: string): number[] {
    // Split the image path by underscore, since it will have to contain at least one of those. Then pop the
    // last instance of this, as it will have the image dimensions. Splitting by x in between the numbers will
    // separate them into an array
    var imageSizeArray: string[] = symbolPath.split('_').pop().split(/x|X/);
    var strike1: boolean;

    if (imageSizeArray.length === 1) strike1 = true;

    if (imageSizeArray[0].length > 2) {
      imageSizeArray[0] = imageSizeArray[0].split('-').pop();
    }
    // Iterate over the array and slice off any file extensions hanging around
    for (let i in imageSizeArray) {
      if (imageSizeArray[i].includes('.')) {
        imageSizeArray[i] = imageSizeArray[i].substring(0, imageSizeArray[i].indexOf('.'));
      }
    }
    // Now that the strings have been formatted to numbers, convert them to actual numbers
    var anchorArray: number[] = imageSizeArray.map(Number);
    // Check if the imageAnchorPoint variable is undefined, by not being given, and assign it as an empty string if so
    if (imageAnchorPoint === undefined) imageAnchorPoint = '';
    // If the number array only has one entry, and that entry is NaN, that's strike1.
    if (strike1 && anchorArray.length === 1 && isNaN(anchorArray[0]) && imageAnchorPoint.toUpperCase() !== 'UPPERLEFT') {
      console.warn('Symbol Image position given as \'' + imageAnchorPoint +
      '\', but no dimensions present in Image file name. Resorting to default position \'UpperLeft\'');
    }

    // Depending on where the point is on the image, change the anchor pixels accordingly
    switch(imageAnchorPoint.toUpperCase()) {
      case 'BOTTOM':
        anchorArray[0] = Math.floor(anchorArray[0] / 2);
        return anchorArray;
      case 'CENTER':
        anchorArray[0] = Math.floor(anchorArray[0] / 2);
        anchorArray[1] = Math.floor(anchorArray[1] / 2);
        return anchorArray;
      case 'UPPERLEFT':
        return null;
      case 'TOP':
        anchorArray[0] = Math.floor(anchorArray[0] / 2);
        anchorArray[1] = 0;
        return anchorArray;
      case 'UPPERRIGHT':
        anchorArray[1] = 0;
        return anchorArray;
      case 'LOWERRIGHT':
        return anchorArray;
      case 'LOWERLEFT':
        anchorArray[0] = 0;
        return anchorArray;
      case 'LEFT':
        anchorArray[0] = 0;
        anchorArray[1] = Math.floor(anchorArray[1] / 2);
        return anchorArray;
      case 'RIGHT':
        anchorArray[1] = Math.floor(anchorArray[1] / 2);
        return anchorArray;
      default:
        return null;
    }
  }

  public static formatAllFeatures(keys: string[], features: any[]): any {

    // var featureIndex = 0;
    // var propertyIndex = 0;

    // for (let property in features[0].properties) {
    //   if (typeof features[0].properties[property] === 'number') {
    //     if (/date|time/i.test(property) && features[0].properties[property] > 100000000 ) {
    //       console.log('here');
          
    //       keys.splice(propertyIndex + 1, 0, '+' + keys[propertyIndex]);

    //       var formattedFeature: any = property;

          

    //       // features.splice(i + 1, 0, );
    //     }
    //   }
    //   ++propertyIndex;
    // }
    return features;
  }

  public static formatDisplayedColumns(keys: any): any {

    
    return keys;
  }

  // Get the color for the symbolShape
  /**
   * 
   * @param symbol The symbol data from the geoLayerView
   * @param strVal The classification attribute that needs to match with the color being searched for
   * @param colorTable The default color table created when a user-created color table was not found
   */
  public static getColor(symbol: any, strVal: string, colorTable: any) {
    
    switch (symbol.classificationType.toUpperCase()) {
      case "SINGLESYMBOL":
        return symbol.color;
      // TODO: jpkeahey 2020.04.29 - Categorized might be hard-coded
      case "CATEGORIZED":
        var color: string = 'gray';      
          for(let i = 0; i < colorTable.length; i++) {
            if (colorTable[i] == strVal) {                                                              
              color = colorTable[i+1];
            }
          }
        return color;
      // TODO: jpkeahey 2020.07.07 - This has not yet been implemented
      case "GRADUATED":
        return;
    } 
    return symbol.color;
  }

  /**
   * Takes a hex string ('#b30000') and converts to rgb (179, 0, 0)
   * Code from user Tim Down @ https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
   * @param hex The string representing a hex value
   */
  public static hexToRGB(hex: string): any {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
      return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;

  }

  /**
   * While the end of the value string from the graph template file hasn't ended yet, look for the '${' start
   * that we need and build the property, adding it to the propertyArray when we've detected the end of the
   * property. Find each one in the value until the value line is done.
   * @param key In order to provide a better console warning, we bring the key from replaceProperties()
   * @param value The line being read from the graph template file that contains the ${ } property.
   * @param featureProperties 
   */
  private static obtainPropertiesFromLine(key: any, value: string, featureProperties: Object): string {

    var propertyString = '';
    var valueLength = 0;
    var formattedValue = '';

    while (valueLength < value.length) {
      if (value[valueLength] && value[valueLength + 1] && value[valueLength] === '$' && value[valueLength + 1] === '{') {
        valueLength = valueLength + 2;
        for (let i = valueLength; i < value.length; i++) {
          if (value[i] !== '}') {
            propertyString += value[i];
            valueLength++;
          } else if (value[i] === '}') {
            valueLength++;
            break;
          }
        }
        // You have gone through everything inside the ${property} format and gotten the string. Split
        // by the colon and now we have our true property. I might have to use the throwaway variable later
        let throwaway = propertyString.split(':')[0];
        let prop = propertyString.split(':')[1];
        
        if (prop === undefined) {
          console.warn('A property of the [' + key + '] attribute in the graph template file is incorrectly formatted. ' +
          'This might cause an error in retrieving the graph, or other unintended output on the graph.');
        }
        formattedValue += featureProperties[prop];
        propertyString = '';
      }
      if (value[valueLength] !== undefined) {
        formattedValue += value[valueLength];
        valueLength++;
      }
      
    }
    return formattedValue;
  }

  /**
   * This is a recursive function that goes through an object and replaces any value in
   * it that contain the ${property} notation with the actual property needed.
   * @param templateObject The object that will translate from the StateMod file to Chart.js
   * @param featureProperties The properties in the selected feature on the map layer.
   */
  public static replaceProperties(templateObject: Object, featureProperties: Object): Object {

    for (var key in templateObject) {
      var value = templateObject[key];
      if (typeof value === 'object') {
        this.replaceProperties(value, featureProperties);
      } else {
        if (value.includes("${")) {
          let formattedValue = this.obtainPropertiesFromLine(key, value, featureProperties);
          
          try {
            templateObject[key] = formattedValue;
          } catch ( e ) {
            templateObject[key] = value;
          }
        }
      }
    }
    if (templateObject['product'] || templateObject['id'])
      return templateObject;
  }

  /**
   * Resets the feature styling back to the original when a mouseout event occurs on the map, and resets the topleft
   * popup from the feature the mouse hover was on, back to the default text
   * @param e The event object passed when a mouseout on a feature occurs
   * @param _this A reference to the map component so the mapService can be used
   * @param geoLayer A reference to the current geoLayer the feature is from
   */
  public static resetFeature(e: any, _this: any, geoLayer: any): void {
              
    var geoLayerView = _this.mapService.getLayerViewFromId(geoLayer.geoLayerId);
    if (geoLayerView.properties.highlightEnabled && geoLayerView.properties.highlightEnabled === 'true') {
      if (geoLayer.geometryType.toUpperCase().includes('LINESTRING')) {
        let layer = e.target;                
        layer.setStyle(_this.mapService.getOriginalFeatureStyle());
      } else if (geoLayer.geometryType.toUpperCase().includes('POLYGON')) {
        let layer = e.target;                                         
        layer.setStyle(_this.mapService.getOriginalFeatureStyle());
      }
    }

    let div = document.getElementById('title-card');
    let instruction: string = "Move over or click on a feature for more information";
    let divContents: string = "";
  
    divContents = ('<h4 id="geoLayerView">' + _this.mapService.getGeoMapName() + '</h4>' + '<p id="point-info"></p>');
    if (instruction != "") {
      divContents += ('<hr/>' + '<p><i>' + instruction + '</i></p>');
    }
    div.innerHTML = divContents;
  }

  /**
   * Takes a lengthy URL to display on a Leaflet popup and shortens it to a reasonable size
   * @param url The original URL to truncate
   * @param newLength The length of the maximum size for the truncated string in letters
   */
  public static truncateString(url: string, newLength: number): string {
    var truncatedURL = '';
    // This puts the three periods in the URL. Not used at the moment
    // // Return the entire URL if it's shorter than 25 letters; That should be short enough
    // if (url.length < 31) return url;

    // for (let letter of url) {
    //   if (truncatedURL.length < 26)
    //     truncatedURL += letter;
    // }
    // // Add the three periods, and then the last three letters in the original URL
    // truncatedURL += '...';
    // for (let i = 10; i > 0; i--) {
    //   truncatedURL += url[url.length - i]
    // }
    // return truncatedURL;
    switch(newLength) {
      case 45:
        // This adds an arbitrary break after the newLength letter in the URL.
        for (let i = 0; i < url.length; i++) {
          if (i === newLength) {
            truncatedURL += '<br>';
            truncatedURL += url[i];
          } else {
            truncatedURL += url[i];
          }
        }
        return truncatedURL;
      case 20:
        if (url.includes('cherryhillsvillage.com/DocumentCenter')) {
          console.log(url);
        }
        for (let i = 0; i < newLength; i++) {
          if (i < url.length - 2) {
            truncatedURL += url[i];
          } else break;
        }
        truncatedURL += '...';
        
        return truncatedURL;
    }
    
  }

  /**
   * Updates the feature styling and topleft popup with information when a mouseover occurs on the map
   * @param e The event object passed when a mouseover on a feature occurs
   * @param _this A reference to the map component so the mapService can be used
   * @param geoLayer A reference to the current geoLayer the feature is from
   * @param symbol The symbol object from the current geoLayerView
   * @param geoLayerViewGroup The current geoLayerViewGroup the feature is from
   * @param i The index of the current geoLayerView in the geoLayerViewGroup
   */
  public static updateFeature(e: any, _this: any, geoLayer: any, symbol: any, geoLayerViewGroup: any, i: any): void {
              
    var geoLayerView = _this.mapService.getLayerViewFromId(geoLayer.geoLayerId);
    if (geoLayerView.properties.highlightEnabled && geoLayerView.properties.highlightEnabled === 'true') {
      if (geoLayer.geometryType.toUpperCase().includes('LINESTRING')) {
        let layer = e.target;
        _this.mapService.setOriginalFeatureStyle(layer.options.style);
        layer.setStyle({
          color: 'yellow'
        });
      } else if (geoLayer.geometryType.toUpperCase().includes('POLYGON') &&
        symbol.classificationType.toUpperCase().includes('SINGLESYMBOL')) {
          let layer = e.target;
          _this.mapService.setOriginalFeatureStyle(layer.options.style);
          layer.setStyle({
            fillColor: 'yellow',
            fillOpacity: '0.1'
          });
      } else if (geoLayer.geometryType.toUpperCase().includes('POLYGON') &&
        symbol.classificationType.toUpperCase().includes('CATEGORIZED')) {
          let layer = e.target;
          _this.mapService.setOriginalFeatureStyle(layer.options.style(e.sourceTarget.feature));
          layer.setStyle({
            color: 'yellow',
            fillOpacity: '0.1'
          });
        }
      }
    
    // Update the main title name up top by using the geoLayerView name
    let div = document.getElementById('title-card');

    let featureProperties: any = e.target.feature.properties;
    let instruction = "Click on a feature for more information";
    // 
    let divContents = '<h4 id="geoLayerView">' + geoLayerViewGroup.geoLayerViews[i].name + '</h4>' + '<p id="point-info"></p>';
    // Here the longest a max length is specified to 40 characters for a line in a popup
    var lineMaxLength = 40;
    // Boolean to describe if we've converted any epoch times in the features. Used to add what the + sign
    // means in the popup
    var converted = false;
    // Boolean to help determine if the current property needs to be converted
    var convertedEpochTime: boolean;

    // Go through each property in the feature properties of the layer
    for (let prop in featureProperties) {
      // The current feature that needs to be displayed
      var feature = featureProperties[prop];
      convertedEpochTime = false;
      // Take the max length of the line and subtract the property name length. The leftover is the available remaining length
      // the feature can be before it's cut off to prevent the mouseover popup from getting too wide
      var longestAllowableName = lineMaxLength - prop.length;

      if (typeof feature === 'number') {
        // If the feature is a number, check to see if either date or time is in the key, then check the number to see if it's
        // very large. If it is, we probably have a date and can convert to an ISO string
        if (/date|time/i.test(prop) && feature > 1000000000) {
          // The feature has been converted, so change to true
          convertedEpochTime = true;
          converted = true;
          // Write the original feature and property first
          divContents += '<b>' + prop + '</b>' + ': ' + feature + '<br>';
          // Convert the feature to the desired format
          feature = MapUtil.convertEpochToFormattedDate(feature);
        }
      }
      // Make sure the feature length is not too long. If it is, truncate it
      if (feature !== null && feature.length > longestAllowableName) {
        feature = feature.substring(0, longestAllowableName) + '...';
      }
      // If the conversion occurred above, feature has been changed and needs to be added to the popup. If it hasn't, feature
      // is the same as it was when read in, and can just be added to the popup
      if (convertedEpochTime) {
        divContents += '<b>+' + prop + '</b>: ' + feature + '<br>';
      } else {
        divContents += '<b>' + prop + '</b>: ' + feature + '<br>';
      }
      
    }
    // Add in the explanation of what the prepended + sign means above
    if (converted) {
      divContents += '<br> <b>+</b> auto-generated values';
    }

    if (instruction != "") {
      divContents += ('<hr/>' + '<p><i>' + instruction + '</i></p>');
    }
    // Once all properties are added to divContents, display them
    div.innerHTML = divContents;
    
  }

  /**
   * Confirms that the given style option is correct, and if not, given a default so the map can still be displayed
   * @param styleProperty 
   * @param styleType 
   */
  public static verify(styleProperty: any, styleType: string): any {
    // The property exists, so return it to be used in the style
    // TODO: jpkeahey 2020.06.15 - Maybe check to see if it's a correct property?
    if (styleProperty) {
      return styleProperty;
    } 
    // The property does not exist, so return a default value.
    else {
      switch (styleType) {
        case 'color': return 'gray';
        case 'fillOpacity': return '0.2';
        case 'fillColor': return 'gray';
        case 'opacity': return '1.0';
        case 'size': return 6;
        case 'shape': return 'circle';
        case 'weight': return 3;
      }
    }
  }


  // NOTE: This setTimeout function dynamically created the side bar MapLayerComponents, but did not cooperate when trying to
  // separate by geoLayerViewGroup, so was scrapped. Might be used in the future. Also, think about setting the timeout to nothing,
  // which will default to 0. It just needs to asynchronously create the components since it's being displayed under an ngIf in the
  // map.component.html file. It would go into the addLayerToSidebar function in the map.component.ts file.
  // setTimeout(() => {
  //   mapGroups.forEach((mapGroup: any) => {
  //     mapGroup.geoLayerViews.forEach((geoLayerView: any) => {
        
  //       // Create the View Layer Component
  //       let componentFactory = this.componentFactoryResolver.resolveComponentFactory(MapLayerComponent);
        
  //       this.layerViewContainerRef = this.LayerComp.viewContainerRef;
  //       let componentRef = this.layerViewContainerRef.createComponent(componentFactory);
        
  //       // Initialize data for the map layer component.
  //       let component = <MapLayerComponent>componentRef.instance;
  //       component.layerViewData = geoLayerView;
  //       component.mapComponentReference = this;

  //       let id: string = geoLayerView.geoLayerId;
  //       component.geometryType = this.mapService.getGeometryType(id);
  //       // Save the reference to this component so it can be removed when resetting the page.
  //       this.sidebar_layers.push(componentRef);
  //     });
  //   });
        
  // }, 750);

  // These conditionals were in the addStyle() function that returned specific style objects with the correct properties for each.
  // I discovered that if a style object is returned with all possible properties, it will discard the any that the layer doesn't
  // need or care about
  // else if (sp.geoLayer.geometryType.includes('Point') && sp.symbol.classificationType.toUpperCase() == 'SINGLESYMBOL') {
    //   return {
    //     color: this.verify(sp.symbol.properties.color, 'color'),
    //     fillColor: this.verify(sp.symbol.properties.fillColor, 'fillColor'),
    //     fillOpacity: this.verify(sp.symbol.properties.fillOpacity, 'fillOpacity'),
    //     opacity: this.verify(sp.symbol.properties.opacity, 'opacity'),
    //     radius: this.verify(parseInt(sp.symbol.properties.symbolSize), 'size'),
    //     stroke: sp.symbol.properties.outlineColor == "" ? false : true,
    //     shape: this.verify(sp.symbol.properties.symbolShape, 'shape'),
    //     weight: this.verify(parseInt(sp.symbol.properties.weight), 'weight')
    //   }
      
    // } else if (sp.geoLayer.geometryType.includes('Point') && sp.symbol.classificationType.toUpperCase() == 'CATEGORIZED') {
    //   return {
    //     color: sp.symbol.properties.color,
    //     fillOpacity: sp.symbol.properties.fillOpacity,
    //     opacity: sp.symbol.properties.opacity,
    //     radius: parseInt(sp.symbol.properties.symbolSize),
    //     stroke: sp.symbol.properties.outlineColor == "" ? false : true,
    //     shape: sp.symbol.properties.symbolShape,
    //     weight: parseInt(sp.symbol.properties.weight)
    //   }
    // } else if (sp.geoLayer.geometryType.includes('LineString')) {
    //   return {
    //     color: this.verify(sp.symbol.properties.color, 'color'),
    //     fillColor: this.verify(sp.symbol.properties.fillColor, 'fillColor'),
    //     fillOpacity: this.verify(sp.symbol.properties.fillOpacity, 'fillOpacity'),
    //     opacity: this.verify(sp.symbol.properties.opacity, 'opacity'),
    //     weight: this.verify(parseInt(sp.symbol.properties.weight), 'weight')
    //   }
    // } else if (sp.geoLayer.geometryType.includes('Polygon') || sp.geoLayer.sourceFormat.toUpperCase() == 'WFS') {      
    //   return {
    //     color: this.verify(sp.symbol.properties.color, 'color'),
    //     fillColor: this.verify(sp.symbol.properties.fillColor, 'fillColor'),
    //     fillOpacity: this.verify(sp.symbol.properties.fillOpacity, 'fillOpacity'),
    //     opacity: this.verify(sp.symbol.properties.opacity, 'opacity'),
    //     stroke: sp.symbol.properties.outlineColor == "" ? false : true,
    //     weight: this.verify(parseInt(sp.symbol.properties.weight), 'weight'),
    //     shape: this.verify(sp.symbol.properties.symbolShape, 'shape'),
    //   }
    // }

}