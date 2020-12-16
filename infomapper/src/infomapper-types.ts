// The interface below are typed object that belong to the JSON files created from configuration files passed to the InfoMapper
// to read in as objects, e.g. app-config.json, map configuration files, etc.
/**
 * Interface for Typing the GeoMapProject JSON object created by the GeoProcessor.
 */
export interface GeoMapProject {
  geoMapProjectId?: string;
  name?: string;
  description?: string;
  projectType?: string;
  properties?: {
    author?: string;
    specificationFlavor?: string;
    specificationVersion?: string;
  };
  geoMaps?: GeoMap[]
}
/**
 * Interface for Typing the GeoMap JSON object created by the GeoProcessor.
 */
export interface GeoMap {
  geoMapId?: string;
  name?: string;
  description?: string;
  dataPath?: string;
  crs?: string;
  properties?: {
    docPath?: string;
    extentInitial?: string;
  };
  geoLayers?: GeoLayer[];
  geoLayerViewGroups?: GeoLayerViewGroup[];
}
/**
 * Interface for Typing the GeoLayer JSON object created by the GeoProcessor.
 */
export interface GeoLayer {
  geoLayerId?: string;
  name?: string;
  description?: string;
  crs?: string;
  geometryType?: string;
  layerType?: string;
  sourceFormat?: string;
  sourcePath?: string;
  properties?: {
    attribution?: string;
    isBackground?: string;
  },
  history?: string[];
}
/**
 * Interface for Typing the GeoLayerViewGroup JSON object created by the GeoProcessor.
 */
export interface GeoLayerViewGroup {
  geoLayerViewGroupId?: string;
  name?: string;
  description?: string;
  properties?: {
    docPath?: string;
    isBackground?: string;
    selectedInitial?: string;
  },
  geoLayerViews?: GeoLayerView[];
}
/**
 * Interface for Typing the GeoLayerView JSON object created by the GeoProcessor.
 */
export interface GeoLayerView {
  geoLayerViewId?: string;
  name?: string;
  description?: string;
  geoLayerId?: string;
  isWFS?: string;
  properties?: {
    imageGalleryEventActionId?: string;
    refreshInterval?: string;
    selectedInitial?: string;
  },
  geoLayerSymbol?: GeoLayerSymbol;
}

/**
 * Interface for Typing the GeoLayerSymbol JSON object created by the GeoProcessor.
 */
export interface GeoLayerSymbol {
  name?: string;
  description?: string;
  classificationType?: string;
  classificationAttribute?: string;
  properties?: {
    color?: string;
    fillColor?: string;
    fillOpacity?: string;
    opacity?: string;
    weight?: string;
    classificationFile?: string;
    symbolSize?: string;
    sizeUnits?: string;
    symbolShape?: string;
    imageAnchorPoint?: string;
    rasterResolution?: string;
    symbolImage?: string;
  }
}

/**
 * Interface for Typing the EventConfig JSON object created by the user.
 */
export interface EventConfig {
  id?: string;
  name?: string;
  description?: string;
  layerAttributes?: {
    include?: any[];
    exclude?: any[];
    formats?: any[];
  }
  actions?: EventAction[];
}

/**
 * Interface for Typing the EventAction JSON object created by the user.
 */
export interface EventAction {
  label?: string;
  action: string;
  resourcePath?: string;
  downloadFile?: string;
  imageGalleryAttribute?: string;
  featureLabelType?: string;
  saveFile?: string;
}

/**
 * Interface for Typing the EventHandler JSON object created by the user.
 */
export interface EventHandler {
  eventType?: string;
  action?: string;
  properties?: {
    eventConfigPath?: string;
    // TODO: jpkeahey 2020.11.24 - popupConfigPath is deprecated.
    popupConfigPath?: string;
  }
}

/**
 * Interface for Typing the main AppConfig JSON object created by the user.
 */
export interface AppConfig {
  title?: string;
  homePage?: string;
  favicon?: string;
  dataUnitsPath?: string;
  googleAnalyticsTrackingId?: string;
  version?: string;
  mainMenu?: MainMenu[];
}

/**
 * Interface for Typing the MainMenu JSON object created by the user.
 */
export interface MainMenu {
  id?: string;
  name?: string;
  align?: string;
  enabled?: any;
  tooltip?: string;
  visible?: any;
  menus?: SubMenu[];
}

/**
 * Interface for Typing the SubMenu JSON object created by the user.
 */
export interface SubMenu {
  name?:  string;
  action?:  string;
  enabled?: any;
  mapProject?: string;
  separatorBefore?: any;
  doubleSeparatorBefore?: any;
  tooltip?: string;
  visible?: any;
}

/**
 * Enum with the supported file paths for the InfoMapper.
 */
export enum Path {
  aCP = 'appConfigPath',
  bSIP = 'builtinSymbolImagePath',
  csvPath = 'csvPath',
  cP = 'classificationPath',
  cPP = 'contentPagePath',
  cPage = 'Content Page',
  dP = 'docPath',
  dVP = 'dateValuePath',
  dUP = 'dataUnitsPath',
  eCP = 'eventConfigPath',
  fMCP = 'fullMapConfigPath',
  gLGJP = 'geoLayerGeoJsonPath',
  hPP = 'homePagePath',
  iGP = 'imageGalleryPath',
  mP = 'markdownPath',
  raP = 'rasterPath',
  rP = 'resourcePath',
  sIP = 'symbolImagePath',
  sMP = 'stateModPath',
  vP = 'versionPath'
}

/**
 * Enum representing the 3 types of files that can be downloaded from the InfoMapper.
 */
export enum SaveFileType {
  dataTable,
  text,
  tstable
}
