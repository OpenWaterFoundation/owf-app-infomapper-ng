import { AfterViewInit,
          Component,
          ComponentFactoryResolver,
          OnDestroy,
          ViewChild,
          ViewContainerRef,
          ViewEncapsulation }        from '@angular/core';
import { ActivatedRoute }            from '@angular/router';
import { MatDialog,
         MatDialogRef,
         MatDialogConfig }           from '@angular/material/dialog';
import { MatSlideToggleChange }      from '@angular/material/slide-toggle';
         
import { forkJoin, Subscription }    from 'rxjs';
import { take }                      from 'rxjs/operators';

import { BackgroundLayerComponent }  from './background-layer-control/background-layer.component';
import { DialogPropertiesComponent } from './dialog-content/dialog-properties/dialog-properties.component';
import { DialogTSGraphComponent }    from './dialog-content/dialog-TSGraph/dialog-TSGraph.component';
import { DialogTextComponent }       from './dialog-content/dialog-text/dialog-text.component';
import { SidePanelInfoComponent }    from './sidepanel-info/sidepanel-info.component';
import { DialogDocComponent }        from './dialog-content/dialog-doc/dialog-doc.component';
import { DialogDataTableComponent }  from './dialog-content/dialog-data-table/dialog-data-table.component';
import { DialogGapminderComponent }  from './dialog-content/dialog-gapminder/dialog-gapminder.component';
import { DialogGalleryComponent }    from './dialog-content/dialog-gallery/dialog-gallery.component';

import { BackgroundLayerDirective }  from './background-layer-control/background-layer.directive';
import { SidePanelInfoDirective }    from './sidepanel-info/sidepanel-info.directive';

import { AppService,
          PathType }                 from '../app.service';
import { MapService }                from './map.service';
import { MapLayerManager }           from './map-layer-manager';
import { MapLayerItem }              from './map-layer-item';
import { WindowManager,
          WindowType }               from './window-manager';
import { MapUtil,
          Style }                    from './map.util';
import { MapManager }                from './map-manager';

import * as $                        from 'jquery';
import * as Papa                     from 'papaparse';
import * as GeoRasterLayer           from 'georaster-layer-for-leaflet';
import * as parse_georaster          from 'georaster';
// Needed to use leaflet L class
declare var L: any;


@Component({
  selector: 'app-map',
  styleUrls: ['./map.component.css'],
  templateUrl: './map.component.html',
  encapsulation: ViewEncapsulation.None
})
export class MapComponent implements AfterViewInit, OnDestroy {

  /**
   * ViewChild is used to inject a reference to components. This provides a reference to the html element
   * <ng-template background-layer-hook></ng-template> found in map.component.html. The following are used for dynamically
   * creating elements in the application. Dynamic elements are being added in a manner similar to the following Angular
   * tutorial: https://angular.io/guide/dynamic-component-loader 
   */
  @ViewChild(BackgroundLayerDirective) backgroundLayerComp: BackgroundLayerDirective;
  /**
   * This provides a reference to <ng-template side-panel-info-host></ng-template> in map.component.html
   */
  @ViewChild(SidePanelInfoDirective, { static: true }) InfoComp: SidePanelInfoDirective;
  /**
   * Global value to access container ref in order to add and remove sidebar info components dynamically.
   */
  public infoViewContainerRef: ViewContainerRef;
  /**
   * Class variable to access container ref in order to add and remove map layer component dynamically.
   */
  public layerViewContainerRef: ViewContainerRef;
  /**
   * Global value to access container ref in order to add and remove background layer components dynamically.
   */
  public backgroundViewContainerRef: ViewContainerRef;
  /**
   * Global value to access container ref in order to add and remove symbol descriptions components dynamically.
   */
  public legendSymbolsViewContainerRef: ViewContainerRef;
  /**
   * The reference for the Leaflet map.
   */
  public mainMap: any;
  /**
   * A variable to keep track of whether or not the leaflet map has already been initialized. This is useful for resetting
   * the page and clearing the map using map.remove() which can only be called on a previously initialized map.
   */
  public mapInitialized: boolean = false; 
  /**
   * The current map's ID from the app configuration file
   */
  public mapID: string;
  /**
   * Boolean to indicate whether the sidebar has been initialized. Don't need to waste time/resources initializing sidebar twice,
   * but rather edit the information in the already initialized sidebar.
   */
  public sidebar_initialized: boolean = false;
  /**
   * An array to hold sidebar layer components to easily remove later, when resetting the sidebar.
   */
  public sidebar_layers: any[] = [];
  /**
   * An array to hold sidebar background layer components to easily remove later, when resetting the sidebar.
   */
  public sidebar_background_layers: any[] = [];
  /**
   * Time interval used for resetting the map after a specified time, if defined in the configuration file.
   */
  public interval: any = null;
  /**
   * Boolean of whether or not refresh is displayed.
   */
  public showRefresh: boolean = true;
  /**
   * Boolean to know if all layers are currently displayed on the map or not.
   */
  public displayAllLayers: boolean = true;
  /**
   * Boolean to know if the user has selected to hide all descriptions in the sidebar under map layer controls.
   */
  public hideAllDescription: boolean = false;
  /**
   * Boolean to know if the user has selected to hide all symbols in the sidebar under the map layer controls.
   */
  public hideAllSymbols: boolean = false;
  /**
   * All the features of a geoLayerView to be passed to the attribute table in a Material Dialog
   */
  public allFeatures: {} = {};
  /**
   * Object containing the geoLayerId as the key and the extended Leaflet class for a selected or highlighted layer as the value.
   */
  public leafletData: {} = {};
  /**
   * Used to indicate which background layer is currently displayed on the map.
   */
  public currentBackgroundLayer: string;
  /**
   * Object that holds the base maps that populates the leaflet sidebar.
   */
  public baseMaps: any = {};
  /**
   * A categorized configuration object with the geoLayerId as key and a list of name followed by color for each feature in
   * the Leaflet layer to be shown in the sidebar.
   */
  public categorizedLayerColor = {};
  /**
   * Boolean test variable for use with Angular Material slide toggle.
   */
  public isChecked = false;
  /**
   * Feature flash test variable.
   */
  public test: boolean;
  /**
   * The MapManger singleton instance, that will keep a certain number of Leaflet map instances, so a new map won't have to be
   * created every time the same map button is clicked.
   */
  public mapManager: MapManager = MapManager.getInstance();
  /**
   * The instance of the MapLayerManager, a helper class that manages MapLayerItem objects with Leaflet layers
   * and other layer data for displaying, ordering, and highlighting.
   */
  public mapLayerManager: MapLayerManager = MapLayerManager.getInstance();
  /**
   * The windowManager instance, whose job it will be to create, maintain, and remove multiple open dialogs from the InfoMapper.
   */
  public windowManager: WindowManager = WindowManager.getInstance();
  /**
   * Boolean showing if the path given to some file is incorrect
   */
  public badPath = false;
  /**
   * Boolean showing if the URL given for a layer is currently unavailable.
   */
  public serverUnavailable = false;
  /**
   * Hard-coded variable for determining whether the experimental feature popup flashing solution is being attempted.
   */
  readonly featureFlashFix = false;
  /**
   * Class variable for the original route subscription object so it can be closed on this component's destruction.
   */
  private routeSubscription$ = <any>Subscription;
  /**
   * Class variable for the Leaflet map's config file subscription object so it can be closed on this component's destruction.
   */
  private forkJoinSubscription$ = <any>Subscription;
  /**
   * Class variable for the original route subscription object so it can be closed on this component's destruction.
   */
  private mapConfigSubscription$ = <any>Subscription;


  /**
   * @constructor for the Map Component
   * @param appService A reference to the top level application service
   * @param componentFactoryResolver Adding components dynamically
   * @param dialog A reference to the MatDialog for creating and displaying a popup with a chart
   * @param mapService A reference to the map service, for sending data between components and global variables
   * @param route Used for getting the parameter 'id' passed in by the url and from the router
   */
  constructor(private appService: AppService,
              private componentFactoryResolver: ComponentFactoryResolver,
              public dialog: MatDialog,
              public mapService: MapService,
              private route: ActivatedRoute) { }


  /**
   * Add content to the info tab of the sidebar dynamically. Following the example from the Angular
   * documentation found here: https://angular.io/guide/dynamic-component-loader
   */
  private addInfoToSidebar(): void {
    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(SidePanelInfoComponent);
    let infoViewContainerRef = this.InfoComp.viewContainerRef;
    let componentRef = infoViewContainerRef.createComponent(componentFactory);

    (<SidePanelInfoComponent>componentRef.instance).properties = this.mapService.getProperties();
    (<SidePanelInfoComponent>componentRef.instance).appVersion = this.mapService.appConfig.version;
  }

