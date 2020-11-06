/**
 * A helper singleton class for creating, managing and maintaining Leaflet maps in the Infomapper. The fact that it is singleton
 * is important.
 */
export class MapManager {
  /**
   * The instance of this WindowManager object.
   */
  private static instance: MapManager;
  // The object to hold each Leaflet map reference as the value, with the map configuration's geoMapId property as the key.
  public maps: {} = {};


  /**
   * A private constructor is declared so any instance of the class cannot be created elsewhere, getInstance must be called.
   */
  private constructor() { }


  /**
   * 
   */
  public static getInstance(): MapManager {
    if (!MapManager.instance) { MapManager.instance = new MapManager(); }
    return MapManager.instance;
  }

  /**
   * Adds a Leaflet map reference to the @var maps object with the unique mapID as the key.
   * @param mapID A string representing the geoMapId from the map configuration file.
   * @param mapRef The reference to the Map Component's @var mainMap Leaflet map.
   */
  public addMap(mapID: string, mapRef: any): void {
    this.maps[mapID] = mapRef;
    console.log(this.maps);
  }

  /**
   * @returns A boolean on whether this map has already been created.
   * @param geoMapId The map's geoMapId property from it's configuration file.
   */
  public mapAlreadyCreated(geoMapId: string): boolean {
    return geoMapId in this.maps;
  }

  /**
   * Removes the Leaflet map reference whose mapID is equal to the @var maps key.
   * @param mapID A string representing the geoMapId from the map configuration file.
   */
  public removeMap(mapID: string): void {
    delete this.maps[mapID];
  }

}
