import { TimeInterval }       from '../Util/Time/TimeInterval';
import { DateTime }           from '../Util/Time/DateTimeUtil';
import { TSIdent }            from '../TS/TSIdent';
import { TSDataFlagMetadata } from '../TS/TSDataFlagMetadata';
import { TSLimits }           from '../TS/TSLimits';
import { StringUtil }         from '../Util/String/StringUtil';
import { TSData }             from '../TS/TSData';


export class TS {

  /**
  Data flavor for transferring this object.
  */
  // public static DataFlavor tsFlavor = new DataFlavor(RTi.TS.TS.class,"RTi.TS.TS");

  /**
  General string to use for status of the time series (use as appropriate by
  high-level code).  This value is volatile - do not assume its value will remain
  for long periods.  This value is not used much now that the GRTS package has been updated.
  */
  _status: string;

  /**
  Beginning date/time for data, at a precision appropriate for the data.
  Missing data may be included in the period.
  */
  _date1: any;

  /**
  Ending date/time for data, at a precision appropriate for the data.
  Missing data may be included in the period.
  */
  _date2: any;

  /**
  Original starting date/time for data, at a precision appropriate for the data.
  For example, this may be used to indicate the period in a database, which is
  different than the period that was actually queried and saved in memory.
  */
  _date1_original: any;

  /**
  Original ending date/time for data, at a precision appropriate for the data.
  For example, this may be used to indicate the period in a database, which is
  different than the period that was actually queried and saved in memory.
  */
  _date2_original: any;

  /**
  The data interval base.  See TimeInterval.HOUR, etc.
  */
  _data_interval_base: number;	

  /**
  The base interval multiplier (what to multiply _interval_base by to get the
  real interval).  For example 15-minute data would have
  _interval_base = TimeInterval.MINUTE and _interval_mult = 15.
  */
  _data_interval_mult: number;

  /**
  The data interval in the original data source (for example, the source may be
  in days but the current time series is in months).
  */
  _data_interval_base_original: number;

  /**
  The data interval multiplier in the original data source.
  */
  _data_interval_mult_original: number;

  /**
  Number of data values inclusive of _date1 and _date2.  Set in the
  allocateDataSpace() method.  This is useful for general information.
  */
  _data_size: any;	

  /**
  Data units.  A list of units and conversions is typically maintained in the DataUnits* classes.
  */
  _data_units: string;

  /**
  Units in the original data source (e.g., the current data may be in CFS and the
  original data were in CMS).
  */
  _data_units_original: string;

  /**
  Indicates whether data flags are being used with data.  If enabled, the derived
  classes that store data should override the allocateDataSpace(boolean, int)
  method to create a data array to track the data flags.  It is recommended to
  save space that the flags be handled using String.intern().
  */
  _has_data_flags: boolean = false;

  /**
  Indicate whether data flags should use String.intern().
  */
  _internDataFlagStrings: boolean = true;

  // FIXME SAM 2007-12-13 Need to phase this out in favor of handling in DAO code.
  /**
  Version of the data format (mainly for use with files).
  */
  _version: string;

  // FIXME SAM 2007-12-13 Need to evaluate renaming to avoid confusion with TSIdent input name.
  // Implementing a DataSource concept for input/output may help (but also have data source in TSIdent!).
  /**
  Input source information.  Filename if read from file or perhaps a database
  name and table (e.g., HydroBase.daily_flow).  This is the actual location read,
  which should not be confused with the TSIdent storage name (which may not be fully expanded).
  */
  _input_name: string;	

  /**
  Time series identifier, which provides a unique and absolute handle on the time series.
  An alias is provided within the TSIdent class.
  */
  _id: TSIdent;

  /**
  Indicates whether the time series data have been modified by calling
  setDataValue().  Call refresh() to update the limits.  This is not used with header data.
  */
  _dirty: boolean;

  /**
  Indicates whether the time series is editable.  This primarily applies to the
  data (not the header information).  UI components can check to verify whether
  users should be able to edit the time series.  It is not intended to be checked
  by low-level code (manipulation is always granted).
  */
  _editable: boolean = false;

  /**
  A short description (e.g, "XYZ gage at ABC river").
  */
  _description: string;

