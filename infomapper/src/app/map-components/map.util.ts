import * as moment         from 'moment';

import * as GeoRasterLayer from 'georaster-layer-for-leaflet';
import * as IM             from 'src/infomapper-types';
import { MapLayerManager } from './map-layer-manager';
import { MapLayerItem }    from './map-layer-item';

import geoblaze            from 'geoblaze';

declare var L: any;

/**
 * This MapUtil class is a utilization class for the Map and its child Dialog Component classes. All of these classes ultimately
 * end up dealing with data that comes from the Map Component, hence the map.util name. It helps with data manipulation and other
 * computational helper functions that take up quite a bit of space in the component classes. This will hopefully clean up code
 * and keep it easier to read and manage in the future. Also, it's good practice in the exporting and importing of functions for
 * components.
 */
export class MapUtil {
  /**
   * Object with the geoLayerId as the key, and an object for displaying a raster cell's information in the upper left Leaflet
   * Control div popup. Used for keeping track of multiple rasters shown on the map.
   */
  private static currentRasterLayers: any = {};
  /**
   * The constant, non-changing, read only variable containing the colors of a defaulted color table for displaying categorized
   * layers.
   */
  public static readonly defaultColorTable =
    ['#b30000', '#ff6600', '#ffb366', '#ffff00', '#59b300', '#33cc33', '#b3ff66', '#00ffff',
      '#66a3ff', '#003cb3', '#3400b3', '#6a00b3', '#9b00b3', '#b30092', '#b30062', '#b30029'];
  /**
   * The constant variable for what a cell value will contain as a missing value.
   * NOTE: May be turned into an array in the future for a list of all known missing values.
   */
  private static readonly missingValue = -3.3999999521443642e38;
  /**
   * A read only constant object for dynamically using operators between two integers.
   */
  public static readonly operators = {
    '>': function(a: any, b: any) { return a > b; },
    '>=': function(a: any, b: any) { return a >= b; },
    '<': function(a: any, b: any) { return a < b; },
    '<=': function(a: any, b: any) { return a <= b; }
  }

  /**
   * Adds style to a geoJson Leaflet layer, determined by properties set in the GeoLayerSymbol, or set to a default.
   * @param sp The object being passed with Style Property data.
   */
  public static addStyle(sp: any): any {
    // Convert the symbolShape property (if it exists) to lowercase, needed to work with the third-party npm package ShapeMarker.
    if (sp.symbol.properties.symbolShape) {
      sp.symbol.properties.symbolShape = sp.symbol.properties.symbolShape.toLowerCase();
    }

    // TODO: jpkeahey 2020.08.14 - Classification file might not be the best way to determine whether or not
    // the layer is a categorized polygon
    // The style returned is either for a categorized polygon, and everything else.
    if (sp.symbol.properties.classificationFile) {
      // Before the classification attribute is used, check to see if it exists, and complain if it doesn't.
      if (!sp.feature['properties'][sp.symbol.classificationAttribute]) {
        console.error("The property 'classificationAttribute' value '" + sp.symbol.classificationAttribute +
          "' was not found. Confirm that the specified attribute exists in the layer attribute table." +
          'Using default styling.');
      }

      for (let i = 0; i < sp.results.length; i++) {
        // If the classificationAttribute is a string, check to see if it's the same as the variable returned from Papaparse.
        if (typeof sp.feature['properties'][sp.symbol.classificationAttribute] === 'string' &&
          sp.feature['properties'][sp.symbol.classificationAttribute].toUpperCase() === sp.results[i]['value'].toUpperCase()) {

          return {
            color: this.verify(sp.results[i]['color'], Style.color),
            fillOpacity: this.verify(sp.results[i]['fillOpacity'], Style.fillOpacity),
            opacity: this.verify(sp.results[i]['opacity'], Style.opacity),
            stroke: sp.symbol.properties.outlineColor === "" ? false : true,
            weight: this.verify(parseInt(sp.results[i]['weight']), Style.weight)
          }
        }
        // If the classificationAttribute is a number, compare it with the results.
        else if (sp.feature['properties'][sp.symbol.classificationAttribute] === parseInt(sp.results[i]['value'])) {
          return {
            color: this.verify(sp.results[i]['color'], Style.color),
            fillOpacity: this.verify(sp.results[i]['fillOpacity'], Style.fillOpacity),
            opacity: this.verify(sp.results[i]['opacity'], Style.opacity),
            stroke: sp.symbol.properties.outlineColor === "" ? false : true,
            weight: this.verify(parseInt(sp.results[i]['weight']), Style.weight)
          }
        }
      }

    }
    // Return all possible style properties, and if the layer doesn't have a use for one, it will be ignored.
    else {
      return {
        color: this.verify(sp.symbol.properties.color, Style.color),
        fillColor: this.verify(sp.symbol.properties.fillColor, Style.fillColor),
        fillOpacity: this.verify(sp.symbol.properties.fillOpacity, Style.fillOpacity),
        opacity: this.verify(sp.symbol.properties.opacity, Style.opacity),
        radius: this.verify(parseInt(sp.symbol.properties.symbolSize), Style.size),
        stroke: sp.symbol.properties.outlineColor === "" ? false : true,
        shape: this.verify(sp.symbol.properties.symbolShape, Style.shape),
        weight: this.verify(parseInt(sp.symbol.properties.weight), Style.weight)
      }
    }

  }

