// The interface below are typed object that belong to the JSON files created from configuration files passed to the InfoMapper
// to read in as objects, e.g. app-config.json, map configuration files, etc.

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
  action?: string;
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