  /**
  Comments that describe the data.  This can be anything from an original data
  source.  Sometimes the comments are created on the fly to generate a standard
  header (e.g., describe drainage area).
  */
  _comments: any[];

  /**
  List of metadata about data flags.  This provides a description about flags
  encountered in the time series.
  */
  private __dataFlagMetadataList: TSDataFlagMetadata[] = [];

  /**
  History of time series.  This is not the same as the comments but instead
  chronicles how the time series is manipulated in memory.  For example the first
  genesis note may be about how the time series was read.  The second may
  indicate how it was filled.  Many TSUtil methods add to the genesis.
  */
  _genesis: any[];

  /**
  TODO SAM 2010-09-21 Evaluate whether generic "Attributable" interface should be implemented instead.
  Properties for the time series beyond the built-in properties.  For example, location
  information like county and state can be set as a property.
  */
  private __property_HashMap: Map<String,Object> = null;

  /**
  The missing data value.  Default for some legacy formats is -999.0 but increasingly Double.NaN is used.
  */
  _missing: number;

  /**
  Lower bound on the missing data value (for quick comparisons and when missing data ranges are used).
  */
  _missingl: number;

  /**
  Upper bound on the missing data value (for quick comparisons and when missing data ranges are used).
  */
  _missingu: number;

  /**
  Limits of the data.  This also contains the date limits other than the original dates.
  */
  _data_limits: TSLimits;

  /**
  Limits of the original data.  Currently only used by apps like TSTool.
  */
  // TSLimits _data_limits_original;

  //TODO SAM 2007-12-13 Evaluate need now that GRTS is available.
  /**
  Legend to show when plotting or tabulating a time series.  This is generally a short legend.
  */
  _legend: string;

  // TODO SAM 2007-12-13 Evaluate need now that GRTS is available.
  /**
  Legend to show when plotting or tabulating a time series.  This is usually a
  long legend.  This may be phased out now that the GRTS package has been phased in for visualization.
  */
  _extended_legend: string;

  /**
  Indicates whether time series is enabled (used to "comment" out of plots, etc).
  This may be phased out.
  */
  _enabled: boolean;

  /**
  Indicates whether time series is selected (e.g., as result of a query).
  Often time series might need to be programmatically selected (e.g., with TSTool
  selectTimeSeries() command) to simplify output by other commands.
  */
  _selected: boolean;


  /**
  Construct a time series and initialize the member data.  Derived classes should
  set the _data_interval_base.
  */
  constructor () {    
    this.TSInit();
  }

  /**
  Initialize data members.
  */
  TSInit() {
    this._version = "";

    this._input_name = "";

    // Need to initialize an empty TSIdent...    
    this._id = new TSIdent ();
    this._legend = "";
    this._extended_legend = "";
    this._data_size = 0;
    // DateTime need to be initialized somehow...
    this.setDataType( "" );
    this._data_interval_base = 0;
    this._data_interval_mult = 1;
    this._data_interval_base_original = 1;
    this._data_interval_mult_original = 0;
    this.setDescription( "" );
    // TODO: jpkeahey 2020.06.09 - Add these in later
    // this._comments = new Vector<String>(2,2);
    // this._genesis = new Vector<String>(2,2);
    this.setDataUnits( "" );
    this.setDataUnitsOriginal( "" );
    this.setMissing ( -999.0 );
    this._data_limits = new TSLimits();
    this._dirty = true;	// We need to recompute limits when we get the chance
    this._enabled = true;
    this._selected = false;	// Let other code select, e.g., as query result
    this._editable = false;
  }

  /**
  Add a TSDataFlagMetadata instance to the list maintained with the time series, to explain flag meanings.
  @param dataFlagMetadata instance of TSDataFlagMetadata to add to time series.
  */
  public addDataFlagMetadata ( dataFlagMetadata: TSDataFlagMetadata ): void
  {
      this.__dataFlagMetadataList.push(dataFlagMetadata);
  }