  /**
   * Goes through each feature in the selected layer and assigns an arbitrary hex number color to display both on the map
   * and the legend. NOTE: There cannot be more than 16 default colors for the InfoMapper.
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
      if (typeof features[i]['properties'][symbol.classificationAttribute] === 'string') {
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
   * @returns The divContent string with the default HTML to show in the Leaflet popup. Shows properties, converted links,
   * and converted Linux like epoch times into human readable date/times.
   * @param featureProperties The object containing feature properties. May be filtered.
   */
  public static buildDefaultDivContentString(featureProperties: any): string {
    var divContents = '';
    var feature: any;
    // Boolean to show if we've converted any epoch times in the features. Used to add what the + sign means in the popup.
    var converted = false;
    // Boolean to help determine if the current property needs to be converted
    var convertedEpochTime: boolean;

    // Go through each property and write the correct html for displaying
    for (let property in featureProperties) {
      // Reset the converted boolean so the rest of the feature don't have + signs on them
      convertedEpochTime = false;
      // Rename features so the long e.tar... isn't used in many places
      feature = featureProperties[property];
      if (typeof feature == 'string') {
        if (feature.startsWith("http://") || feature.startsWith("https://")) {
          // If the value is a http or https link, convert it to one
          divContents += '<b>' + property + ':</b> ' +
            "<a class='popup-wrap' href='" +
            encodeURI(feature) + "' target=_blank'" +
            "'>" +
            feature +
            "</a>" +
            "<br>";

        } else { // Display a regular non-link string in the popup
          divContents += '<b>' + property + ':</b> ' + feature + '<br>';
        }
      } else { // Display a non-string in the popup
        // This will convert the feature to an ISO 8601 moment
        if (typeof feature === 'number') {
          if (/date|time/i.test(property) && feature > 1000000000) {
            converted = true;
            convertedEpochTime = true;

            divContents += '<b>' + property + ':</b> ' + feature + '<br>';
            feature = MapUtil.convertEpochToFormattedDate(feature);
          }
        }

        if (convertedEpochTime) {
          divContents += '<b>+' + property + '</b>: ' + feature + '<br>';
        } else {
          divContents += '<b>' + property + '</b>: ' + feature + '<br>';
        }

      }
    }
    // Add in the explanation of what the prepended + sign means above
    if (converted) {
      divContents += '<br> <b>+</b> auto-generated values';
    }
    return divContents;
  }

