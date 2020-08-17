

/**
This class provides a way to generically store property information and can
be used similar to Java properties, environment variables, etc.  The main
difference is that it allows the contents of a property to be an Object, which
allows flexibility to use the property for anything in Java.
<p>
A property essentially consists of a string key and an associated object.
The functions that deal with property "contents" return the literal object.
The functions that deal with property "value" return a string representation of
the value.  In many cases, the Object will actually be a String and therefore
the contents and value will be the same (there is currently no constructor to
take contents only - if it is added, then the value will be set to
contents.toString() at construction).
<p>
A property can also hold a literal string.  This will be the case when a configuration
file is read and a literal comment or blank line is to be retained, to allow outputting
the properties with very close to the original formatting.  In this case, the
isLiteral() call will return true.
@see PropList
@see PropListManager
*/

// implements Comparable<Prop>
export class Prop {

  /**
  Indicates that it is unknown how the property was set (this is the default).
  */
  public static SET_UNKNOWN = 0;

  /**
  Indicates that the property was set from a file or database.  In this case,
  when a PropList is saved, the property should typically be saved.
  */
  public static SET_FROM_PERSISTENT = 1;

  /**
  Indicates that the property was set at run-time as a default value.  In this
  case, when a PropList is saved, the property often may be ignored because it
  will be set to the same default value the next time.
  */
  public static SET_AS_RUNTIME_DEFAULT = 2;

  /**
  Indicates that the property was set by the user at run-time.  In this case,
  when a PropList is saved, the property should likely be saved because the user
  has specified a value different from internal defaults.
  */
  public static SET_AT_RUNTIME_BY_USER = 3;

  /**
  Indicates that the property was automatically set for the user at run-time.  In
  this case, when a PropList is saved, the property should likely be saved because
  the user the property is considered important in defining something.  However,
  for all practical purposes, it is a run-time default and, in and of itself,
  should not force the user to save.
  */
  public static SET_AT_RUNTIME_FOR_USER = 4;

  /**
  Indicates that the property was set behind the scenes in a way that should be
  invisible to the user.  Users cannot edit hidden properties, will never see
  hidden properties, and should never be able to save hidden properties to a persistent source.
  */
  public static SET_HIDDEN = 5;

  /**
  Indicates whether property is read from a persistent source, set internally as a
  run-time default, or is set at runtime by the user.
  */
  private __howSet: number;
  /**
  Integer key for faster lookups.
  */
  private __intKey: number;
  /**
  Indicate whether the property is a literal string.
  By default the property is a normal property.
  */
  private __isLiteral = false;
  /**
  String to look up property.
  */
  private __key: string;
  /**
  Contents of property (anything derived from Object).  This may be a string or another
  object.  If a string, it contains the value before expanding wildcards, etc.
  */
  private __contents: any;
  /**
  Value of the object as a string.  In most cases, the object will be a string.  The
  value is the fully-expanded string (wildcards and other variables are expanded).  If not
  a string, this may contain the toString() representation.
  */
  private __value: string;

  /**
  Construct a property having no key and no object (not very useful!).
  */
  constructor (input: any[]) {
    if (input[0] === "") {
      this.initialize ( Prop.SET_UNKNOWN, 0, "", null, null );
    } else if (input[1] !== undefined) {
      this.initialize ( input[3], 0, input[0], input[1], input[2] );
    }
    
  }


  /**
  Return the contents (Object) for the property.
  @return The contents (Object) for the property (note: the original is returned, not a copy).
  */
  public getContents (): any {
    return this.__contents;
  }

  /**
  Return the string key for the property.
  @return The string key for the property.
  */
  public getKey (): string {
    return this.__key;
  }

  /**
  Initialize member data.
  */
  private initialize ( howSet: number, intKey: number, key: string, contents: any, value: string ): void {
    this.__howSet = howSet;
    this.__intKey = intKey;
    if ( key == null ) {
      this.__key = ""; 
    }
    else {
        this.__key = key;
    }
    this.__contents = contents;
    if ( value == null ) {
      this.__value = "";
    }
    else {
        this.__value = value;
    }
  }

  /**
  Set the contents for a property.
  @param contents The contents of a property as an Object.
  */
  public setContents ( contents: any ): void {
    // Use a reference here (do we need a copy?)...
    if ( contents != null ) {
      this.__contents = contents;
    }
  }

  /**
  Set how the property is being set (see SET_*).
  Set how the property is being set.
  */
  public setHowSet ( how_set: number ): void {
    this.__howSet = how_set;
  }

  /**
  Set the string key for the property.
  @param key String key for the property.
  */
  public setKey ( key: string ): void {
    if ( key != null ) {
      this.__key = key;
    }
  }

  /**
  Set the string value for the property.
  @param value The string value for the property.
  */
  public setValue ( value: string ): void
  {	if ( value != null ) {
      this.__value = value;
    }
  }

}