  /**
  Allocate the data space for the time series.  This requires that the data
  interval base and multiplier are set correctly and that _date1 and _date2 have
  been set.  If data flags are used, hasDataFlags() should also be called before
  calling this method.  This method is meant to be overridden in derived classes
  (e.g., MinuteTS, MonthTS) that are optimized for data storage for different intervals.
  @return 0 if successful allocating memory, non-zero if failure.
  */
  public allocateDataSpace ( ): number {
    console.error ( 1, "TS.allocateDataSpace", "TS.allocateDataSpace() is virtual, define in derived classes." );
    return 1;
  }

  /**
  Determine if a data value for the time series is missing.  The missing value can
  be set to a range of values or a single value, using setMissing().
  There is no straightforward way to check to see if a value is equal to NaN
  (the code: if ( value == Double.NaN ) will always return false if one or both
  values are NaN).  Consequently there is no way to see know if only one or both
  values is NaN, using the standard operators.  Instead, we assume that NaN
  should be interpreted as missing and do the check if ( value != value ), which
  will return true if the value is NaN.  Consequently, code that uses time series
  data should not check for missing and treat NaN differently because the TS class treats NaN as missing.
  @return true if the data value is missing, false if not.
  @param value Value to check.
  */
  public isDataMissing ( value: number ): boolean {
    if ( isNaN(value) ) {
      return true;
    }
    if ( (value >= this._missingl) && (value <= this._missingu) ) {
      return true;
    }
    return false;
  }

  public formatLegendBool ( format: string, update_ts: boolean ): string {

    var buffer: string = '';

    //Message.printStatus ( 2, "", "Legend format is " + format );
    // Loop through the format string and if format strings are found,
    // append to the buffer.  Otherwise, transfer all characters as given.
    if ( format === null ) {
      return "";
    }
    var len: number = format.length;
    var c: string;
    for ( var i = 0; i < len; i++ ) {
      c = format.charAt(i);
      if ( c == '%' ) {
        // Format modifier.  Get the next character...
        ++i;
        if ( i >= len ) {
          break;
        }
        c = format.charAt ( i );
        if ( c == '%' ) {
          // Literal %...
          buffer += c;
        }
        else if ( c == 'A' ) {
          // Alias from TSIdent...
          buffer += this._id.getAlias();
        }
        else if ( c == 'b' ) {
          // Data interval base...
          buffer += TimeInterval.getName( this._id.getIntervalBase(),1);
        }
        else if ( c == 'D' ) {
          // Description...
          buffer += this._description;
        }
        else if ( c == 'F' ) {
          // Full identifier...
          //buffer += _id.getIdentifier() );
          buffer += this._id.toString();
        }
        else if ( c == 'I' ) {
          // Full interval...
          buffer += this._id.getInterval();
        }
            else if ( c == 'i' ) {
                // Input name...
                buffer += this._id.getInputName();
            }
            else if ( c == 'k' ) {
                  // Sub source...
                  buffer += this._id.getSubSource();
              }
        else if ( c == 'L' ) {
          // Full location...
          buffer += this._id.getLocation();
        }
        else if ( c == 'l' ) {
          // Main location...
          buffer += this._id.getMainLocation();
        }
        else if ( c == 'm' ) {
          // Data interval multiplier...
          buffer += this._id.getIntervalMult();
        }
        else if ( c == 'p' ) {
          // Period...
          buffer += "" + this._date1 + " - " + this._date2;
        }
        else if ( c == 'S' ) {
          // Full source...
          buffer += this._id.getSource();
        }
        else if ( c == 's' ) {
          // Main source...
          buffer += this._id.getMainSource();
        }
        else if ( c == 'U' ) {
          // Units...
          buffer += this._data_units;
        }
        else if ( c == 'T' ) {
          // Data type...
          buffer += this._id.getType();
        }
        else if ( c == 't' ) {
          // Data main type (reserved for future use - for
          // now return the total)...
          buffer += this._id.getType();
        }
        else if ( c == 'y' ) {
          // Data sub type (reserved for future use)...
        }
        else if ( c == 'w' ) {
          // Sub-location...
          buffer += this._id.getSubLocation();
        }
        else if ( c == 'x' ) {
          // Sub source...
          buffer += this._id.getSubSource();
        }
        else if ( c == 'Z' ) {
          // Scenario...
          buffer += this._id.getScenario();
        }
        else if ( c == 'z' ) {
          // Sequence ID (old sequence number)...
          buffer += this._id.getSequenceID();
        }
        else {
            // No match.  Add the % and the character...
          buffer += "%";
          buffer += c;
        }
      }
      else {
          // Just add the character...
        buffer += c;
      }
    }
    //Message.printStatus(2, routine, "After formatLegend(), string is \"" + s2 + "\"" );
      // Now replace ${ts:Property} strings with properties from the time series
      // Put the most specific first so it is matched first
      var startString: string = "${ts:";
      var startStringLength = 5;
      var endString = "}";
      var propO: any;
      var start = 0; // Start at the beginning of the string
      var pos2 = 0;
      var s2: string = buffer;
      while ( pos2 < s2.length ) {
          var pos1 = StringUtil.indexOfIgnoreCase(s2, startString, start );
          if ( pos1 >= 0 ) {
              // Find the end of the property
              pos2 = s2.indexOf( endString, pos1 );
              if ( pos2 > 0 ) {
                  // Get the property...
                  var propname = s2.substring(pos1+startStringLength,pos2);
                  //Message.printStatus(2, routine, "Property=\"" + propname + "\" isTSProp=" + isTsProp + " pos1=" + pos1 + " pos2=" + pos2 );
                  // By convention if the property is not found, keep the original string so can troubleshoot property issues
                  var propvalString = s2.substring(pos1,(pos2 + 1));
                  // Get the property out of the time series
                  propO = this.getProperty(propname);
                  if ( propO != null ) {
                      // This handles conversion of integers to strings
                      propvalString = "" + propO;
                  }
                  // Replace the string and continue to evaluate s2
                  s2 = s2.substring ( 0, pos1 ) + propvalString + s2.substring (pos2 + 1);
                  // Next search will be at the end of the expanded string (end delimiter will be skipped in any case)
                  start = pos1 + propvalString.length;
              }
              else {
                  // No closing character so leave the property string as is and march on...
                  start = pos1 + startStringLength;
                  if ( start > s2.length ) {
                      break;
                  }
              }
          }
          else {
              // No more ${} property strings so done processing properties.
              // If checking time series properties will then check global properties in next loop
              break;
          }
      }
      if ( update_ts ) {
          this.setLegend ( buffer );
      }
    return s2;
  }