  /**
   * Dynamically add the layer information to the sidebar coming in from the map configuration file
   * @param configFile 
   */
  private addLayerToSidebar(configFile: any) {
    // reset the sidebar components so elements are added on top of each other
    this.resetSidebarComponents();

    // Creates new layerToggle component in sideBar for each layer specified in
    // the config file, sets data based on map service.
    // var geoLayers = configFile.geoMaps[0].geoLayers;

    let mapGroups: any[] = [];
    let backgroundMapGroups: any[] = [];
    let viewGroups: any = configFile.geoMaps[0].geoLayerViewGroups;
    // var groupNumber = 0;

    viewGroups.forEach((group: any) => {
      if (group.properties.isBackground == undefined ||
          group.properties.isBackground == "false") {
            mapGroups.push(group);
          }
      if (group.properties.isBackground == "true")
        backgroundMapGroups.push(group);
    });

    // Create the each background component asynchronously by using setTimeout. If no time is given to setTimeout, 0 is used by
    // default, which makes sure that viewContainerRef is defined by the time the components are created.
    setTimeout(() => {
      backgroundMapGroups.forEach((backgroundGroup: any) => {
        backgroundGroup.geoLayerViews.forEach((backgroundGeoLayerView: any) => {
        // Create the background map layer component
        let componentFactory = this.componentFactoryResolver.resolveComponentFactory(BackgroundLayerComponent);
        this.backgroundViewContainerRef = this.backgroundLayerComp.viewContainerRef;
        let componentRef = this.backgroundViewContainerRef.createComponent(componentFactory);
        // Initialize the data for the background map layer component
        let component = <BackgroundLayerComponent>componentRef.instance;
        component.data = backgroundGeoLayerView;
        component.mapComponentReference = this;
  
        // Save the reference to this component so it can be removed when resetting the page.
        this.sidebar_background_layers.push(componentRef);
        });
      });
    });

  }

