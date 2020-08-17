import { Prop } from './Prop';


export class PropList {

  /**
  Indicates that the configuration file format is unknown.
  */
  public static	FORMAT_UNKNOWN = 0;

  /**
  Indicates that the configuration file format is that used by Makefiles.
  */
  public static	FORMAT_MAKEFILE	= 1;

  /**
  Indicates that the configuration file format is that used by NWSRFS
  configuration files (apps_defaults).  A : is used instead of the = for assignment.
  */
  public static	FORMAT_NWSRFS = 2;

  /**
  Indicates that configuration information is being stored in a custom database.
  */
  public static	FORMAT_CUSTOM_DB = 3;

  /**
  Indicates that configuration information is being stored in standard RTi properties file.
  */
  public static	FORMAT_PROPERTIES = 4;

  /**
  Name of this PropList.
  */
  private __listName: string;
  /**
  List of Prop.
  */
  private __list: Prop[];
  /**
  File to save in.
  */
  private __persistentName: string;
  /**
  Format of file to read.
  */
  private __persistentFormat: number;
  /**
  Last line read from the property file.
  */
  private __lastLineNumberRead: number;
  /**
  Indicates if quotes should be treated literally when setting Prop values.
  */
  private __literalQuotes = true;
  /**
  The "how set" value to use when properties are being set.
  */
  private __howSet = Prop.SET_UNKNOWN;

  constructor(input: any) {

    switch(input) {
      case "":
        this.initialize; break;
    }
  }


  /**
  Append a property to the list using a string key, the contents, and value.
  @param key String key for the property.
  @param contents Contents for the property.
  @param value String value for the property.
  */
  private append ( key: string, contents: any, value: string ): void {
    var prop: Prop = new Prop ( [key, contents, value, this.__howSet] );
    // if ( Message.isDebugOn ) {
    //   Message.printDebug ( 100, "PropList.append", "Setting property \"" + key + "\" to: \"" + value + "\"" );
    // }
    this.__list.push ( prop );
  }

  /**
  Returns the list of Props.
  @return the list of Props.
  */
  public getList(): Prop[] {
    return this.__list;
  }

  /**
  Find a property in the list.
  @return The index position of the property corresponding to the string key, or -1 if not found.
  @param key The string key used to look up the property.
  */
  public findProp ( key: string ): number {
    var	size: number = this.__list.length;
    var prop_i: Prop;
    var propKey: string;
    for ( let i = 0; i < size; i++ ) {
      prop_i = this.__list[i];
      propKey = String(prop_i.getKey());
      if ( key.toUpperCase() === propKey.toUpperCase() ) {
        // Have a match.  Return the position...
        // if ( Message.isDebugOn ) {
        //   Message.printDebug ( 100, "PropList.findProp", "Found property \"" + key + "\" at index " + i);
        // }
        return i;
      }
    }
    return -1;
  }

  /**
  Initialize the object.
  @param listName Name for the PropList.
  @param persistentName Persistent name for the PropList (used only when reading from a file).
  @param persistentFormat Format for properties file.
  */
  private initialize ( listName: string, persistentName: string, persistentFormat: number ): void {
    if ( listName == null ) {
      this.__listName = "";
    }
    else {
      this.__listName = listName;
    }
    if ( persistentName == null ) {
      this.__persistentName = "";
    }
    else {
      this.__persistentName = persistentName;
    }
    this.__persistentFormat = persistentFormat;
    this.__list = [];
    this.__lastLineNumberRead = 0;
  }

  /**
  Set the property given a string key and contents.  If the contents do not have
  a clean string value, use set ( new Prop(String,Object,String) ) instead.
  If the property key exists, reset the property to the new information.
  @param key The property string key.
  @param contents The contents of the property as an Object.  The value is
  determined by calling the object's toString() method.  If contents are null, then
  the String value is also set to null.
  */
  public setUsingObject ( key: string, contents: any ): void
  {	// Ignore null keys...

    if ( key == null ) {
      return;
    }

    // Find if this is already a property in this list...

    var index: number = this.findProp ( key );
    var value: string = null;
    if ( contents != null ) {
      contents.toString();
    }
    if ( index < 0 ) {
      // Not currently in the list so add it...
      this.append ( key, contents, value );
    }
    else {
        // Already in the list so change it...
      var prop: Prop = this.__list[ index ];
      prop.setKey ( key );
      prop.setContents ( contents );
      prop.setValue ( value );
      prop.setHowSet ( this.__howSet );
    }
    value = null;
  }

}