  /**
  Return a formatted legend string, without changing the legend in memory.
  @return A formatted legend string for the time series but do not update the
  time series legend data.  See the version that accepts a flag for a description of format characters.
  @param format Format string.
  */
  public formatLegend ( format: string ): string {
    return this.formatLegendBool ( format, false );
  }

  /**
  Return the time series alias from the TSIdent.
  @return The alias part of the time series identifier.
  */
  public getAlias( ): string
  {	return this._id.getAlias();
  }

  /**
  Return the data interval base.
  @return The data interval base (see TimeInterval.*).
  */
  public getDataIntervalBase(): number {
    return this._data_interval_base;
  }

  /**
  Return the original data interval base.
  @return The data interval base of the original data.
  */
  public getDataIntervalBaseOriginal(): number {
    return this._data_interval_base_original;
  }

  /**
  Return the data interval multiplier.
  @return The data interval multiplier.
  */
  public getDataIntervalMult(): number {
    return this._data_interval_mult;
  }

  /**
  Return the original data interval multiplier.
  @return The data interval multiplier of the original data.
  */
  public getDataIntervalMultOriginal(): number {
    return this._data_interval_mult_original;
  }

  /**
  Return a TSData for a date.  This method should be defined in derived classes,
  especially if data flags are being used.
  @param date date/time to get data.
  @param tsdata if null, a new instance of TSData will be returned.  If non-null, the provided
  instance will be used (this is often desirable during iteration to decrease memory use and
  increase performance).
  @return a TSData for the specified date/time.
  */
  public getDataPoint ( date: DateTime, tsdata: TSData ): TSData {
    console.warn( 3, "TS.getDataPoint", "This is a virtual function, redefine in child classes" );
    // Empty point...
    var data: TSData = new TSData();
    return data;
  }