  /**
   * A CSV classification file is given by the user, so use that to create the colorTable to add to the categorizedLayerColor
   * array for creating the legend colors.
   * @param results An array of objects containing information from each row in the CSV file
   * @param geoLayerId The geoLayerId of the given layer. Used for creating legend colors
   */
  private assignFileColor(results: any[], geoLayerId: string): void {

    let colorTable: any[] = [];
    var propertyObject: any;

    for (let i = 0; i < results.length; i++) {
      propertyObject = {};
      colorTable.push(results[i]['label']);

      if (results[i]['color']) {
        propertyObject.color = results[i]['color'];
      }
      if (results[i]['fillColor']) {
        propertyObject.fillColor = results[i]['fillColor'];
      }
      if (results[i]['fillOpacity']) {
        propertyObject.fillOpacity = results[i]['fillOpacity'];
      }
      if (results[i]['weight']) {
        propertyObject.weight = results[i]['weight'];
      }

      colorTable.push(propertyObject);
    }

    if (this.categorizedLayerColor[geoLayerId]) {
      this.categorizedLayerColor[geoLayerId] = colorTable;
    }
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
  private buildPopupHTML(popupTemplateId: string, action: any, layerAttributes: any,
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
   * The entry point and main foundation for building the Leaflet map using the data from the configuration file. Contains the
   * building and positioning of the map, raster and/or vector layers on the map and all necessary Leaflet functions for the
   * creation and styling of shapes, polygons and images on the map (among other options).
   */
  private buildMap(): void {
    
    this.mapInitialized = true;
    var _this = this;

    // Create background layers from the configuration file.
    let backgroundLayers: any[] = this.mapService.getBackgroundLayers();
    // Iterate over each background layer, create them using tileLayer, and add them to the baseMaps class object
    backgroundLayers.forEach((backgroundLayer) => {
      let leafletBackgroundLayer = L.tileLayer(backgroundLayer.sourcePath, {
        attribution: backgroundLayer.properties.attribution,
        maxZoom: backgroundLayer.properties.zoomLevelMax ? parseInt(backgroundLayer.properties.zoomLevelMax) : 18
      });
      this.baseMaps[this.mapService.getBackgroundGeoLayerViewNameFromId(backgroundLayer.geoLayerId)] = leafletBackgroundLayer;
    });

    // Create a Leaflet Map; set the default layers that appear on initialization
    this.mainMap = L.map('mapID', {
        layers: [this.baseMaps[this.mapService.getDefaultBackgroundLayer()]],
        // We're using our own zoom control for the map, so we don't need the default
        zoomControl: false,
        wheelPxPerZoomLevel: 150,
        zoomSnap: 0.1
    });

    // Retrieve the initial extent from the config file and set the map view
    let extentInitial = this.mapService.getExtentInitial();    
    this.mainMap.setView([extentInitial[1], extentInitial[0]], extentInitial[2]);
    
    // Set the default layer radio check to true
    this.setDefaultBackgroundLayer();

    // Add the background layers to the maps control in the topright
    if (this.mapService.getBackgroundLayersMapControl()) {
      L.control.layers(this.baseMaps).addTo(this.mainMap);
    }

    // baselayerchange is fired when the base layer is changed through the layer control. So when a radio button is pressed and
    // the basemap changes, update the currentBackgroundLayer and check the radio button
    this.mainMap.on('baselayerchange', (backgroundLayer: any) => {
      this.setBackgroundLayer(backgroundLayer.name);
    });

    // Get the map name from the config file.
    let mapName: string = this.mapService.getGeoMapName();
    // Create the control on the Leaflet map
    var mapTitle = L.control({ position: 'topleft' });
    // Add the title to the map in a div whose class name is 'info'
    mapTitle.onAdd = function () {
        this._div = L.DomUtil.create('div', 'info');
        this._div.id = 'title-card';
        this.update();
        // Without this, the mouse cannot select what's in the info div. With it, it can. This hopefully helps with the
        // flashing issues that have been happening when a user hovers over a feature on the map. NOTE: It didn't
        // L.DomEvent.disableClickPropagation(this._div);
        return this._div;
    };
    // When the title-card is created, have it say this
    mapTitle.update = function () {
      this._div.innerHTML = ('<h4>' + mapName + '</h4>');
    };
    mapTitle.addTo(this.mainMap);

    if (this.featureFlashFix) {
      mapTitle.getContainer().addEventListener('mouseover', function(event: any) {
        if (event.target !== this) {
          return;
        }
        _this.test = true;
        L.DomEvent.disableClickPropagation(mapTitle.getContainer());
        L.DomEvent.disableScrollPropagation(mapTitle.getContainer());
        L.DomEvent.preventDefault(event);
      });
  
      mapTitle.getContainer().addEventListener('mouseout', function(event: Event) {
        if (event.target !== this) {
          return;
        }
        _this.test = false;
        let div = L.DomUtil.get('title-card');
        let instruction: string = "Move over or click on a feature for more information";
        let divContents: string = "";
  
        divContents = ('<h4 id="geoLayerView">' + mapName + '</h4>' + '<p id="point-info"></p>');
        if (instruction !== "") {
          divContents += ('<hr/>' + '<p id="instructions"><i>' + instruction + '</i></p>');
        }
        div.innerHTML = divContents;
      });
    }

    // Display the zoom level on the map
    let mapZoom = L.control({ position: 'bottomleft' });
    mapZoom.onAdd = function () {
      // Have Leaflet create a div with the class name zoomInfo
      this._container = L.DomUtil.create('div', 'zoomInfo');
      // When the map is created for the first time, call update to display zoom
      this.update();
      // On subsequent zoom events (at the end of the zoom) update the innerHTML again, and round to tenths
      _this.mainMap.on('zoomend', function() {
        this._container.innerHTML = '<div id="zoomInfo">Zoom Level: ' + _this.mainMap.getZoom().toFixed(1) + '</div>';
      }, this);
      return this._container;
    };
    mapZoom.update = function () {
        this._container.innerHTML = '<div id="zoomInfo">Zoom Level: ' + _this.mainMap.getZoom().toFixed(1) + '</div>';
    };
    // jpkeahey might have to turn the event listener off when a map is removed
    // mapZoom.onRemove = function() {
    //   L.DomUtil.remove(this._container);
    //   map.off('zoomend', )
    // }

    // Add home and zoom in/zoom out control to the top right corner
    L.Control.zoomHome({
      position: 'topright',
      zoomHomeTitle: 'Zoom to initial extent'
    }).addTo(this.mainMap);

    // Show the lat and lang of mouse position in the bottom left corner
    var mousePosition = L.control.mousePosition({
      position: 'bottomleft',
      lngFormatter: (num: number) => {
        let direction = (num < 0) ? 'W' : 'E';
        let formatted = Math.abs(num).toFixed(6) + '&deg ' + direction;
        return formatted;
      },
      latFormatter: (num: number) => {
        let direction = (num < 0) ? 'S' : 'N';
        let formatted = Math.abs(num).toFixed(6) + '&deg ' + direction;
        return formatted;
      }
    });

    // The next three lines of code makes sure that each control in the bottom left is created on the map in a specific order
    this.mainMap.addControl(mousePosition);
    this.mainMap.addControl(mapZoom);
    // Bottom Left corner control that shows the scale in km and miles of the map.
    L.control.scale({ position: 'bottomleft', imperial: true }).addTo(this.mainMap);

    updateTitleCard();
    /**
     * Updates the title card in the top left corner of the map.
     */
    function updateTitleCard(): void {
      let div = L.DomUtil.get('title-card');
      let instruction: string = "Move over or click on a feature for more information";
      let divContents: string = "";

      divContents = ('<h4 id="geoLayerView">' + mapName + '</h4>' + '<p id="point-info"></p>');
      if (instruction != "") {
        divContents += ('<hr/>' + '<p id="instructions"><i>' + instruction + '</i></p>');
      }
      div.innerHTML = divContents;
    }

    var geoLayerViewGroups: any[] = this.mapService.getLayerGroups();
    var dialog = this.dialog;
    
    // Dynamically load layers into array. VERY IMPORTANT
    geoLayerViewGroups.forEach((geoLayerViewGroup: any) => {
      if (geoLayerViewGroup.properties.isBackground === undefined || geoLayerViewGroup.properties.isBackground === 'false') {
        
        for (let i = 0; i < geoLayerViewGroup.geoLayerViews.length; i++) {
          
          // Obtain the geoLayer for use in creating this Leaflet layer
          let geoLayer: any = this.mapService.getGeoLayerFromId(geoLayerViewGroup.geoLayerViews[i].geoLayerId);
          // Obtain the symbol data for use in creating this Leaflet layer
          let symbol: any = this.mapService.getSymbolDataFromID(geoLayer.geoLayerId);
          // Obtain the event handler information from the geoLayerView for use in creating this Leaflet layer
          let eventHandlers: any = this.mapService.getGeoLayerViewEventHandler(geoLayer.geoLayerId);
          
          var asyncData: any[] = [];
          // Push the retrieval of layer data onto the async array by appending the
          // appPath with the GeoJSONBasePath and the sourcePath to find where the
          // geoJSON file is to read.
          
          // Displays a web feature service from Esri. 
          if (geoLayer.sourceFormat && geoLayer.sourceFormat.toUpperCase() === 'WFS') {

            // Displays a raster layer on the Leaflet map by using the third-party package 'georaster-layer-for-leaflet'
          } else if (geoLayer.layerType.toUpperCase().includes('RASTER')) {
            this.createRasterLayer(geoLayer, symbol, geoLayerViewGroup.geoLayerViews[i], geoLayerViewGroup);
            // Since a raster was already created for the layer, we can skip doing anything else and go to the next geoLayerView
            continue;
          } else if (geoLayer.layerType.toUpperCase().includes('VECTOR')) {
            asyncData.push(
              this.appService.getJSONData(
                this.appService.buildPath(PathType.gLGJP, [geoLayer.sourcePath]), PathType.gLGJP, geoLayer.geoLayerId
              )
            );
          }
          // Push each event handler onto the async array if there are any
          if (eventHandlers.length > 0) {
            eventHandlers.forEach((event: any) => {
              // TODO: jpkeahey 2020.10.22 - popupConfigPath will be deprecated, but will still work for now, just with a warning
              // message displayed to the user
              if (event.properties.popupConfigPath) {
                console.warn('The Event Handler property \'popupConfigPath\' is deprecated. \'eventConfigPath\' will replace ' +
                'it, will be supported in the future, and should be used instead');
                // Use the http GET request function and pass it the returned formatted path
                asyncData.push(
                  this.appService.getJSONData(
                    this.appService.buildPath(PathType.eCP, [event.properties.popupConfigPath]), PathType.eCP, this.mapID
                  )
                );
              }
              else if (event.properties.eventConfigPath) {
                // Use the http GET request function and pass it the returned formatted path
                asyncData.push(
                  this.appService.getJSONData(
                    this.appService.buildPath(PathType.eCP, [event.properties.eventConfigPath]), PathType.eCP, this.mapID
                  )
                );
              }

            });
          }
          // Use forkJoin to go through the array and be able to subscribe to every
          // element and get the response back in the results array when finished.
          this.forkJoinSubscription$ = forkJoin(asyncData).subscribe((results) => {

            // The scope of this does not reach the leaflet event functions. _this will allow a reference to this.
            var _this = this;
            // The first element in the results array will always be the features returned from the geoJSON file.
            this.allFeatures[geoLayer.geoLayerId] = results[0];

            // Prints out how many features each geoLayerView contains
            // if (this.allFeatures[geoLayer.geoLayerId]) {
            //   console.log(geoLayerViewGroup.geoLayerViews[i].name, 'contains',
            //   this.allFeatures[geoLayer.geoLayerId].features.length, 'features');
            // }
            
            var eventObject: any = {};
            // Go through each event and assign the retrieved template output to each event type in an eventObject
            if (eventHandlers.length > 0) {
              for (let i = 0; i < eventHandlers.length; i++) {
                eventObject[eventHandlers[i].eventType + '-eCP'] = results[i + 1];
              }
            }

            // If the layer is a LINESTRING or SINGLESYMBOL POLYGON, create it here
            if (geoLayer.geometryType.toUpperCase().includes('LINESTRING') ||
                geoLayer.geometryType.toUpperCase().includes('POLYGON') &&
                symbol.classificationType.toUpperCase().includes('SINGLESYMBOL')) {
              
              var data = L.geoJson(this.allFeatures[geoLayer.geoLayerId], {
                  onEachFeature: onEachFeature,
                  style: MapUtil.addStyle( {
                    feature: this.allFeatures[geoLayer.geoLayerId],
                    geoLayer: geoLayer,
                    symbol: symbol
                  })
              });
              // Add the newly created Leaflet layer to the MapLayerManager, and if it has the selectedInitial field set
              // to true (or it's not given) add it to the Leaflet map. If false, don't show it yet.
              this.mapLayerManager.addLayerItem(data, geoLayer, geoLayerViewGroup.geoLayerViews[i], geoLayerViewGroup);
              let layerItem: MapLayerItem = this.mapLayerManager.getLayerItem(geoLayer.geoLayerId);
              if (layerItem.isSelectInitial()) {
                layerItem.initItemLeafletLayerToMainMap(this.mainMap);
                if (layerItem.getItemSelectBehavior().toUpperCase() === 'SINGLE') {
                  this.mapLayerManager.toggleOffOtherLayersOnMainMap(geoLayer.geoLayerId, this.mainMap, geoLayerViewGroup.geoLayerViewGroupId, 'init');
                }
              }

              this.mapLayerManager.setLayerOrder();
            } 
            // If the layer is a CATEGORIZED POLYGON, create it here
            else if (geoLayer.geometryType.toUpperCase().includes('POLYGON') &&
              symbol.classificationType.toUpperCase().includes('CATEGORIZED')) {

              this.categorizedLayerColor[geoLayer.geoLayerId] = [];

              if (symbol.properties.classificationFile) {

                Papa.parse(this.appService.buildPath(PathType.cP, [symbol.properties.classificationFile]),
                  {
                    delimiter: ",",
                    download: true,
                    comments: "#",
                    skipEmptyLines: true,
                    header: true,
                    complete: (result: any, file: any) => {
                      this.assignFileColor(result.data, geoLayer.geoLayerId);

                      var geoLayerView = this.mapService.getLayerViewFromId(geoLayer.geoLayerId);                      
                      var results = result.data;
                      
                      let data = new L.geoJson(this.allFeatures[geoLayer.geoLayerId], {
                        onEachFeature: onEachFeature,
                        style: function (feature: any) {
                          return MapUtil.addStyle({
                            feature: feature,
                            symbol: symbol,
                            results: results,
                            geoLayerView: geoLayerView
                          })
                        }
                      });
                      // Add the newly created Leaflet layer to the MapLayerManager, and if it has the selectedInitial field set
                      // to true (or it's not given) add it to the Leaflet map. If false, don't show it yet.
                      this.mapLayerManager.addLayerItem(data, geoLayer, geoLayerViewGroup.geoLayerViews[i], geoLayerViewGroup);
                      let layerItem: MapLayerItem = this.mapLayerManager.getLayerItem(geoLayer.geoLayerId);
                      if (layerItem.isSelectInitial()) {
                        layerItem.initItemLeafletLayerToMainMap(this.mainMap);
                        if (layerItem.getItemSelectBehavior().toUpperCase() === 'SINGLE') {
                          this.mapLayerManager.toggleOffOtherLayersOnMainMap(geoLayer.geoLayerId, this.mainMap, geoLayerViewGroup.geoLayerViewGroupId, 'init');
                        }
                      }

                      this.mapLayerManager.setLayerOrder();
                    }
                  });
                
              } else {                
                // Default color table is made here
                let colorTable = MapUtil.assignColor(this.allFeatures[geoLayer.geoLayerId].features, symbol);
                this.categorizedLayerColor[geoLayer.geoLayerId] = colorTable;
                
                // If there is no classificationFile, create a default colorTable
                let data = L.geoJson(this.allFeatures[geoLayer.geoLayerId], {
                  onEachFeature: onEachFeature,
                  style: (feature: any, layerData: any) => {                    
                    let classificationAttribute: any = feature['properties'][symbol.classificationAttribute];
                      return {
                        color: MapUtil.verify(MapUtil.getColor(symbol, classificationAttribute, colorTable), Style.color),
                        fillOpacity: MapUtil.verify(symbol.properties.fillOpacity, Style.fillOpacity),
                        opacity: MapUtil.verify(symbol.properties.opacity, Style.opacity),
                        stroke: symbol.properties.outlineColor == "" ? false : true,
                        weight: MapUtil.verify(parseInt(symbol.properties.weight), Style.weight)
                      }
                  }
                });

                // Add the newly created Leaflet layer to the MapLayerManager, and if it has the selectedInitial field set
                // to true (or it's not given) add it to the Leaflet map. If false, don't show it yet.
                this.mapLayerManager.addLayerItem(data, geoLayer, geoLayerViewGroup.geoLayerViews[i], geoLayerViewGroup);
                let layerItem: MapLayerItem = this.mapLayerManager.getLayerItem(geoLayer.geoLayerId);
                if (layerItem.isSelectInitial()) {
                  layerItem.initItemLeafletLayerToMainMap(this.mainMap);
                  if (layerItem.getItemSelectBehavior().toUpperCase() === 'SINGLE') {
                    this.mapLayerManager.toggleOffOtherLayersOnMainMap(geoLayer.geoLayerId, this.mainMap, geoLayerViewGroup.geoLayerViewGroupId, 'init');
                  }
                }

                this.mapLayerManager.setLayerOrder();
              }
            }
            // Display a Leaflet marker or custom point/SHAPEMARKER
            else {

              var data = L.geoJson(this.allFeatures[geoLayer.geoLayerId], {
                pointToLayer: (feature: any, latlng: any) => {
                  // Create a shapemarker layer
                  if (geoLayer.geometryType.toUpperCase().includes('POINT') && !symbol.properties.symbolImage && !symbol.properties.builtinSymbolImage) {
                    return L.shapeMarker(latlng, MapUtil.addStyle({
                      feature: feature,
                      geoLayer: geoLayer,
                      symbol: symbol
                    }));
                  }
                  // Create a user-provided marker image layer
                  else if (symbol.properties.symbolImage) {
                    let markerIcon = new L.icon({
                      iconUrl: this.appService.getAppPath() + this.mapService.formatPath(symbol.properties.symbolImage, 'symbolImagePath'),
                      iconAnchor: MapUtil.createAnchorArray(symbol.properties.symbolImage, symbol.properties.imageAnchorPoint)
                    });
                    var divIcon = new L.divIcon({
                      iconSize: new L.Point(45, 20),
                      html: 'foo bar'
                    });
                    L.marker(latlng, { icon: divIcon }).addTo(this.mainMap);
                    return L.marker(latlng, { icon: markerIcon });
                  }
                  // Create a built-in (default) marker image layer
                  else if (symbol.properties.builtinSymbolImage) {

                    let markerIcon = new L.icon({
                      iconUrl: this.mapService.formatPath(symbol.properties.builtinSymbolImage, 'builtinSymbolImagePath'),
                      iconAnchor: MapUtil.createAnchorArray(symbol.properties.builtinSymbolImage, symbol.properties.imageAnchorPoint)
                    });
                    return L.marker(latlng, { icon: markerIcon })
                  }
                },
                onEachFeature: onEachFeature
              });
              // Add the newly created Leaflet layer to the MapLayerManager, and if it has the selectedInitial field set
              // to true (or it's not given) add it to the Leaflet map. If false, don't show it yet.
              this.mapLayerManager.addLayerItem(data, geoLayer, geoLayerViewGroup.geoLayerViews[i], geoLayerViewGroup);
              let layerItem: MapLayerItem = this.mapLayerManager.getLayerItem(geoLayer.geoLayerId);
              if (layerItem.isSelectInitial()) {
                layerItem.initItemLeafletLayerToMainMap(this.mainMap);
                if (layerItem.getItemSelectBehavior().toUpperCase() === 'SINGLE') {
                  this.mapLayerManager.toggleOffOtherLayersOnMainMap(geoLayer.geoLayerId, this.mainMap, geoLayerViewGroup.geoLayerViewGroupId, 'init');
                }
              }

              this.createSelectedLeafletClass(geoLayer, symbol);
              this.mapLayerManager.setLayerOrder();
            }
            // Check if refresh
            // let refreshTime: string[] = this.mapService.getRefreshTime(geoLayer.geoLayerId ? geoLayer.geoLayerId : geoLayer.geoLayerId)
            // if (!(refreshTime.length == 1 && refreshTime[0] == "")) {
            //   this.addRefreshDisplay(refreshTime, geoLayer.geoLayerId);
            // }

            /**
             * Adds event listeners to each feature in the Leaflet layer. 
             * @param feature The feature object and all its properties in the layer.
             * @param layer The reference to the layer object the feature comes from.
             */
            function onEachFeature(feature: any, layer: any): void {
              // If the geoLayerView has its own custom events, use them here
              if (eventHandlers.length > 0) {
                // If the map config file has event handlers, use them
                eventHandlers.forEach((eventHandler: any) => {
                  switch (eventHandler.eventType.toUpperCase()) {
                    case "CLICK":
                      var multipleEventsSet: boolean;
                      var popup: any;

                      for (let value of Object.values(eventHandlers)) {
                        if (typeof value['eventType'] === 'string') {
                          if (value['eventType'].toUpperCase() === 'HOVER') {
                            multipleEventsSet = true;
                          }
                        }
                      }
                      layer.on({
                        // If only click is given for an event, default should be to display all features and show them.
                        mouseover: function(e: any) {
                          if (multipleEventsSet === true) {
                            return;
                          } else {
                            MapUtil.updateFeature(e, _this, geoLayer, symbol, geoLayerViewGroup, i);
                          }
                        },
                        mouseout: function(e: any) {
                          if (multipleEventsSet === true) {
                            return;
                          } else {
                            if (_this.featureFlashFix && !feature.geometry.type.toUpperCase().includes('POLYGON')) {
                              setTimeout(() => {
                                if (_this.test === true) { return; }
                                else MapUtil.resetFeature(e, _this, geoLayer);
                              }, 100);
                            } else {
                              MapUtil.resetFeature(e, _this, geoLayer);
                            }
                          }
                        },
                        click: ((e: any) => {
                          var divContents = '';
                          var featureProperties: Object = e.target.feature.properties;
                          var popupTemplateId = eventObject[eventHandler.eventType + '-eCP'].id;
                          var layerAttributes = eventObject[eventHandler.eventType + '-eCP'].layerAttributes;
                          // If there is no action OR there is an empty list, just show the HTML in the Leaflet popup
                          if (!eventObject[eventHandler.eventType + '-eCP'].actions ||
                          eventObject[eventHandler.eventType + '-eCP'].actions.length === 0) {
                            divContents = _this.buildPopupHTML(popupTemplateId, null, layerAttributes, featureProperties, null);
                            // Create the Leaflet popup and show on the map with a set size
                            layer.unbindPopup().bindPopup(divContents, {
                              maxHeight: 300,
                              maxWidth: 300
                            });

                            popup = e.target.getPopup();
                            popup.setLatLng(e.latlng).openOn(_this.mainMap);
                            return;
                          }

                          var chartPackageArray: any[] = [];
                          var firstAction = true;
                          var numberOfActions = eventObject[eventHandler.eventType + '-eCP'].actions.length;
                          var actionArray: string[] = [];
                          var actionLabelArray: string[] = [];
                          var graphFilePath: string;
                          var TSID_Location: string;
                          var resourcePathArray: string[] = [];
                          var downloadFileNameArray: any[] = [];
                          var buttonID: string;

                          // Iterate over the action array from the popup template file
                          for (let action of eventObject[eventHandler.eventType + '-eCP'].actions) {
                            downloadFileNameArray.push(action.downloadFile);
                            resourcePathArray.push(action.resourcePath);
                            actionLabelArray.push(action.label);
                            actionArray.push(action.action);
                            chartPackageArray.push(action.chartPackage);

                            if (firstAction) {
                              divContents +=
                              _this.buildPopupHTML(popupTemplateId, action, layerAttributes, featureProperties, true);
                              firstAction = false;
                            } else {
                              divContents +=
                              _this.buildPopupHTML(popupTemplateId, action, layerAttributes, featureProperties, false);
                            }

                          }
                          layer.unbindPopup().bindPopup(divContents, {
                            maxHeight: 300,
                            maxWidth: 300
                          });

                          popup = e.target.getPopup();
                          popup.setLatLng(e.latlng).openOn(_this.mainMap);
                          
                          for (let i = 0; i < numberOfActions; i++) {
                            buttonID = popupTemplateId + '-' + actionLabelArray[i];
                            L.DomEvent.addListener(L.DomUtil.get(buttonID), 'click', function (e: any) {
                              buttonID = popupTemplateId + '-' + actionLabelArray[i];
                              // If this button has already been clicked and resides in the windowManager, don't do anything.
                              if (_this.windowManager.windowExists(buttonID)) {
                                return;
                              }

                              // Display a plain text file in a Dialog popup
                              if (actionArray[i] === 'displayText') {
                                // Since the popup template file is not replacing any ${properties}, replace the ${property}
                                // for the resourcePath only
                                var resourcePath = MapUtil.obtainPropertiesFromLine(resourcePathArray[i], featureProperties);
                                let fullResourcePath = _this.appService.buildPath(PathType.rP, [resourcePath]);
                                // Add this button's id to the windowManager so a user can't open it more than once.
                                _this.windowManager.addWindow(buttonID, WindowType.TEXT);

                                _this.appService.getPlainText(fullResourcePath, PathType.rP).subscribe((text: any) => {
                                  openTextDialog(dialog, text, fullResourcePath, buttonID);
                                });
                              }
                              // Display a Time Series graph in a Dialog popup
                              else if (actionArray[i] === 'displayTimeSeries') {
                                
                                let fullResourcePath = _this.appService.buildPath(PathType.rP, [resourcePathArray[i]]);
                                // Add this button's id to the windowManager so a user can't open it more than once.
                                _this.windowManager.addWindow(buttonID, WindowType.TSGRAPH);
                                
                                _this.appService.getJSONData(fullResourcePath, PathType.rP, _this.mapID)
                                .subscribe((graphTemplateObject: Object) => {
                                  // Replaces all ${} property notations with the correct feature in the TSTool graph template object
                                  MapUtil.replaceProperties(graphTemplateObject, featureProperties);

                                  if (graphTemplateObject['product']['subProducts'][0]['data'][0]['properties'].TSID) {
                                    let TSID: string = graphTemplateObject['product']['subProducts'][0]['data'][0]['properties'].TSID;
                                    // Split on the ~ and set the actual file path we want to use so our dialog-content component
                                    // can determine what kind of file was given.
                                    TSID_Location = TSID.split('~')[0];
                                    // If the TSID has one tilde (~), set the path using the correct index compared to if the 
                                    // TSID contains two tildes.
                                    if (TSID.split('~').length === 2) {
                                      graphFilePath = TSID.split("~")[1];
                                    } else if (TSID.split('~').length === 3) {
                                      graphFilePath = TSID.split("~")[2];
                                    }
                                  } else console.error('The TSID has not been set in the graph template file');

                                  openTSGraphDialog(dialog, graphTemplateObject, graphFilePath, TSID_Location, chartPackageArray[i],
                                  featureProperties, downloadFileNameArray[i] ? downloadFileNameArray[i] : null, buttonID);
                                });
                              }
                              // Display a Map Feature Gallery Dialog.
                              else if (actionArray[i] === 'displayGallery') {
                                let fullResourcePath = _this.appService.buildPath(PathType.rP, [resourcePathArray[i]]);

                                _this.appService.getPlainText(fullResourcePath, PathType.rP, _this.mapID)
                                .subscribe((galleryDisplay: string) => {

                                  const dialogConfig = new MatDialogConfig();
                                  dialogConfig.data = {
                                    display: galleryDisplay
                                  }
                                  
                                  const dialogRef: MatDialogRef<DialogGalleryComponent, any> = dialog.open(DialogGalleryComponent, {
                                    data: dialogConfig,
                                    hasBackdrop: false,
                                    panelClass: ['custom-dialog-container', 'mat-elevation-z24'],
                                    height: "700px",
                                    width: "910px",
                                    minHeight: "700px",
                                    minWidth: "910px",
                                    maxHeight: "700px",
                                    maxWidth: "910px"
                                  });
                                });
                              }
                              // Display a Gapminder Visualization
                              else if (actionArray[i] === 'displayGapminder') {
                                let fullResourcePath = _this.appService.buildPath(PathType.rP, [resourcePathArray[i]]);

                                const dialogConfig = new MatDialogConfig();
                                dialogConfig.data = {
                                  resourcePath: fullResourcePath
                                }

                                // Open the dialog WITHOUT any given data for right now.
                                const dialogRef: MatDialogRef<DialogGapminderComponent, any> = dialog.open(DialogGapminderComponent, {
                                  data: dialogConfig,
                                  hasBackdrop: false,
                                  panelClass: ['custom-dialog-container', 'mat-elevation-z24'],
                                  height: "700px",
                                  width: "910px",
                                  minHeight: "600px",
                                  minWidth: "645px",
                                  maxHeight: "90vh",
                                  maxWidth: "90vw"
                                });
                              }
                              // If the attribute is neither displayTimeSeries nor displayText
                              else {
                                console.error(
                                  'Action attribute is not supplied or incorrect. Please specify either "displayText" or "displayTimeSeries" as the action.'
                                );
                              }
                            });
                          }
                          // Not needed?
                          layer.getPopup().on('remove', function() {
                            for (let i = 0; i < numberOfActions; i++) {
                              L.DomEvent.removeListener(L.DomUtil.get(popupTemplateId + '-' + actionLabelArray[i], 'click', function(e: any) { }));                              
                            }                            
                          });
                        })
                      });
                      break;
                    case "HOVER":
                      var multipleEventsSet: boolean;

                      for (let value of Object.values(eventHandlers)) {
                        if (typeof value['eventType'] === 'string') {
                          if (value['eventType'].toUpperCase() === 'CLICK') {
                            multipleEventsSet = true;
                          }
                        }
                      }
                      layer.on({
                        // If a hover event is given, default should be to display all features.
                        mouseover: function(e: any) {
                            MapUtil.updateFeature(e, _this, geoLayer, symbol,
                              geoLayerViewGroup, i, eventObject['hover-eCP'].layerAttributes);
                        },
                        mouseout: function(e: any) {
                          if (_this.featureFlashFix && !feature.geometry.type.toUpperCase().includes('POLYGON')) {
                            setTimeout(() => {
                              if (_this.test === true) { return; }
                              else MapUtil.resetFeature(e, _this, geoLayer);
                            }, 100);
                          } else {
                            MapUtil.resetFeature(e, _this, geoLayer);
                          }
                        },
                        click: ((e: any) => {
                          if (multipleEventsSet === true) {
                            return;
                          } else {
                            var divContents = '';
                            var featureProperties: Object = e.target.feature.properties;
                            var popupTemplateId = eventObject[eventHandler.eventType + '-eCP'].id;
                            var layerAttributes = eventObject[eventHandler.eventType + '-eCP'].layerAttributes;
                            // If there is no action, just show the HTML in the Leaflet popup
                            if (!eventObject[eventHandler.eventType + '-eCP'].actions) {
                              // Add the last optional argument hoverEvent boolean telling the buildPopupHTML function that the hover
                              // event is the alone event in the popup config file, and all features should be shown
                              divContents = _this.buildPopupHTML(popupTemplateId, null, layerAttributes, featureProperties, null, true);
                              // Create the Leaflet popup and show on the map with a set size
                              layer.unbindPopup().bindPopup(divContents, {
                                maxHeight: 300,
                                maxWidth: 300
                              });

                              popup = e.target.getPopup();
                              popup.setLatLng(e.latlng).openOn(_this.mainMap);
                              return;
                            }
                          }
                        })
                      });
                      break;
                    // If built in eventTypes are not found in the eventType property, (e.g. hover, click) then default to only
                    // having mouseover and mouseout showing all features in the Control div popup
                    default:
                      layer.on({
                        mouseover: function(e: any) {
                          MapUtil.updateFeature(e, _this, geoLayer, symbol, geoLayerViewGroup, i);
                        },
                        mouseout: function(e: any) {
                          if (_this.featureFlashFix) {
                            setTimeout(() => {
                              if (_this.test === true) { return; }
                              else MapUtil.resetFeature(e, _this, geoLayer);
                            }, 100);
                          } else {
                            MapUtil.resetFeature(e, _this, geoLayer);
                          }
                        },
                        click: ((e: any) => {

                          var divContents = '';
                          var featureProperties: Object = e.target.feature.properties;
                          var popupTemplateId = eventObject[eventHandler.eventType + '-eCP'].id;
                          var layerAttributes = eventObject[eventHandler.eventType + '-eCP'].layerAttributes;
                          // If there is no action, just show the HTML in the Leaflet popup
                          if (!eventObject[eventHandler.eventType + '-eCP'].actions) {
                            divContents = _this.buildPopupHTML(popupTemplateId, null, layerAttributes, featureProperties, null);
                            // Create the Leaflet popup and show on the map with a set size
                            layer.unbindPopup().bindPopup(divContents, {
                              maxHeight: 300,
                              maxWidth: 300
                            });

                            popup = e.target.getPopup();
                            popup.setLatLng(e.latlng).openOn(_this.mainMap);
                            return;
                          }
                        })
                      });
                      
                  }  
                });
              } else {
                // If the map config does NOT have any event handlers at all, use a default
                layer.on({
                  mouseover: function(e: any) {
                    MapUtil.updateFeature(e, _this, geoLayer, symbol, geoLayerViewGroup, i);
                  },
                  mouseout: function(e: any) {
                    if (_this.featureFlashFix) {
                      setTimeout(() => {
                        if (_this.test === true) { return; }
                        else MapUtil.resetFeature(e, _this, geoLayer);
                      }, 100);
                    } else {
                      MapUtil.resetFeature(e, _this, geoLayer);
                    }
                  },
                  click: ((e: any) => {
                    // Create the default HTML property popup.
                    var divContents = MapUtil.buildDefaultDivContentString(e.target.feature.properties);
                    // Show the popup on the map. It must be unbound first, or else will only show on the first click.
                    layer.unbindPopup().bindPopup(divContents, {
                      maxHeight: 300,
                      maxWidth: 300
                    });

                    var popup = e.target.getPopup();
                    popup.setLatLng(e.latlng).openOn(_this.mainMap);
                  })
                });
              }
            }

            /**
             * Creates the Dialog object to show the graph in and passes the info needed for it.
             * @param dialog The dialog object needed to create the Dialog popup
             * @param graphTemplateObject The template config object of the current graph being shown
             * @param graphFilePath The file path to the current graph that needs to be read
             */
            function openTSGraphDialog(dialog: any, graphTemplateObject: any, graphFilePath: string, TSID_Location: string,
              chartPackage: string, featureProperties: any, downloadFileName?: string, buttonID?: string): void {

              // Create a MatDialogConfig object to pass to the DialogTSGraphComponent for the graph that will be shown
              const dialogConfig = new MatDialogConfig();
              dialogConfig.data = {
                buttonID: buttonID,
                featureProperties: featureProperties,
                chartPackage: chartPackage,
                graphTemplate: graphTemplateObject,
                graphFilePath: graphFilePath,
                // This cool piece of code uses quite a bit of syntactic sugar. It dynamically sets the saveFile based on the
                // condition that saveFile is defined, using the spread operator. More information was found here:
                // https://medium.com/@oprearocks/what-do-the-three-dots-mean-in-javascript-bc5749439c9a
                ...(downloadFileName && { downloadFileName: downloadFileName }),
                TSID_Location: TSID_Location
              }
              const dialogRef: MatDialogRef<DialogTSGraphComponent, any> = dialog.open(DialogTSGraphComponent, {
                data: dialogConfig,
                hasBackdrop: false,
                panelClass: ['custom-dialog-container', 'mat-elevation-z20'],
                height: "700px",
                width: "910px",
                minHeight: "700px",
                minWidth: "910px",
                maxHeight: "700px",
                maxWidth: "910px"
              });

            }

            /**
             * Creates a Dialog object to show a plain text file and passes the info needed for it.
             * @param dialog The dialog object needed to create the Dialog popup
             * @param text The text retrieved from the text file to display in the Dialog Content popup
             * @param resourcePath The path to the text file so the file name can be extracted in the dialog-text component
             * @param buttonID A string representing the button ID of the button clicked to open this dialog.
             */
            function openTextDialog(dialog: any, text: any, resourcePath: string, buttonID: string): void {

              const dialogConfig = new MatDialogConfig();
              dialogConfig.data = {
                buttonID: buttonID,
                text: text,
                resourcePath: resourcePath
              }
              const dialogRef: MatDialogRef<DialogTextComponent, any> = dialog.open(DialogTextComponent, {
                data: dialogConfig,
                // This stops the dialog from containing a backdrop, which means the background opacity is set to 0, and the
                // entire Info Mapper is still navigable while having the dialog open. This way, you can have multiple dialogs
                // open at the same time.
                hasBackdrop: false,
                panelClass: ['custom-dialog-container', 'mat-elevation-z20'],
                height: "750px",
                width: "900px",
                minHeight: "600px",
                minWidth: "410px",
                maxHeight: "90vh",
                maxWidth: "90vw"
              });
            }

          });
          this.badPath = false;
          this.serverUnavailable = false;
        }
      }
    });
    // Retrieve the expandedInitial and set to collapse if false or not present. If true, show all background layers
    if (this.mapService.getBackgroundExpandedInitial() === false) {
      setTimeout(() => {
        document.getElementById('collapse-background').setAttribute('class', 'collapse');
      });
    }
    // If the sidebar has not already been initialized once then do so.
    if (this.sidebar_initialized == false) { this.createSidebar(); }

    // setTimeout(() => {
    //   this.mapManager.addMap(this.mapService.getGeoMapID(), this.mainMap);
    // });
  }

  /**
   * Determine what layer the user clicked the clear button from, and rest the styling for the highlighted features
   * @param geoLayerId The geoLayerId to determine which layer style should be reset
   */
  public clearSelections(geoLayerId: string): void {
    
    var selectedLayer = this.leafletData[geoLayerId];
    // Reset the style of the selected layer so that it disappears when the clear selection button is clicked.
    if (selectedLayer) {
      selectedLayer.setStyle({
        fillOpacity: '0',
        opacity: '0'
      });
    }
  }

  /**
   * Asynchronously creates a raster layer on the Leaflet map.
   * @param geoLayer The geoLayer object from the map configuration file
   * @param symbol The Symbol data object from the geoLayerView
   */
  private createRasterLayer(geoLayer: any, symbol: any, geoLayerView: any, geoLayerViewGroup: any): void {
    // Uses the fetch API with the given path to get the tiff file in assets to create the raster layer
    fetch('assets/app/' + this.mapService.formatPath(geoLayer.sourcePath, 'rasterPath'))
    .then((response: any) => response.arrayBuffer())
    .then((arrayBuffer: any) => {
      parse_georaster(arrayBuffer).then((georaster: any) => {
        // The classificationFile attribute exists in the map configuration file, so use that file path for Papaparse
        if (symbol.properties.classificationFile) {

          this.categorizedLayerColor[geoLayer.geoLayerId] = [];

          Papa.parse(this.appService.buildPath(PathType.cP, [symbol.properties.classificationFile]),
            {
              delimiter: ",",
              download: true,
              comments: "#",
              skipEmptyLines: true,
              header: true,
              complete: (result: any, file: any) => {

                this.assignFileColor(result.data, geoLayer.geoLayerId);
                
                var layer = new GeoRasterLayer({
                  georaster: georaster,
                  // Sets the color and opacity of each cell in the raster layer
                  pixelValuesToColorFn: (values: any) => {
                    if (values[0] === 0) {
                      return undefined;
                    }

                    for (let line of result.data) {
                      if (values[0] === parseInt(line.value)) {
                        let conversion = MapUtil.hexToRGB(line.fillColor);
                        
                        return `rgba(${conversion.r}, ${conversion.g}, ${conversion.b}, ${line.fillOpacity})`;
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
                  }
                });

                // Add the newly created Leaflet layer to the MapLayerManager, and if it has the selectedInitial field set
                // to true (or it's not given) add it to the Leaflet map. If false, don't show it yet.
                this.mapLayerManager.addLayerItem(layer, geoLayer, geoLayerView, geoLayerViewGroup);
                let layerItem: MapLayerItem = this.mapLayerManager.getLayerItem(geoLayer.geoLayerId);
                if (layerItem.isSelectInitial()) {
                  layerItem.initItemLeafletLayerToMainMap(this.mainMap);
                  if (layerItem.getItemSelectBehavior().toUpperCase() === 'SINGLE') {
                    this.mapLayerManager.toggleOffOtherLayersOnMainMap(geoLayer.geoLayerId, this.mainMap, geoLayerViewGroup.geoLayerViewGroupId, 'init');
                  }
                }
              }
            });
        }
        // No classificationFile attribute was given in the config file, so just create a default raster layer
        else {
          var layer = new GeoRasterLayer({
            georaster: georaster,
            opacity: 0.7
          });

          // Add the newly created Leaflet layer to the MapLayerManager, and if it has the selectedInitial field set
          // to true (or it's not given) add it to the Leaflet map. If false, don't show it yet.
          this.mapLayerManager.addLayerItem(layer, geoLayer, geoLayerView, geoLayerViewGroup);
          let layerItem: MapLayerItem = this.mapLayerManager.getLayerItem(geoLayer.geoLayerId);
          if (layerItem.isSelectInitial()) {
            layerItem.initItemLeafletLayerToMainMap(this.mainMap);
            if (layerItem.getItemSelectBehavior().toUpperCase() === 'SINGLE') {
              this.mapLayerManager.toggleOffOtherLayersOnMainMap(geoLayer.geoLayerId, this.mainMap, geoLayerViewGroup.geoLayerViewGroupId, 'init');
            }
          }
        }
      });
    });
  }

  /**
   * For each marker, image and built-in image, create a highlighted layer to be shown behind it when filtered in the layer's
   * data table.
   * @param geoLayer The reference to the geoLayer object from the current layer.
   * @param symbol The symbol object from the current layer's geoLayerView.
   */
  private createSelectedLeafletClass(geoLayer: any, symbol: any): void {
    var SelectedClass = L.GeoJSON.include({

      setSelectedStyleAfter: function() {
        this.setStyle({
          color: 'red',
          fillOpacity: '0',
          opacity: '1',
          radius: parseInt(symbol.properties.symbolSize) + 4,
          weight: 2
        });
      },

      setSelectedStyleInit: function() {
        this.setStyle({
          color: 'red',
          fillOpacity: '0',
          opacity: '0',
          radius: parseInt(symbol.properties.symbolSize) + 4,
          weight: 2
        });
      }
    });

    var selected = new SelectedClass();
    selected = L.geoJson(this.allFeatures[geoLayer.geoLayerId], {
      pointToLayer: (feature: any, latlng: any) => {
        // Create a shapemarker layer
        return L.shapeMarker(latlng, MapUtil.addStyle({
          feature: feature,
          geoLayer: geoLayer,
          symbol: symbol
      }));
    }});

    selected.setSelectedStyleInit();
    // This selected layer can be added to the map since it's automatically set to 0 visibility
    selected.addTo(this.mainMap);
    this.leafletData[geoLayer.geoLayerId] = selected;
  }

  /**
   * Creates the side bar on the left side of the map using the third party npm package `leaflet-sidebar-v2`
   */
  private createSidebar(): void {
    this.sidebar_initialized = true;
    // Create the sidebar instance and add it to the map. 
    let sidebar = L.control.sidebar({
      container: 'sidebar'
    }).addTo(this.mainMap).open('home');

    // Add panels dynamically to the sidebar
    // sidebar.addPanel({
    //     id:   'testPane',
    //     tab:  '<i class="fa fa-gear"></i>',
    //     title: 'JS API',
    //     pane: '<div class="leaflet-sidebar-pane" id="home"></div>'
    // });    
    this.addInfoToSidebar();
  }

  /**
   * @returns the value from the badPath object with the matching geoLayerId as the key
   * @param geoLayerId The geoLayerId of the layer
   */
  public getBadPath(geoLayerId: string): string {
    return this.mapService.getBadPath(geoLayerId);
  }

  /**
   * @returns the geometryType of the current geoLayer to determine what shape should be drawn in the legend
   * @param geoLayerId The id of the current geoLayer
   */
  public getGeometryType(geoLayerId: string): any { return this.mapService.getGeometryType(geoLayerId); }

  /**
   * @returns a boolean on whether the layer on the Leaflet map has a bad path so a red triangle is displayed
   * on the layer's side bar legend
   */
  public isBadPath(geoLayerId: string): boolean {
    return this.mapService.isBadPath(geoLayerId);
  }

  /**
   * @returns a boolean on whether the layer on the Leaflet map's service URL is unavailable
   * @param geoLayerId The geoLayerId for the layer
   */
  public isServerUnavailable(geoLayerId: string): boolean {
    return this.mapService.isServerUnavailable(geoLayerId);
  }

  /**
   * This function is called on initialization of the map component, after the constructor.
   */
  public ngAfterViewInit() {
    // When the parameters in the URL are changed the map will refresh and load according to new configuration data.
    this.routeSubscription$ = this.route.params.subscribe(() => {

      this.resetMapVariables();

      this.mapID = this.route.snapshot.paramMap.get('id');
      
      // TODO: jpkeahey 2020.05.13 - This shows how the map config path isn't set on a hard refresh because of async issues
      setTimeout(() => {
        let fullMapConfigPath = this.appService.getAppPath() + this.mapService.getFullMapConfigPath(this.mapID);

        this.mapConfigSubscription$ = this.appService.getJSONData(fullMapConfigPath, PathType.fMCP, this.mapID)
        .subscribe((mapConfig: any) => {
          
          // this.mapService.setGeoMapID(mapConfig.geoMaps[0].geoMapId);
          // console.log(this.mapManager.mapAlreadyCreated(this.mapService.getGeoMapID()));

          // Set the configuration file class variable for the map service
          this.mapService.setMapConfig(mapConfig);
          // Once the mapConfig object is retrieved and set, set the order in which they should be displayed
          this.mapService.setMapConfigLayerOrder();
          // Add components to the sidebar
          this.addLayerToSidebar(mapConfig);
          // Create the map.
          this.buildMap();
        });
      }, 500);
    });
  }

  /**
   * Called once, before this Map Component instance is destroyed.
   */
  public ngOnDestroy(): void {
    // Unsubscribe from all subscriptions that occurred in the Map Component.
    this.routeSubscription$.unsubscribe();
    this.forkJoinSubscription$.unsubscribe();
    this.mapConfigSubscription$.unsubscribe();
    // If a popup is open on the map and a Content Page button is clicked on, then this Map Component will be destroyed. Instead
    // of resetting the map variables, close the popup before the map is destroyed.
    this.mainMap.closePopup();
    // Destroy the map and all attached event listeners.
    this.mainMap.remove();
  }

  /**
   * Opens up an attribute (data) table dialog
   * @param geoLayerId The geoLayerView's geoLayerId to be matched so the correct features are displayed
   */
  public openDataTableDialog(geoLayerId: string, geoLayerViewName: string): void {
    var windowID = geoLayerId + '-dialog-data-table';
    if (this.windowManager.windowExists(windowID)) {
      return;
    }

    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      allFeatures: this.allFeatures[geoLayerId],
      geoLayerId: geoLayerId,
      geoLayerViewName: geoLayerViewName,
      leafletData: this.leafletData,
      mainMap: this.mainMap
    }
    const dialogRef: MatDialogRef<DialogDataTableComponent, any> = this.dialog.open(DialogDataTableComponent, {
      data: dialogConfig,
      hasBackdrop: false,
      panelClass: ['custom-dialog-container', 'mat-elevation-z20'],
      height: "750px",
      width: "910px",
      minHeight: "530px",
      minWidth: "675px",
      maxHeight: "90vh",
      maxWidth: "90vw"
    });
    this.windowManager.addWindow(windowID, WindowType.TABLE);
  }

  /**
   * When the info button by the side bar slider is clicked, it will either show a popup or separate tab containing the documentation
   * for the selected geoLayerViewGroup or geoLayerView.
   * @param docPath The string representing the path to the documentation
   * @param 
   */
  public openDocDialog(docPath: string, geoLayerView: any): void {

    var windowID = geoLayerView.geoLayerId + '-dialog-doc';
    if (this.windowManager.windowExists(windowID)) {
      return;
    }

    var text: boolean, markdown: boolean, html: boolean;
    // Set the type of display the Mat Dialog will show
    if (docPath.includes('.txt')) text = true;
    else if (docPath.includes('.md')) markdown = true;
    else if (docPath.includes('.html')) html = true;

    this.appService.getPlainText(this.appService.buildPath(PathType.dP, [docPath]), PathType.dP)
    .pipe(take(1))
    .subscribe((doc: any) => {

      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = {
        doc: doc,
        docPath: docPath,
        docText: text,
        docMarkdown: markdown,
        docHtml: html,
        geoLayerView: geoLayerView,
        windowID: windowID
      }
        
      var dialogRef: MatDialogRef<DialogDocComponent, any> = this.dialog.open(DialogDocComponent, {
        data: dialogConfig,
        hasBackdrop: false,
        panelClass: ['custom-dialog-container', 'mat-elevation-z20'],
        height: "725px",
        width: "700px",
        minHeight: "550px",
        minWidth: "500px",
        maxHeight: "90vh",
        maxWidth: "90vw"
      });
      this.windowManager.addWindow(windowID, WindowType.DOCS);
    });
  }

  /**
   * Creates the data dialog config object, adds it to the dialog ref object, and sets all other necessary options
   * to create and open the layer properties dialog
   */
  public openPropertyDialog(geoLayerId: string, geoLayerViewName: any): void {

    var windowID = geoLayerId + '-dialog-properties';
    if (this.windowManager.windowExists(windowID)) {
      return;
    }

    // Create a MatDialogConfig object to pass to the DialogTSGraphComponent for the graph that will be shown
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      layerProperties: Object.keys(this.allFeatures[geoLayerId].features[0].properties),
      geoLayerId: geoLayerId,
      geoLayerViewName: geoLayerViewName
    }
    const dialogRef: MatDialogRef<DialogPropertiesComponent, any> = this.dialog.open(DialogPropertiesComponent, {
      data: dialogConfig,
      hasBackdrop: false,
      panelClass: ['custom-dialog-container', 'mat-elevation-z20'],
      height: "700px",
      width: "910px",
      minHeight: "580px",
      minWidth: "535px",
      // vh = view height = 1% of the browser's height, so the max height will be 90% of the browser's height
      maxHeight: "90vh",
      // vw = view width = 1% of the browser's width, so the max width will be 90% of the browser's width
      maxWidth: "90vw"
    });

    this.windowManager.addWindow(windowID, WindowType.TEXT);
  }

  /**
   * Refreshes and/or reinitializes map global variables when a new map component instance is created.
   */
  private resetMapVariables(): void {
    // First clear the map
    if (this.mapInitialized === true) {
      // Before the map is removed - and there can only be one popup open at a time on the map - close it. This is used
      // when another map menu button is clicked on, and the Map Component is not destroyed.
      this.mainMap.closePopup();
      // Remove all event listeners on the map and destroy the map
      this.mainMap.remove();
    }

    this.mapInitialized = false;
    // Reset the mapConfigLayerOrder variable in the mapService, which contains the list of ordered geoLayerView geoLayerId's
    // for ordering the layers on the map. If it isn't reset, the array will keep being appended to.
    this.mapLayerManager.resetMapLayerManagerVariables();

    clearInterval(this.interval);
  }

  /**
   * Clears the current data displayed in the sidebar. This makes sure that the sidebar is cleared when
   * adding new components due to a page refresh.
   */
  private resetSidebarComponents(): void {
    if (this.layerViewContainerRef && this.backgroundViewContainerRef) {
      if (this.layerViewContainerRef.length > 1 || this.backgroundViewContainerRef.length > 1) {
        this.layerViewContainerRef.clear();
        this.backgroundViewContainerRef.clear();
      }
    }
  }

  /**
   * Replaces the background layer on the Leaflet map with the layer selected
   * @param name The name of the background selected to set the @var currentBackgroundLayer as
   */
  public selectBackgroundLayer(name: string): void {
    this.mainMap.removeLayer(this.baseMaps[this.currentBackgroundLayer]);
    this.mainMap.addLayer(this.baseMaps[name]);
    this.currentBackgroundLayer = name;

    // When a new background layer is selected, the raster layer was being covered up by the new tile layer. This
    // sets the z index of the raster so that it stays on top of the background, but behind the vector.
    this.mainMap.eachLayer((layer: any) => {
      if (layer instanceof L.GridLayer && layer.debugLevel) {
        layer.setZIndex(10);
      }
    });
    
  }

  /**
   * Sets the @var currentBackgroundLayer to the name of the background layer given, and sets the radio check in the side bar
   * to checked so that background layer is set on the Leaflet map.
   * @param name The name of the background layer selected
   */
  private setBackgroundLayer(name: string): void {
    this.currentBackgroundLayer = name;
    let radio: any = document.getElementById(name + "-radio");
    radio.checked = "checked";
  }

  /**
   * Sets the default background layer for the leaflet map by creating a MutationObserver and listens for when the DOM element
   * defaultName + '-radio' is not undefined. When the if statement is true, it calls the handleCanvas function, set the now
   * creating canvas elementId to 'checked', stops the observer from observing, and returns.
   */
  private setDefaultBackgroundLayer(): void {

    let defaultName: string = this.mapService.getDefaultBackgroundLayer();
    this.currentBackgroundLayer = defaultName;

    // Callback executed when canvas was found
    function handleCanvas(canvas: any) { 
      canvas.checked = "checked";
    }
    // Set up the mutation observer
    var observer = new MutationObserver(function (mutations, me) {
      // `mutations` is an array of mutations that occurred
      // `me` is the MutationObserver instance
      var canvas = document.getElementById(defaultName + "-radio");
      if (canvas) {
        handleCanvas(canvas);
        me.disconnect(); // stop observing
        return;
      }
    });
    // Start observing
    observer.observe(document, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Style's the current legend object in the sidebar legend.
   * @param symbolProperties The display style object for the current layer's legend
   * @param styleType A string or character differentiating between single symbol, categorized, and graduated style legend objects
   */
  public styleObject(symbolProperties: any, styleType: string): Object {
    switch(styleType) {
      case 'ss':
        return {
          fill: MapUtil.verify(symbolProperties.properties.fillColor, Style.fillColor),
          fillOpacity: MapUtil.verify(symbolProperties.properties.fillOpacity, Style.fillOpacity),
          opacity: MapUtil.verify(symbolProperties.properties.opacity, Style.opacity),
          stroke: MapUtil.verify(symbolProperties.properties.color, Style.color),
          strokeWidth: MapUtil.verify(symbolProperties.properties.weight, Style.weight)
        };
      case 'c':
        return {
          fill: MapUtil.verify(symbolProperties.fillColor, Style.fillColor),
          fillOpacity: MapUtil.verify(symbolProperties.fillOpacity, Style.fillOpacity),
          stroke: MapUtil.verify(symbolProperties.color, Style.color),
          strokeWidth: MapUtil.verify(symbolProperties.weight, Style.weight)
        };
    }

  }

  /**
   * Toggles Leaflet layer visibility, side bar description & symbol, and slide toggle button when it is clicked. Keeps the layer
   * order integrity and (soon) the selectBehavior Single property. This is when either zero or one layer at most can be showing
   * in a view group
   * @param geoLayerId The current geoLayer ID
   */
  public toggleLayer(geoLayerId: string, geoLayerViewGroupId: string): void {

    // Obtain the MapLayerItem for this layer
    var layerItem: MapLayerItem = this.mapLayerManager.getLayerItem(geoLayerId);
    let checked = (<HTMLInputElement>document.getElementById(geoLayerId + "-slider")).checked;

    if (!checked) {
      layerItem.removeItemLeafletLayerFromMainMap(this.mainMap);
    }
    // If checked
    else {
      // Check to see if the layer has already been added to the Leaflet map. If it has, add the layer again. If it hasn't
      // (because of not being initially selected) use the addTo method on the layer and add to the map using the MapLayerItem
      if (layerItem.isItemAddedToMainMap()) {
        layerItem.addItemLeafletLayerToMainMap(this.mainMap);
        if (layerItem.getItemSelectBehavior().toUpperCase() === 'SINGLE') {
          this.mapLayerManager.toggleOffOtherLayersOnMainMap(geoLayerId, this.mainMap, geoLayerViewGroupId);
        }
      } else {
        layerItem.initItemLeafletLayerToMainMap(this.mainMap);
        if (layerItem.getItemSelectBehavior().toUpperCase() === 'SINGLE') {
          this.mapLayerManager.toggleOffOtherLayersOnMainMap(geoLayerId, this.mainMap, geoLayerViewGroupId);
        }
      }
      // When the slider is checked again, re-sort the layers so layer order is preserved.
      this.mapLayerManager.setLayerOrder();
    }
  }

  /**
   * NOTE: Not currently in use
   */
  public x_openDocDialog(): void {
    // This is needed to unbind the click handler from the div, or else events will be added every time the doc button is pressed
    $('.geoMap-doc-button').off('click');
    $('.geoLayerViewGroup-doc-button').off('click');
    $('.geoLayerView-doc-button').off('click');
    // Adds the event for clicking, and depending on whether it was normal or ctl-click, do different things
    $( '.geoMap-doc-button, .geoLayerViewGroup-doc-button, .geoLayerView-doc-button' ).on( 'click', function( event ) {
      if ( event.ctrlKey ) {
        // Ctrl + click
        console.log('Ctl-click');
      }
    });
  }

}