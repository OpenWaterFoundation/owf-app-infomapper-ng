/**
 * This MapUtil class is a utilization class for the Map Component Class. It helps with data manipulation and other computational
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
   * @param sp The object being passed with style property data
   */
  public static addStyle(sp: any): Object {    

    if (sp.symbol.properties.symbolShape) {
      sp.symbol.properties.symbolShape = sp.symbol.properties.symbolShape.toLowerCase();
    }
    
    var style: {} = {};

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
            weight: this.verify(sp.results[i]['weight'], 'weight')
          }
        }
        // If the classificationAttribute is a number, compare it with the results
        else if (sp.feature['properties'][sp.symbol.classificationAttribute] == sp.results[i]['value']) {          
          return {
            color: this.verify(sp.results[i]['color'], 'color'),
            fillOpacity: this.verify(sp.results[i]['fillOpacity'], 'fillOpacity'),
            opacity: this.verify(sp.results[i]['opacity'], 'opacity'),
            stroke: sp.symbol.properties.outlineColor == "" ? false : true,
            weight: this.verify(sp.results[i]['weight'], 'weight')
          }
        }
      }
    } else if (sp.geoLayer.geometryType.includes('Point') && sp.symbol.classificationType.toUpperCase() == 'SINGLESYMBOL') {
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
      
    } else if (sp.geoLayer.geometryType.includes('Point') && sp.symbol.classificationType.toUpperCase() == 'CATEGORIZED') {
      return {
        color: sp.symbol.properties.color,
        fillOpacity: sp.symbol.properties.fillOpacity,
        opacity: sp.symbol.properties.opacity,
        radius: parseInt(sp.symbol.properties.symbolSize),
        stroke: sp.symbol.properties.outlineColor == "" ? false : true,
        shape: sp.symbol.properties.symbolShape,
        weight: parseInt(sp.symbol.properties.weight)
      }
    } else if (sp.geoLayer.geometryType.includes('LineString')) {
      return {
        color: this.verify(sp.symbol.properties.color, 'color'),
        fillColor: this.verify(sp.symbol.properties.fillColor, 'fillColor'),
        fillOpacity: this.verify(sp.symbol.properties.fillOpacity, 'fillOpacity'),
        opacity: this.verify(sp.symbol.properties.opacity, 'opacity'),
        weight: this.verify(parseInt(sp.symbol.properties.weight), 'weight')
      }
    } else if (sp.geoLayer.geometryType.includes('Polygon') || sp.geoLayer.sourceFormat.toUpperCase() == 'WFS') {      
      return {
        color: this.verify(sp.symbol.properties.color, 'color'),
        fillColor: this.verify(sp.symbol.properties.fillColor, 'fillColor'),
        fillOpacity: this.verify(sp.symbol.properties.fillOpacity, 'fillOpacity'),
        opacity: this.verify(sp.symbol.properties.opacity, 'opacity'),
        stroke: sp.symbol.properties.outlineColor == "" ? false : true,
        weight: this.verify(parseInt(sp.symbol.properties.weight), 'weight'),
        shape: this.verify(sp.symbol.properties.symbolShape, 'shape'),
      }
    } 
    return style;

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
   * @returns an object that contains the boolean letting Leaflet know whether to call a built-in Leaflet constructor,
   * or Esri, and the correct URLIdent for it.
   * @param URL The URL sourcePath property from the geoLayer in the map config file
   */
  public static getURLIdent(URL: string): any {
    // If the URL contains arcgis AND any of these strings, return that it will be an Esri tile layer, and the correct Esri string
    if (/(?=.*World_Street_Map)(?=.*arcgis)/.test(URL)) return { URLIdent: 'Streets', type: 'esri' };
    else if (/(?=.*World_Topo_Map)(?=.*arcgis)/.test(URL)) return { URLIdent: 'Topographic', type: 'esri' };
    else if (/(?=.*World_Ocean_Base)(?=.*arcgis)/.test(URL)) return { URLIdent: 'Oceans', type: 'esri' };
    else if (/(?=.*NatGeo_World_Map)(?=.*arcgis)/.test(URL)) return { URLIdent: 'NationalGeographic', type: 'esri' };
    else if (/(?=.*World_Dark_Gray_Base)(?=.*arcgis)/.test(URL)) return { URLIdent: 'DarkGray', type: 'esri' };
    else if (/(?=.*World_Light_Gray_Base)(?=.*arcgis)/.test(URL)) return { URLIdent: 'Gray', type: 'esri' };
    else if (/(?=.*World_Imagery)(?=.*arcgis)/.test(URL)) return { URLIdent: 'Imagery', type: 'esri' };
    else if (/(?=.*World_Shaded_Relief)(?=.*arcgis)/.test(URL)) return { URLIdent: 'ShadedRelief', type: 'esri' };
    else if (/(?=.*World_Terrain_Base)(?=.*arcgis)/.test(URL)) return { URLIdent: 'Terrain', type: 'esri' };
    else if (/(?=.*USA_Topo_Maps)(?=.*arcgis)/.test(URL)) return { URLIdent: 'USATopo', type: 'esri' };
    else if (/(?=.*clarity)(?=.*arcgis)/.test(URL)) return { URLIdent: 'ImageryClarity', type: 'esri' };
    else if (/(?=.*World_Physical_Map)(?=.*arcgis)/.test(URL)) return { URLIdent: 'Physical', type: 'esri' };
    else if (/(?=.*World_Imagery_Firefly)(?=.*arcgis)/.test(URL)) return { URLIdent: 'ImageryFirefly', type: 'esri' };
    // If google is in the URL, it will be a google basemap
    else if (/google/.test(URL)) return { URLIdent: URL, type: 'google' };
    // Default is to just return the URL itself, as Leaflet will create it with L.tileLayer()...
    else return { URLIdent: URL };
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
   * Takes a lengthy URL to display on a Leaflet popup and shortens it to a reasonable size
   * @param url The original URL to truncate
   */
  public static truncateURL(url: string): string {
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

    // This adds an arbitrary break after the 45th letter in the URL.
    for (let i = 0; i < url.length; i++) {
      if (i == 45) {
        truncatedURL += '<br>';
        truncatedURL += url[i];
      } else {
        truncatedURL += url[i];
      }
    }
    return truncatedURL;
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

}