  /**
  Return the number of data points that are allocated in memory.
  Zero will be returned if allocateDataSpace() has not been called.
  @return The number of data points included in the period.
  */
  public getDataSize( ): number {
    return this._data_size;
  }

  /**
  Return the data type from the TSIdent or an empty string if no TSIdent has been set.
  @return The data type abbreviation.
  */
  public getDataType( ): string {
    if ( this._id == null ) {
      return "";
    }
    else {
        return this._id.getType();
    }
  }

  /**
  Return the data units.
  @return The data units.
  @see RTi.Util.IO.DataUnits
  */
  public getDataUnits( ): string {
    return this._data_units;
  }

  /**
  Return the original data units.
  @return The data units in the original data.
  @see RTi.Util.IO.DataUnits
  */
  public getDataUnitsOriginal( ): string {
    return this._data_units_original;
  }

  /**
  Return the first date in the period of record (returns a copy).
  @return The first date in the period of record, or null if the date is null.
  */
  public getDate1(): DateTime {
    if ( this._date1 === null ) {
      return null;
    }    
    return DateTime.copyConstructor ( this._date1 );
  }

  /**
  Return the first date in the original period of record (returns a copy).
  @return The first date of the original data source (generally equal to or
  earlier than the time series that is actually read), or null if the date is null.
  */
  public getDate1Original(): DateTime {
    if ( this._date1_original === null ) {
      return null;
    }
    return DateTime.copyConstructor ( this._date1_original);
  }

  /**
  Return the last date in the period of record (returns a copy).
  @return The last date in the period of record, or null if the date is null.
  */
  public getDate2(): DateTime {
    if ( this._date2 === null ) {
      return null;
    }
    return DateTime.copyConstructor ( this._date2 );
  }

  /**
  Return the last date in the original period of record (returns a copy).
  @return The last date of the original data source (generally equal to or
  later than the time series that is actually read), or null if the date is null.
  */
  public getDate2Original(): DateTime {
    if ( this._date2_original === null ) {
      return null;
    }
    return DateTime.copyConstructor ( this._date2_original );
  }

  /**
  Return the time series legend.
  @return Time series legend.
  */
  public getLegend(): string {
    return this._legend;
  }

  /**
  Return the location part of the time series identifier.  Does not include location type.
  @return The location part of the time series identifier (from TSIdent).
  */
  public getLocation(): string {
    return this._id.getLocation();
  }

  /**
  Return the missing data value used for the time series (single value).
  @return The value used for missing data.
  */
  public getMissing (): number {
    return this._missing;
  }

  /**
  Get a time series property's contents (case-specific).
  @param propertyName name of property being retrieved.
  @return property object corresponding to the property name.
  */
  public getProperty ( propertyName: string ): any
  {
      if ( this.__property_HashMap == null ) {
          return null;
      }
      return this.__property_HashMap.get ( propertyName );
  }


  /**
  Return the time series identifier as a TSIdent.
  @return the time series identifier as a TSIdent.
  @see TSIdent
  */
  public getIdentifier(): TSIdent {	
    return this._id;
  }

  /**
  Return the time series identifier as a String.  This returns TSIdent.getIdentifier().
  @return The time series identifier as a string.
  @see TSIdent
  */
  public getIdentifierString(): string {
    return this._id.getIdentifier();
  }

  /**
  Return whether data flag strings use String.intern().
  @return True if data flag strings use String.intern(), false otherwise.
  */
  public getInternDataFlagStrings(): boolean {  
    return this._internDataFlagStrings;
  }

  // FIXME SAM 2010-08-20 Evaluate phasing this out.  setDataValue() now automatically turns on
  // data flags when a flag is passed in.  Also, using intern strings improves memory management so
  // allocating memory is not such a big deal as it was in the past.
  /**
  Set whether the time series has data flags.  This method should be called before
  allocateDataSpace() is called.  If data flags are enabled, allocateDataSpace()
  will allocate memory for the data and data flags.
  @param hasDataFlags Indicates whether data flags will be associated with each data value.  The data flag is a String.
  @param internDataFlagStrings if true, then String.intern() will be used to manage the data flags.  This generally
  is advised because flags often consist of the same strings used repeatedly.  However, if unique
  string values are used, then false can be specified so as to not bloat the global String table.
  @return true if data flags are enabled for the time series, after the set.
  */
  public hasDataFlags ( hasDataFlags: boolean, internDataFlagStrings: boolean ): boolean {
    this._has_data_flags = hasDataFlags;
      this._internDataFlagStrings = internDataFlagStrings;
    return this._has_data_flags;
  }

