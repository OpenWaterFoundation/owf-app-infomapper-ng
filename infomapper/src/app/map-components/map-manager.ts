/**
 * A helper singleton class for creating, managing and maintaining Leaflet maps in the Infomapper. The fact that it is singleton
 * is important.
 */
export class MapManager {
  // The instance of this WindowManager object
  private static instance: MapManager;
  // The object to hold each WindowManagerItem, with the Item's title as a key
  public mapList: any[] = [];

  // A private constructor is declared so any instance of the class cannot be created elsewhere, getInstance must be called
  private constructor() { }


  public static getInstance(): MapManager {
    if (!MapManager.instance) { MapManager.instance = new MapManager(); }
    return MapManager.instance;
  }

  /**
   * 
   * @param dialogRef 
   * @param title 
   * @param type 
   */
  public addMap(): void {
  }


  public removeMap(): void {

  }

}