  /**
   * Build the string that will become the HTML to populate the Leaflet popup with feature properties and the possibility
   * of TSGraph & Doc creating bootstrap buttons.
   * @param popupTemplateId The id property from the popup template config file to help ensure HTML id uniqueness
   * @param action The action object from the popup template config file
   * @param layerAttributes An object containing up to 3 arrays for displaying properties for all features in the layer.
   * @param featureProperties All feature properties for the layer.
   * @param firstAction Boolean showing whether the action currently on is the first action, or all others after.
   */
  public static buildPopupHTML(popupTemplateId: string, action: any, layerAttributes: any,
    featureProperties: any, firstAction: boolean, hoverEvent?: boolean): string {

    // VERY IMPORTANT! When the user clicks on a marker, a check is needed to determine if the marker has been clicked on before,
    // and if so, that HTML element needs to be removed so it can be created again. This allows each created button to be
    // referenced specifically for the marker being created.
    if (firstAction !== null) {
      if (L.DomUtil.get(popupTemplateId + '-' + action.label) !== null) {
        L.DomUtil.remove(L.DomUtil.get(popupTemplateId + '-' + action.label));
      }
    }

    // The only place where the original featureProperties object is used. Returns a new, filtered object with only the
    // properties desired from the layerAttributes property in the user created popup config file
    var filteredProperties: any;
    if (hoverEvent === true) {
      filteredProperties = featureProperties;
    } else {
      filteredProperties = MapUtil.filterProperties(featureProperties, layerAttributes);
    }

    // The string to return with all the necessary HTML to show in the Leaflet popup.
    var divContents = '';
    // First action, so show all properties (including the encoding of URL's) and the button for the first action. 
    if (firstAction === true) {
      divContents = MapUtil.buildDefaultDivContentString(filteredProperties);
      // Create the action button (class="btn btn-light btn-sm" creates a nicer looking bootstrap button than regular html can)
      // For some reason, an Angular Material button cannot be created this way.
      divContents += '<br><button class="btn btn-light btn-sm" id="' + popupTemplateId + '-' + action.label +
        '" style="background-color: #c2c1c1">' + action.label + '</button>';
    }
    // The features have already been created, so just add a button with a new id to keep it unique.
    else if (firstAction === false) {
      divContents += '&nbsp&nbsp<button class="btn btn-light btn-sm" id="' + popupTemplateId + '-' + action.label +
        '" style="background-color: #c2c1c1">' + action.label + '</button>';
    }
    // If the firstAction boolean is set to null, then no actions are present in the popup template, and so the default
    // action of showing everything property for the feature is used
    else if (firstAction === null) {
      divContents = MapUtil.buildDefaultDivContentString(filteredProperties);
    }
    return divContents;
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
    switch (imageAnchorPoint.toUpperCase()) {
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

  /**
   * Create Tooltips on the Image Markers of a Leaflet layer dependant on conditional statements that look at (if applicable)
   * event actions from a popup template file and the geoLayerView data from the map configuration file.
   * @param leafletMarker The reference to the Leaflet Marker object that's being created in the layer.
   * @param eventObject The object containing the type of event as the key (e.g. click-eCP) and the entire event object from the
   * popup template file.
   * @param imageGalleryEventActionId The geoLayerView property for determining whether to display the Image Gallery menu in
   * the side bar Leaflet Kebab menu.
   * @param labelText The geoLayerSymbol property for showing a user-defined label in the tooltip instead of default numbering.
   */
  public static createLayerTooltips(leafletMarker: any, eventObject: any, imageGalleryEventActionId: string,
    labelText: string, count: number): void {

    // Check the eventObject to see if it contains any keys in it. If it does, then event actions have been added and can be
    // iterated over to determine if one of them contains an action to display an Image Gallery.
    if (Object.keys(eventObject).length > 0) {
      for (var action of eventObject['click-eCP'].actions) {
        if (action.action && action.action.toUpperCase() === 'DISPLAYIMAGEGALLERY') {
          // By default, if the geoLayerSymbol property labelText is not given, then create the tooltip default labels
          if (!action.featureLabelType || action.featureLabelType.toUpperCase() === 'FEATURENUMBER') {
            leafletMarker.bindTooltip(count.toString(), {
              className: 'feature-label',
              direction: 'bottom',
              permanent: true
            });
          }

        }
      }
    }
    // If a Kebab menu item needs to be added for the Image Gallery, then create the tooltips here.
    else if (imageGalleryEventActionId) {
      if (!labelText) {
        leafletMarker.bindTooltip(count.toString(), {
          className: 'feature-label',
          direction: 'bottom',
          permanent: true
        });
      }

    }

    // if (imageGalleryEventActionId || labelText.toUpperCase() === 'FEATURENUMBER') {

    // }
    // else if (labelText.toUpperCase() === 'ATTRIBUTEVALUE') {
    //   for (let action of eventObject['click-eCP'].actions) {
    //     if (action.id === imageGalleryEventActionId) {
    //       if (action.featureLabelType.toUpperCase() === 'FEATURENUMBER') {
    //         leafletMarker.bindTooltip(count.toString(), {
    //           className: 'feature-label',
    //           direction: 'bottom',
    //           permanent: true
    //         });
    //       }
    //     }
    //   }
    // }

  }

  /**
   * Creates a single band raster layer on the Leaflet map with the necessary debug properties, georaster object, 
   * pixel values to color function, and resolution.
   * @param georaster The georaster-for-leaflet-layer object with data for the raster.
   * @param result The result object from PapaParse after asynchronously reading the CSV classification file.
   * @param symbol The GeoLayerSymbol object from the map configuration file.
   */
  public static createSingleBandRaster(georaster: any, result: any, symbol: IM.GeoLayerSymbol): any {
    var geoRasterLayer = new GeoRasterLayer({
      debugLevel: 2,
      georaster: georaster,
      // Sets the color and opacity of each cell in the raster layer.
      pixelValuesToColorFn: (values: any) => {
        if (values[0] === 0) {
          return undefined;
        }
        // Iterate over each line in the classification file
        for (let line of result.data) {
          // If the Raster layer is a CATEGORIZED layer, then set each color accordingly.
          if (symbol.classificationType.toUpperCase() === 'CATEGORIZED') {
            if (values[0] === parseInt(line.value)) {
              let conversion = MapUtil.hexToRGB(line.fillColor);
  
              return `rgba(${conversion.r}, ${conversion.g}, ${conversion.b}, ${line.fillOpacity})`;
            }
          }
          // If the Raster layer is a GRADUATED layer, then determine what color each value should be under.
          else if (symbol.classificationType.toUpperCase() === 'GRADUATED') {
           
            // If the cell value is no data and either the valueMin or valueMax of the current line from the classification
            // file is no data, set the cell value to the line's values.
            if (MapUtil.isCellValueMissing(values[parseInt(symbol.classificationAttribute) - 1]) === 'no data' &&
                (line.valueMin.toUpperCase() === 'NODATA' || line.valueMax.toUpperCase() === 'NODATA')) {

              let conversion = MapUtil.hexToRGB(line.fillColor);

              return `rgba(${conversion.r}, ${conversion.g}, ${conversion.b}, ${line.fillOpacity})`;
            }
            // This is the default if there is no 'Nodata' value in the classification value, which is full cell transparency.
            else if (MapUtil.isCellValueMissing(values[parseInt(symbol.classificationAttribute) - 1]) === 'no data') {
              continue;
            } else {
              var valueObj = MapUtil.determineValueOperator(line.valueMin, line.valueMax);
              // The valuMin and valueMax are numbers, so check if the value from the raster cell is between the two, with
              // inclusiveness and exclusiveness being determined by the number type. Use the readonly variable operators with
              // the min and max operators to determine what should be used, with the value from the cell and the
              // valueMin/valueMax as the parameters for the function.
              if (MapUtil.operators[valueObj.minOp](values[parseInt(symbol.classificationAttribute) - 1], valueObj.valueMin) &&
                  MapUtil.operators[valueObj.maxOp](values[parseInt(symbol.classificationAttribute) - 1], valueObj.valueMax)) {

                let conversion = MapUtil.hexToRGB(line.fillColor);
  
                return `rgba(${conversion.r}, ${conversion.g}, ${conversion.b}, ${line.fillOpacity})`;
              }
            }
          }
        }

        for (let line of result.data) {
          if (line.value === '*') {
            if (line.fillColor && !line.fillOpacity) {
              let conversion = MapUtil.hexToRGB(line.fillColor);

              return `rgba(${conversion.r}, ${conversion.g}, ${conversion.b}, 0.7)`;
            } else if (!line.fillColor && line.fillOpacity) {
              return `rgba(0, 0, 0, ${line.fillOpacity})`;
            } else
              return `rgba(0, 0, 0, 0.6)`;
          }
        }
      },
      resolution: symbol.properties.rasterResolution ? parseInt(symbol.properties.rasterResolution) : 64
    });
    return geoRasterLayer;
  }

  /**
   * Creates a multi-band raster layer on the Leaflet map with the necessary debug properties, georaster object, 
   * custom drawing function, and resolution.
   * @param georaster The georaster-for-leaflet-layer object with data for the raster.
   * @param result The result object from PapaParse after asynchronously reading the CSV classification file.
   * @param symbol The GeoLayerSymbol object from the map configuration file.
   */
  public static createMultiBandRaster(georaster: any, geoLayerView: any, result: any, symbol: any): any {

    var classificationAttribute = symbol.classificationAttribute;
    // Check the classificationAttribute to see if it is a number, and if not, log the error.
    if (classificationAttribute && isNaN(classificationAttribute)) {
      console.error('The GeoLayerSymbol property \'classificationAttribute\' must be a number representing which band\'s ' +
        'cell value is desired for displaying a Raster layer. Using the first band by default (This will probably not show on the map)');
      classificationAttribute = '1';
    }
    // If the classificationAttribute is a number but smaller or larger than the number of bands in the raster, log the error.
    else if (!isNaN(classificationAttribute)) {
      if (parseInt(classificationAttribute) < 1 || parseInt(classificationAttribute) > georaster.numberOfRasters) {
        console.error('The geoRaster with geoLayerId \'' + geoLayerView.geoLayerId + '\' contains ' + georaster.numberOfRasters +
          ' bands, but the \'classificationAttribute\' property was given the number ' + parseInt(classificationAttribute) +
          '. Using the first band by default (This will probably not show on the map)');
      }
    }

    var geoRasterLayer = new GeoRasterLayer({
      debugLevel: 2,
      georaster: georaster,
      // Create a custom drawing scheme for the raster layer. This might overwrite pixelValuesToColorFn().
      customDrawFunction: ({ context, values, x, y, width, height }) => {

        for (let line of result.data) {
          // If the Raster layer is a CATEGORIZED layer, then set each color accordingly.
          if (symbol.classificationType.toUpperCase() === 'CATEGORIZED') {
            // Use the geoLayerSymbol attribute 'classificationAttribute' to determine what band is being used for
            // the coloring of the raster layer. Convert both it and the values index to a number.
            if (values[parseInt(classificationAttribute) - 1] === parseInt(line.value)) {
              let conversion = MapUtil.hexToRGB(line.fillColor);

              context.fillStyle = `rgba(${conversion.r}, ${conversion.g}, ${conversion.b}, ${line.fillOpacity})`;
              context.fillRect(x, y, width, height);
            }
            // If the out of range attribute asterisk (*) is used, use its fillColor.
            else if (line.value === '*') {
              if (line.fillColor && !line.fillOpacity) {
                let conversion = MapUtil.hexToRGB(line.fillColor);
  
                context.fillStyle = `rgba(${conversion.r}, ${conversion.g}, ${conversion.b}, 0.7)`;
                context.fillRect(x, y, width, height);
              } else if (!line.fillColor && line.fillOpacity) {
                context.fillStyle = `rgba(0, 0, 0, ${line.fillOpacity})`;
                context.fillRect(x, y, width, height);
              } else {
                context.fillStyle = `rgba(0, 0, 0, 0.6)`;
                context.fillRect(x, y, width, height);
              }
            }
            // If the no data value is present, make the cell invisible.
            else {
              context.fillStyle = `rgba(0, 0, 0, 0)`;
              context.fillRect(x, y, width, height);
            }
          }
          // If the Raster layer is a GRADUATED layer, then determine what color each value should be under.
          else if (symbol.classificationType.toUpperCase() === 'GRADUATED') {
            // If the cell value is no data and either the valueMin or valueMax of the current line from the classification
            // file is no data, set the cell value to the line's values.
            if (MapUtil.isCellValueMissing(values[parseInt(symbol.classificationAttribute) - 1]) === 'no data' &&
                (line.valueMin.toUpperCase() === 'NODATA' || line.valueMax.toUpperCase() === 'NODATA')) {

              let conversion = MapUtil.hexToRGB(line.fillColor);

              return `rgba(${conversion.r}, ${conversion.g}, ${conversion.b}, ${line.fillOpacity})`;
            }
            // This is the default if there is no 'Nodata' value in the classification value, which is full cell transparency.
            else if (MapUtil.isCellValueMissing(values[parseInt(symbol.classificationAttribute) - 1]) === 'no data') {
              continue;
            } else {
              var valueObj = MapUtil.determineValueOperator(line.valueMin, line.valueMax);
              // The valuMin and valueMax are numbers, so check if the value from the raster cell
              // is between the two, with inclusiveness and exclusiveness being determined by the number type. Use the readonly
              // variable operators with the min and max operators to determine what should be used, with the value from the cell
              // and the valueMin/valueMax as the parameters for the function.
              if (MapUtil.operators[valueObj.minOp](values[parseInt(symbol.classificationAttribute) - 1], valueObj.valueMin) &&
                  MapUtil.operators[valueObj.maxOp](values[parseInt(symbol.classificationAttribute) - 1], valueObj.valueMax)) {

                let conversion = MapUtil.hexToRGB(line.fillColor);
  
                context.fillStyle = `rgba(${conversion.r}, ${conversion.g}, ${conversion.b}, ${line.fillOpacity})`;
                context.fillRect(x, y, width, height);
              }
            }
            // If the out of range attribute asterisk (*) is used, use its fillColor.
            if (line.valueMin === '*' || line.valueMax === '*') {
              if (line.fillColor && !line.fillOpacity) {
                let conversion = MapUtil.hexToRGB(line.fillColor);
  
                context.fillStyle = `rgba(${conversion.r}, ${conversion.g}, ${conversion.b}, 0.7)`;
                context.fillRect(x, y, width, height);
              } else if (!line.fillColor && line.fillOpacity) {
                context.fillStyle = `rgba(0, 0, 0, ${line.fillOpacity})`;
                context.fillRect(x, y, width, height);
              } else {
                context.fillStyle = `rgba(0, 0, 0, 0.6)`;
                context.fillRect(x, y, width, height);
              }
            }
            // If the values are not in between
            else {
              context.fillStyle = `rgba(0, 0, 0, 0)`;
              context.fillRect(x, y, width, height);
            }
          }
          
        }
      },
      // If the geoLayerSymbol has a rasterResolution property, then convert from string to number and use it.
      resolution: symbol.properties.rasterResolution ? parseInt(symbol.properties.rasterResolution) : 64
    });
    return geoRasterLayer;
  }

  /**
   * @returns An object representing what the current cell's valueMin, valueMax, and valueMin & valueMax operators. Used for
   * deciding what operators to look between the values.
   * @param min The valueMin property of one line from the CSV classification file for Graduated layers.
   * @param max The valueMax property of one line from the CSV classification file for Graduated layers.
   */
  private static determineValueOperator(min: string, max: string): any {

    var valueMin: any = null;
    var valueMax: any = null;
    var minOp: IM.Operator = null;
    var maxOp: IM.Operator = null;
    var minOpPresent = false;
    var maxOpPresent = false;

    // Check to see if either of them are actually positive or negative infinity.
    if (min.toUpperCase().includes('-INFINITY')) {
      valueMin = Number.MIN_SAFE_INTEGER;
      minOp = IM.Operator.gt;
    }
    if (max.toUpperCase().includes('INFINITY')) {
      valueMax = Number.MAX_SAFE_INTEGER;
      maxOp = IM.Operator.lt;
    }

    // Contains operator
    if (min.includes(IM.Operator.gt)) {
      valueMin = parseInt(min.replace(IM.Operator.gt, ''));
      minOp = IM.Operator.gt;
      minOpPresent = true;
    }
    if (min.includes(IM.Operator.gtet)) {
      valueMin = parseInt(min.replace(IM.Operator.gtet, ''));
      minOp = IM.Operator.gtet;
      minOpPresent = true;
    }
    if (min.includes(IM.Operator.lt)) {
      valueMin = parseInt(min.replace(IM.Operator.lt, ''));
      minOp = IM.Operator.lt;
      minOpPresent = true;
    }
    if (min.includes(IM.Operator.ltet)) {
      valueMin = parseInt(min.replace(IM.Operator.ltet, ''));
      minOp = IM.Operator.ltet;
      minOpPresent = true;
    }

    // Contains operator
    if (max.includes(IM.Operator.gt)) {
      valueMax = parseInt(max.replace(IM.Operator.gt, ''));
      maxOp = IM.Operator.gt;
      maxOpPresent = true;
    }
    if (max.includes(IM.Operator.gtet)) {
      valueMax = parseInt(max.replace(IM.Operator.gtet, ''));
      maxOp = IM.Operator.gtet;
      maxOpPresent = true;
    }
    if (max.includes(IM.Operator.lt)) {
      valueMax = parseInt(max.replace(IM.Operator.lt, ''));
      maxOp = IM.Operator.lt;
      maxOpPresent = true;
    }
    if (max.includes(IM.Operator.ltet)) {
      valueMax = parseInt(max.replace(IM.Operator.ltet, ''));
      maxOp = IM.Operator.ltet;
      maxOpPresent = true;
    }

    // If no operator is detected in the valueMin property.
    if (minOpPresent === false) {
      valueMin = parseFloat(min);
      minOp = IM.Operator.gt;
    }
    // If no operator is detected in the valueMax property.
    if (maxOpPresent === false) {
      valueMax = parseFloat(max);
      maxOp = IM.Operator.ltet;
    }

    // The following two if, else if statements are done if only a number is given as valueMin and valueMax.
    // If the min is an integer or float.
    // if (MapUtil.isInt(min)) {
    //   valueMin = parseInt(min);
    //   minOp = IM.Operator.gtet;
    // } else if (MapUtil.isFloat(min)) {
    //   valueMin = parseFloat(min);
    //   minOp = IM.Operator.gt;
    // }
    
    // If the max is an integer or float.
    // if (MapUtil.isInt(max)) {
    //   valueMax = parseInt(max);
    //   maxOp = IM.Operator.ltet;
    // } else if (MapUtil.isFloat(max)) {
    //   valueMax = parseFloat(max);
    //   maxOp = IM.Operator.ltet;
    // }

    // Each of the attributes below have been assigned; return as an object.
    return {
      valueMin: valueMin,
      valueMax: valueMax,
      minOp: minOp,
      maxOp: maxOp
    }
    
  }

  /**
   * Takes care of displaying one or more raster cell's data in the upper left popup div on the Leaflet map. 
   * @param e The Event object from Leaflet.
   * @param georaster The georaster object returned from the georaster-layer-for-leaflet & geoblaze function.
   * @param geoLayerView An InfoMapper GeoLayerView object with data from the raster's geoLayerView in the map config file.
   * @param originalDivContents A string representing the current layer's name and default <hr> and text, displayed at the bottom.
   * @param layerItem The layerItem instance to help determine if a layer is currently visible on the map.
   * @param symbol An InfoMapper GeoLayerSymbol object from the map config file to decide what the classificationAttribute is,
   * and therefore what raster band is being used for the cell value to display.
   */
  public static displayMultipleHTMLRasterCells(e: any, georaster: any, geoLayerView: IM.GeoLayerView, originalDivContents: string,
                                                layerItem: MapLayerItem, symbol: IM.GeoLayerSymbol): void {

    /**
     * The instance of the MapLayerManager, a helper class that manages MapLayerItem objects with Leaflet layers
     * and other layer data for displaying, ordering, and highlighting.
     */
    var mapLayerManager: MapLayerManager = MapLayerManager.getInstance();
    // console.log(mapLayerManager.displayedLayers());

    let div = L.DomUtil.get('title-card');
    // var originalDivContents: string = div.innerHTML;
    // If the raster layer is not currently being displayed on the map, then don't show anything over a hover.
    if (layerItem.isDisplayedOnMainMap() === false) {
      return;
    }
    // Check with the MapLayerManager to see if there are any vector layers currently being shown on the map.
    // If there are, and the raster is not being moused over, then don't do anything with the hover event.
    else if (mapLayerManager.isVectorDisplayed()) {
      const latlng = [e.latlng.lng, e.latlng.lat];
      const results = geoblaze.identify(georaster, latlng);
      if (results === null) {
        // NOTE: This creates a tiny issue where if both a vector and raster are displayed, mousing out of
        // the raster will not reset the Leaflet Control div.
        // div.innerHTML = originalDivContents;
        return;
      }
    }
    
    var divContents = '';
    var split1: string[];
    var divEnd: string;
    // If the amount of displayed Raster layers on the map is one, restart all the HTML after the point-info <p> tag.
    if (mapLayerManager.displayedRasterLayers() === 1) {
      split1 = div.innerHTML.split('<hr class="normal-hr">');
      divEnd = '<hr class="normal-hr"/>' + split1[split1.length - 1];
      split1 = div.innerHTML.split('<hr class="small-hr">');
      // Iterate over all layers on the map, and if a layer is both a raster and not dislayed on the map, remove it from the
      // currentRasterLayers object that keeps track of raster layers for displaying their info in the div.
      var allMapLayers = mapLayerManager.getMapLayers();
      for (let geoLayerId in allMapLayers) {
        if (allMapLayers[geoLayerId].isRasterLayer() === true && allMapLayers[geoLayerId].isDisplayedOnMainMap() === false) {
          delete MapUtil.currentRasterLayers[geoLayerId];
        }
      }
    } else {
      split1 = div.innerHTML.split('<hr class="normal-hr">');
      divEnd = '<hr class="normal-hr"/>' + split1[split1.length - 1];
    }
    
    split1 = div.innerHTML.split('<hr class="normal-hr">');
    
    divContents += split1[0];

    const latlng = [e.latlng.lng, e.latlng.lat];
    const results = geoblaze.identify(georaster, latlng);
    var cellValue: number;
    // The classificationAttribute needs to be set as the band that needs to be displayed in the Leaflet
    // upper-left Control on the map. If it isn't, it will display undefined.
    if (results !== null) {
      cellValue = results[parseInt(symbol.classificationAttribute) - 1];
      // Now that the cellValue has been determined, check if the current raster layer's geoLayerId is in the currentRasterLayers
      // object as a key. If it is not, or the cellValue has changed since the last time this event function was called, update
      // the object that's given as the value in the currentRasterLayers object.
      if (!(geoLayerView.geoLayerId in MapUtil.currentRasterLayers) ||
      MapUtil.currentRasterLayers[geoLayerView.geoLayerId]['cellValue'] !== cellValue) {
        MapUtil.currentRasterLayers[geoLayerView.geoLayerId] = {
          cellValue: cellValue,
          geoLayerName: geoLayerView.name
        };
      }
    }

    // If the results of the currentRasterLayer are null, remove it from the currentRasterLayers object, then check to see if
    // there's still a raster layer event object left.
    if (results === null) {
      delete MapUtil.currentRasterLayers[geoLayerView.geoLayerId];
      // If there is another event object, iterate through and write it out to the div.innerHTML string;
      if (Object.keys(MapUtil.currentRasterLayers).length > 0) {
        var first = true;
        for (let key of Object.keys(MapUtil.currentRasterLayers)) {
          if (divContents.includes('small-hr') && first === true) {
            divContents = divContents.substring(0, divContents.indexOf('<hr'));
            first = false;
          }
          divContents += '<hr class="small-hr">Raster: ' +
          MapUtil.currentRasterLayers[key]['geoLayerName'] + '<br>' +
          '<b>Cell Value:</b> ' +
          MapUtil.isCellValueMissing(MapUtil.currentRasterLayers[key]['cellValue']);
        }
        div.innerHTML = divContents + divEnd;
        return;
      }
      // If there's nothing left in the currentRasterLayers object
      else {
        div.innerHTML = originalDivContents;
      }
    }
    // If the mouse is currently hovering over the same cell as before, don't do anything. This was commented out as it was
    // not working as intended. It actually works better without it.
    // else if (div.innerHTML.includes('<b>Cell Value:</b> ' + MapUtil.isCellValueMissing(cellValue))) {
      
    //   return;
    // }
    // If the results are different, update the divContents accordingly.
    else {
      var first = true;
      // Iterate through each raster layer in the currentRasterLayers object, and add one's information to the div's
      // innerHTML string.
      for (let key of Object.keys(MapUtil.currentRasterLayers)) {
        if (divContents.includes('small-hr') && first === true) {
          divContents = divContents.substring(0, divContents.indexOf('<hr'));
          first = false;
        }
        divContents += '<hr class="small-hr">Raster: ' +
        MapUtil.currentRasterLayers[key]['geoLayerName'] + '<br>' +
        '<b>Cell Value:</b> ' +
        MapUtil.isCellValueMissing(MapUtil.currentRasterLayers[key]['cellValue']);
      }
      // NOTE: Older way of showing the raster HTML innerHTML string, and possibly more stable than the current code.
      // if (divContents.includes('small-hr')) {
      //   divContents = divContents.substring(0, divContents.indexOf('<hr'));
      // }
      // divContents += '<hr class="small-hr">Raster: ' +
      // geoLayerView.name + '<br>' +
      // '<b>Cell Value:</b> ' +
      // MapUtil.isCellValueMissing(cellValue) +
      // '<hr class="normal-hr"/>' +
      // split[1];

      // Tack on the bottom <hr> divider and the rest of the split string from before. Use split.length - 1 to always get the
      // last element in the split string.
      div.innerHTML = divContents + divEnd;
    }
  }

  /**
   * Takes an object and filters it down to a newly created smaller object by filtering down by the provided layerAttributes
   * object. This is retrieved from the popup config file provided by a user
   * @param featureProperties The original feature Properties object taken from the feature
   * @param layerAttributes The object containing rules, regex, and general instructions for filtering out properties
   */
  public static filterProperties(featureProperties: any, layerAttributes: any): any {

    var included: string[] = layerAttributes.include;
    var excluded: string[] = layerAttributes.exclude;
    var filteredProperties: any = {};
    // This is 'default', but the included has an asterisk wildcard to include every property
    if ((included.includes('*') && excluded.length === 0) || (included.length === 0 && excluded.length === 0)) {
      return featureProperties;
    }
    // If the include array has the wildcard asterisk and we're here, then the excluded array has at least one element,
    // so iterate over the original featureProperties object and skip any keys in the excluded array
    else if (included.includes('*') || included.length === 0) {
      for (const key in featureProperties) {
        if (excluded.includes(key)) {
          continue;
        }
        // else if () {

        // }
        else {
          filteredProperties[key] = featureProperties[key];
        }
      }
      return filteredProperties;
    }
    // If the included array does not have a wildcard, but contains more than one element, then assume that every property of the
    // feature is excluded EXCEPT whatever is given in the included array, and display those
    else if ((included.length > 0 && excluded.length === 0) || (included.length > 0 && excluded.includes('*'))) {
      // This iterates over the included array so that they can be added in the order given to the filteredProperties array
      // This way the properties can be displayed in the order they were given in the HTML and Leaflet popup
      for (const elem of included) {
        if (elem in featureProperties) {
          filteredProperties[elem] = featureProperties[elem];
        }
        // else if (elem.substring(1).includes("*")) {

        // }
      }
      return filteredProperties;
    }

  }

  /**
   * 
   * @param keys 
   * @param features 
   */
  public static formatAllFeatures(keys: string[], features: any[]): any {

    // var featureIndex = 0;
    // var propertyIndex = 0;

    // for (let property in features[0].properties) {
    //   if (typeof features[0].properties[property] === 'number') {
    //     if (/date|time/i.test(property) && features[0].properties[property] > 100000000 ) {

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
        for (let i = 0; i < colorTable.length; i++) {
          if (colorTable[i] == strVal) {
            color = colorTable[i + 1];
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
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
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
   * 
   * @param cellValue 
   */
  public static isCellValueMissing(cellValue: number): number | string {

    let nodataValueMin = MapUtil.missingValue - .000001;
    let nodataValueMax = MapUtil.missingValue + .000001;

    if ((cellValue >= nodataValueMin) && (cellValue <= nodataValueMax)) {
      return 'no data';
    }
    else {
      return cellValue;
    }
  }

  /**
   * @returns True if the given @var num is an integer number, and false otherwise.
   * @param num The number to be tested as an integer value.
   */
  public static isInt(num: any): boolean {
    return Number(num) === parseInt(num) && Number(num) % 1 === 0;
  }

  /**
   * @returns True if the given @var num is a floating point number, and false otherwise.
   * @param num The number to be tested as a floating point number.
   */
  public static isFloat(num: any): boolean {
    return Number(num) === parseFloat(num) && Number(num) % 1 !== 0;
  }

  /**
   * While the end of the value string from the graph template file hasn't ended yet, look for the '${' start
   * that we need and build the property, adding it to the propertyArray when we've detected the end of the
   * property. Find each one in the value until the value line is done.
   * @param key In order to provide a better console warning, we bring the key from replaceProperties()
   * @param value The line being read from the graph template file that contains the ${ } property.
   * @param featureProperties The object containing the feature's key and value pair properties.
   * @returns the entire line read in, with all ${property} notation converted to the correct  
   */
  public static obtainPropertiesFromLine(line: string, featureProperties: Object, key?: any, labelProp?: boolean): string {

    var propertyString = '';
    var currentIndex = 0;
    var formattedLine = '';
    var featureValue = '';
    // Go through the entire line
    while (currentIndex < line.length) {
      // Check to see if the string at the current index and the next index exists, and if they are equal to '${'
      if (line[currentIndex] && line[currentIndex + 1] && line[currentIndex] === '$' && line[currentIndex + 1] === '{') {
        currentIndex = currentIndex + 2;
        // A property notation has been found. Move the current index up by 2 and now go through the line that contains a property
        // until an ending '}' is found.
        for (let i = currentIndex; i < line.length; i++) {
          if (line[i] !== '}') {
            propertyString += line[i];
            currentIndex++;
          } else if (line[i] === '}') {
            currentIndex++;
            break;
          }
        }
        // You have gone through everything inside the ${property} format and gotten the string. Split by the colon and now we
        // have our true property. I might have to use the throwaway variable later, which is the featureAttribute string.
        let splitArr = propertyString.split(':');
        var prop: string;
        if (splitArr.length === 1) {
          prop = propertyString.split(':')[0];
        } else {
          let throwaway = propertyString.split(':')[0];
          prop = propertyString.split(':')[1];
        }
        
        featureValue = featureProperties[prop];

        if (prop === undefined) {
          console.warn('A property of the [' + key + '] attribute in the graph template file is incorrectly formatted. ' +
            'This might cause an error in retrieving the graph, or other unintended output on the graph.');
        }
        // If the featureValue is undefined, then the property given after the colon (:) does not exist on the feature. Let
        // the user know in a warning and return the ${property} that was given by the user so it's obvious there's an issue.
        if (featureValue === undefined) {
          console.warn('The featureAttribute property "' + prop + '" does not exist in the feature. Confirm the spelling ' +
            'and punctuation of the attribute is correct.');
          formattedLine += '${' + propertyString + '}';
          propertyString = '';
          continue;
        }
        // If the property is for a graduated label property, check to see if any operators need to be removed.
        if (labelProp === true) {
          if (featureValue.includes('=')) {
            featureValue = featureValue.substring(featureValue.indexOf('=') + 1);
          }
          if (featureValue.includes('>')) {
            featureValue = featureValue.replace('>', '');
          }
          if (featureValue.includes('<')) {
            featureValue = featureValue.replace('<', '');
          }
        }

        // This looks for all the content inside two soft parentheses
        var regExp = /\(([^)]+)/;
        // Iterate over the currently implemented property functions that OWF is supporting, which is being organized in the
        // PropFunction enum at the end of this file
        for (const propFunction of Object.values(PropFunction)) {
          // We're at the index after the ${} property, so check to see if it is immediately followed by a PropFunction string
          if (line.substring(currentIndex).startsWith(propFunction)) {
            // Use the regExp variable above to get all contents between the parens, check if null - no parameters were given
            // in the PropFunction - and run the appropriate function
            if (regExp.exec(line.substring(currentIndex)) !== null) {
              featureValue = MapUtil.runPropFunction(featureValue, propFunction, regExp.exec(line.substring(currentIndex))[1]);
            } else {
              featureValue = MapUtil.runPropFunction(featureValue, propFunction);
            }
            // Set the current index to the letter after the function parenthesis e.g. replace(...) <----
            // Use the currentIndex as the start of the search for the index of ')', for chaining functions
            currentIndex = line.indexOf(')', currentIndex) + 1;
          }
        }
        // Add the possibly manipulated featureValue to the formattedLine string that will be returned
        formattedLine += featureValue;
        propertyString = '';
      }
      // The first conditional was not met, so the current and next letters of the line are not '${'. Double check to make sure
      // the current letter exists, 
      if (line[currentIndex] !== undefined) {
        formattedLine += line[currentIndex];
        currentIndex++;
      }
    }
    // The while loop is finished; the entire line has been iterated over, and the variable formattedLine has been rewritten
    // to replace all the ${property} notation with the correct feature value
    return formattedLine;
  }

  /**
   * This is a recursive function that goes through an object and replaces any value in
   * it that contains the ${property} notation with the actual property needed.
   * @param templateObject The object that will have its property notation expanded
   * @param featureProperties The properties in the selected feature on the map layer.
   */
  public static replaceProperties(templateObject: Object, featureProperties: Object): Object {

    for (var key in templateObject) {
      var value = templateObject[key];
      if (typeof value === 'object') {
        this.replaceProperties(value, featureProperties);
      } else {
        if (value.includes("${")) {
          let formattedValue = this.obtainPropertiesFromLine(value, featureProperties, key);

          try {
            templateObject[key] = formattedValue;
          } catch (e) {
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
      divContents += ('<hr class="normal-hr"/>' + '<p><i>' + instruction + '</i></p>');
    }
    div.innerHTML = divContents;
  }

  /**
   * Run the appropriate PropFunction function that needs to be called on the ${} property value
   * @param featureValue The property value that needs to be manipulated
   * @param propFunction The PropFunction enum value to determine which implemented function needs to be called
   * @param args The optional arguments found in the parens of the PropFunction as a string
   */
  public static runPropFunction(featureValue: string, propFunction: PropFunction, args?: string): string {
    switch (propFunction) {
      case PropFunction.toMixedCase:
        var featureArray = featureValue.toLowerCase().split(' ');
        var finalArray = [];

        for (let word of featureArray) {
          finalArray.push(word[0].toUpperCase() + word.slice(1));
        }
        return finalArray.join(' ');

      case PropFunction.replace:
        var argArray: string[] = [];
        for (let arg of args.split(',')) {
          argArray.push(arg.trim().replace(/\'/g, ''));
        }

        if (argArray.length !== 2) {
          console.warn('The function \'.replace()\' must be given two arguments, the searched for pattern and the replacement ' +
            'for the pattern e.g. .replace(\' \', \'\')');
          return featureValue;
        } else {
          // Create a new regular expression object with the pattern we want to find (the first argument) and g to replace
          // globally, or all instances of the found pattern
          var regex = new RegExp(argArray[0], 'g');
          return featureValue.replace(regex, argArray[1]);
        }
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
  public static updateFeature(e: any, _this: any, geoLayer: any, symbol: any,
    geoLayerViewGroup: any, i: any, layerAttributes?: any): void {

    // First check if the geoLayerView of the current layer that's being hovered over has its enabledForHover property set to
    // false. If it does, skip the entire update of the div string and just return.
    if (geoLayerViewGroup.geoLayerViews[i].properties.enabledForHover &&
        geoLayerViewGroup.geoLayerViews[i].properties.enabledForHover.toUpperCase() === 'FALSE') {
      return;
    }

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
    var featureProperties: any;
    if (layerAttributes) {
      featureProperties = this.filterProperties(e.target.feature.properties, layerAttributes);
    } else {
      featureProperties = e.target.feature.properties;
    }

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
      // the feature can be before it's cut off to prevent the mouseover popup from getting too wide.
      var longestAllowableName = lineMaxLength - prop.length;

      if (typeof feature === 'number') {
        // If the feature is a number, check to see if either date or time is in the key, then check the number to see if it's
        // very large. If it is, we probably have a date and can convert to an ISO string.
        if (/date|time/i.test(prop) && feature > 1000000000) {
          // The feature has been converted, so change to true
          convertedEpochTime = true;
          converted = true;
          // Write the original feature and property first.
          divContents += '<b>' + prop + '</b>' + ': ' + feature + '<br>';
          // Convert the feature to the desired format
          feature = MapUtil.convertEpochToFormattedDate(feature);
        }
      }
      // Make sure the feature length is not too long. If it is, truncate it.
      if (feature !== null && feature.length > longestAllowableName) {
        feature = feature.substring(0, longestAllowableName) + '...';
      }
      // If the conversion occurred above, feature has been changed and needs to be added to the popup. If it hasn't, feature
      // is the same as it was when read in, and can just be added to the popup.
      if (convertedEpochTime) {
        divContents += '<b>+' + prop + '</b>: ' + feature + '<br>';
      } else {
        divContents += '<b>' + prop + '</b>: ' + feature + '<br>';
      }

    }
    // Add in the explanation of what the prepended + sign means above.
    if (converted) {
      divContents += '<br> <b>+</b> auto-generated values<br>';
    }

    if (instruction != "") {
      divContents += ('<hr class="normal-hr"/>' + '<p><i>' + instruction + '</i></p>');
    }
    // Once all properties are added to divContents, display them.
    div.innerHTML = divContents;
  }

  /**
   * Confirms that the given style option is correct, and if not, given a default so the map can still be displayed
   * @param styleProperty 
   * @param styleType 
   */
  public static verify(styleProperty: any, style: Style): any {
    // The property exists, so return it to be used in the style
    // TODO: jpkeahey 2020.06.15 - Maybe check to see if it's a correct property?
    if (styleProperty) {
      return styleProperty;
    }
    // The property does not exist, so return a default value.
    else {
      switch (style) {
        case Style.color: return 'gray';
        case Style.fillOpacity: return '0.2';
        case Style.fillColor: return 'gray';
        case Style.opacity: return '1.0';
        case Style.size: return 6;
        case Style.shape: return 'circle';
        case Style.weight: return 3;
      }
    }
  }

  /**
   * Takes a lengthy URL to display on a Leaflet popup and shortens it to a reasonable size.
   * @param url The original URL to truncate.
   * @param newLength The length of the maximum size for the truncated string in letters.
   * NOTE: This function is no longer used, as a CSS solution was found as a better and more consistent way of line breaking.
   */
  public static x_truncateString(url: string, newLength: number): string {
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
    switch (newLength) {
      case 40:
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
        for (let i = 0; i < newLength; i++) {
          if (i < url.length - 2) {
            truncatedURL += url[i];
          } else break;
        }
        truncatedURL += '...';

        return truncatedURL;
    }

  }

}

/**
 * Enum with the currently supported InfoMapper style properties.
 */
export enum Style {
  color,
  fillOpacity,
  fillColor,
  opacity,
  size,
  shape,
  weight
}

/**
 * Enum with the currently supported ${Property} functions.
 */
export enum PropFunction {
  toMixedCase = '.toMixedCase(',
  replace = '.replace('
}

/**
 * e, _this, geoLayer, symbol, geoLayerViewGroup, i
 */
export interface LeafletEvent {
  event?: any;
  mapCompRef?: any;
  geoLayer?: any;
  geoLayerViewGroup?: any;
  index?: number;
  symbol?: any;
}