  /**
  Set the time series identifier alias.
  @param alias Alias of time series.
  */
  public setAlias ( alias: string ): void {
    if ( alias != null ) {
      this._id.setAlias( alias );
    }
  }

  /**
  Set the first date in the period.  A copy is made.
  The date precision is set to the precision appropriate for the time series.
  @param t First date in period.
  @see DateTime
  */
  public setDate1 ( t: any ): void {
    if ( t != null ) {
      this._date1 = DateTime.copyConstructor ( t );
      if ( this._data_interval_base != TimeInterval.IRREGULAR ) {
          // For irregular, rely on the DateTime precision
          this._date1.setPrecisionOne ( this._data_interval_base );
      }
    }
  }

  /**
  Set the first date in the period in the original data.  A copy is made.
  The date precision is set to the precision appropriate for the time series.
  @param t First date in period in the original data.
  @see DateTime
  */
  public setDate1Original( t: any ): void {
    if ( t != null ) {
      this._date1_original = DateTime.copyConstructor ( t );
      if ( this._data_interval_base != TimeInterval.IRREGULAR ) {
              // For irregular, rely on the DateTime precision
          this._date1_original.setPrecisionOne ( this._data_interval_base );
      }
    }
  }

  /**
  Set the last date in the period.  A copy is made.
  The date precision is set to the precision appropriate for the time series.
  @param t Last date in period.
  @see DateTime
  */
  public setDate2 ( t: any ): void {
    if ( t != null ) {
      this._date2 = DateTime.copyConstructor ( t );
      if ( this._data_interval_base != TimeInterval.IRREGULAR ) {
              // For irregular, rely on the DateTime precision
          this._date2.setPrecisionOne ( this._data_interval_base );
      }
    }
  }

  /**
  Set the last date in the period in the original data. A copy is made.
  The date precision is set to the precision appropriate for the time series.
  @param t Last date in period in the original data.
  @see DateTime
  */
  public setDate2Original( t: any ): void {
    if ( t != null ) {
      this._date2_original = DateTime.copyConstructor ( t );
      if ( this._data_interval_base != TimeInterval.IRREGULAR ) {
              // For irregular, rely on the DateTime precision
          this._date2_original.setPrecisionOne ( this._data_interval_base );
      }
    }
  }

  /**
  Set the data interval.
  @param base Base interval (see TimeInterval.*).
  @param mult Base interval multiplier.
  */
  setDataInterval ( base: number, mult: number ) {
    this._data_interval_base = base;
    this._data_interval_mult = mult;
  }

  /**
  Set the data interval for the original data.
  @param base Base interval (see TimeInterval.*).
  @param mult Base interval multiplier.
  */
  setDataIntervalOriginal ( base: number, mult: number ) {
    this._data_interval_base_original = base;
    this._data_interval_mult_original = mult;
  }

  /**
  Set the data type.
  @param data_type Data type abbreviation.
  */
  setDataType( data_type: string ) {
    if ( (data_type != null) && (data_type !== 'undefined') && (this._id != null) ) {      
      this._id.setType ( data_type );
    }
  }

  /**
  Set the data units.
  @param data_units Data units abbreviation.
  @see RTi.Util.IO.DataUnits
  */
  setDataUnits( data_units: string ) {
    if (( data_units != null ) && (data_units !== 'undefined')) {
      this._data_units = data_units;
    }
  }

  /**
  Set the data units for the original data.
  @param units Data units abbreviation.
  @see RTi.Util.IO.DataUnits
  */
  setDataUnitsOriginal( units: string ) {
    if ( units != null ) {
      this._data_units_original = units;
    }
  }

  /**
  Set the number of data points including the full period.  This should be called by refresh().
  @param data_size Number of data points in the time series.
  */
  protected setDataSize ( data_size: number ): void {
    this._data_size = data_size;
  }

  /**
  Set a data value for the specified date.
  @param date Date of interest.
  @param val Data value for date.
  @see RTi.Util.Time.DateTime
  */
  public setDataValueTwo ( date: DateTime, val: number ): void {
    console.error ("TS.setDataValue is " +
    "virtual and should be redefined in derived classes" );
  }

  // TODO SAM 2010-08-03 if flag is null, should it be treated as empty string?  What about append?
  /**
  Set a data value and associated information for the specified date.  This method
  should be defined in derived classes.
  @param date Date of interest.
  @param val Data value for date.
  @param data_flag Data flag associated with the data value.
  @param duration Duration (seconds) for the data value (specify as 0 if not relevant).
  @see DateTime
  */
  public setDataValueFour ( date: DateTime, val: number, data_flag: string,	duration: number ): void {
    console.warn ( "TS.setDataValue is " +
    "virtual and should be implemented in derived classes" );
  }

  /**
  Set the description.
  @param description Time series description (this is not the comments).
  */
  setDescription( description: string ) {
    if ( description != null ) {
      this._description = description;
    }
  }

  /**
  Set the time series identifier using a string.
  Note that this only sets the identifier but
  does not set the separate data fields (like data type).
  @param identifier Time series identifier.
  @exception Exception If there is an error setting the identifier.
  */
  public setIdentifier( identifier: string ): void {
    if ( identifier != null ) {
      this._id.setIdentifier( identifier );
    }
  }

  /**
  Set the time series identifier using a string.
  Note that this only sets the identifier but
  does not set the separate data fields (like data type).
  @param identifier Time series identifier.
  @exception Exception If there is an error setting the identifier.
  */
  setIdentifierString( identifier: string ) {    
    if ( identifier != null ) {
        this._id.setIdentifier( identifier );
    }
  }

  /**
  Set the time series identifier using a TSIdent.
  Note that this only sets the identifier but
  does not set the separate data fields (like data type).
  @param id Time series identifier.
  @see TSIdent
  @exception Exception If there is an error setting the identifier.
  */
  public setIdentifierObject ( id: any ): void {
    if ( id != null ) {
      this._id = new TSIdent ( id );
    }
  }

  /**
  Set the input name (file or database table).
  */
  public setInputName ( input_name: string ): void {
    if ( input_name != null ) {
      this._input_name = input_name;
    }
  }

  /**
  Set the time series legend.
  @param legend Time series legend (can be used for labels on graphs, etc.).
  @see #formatLegend
  */
  public setLegend ( legend: string ): void {
    if ( legend != null ) {
      this._legend = legend.trim();
    }
  }

  /**
  Set the missing data value for the time series.  The upper and lower bounds
  of missing data are set to this value +.001 and -.001, to allow for precision truncation.
  The value is constrained to Double.MAX and Double.Min.
  @param missing Missing data value for time series.
  */
  setMissing ( missing: number ) {
    this._missing = missing;
    if ( isNaN(missing) ) {
      // Set the bounding limits also just to make sure that values like -999 are not treated as missing.
        this._missingl = NaN;
        this._missingu = NaN;
      return;
    }
    // TODO: jpkeahey 2020.06.09 - Is MAX_SAFE_INTEGER correct here? It used to be Double.MAX_VALUE for Java
    // Will this value work with Typescript?
    if ( missing == Number.MAX_SAFE_INTEGER ) {
      this._missingl = missing - .001;
      this._missingu = missing;
    }
    else {
      // Set a range on the missing value check that is slightly on each side of the value
      this._missingl = missing - .001;
      this. _missingu = missing + .001;
    }
  }

  /**
  Set a time series property's contents (case-specific).
  @param propertyName name of property being set.
  @param property property object corresponding to the property name.
  */
  public setProperty ( propertyName: string, property: any ): void
  {
      if ( this.__property_HashMap == null ) {
          this.__property_HashMap = new Map<String, Object>();
      }
      this.__property_HashMap.set ( propertyName, property );
  }

  /**
  Set the sequence identifier (old sequence number), used with ensembles.
  @param sequenceID sequence identifier for the time series.
  */
  public setSequenceID ( sequenceID: string ): void {
    this._id.setSequenceID ( sequenceID );
  }

}