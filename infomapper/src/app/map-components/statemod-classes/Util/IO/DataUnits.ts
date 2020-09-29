// DataUnits - class to provide capabilities for reading and storing data units and conversion between units
import { AppService }          from 'src/app/app.service';

import { map }                 from 'rxjs/operators';

import { DataFormat }          from './DataFormat';
import { DataUnitsConversion } from './DataUnitsConversion';
import { DataDimension }       from './DataDimension';
import { StringUtil }          from '../../StringUtil';

/* NoticeStart
CDSS Common Java Library
CDSS Common Java Library is a part of Colorado's Decision Support Systems (CDSS)
Copyright © 1994-2019 Colorado Department of Natural Resources
CDSS Common Java Library is free software:  you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.
    CDSS Common Java Library is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
    You should have received a copy of the GNU General Public License
    along with CDSS Common Java Library.  If not, see <https://www.gnu.org/licenses/>.
NoticeEnd */

/**
The DataUnits class provides capabilities for reading and storing 
data units and conversion between units.  Units are maintained internally using a list of DataUnits.
*/
export class DataUnits {

  /**
  Indicates that the units system is unknown.
  */
  public static SYSTEM_UNKNOWN = 0;
  /**
  Indicates that the units are for the English System.
  */
  public static SYSTEM_ENGLISH = 1;
  /**
  Indicates that the units are for the International System.
  */
  public static SYSTEM_SI = 2;
  /**
  Indicates that the units are for both English and International System.
  */
  public static SYSTEM_ALL = 3;

  // Data members...

  /**
  The units abbreviation (e.g., "AF").
  */
  private __abbreviation: string;
  /**
  The long name (e.g., "ACRE-FOOT").
  */
  private __long_name: string;
  /**
  The dimension (e.g., "L3").
  */
  private __dimension: DataDimension;
  /**
  Indicates whether it the base unit in the dimension.
  */
  private __base_flag: number;
  /**
  The number of digits of precision after the decimal point output.
  */
  private __output_precision: number;
  /**
  Units system (SYSTEM_SI, SYSTEM_ENGLISH, SYSTEM_ALL, or SYSTEM_UNKNOWN).
  */
  private __system: number;
  /**
  Multiplier for conversion (relative to base).
  */
  private __mult_factor: number;
  /**
  Add factor for conversion (relative to base).
  */
  private __add_factor: number;
  /**
  Behavior flag (e.g., whether to output in upper-case).
  */
  private __behavior_mask: number;
  /**
  Note indicating source of the data units.
  */
  private __source: string;

  /**
  List of internally-maintained available units, make sure to be non-null.
  */
  private static __units_Vector: DataUnits[] = [];


  constructor (constructType: number, units?: DataUnits, dimension?: string, base_flag?: number,
  abbreviation?: string, long_name?: string, output_precision?: number, mult_factor?: number, add_factor?: number, source?: string) {

    switch(constructType) {
      // Construct and set all data members to empty strings and zeros.
      case 0: this.initialize; break;
      // Construct using the individual data items.  The data source is set to an empty string.
      case 1:
        this.initialize ();
        try {
          this.setDimension ( dimension );
        }
        catch ( e ) {
          // Do nothing for now.
        }
        this.__base_flag = base_flag;
        this.setAbbreviation ( abbreviation );
        this.setLongName ( long_name );
        this.__output_precision = output_precision;
        this.__mult_factor = mult_factor;
        this.__add_factor = add_factor;
        this.setSource ('');
        break;
      // Construct using the individual data items.
      case 2:
        this.initialize ();
        try {
          this.setDimension ( dimension );
        }
        catch ( e ) {
          // Do nothing for now.
        }
        this.__base_flag = base_flag;
        this.setAbbreviation ( abbreviation );
        this.setLongName ( long_name );
        this.__output_precision = output_precision;
        this.__mult_factor = mult_factor;
        this.__add_factor = add_factor;
        this.setSource (source);
        break;
      // Copy constructor.
      case 3:
        this.initialize();
        this.setAbbreviation ( units.__abbreviation );
        this.setLongName ( units.__long_name );
        try {
            // Converts to integer, etc.
            this.setDimension ( units.__dimension.getAbbreviation() );	
        }
        catch ( e ) {
          var routine = "DataUnits";
          // Message.printWarning(3, routine, "Error copying units." );
          // Message.printWarning(3, routine, e);
          // Do nothing for now...
        }
        this.__base_flag = units.__base_flag;
        this.__output_precision = units.__output_precision;
        this.__system = units.__system;
        this.__mult_factor = units.__mult_factor;
        this.__add_factor = units.__add_factor;
        this.__behavior_mask = units.__behavior_mask;
        break;
    }
  }


  /**
  Add a set of units to the internal list of units.  After adding, the units can
  be used throughout the application.
  @param units Instance of DataUnits to add to the list.
  */
  public static addUnits ( units: DataUnits ): void {
    // First see if the units are already in the list...

    var size: number = this.__units_Vector.length;
    var pt: DataUnits = null;
    for ( var i = 0; i < size; i ++ ) {
      // Get the units for the loop index...
      pt = this.__units_Vector[i];
      // Now compare...
      if ( units.getAbbreviation().toUpperCase() === pt.getAbbreviation().toUpperCase() ) {
        // The requested units match something that is already in the list.  Reset the list...
        this.__units_Vector.splice ( i, 0, units );
        return;
      }
    }
    // Need to add the units to the list...
    this.__units_Vector.push ( units );
  }

  /**
  Determine whether a list of units strings are compatible.
  The units are allowed to be different as long as they are within the same
  dimension (e.g., each is a length).
  If it is necessary to guarantee that the units are exactly the same, call the
  version of this method that takes the boolean flag.
  @param units_strings list of units strings.
  */
  public static areUnitsStringsCompatible ( units_strings: string[] ): boolean {
    return this.areUnitsStringsCompatibleBool ( units_strings, false );
  }

  /**
  Determine whether a two units strings are compatible.
  The units are allowed to be different as long as they are within the same dimension (e.g., each is a length).
  @param units_string1 First units strings.
  @param units_string2 Second units strings.
  @param require_same Flag indicating whether the units must exactly match (no
  conversion necessary).  If true, the units must be the same.  If false, the
  units must only be in the same dimension (e.g., "CFS" and "GPM" would be compatible).
  */
  public static areUnitsStringsCompatible3 ( units_string1: string, units_string2: string, require_same: boolean ): boolean {	
    var units_strings: string[] = new Array<string>(2);
    units_strings.push ( units_string1 );
    units_strings.push ( units_string2 );
    var result: boolean = this.areUnitsStringsCompatibleBool ( units_strings, require_same);
    return result;
  }

  /**
  Determine whether a list of units strings are compatible.
  @param units_strings list of units strings.
  @param require_same Flag indicating whether the units must exactly match (no
  conversion necessary).  If true, the units must be the same, either in
  spelling or have the a conversion factor of unity.  If false, the
  units must only be in the same dimension (e.g., "CFS" and "GPM" would be compatible).
  */
  public static areUnitsStringsCompatibleBool ( units_strings: string[], require_same: boolean ): boolean {
    if ( units_strings === null ) {
      // No units.  Decide later whether to throw an exception.
      return true;
    }
    var size: number = units_strings.length;
    if ( size < 2 ) {
      // No need to compare...
      return true;
    }
    var units1: string = units_strings[0];
    if ( units1 === null ) {
      return true;
    }
    var units2: string;
    // Allow nulls because it is assumed that later they will result in an ignored conversion...
    var conversion: DataUnitsConversion = null;
    for ( var i = 1; i < size; i++ ) {
      units2 = units_strings[i];
      if ( units2 === null ) {
        continue;
      }
      // Get the conversions and return false if a conversion cannot be obtained...
      try {
          conversion = this.getConversion ( units1, units2 );
        if ( require_same ) {
          // If the factors are not unity, return false.
          // This will allow AF and ACFT to compare exactly...
          if ( (conversion.getAddFactor() != 0.0) || (conversion.getMultFactor() != 1.0) ) {
            return false;
          }
        }
      }
      catch ( e ) {
        return false;
      }
    }
    return true;
  }

  /**
  This routine checks the internal list of units data for integrity.  This
  consists of making sure that for units of a dimension, there is
  base unit only.  THIS ROUTINE IS CURRENTLY A PLACEHOLDER.
  @TODO SAM 2009-03-25 THE FUNCTIONALITY NEEDS TO BE ADDED.
  */
  private static checkUnitsData ( ): void
  {	// First see if the units are already in the list...

    //Message.printWarning ( 3, routine, "No functionality here yet!" );
  }

  /**
  Finalize before garbage collection.
  @exception Throwable if an error occurs.
  */
  protected finalize (): void {
    this.__abbreviation = null;
    this.__long_name = null;
    this.__dimension = null;
    // super.finalize();
  }

  /**
  Return the units abbreviation string.
  @return The units abbreviation string.
  */
  public getAbbreviation ( ): string {
    return this.__abbreviation;
  }

  /**
  Return The addition factor when converting to the base units.
  @return The addition factor when converting to the base units.
  */
  public getAddFactor ( ): number {
    return this.__add_factor;
  }

  /**
  Return One (1) if the units are the base units for a dimension, zero otherwise.
  @return One (1) if the units are the base units for a dimension, zero otherwise.
  */
  public getBaseFlag ( ) {
    return this.__base_flag;
  }

  /**
  Return "BASE" if the unit is the base unit for conversions, and "OTHR" if not.
  @return "BASE" if the unit is the base unit for conversions, and "OTHR" if not.
  */
  public getBaseString ( ): string {
    if ( this.__base_flag === 1 ) {
      return "BASE";
    }
    else {
        return "OTHR";
    }
  }

  /**
  Get the conversion from units string to another.
  @return A DataUnitsConversion instance with the conversion information from one set of units to another.
  @param u1_string Original units.
  @param u2_string The units after conversion.
  @exception Exception If the conversion cannot be found.
  */
  public static getConversion ( u1_string: string, u2_string: string ): DataUnitsConversion {
    // Call the routine that takes the auxiliary information.  This is not
    // fully implemented at this time but provides a migration path from the legacy code...
    return this.getConversionFull ( u1_string, u2_string, 0.0, "" );
  }

  /**
  Get the conversion from units string to another.
  @return A DataUnitsConversion instance with the conversion information from one set of units to another.
  @param u1_string Original units.
  @param u2_string The units after conversion.
  @param aux An auxiliary piece of information when converting between units of different dimension.
  @param aunits The units of "aux".
  @exception Exception If the conversion cannot be found.
  */
  public static getConversionFull ( u1_string: string, u2_string: string, aux: number, aunits: string ): DataUnitsConversion {
    var	dl = 20;
    var routine = "DataUnits.getConversion", u1_dim, u2_dim;

    // if ( Message.isDebugOn ) {
    //   Message.printDebug ( dl, routine,
    //   "Trying to get conversion from \"" + u1_string + "\" to \"" + u2_string + "\"" );
    // }

    // Make sure that the units strings are not NULL...

    if ( ((u1_string === null) || (u1_string === "")) && ((u2_string === null) || (u2_string === "")) ) {
      // Both units are unspecified so return a unit conversion...
      var c: DataUnitsConversion = new DataUnitsConversion(null);
      c.setMultFactor ( 1.0 );
      c.setAddFactor ( 0.0 );
      return c;
    }

    var message = "";
    // if ( u1_string === null ) {
    //   message = "Source units string is NULL";
    //   Message.printWarning ( 3, routine, message );
    //   throw new Exception ( message );
    // }
    // if ( u2_string === null ) {
    //   message = "Secondary units string is NULL";
    //   Message.printWarning ( 3, routine, message );
    //   throw new Exception ( message );
    // }

    // Set the conversion units...

    var c: DataUnitsConversion = new DataUnitsConversion(null);
    c.setOriginalUnits ( u1_string );
    c.setNewUnits ( u2_string );

    // First thing we do is see if the units are the same.  If so, we are done...

    if ( u1_string.trim().toUpperCase() === u2_string.trim().toUpperCase() ) {
      c.setMultFactor ( 1.0 );
      c.setAddFactor ( 0.0 );
      return c;
    }

    // if ( u1_string.length() === 0 ) {
    //   message = "Source units string is empty";
    //   Message.printWarning ( 3, routine, message );
    //   throw new Exception ( message );
    // }
    // if ( u2_string.length() === 0 ) {
    //   message = "Secondary units string is empty";
    //   Message.printWarning ( 3, routine, message );
    //   throw new Exception ( message );
    // }

    // First get the units data...

    var u1: DataUnits, u2: DataUnits;
    try {
        u1 = this.lookupUnits ( u1_string );
    }
    catch ( e ) {
      message = "Unable to get units type for \"" + u1_string + "\"";
      console.warn ( 3, routine, message );
      throw new Error ( message );
      
    }
    try {
        u2 = this.lookupUnits ( u2_string );
    }
    catch ( e ) {
      message = "Unable to get units type for \"" + u2_string + "\"";
      console.warn ( 3, routine, message );
      throw new Error ( message );
    }

    // Get the dimension for the units of interest...

    u1_dim = u1.getDimension().getAbbreviation();
    u2_dim = u2.getDimension().getAbbreviation();

    if ( u1_dim.equalsIgnoreCase(u2_dim) ) {
      // Same dimension...
      c.setMultFactor ( u1.getMultFactor()/u2.getMultFactor() );
      // For the add factor assume that a value over .001 indicates
      // that an add factor should be considered.  This should only
      // be the case for temperatures and all other dimensions should have a factor of 0.0.
      if ( (Math.abs(u1.getAddFactor()) > .001) || (Math.abs(u2.getAddFactor()) > .001) ){
        // The addition factor needs to take into account the
        // different scales for the measurement range...
        c.setAddFactor ( -1.0*u2.getAddFactor()/u2.getMultFactor() + u1.getAddFactor()/u2.getMultFactor() );
      }
      else {
          c.setAddFactor ( 0.0 );
      }
      // Message.printStatus(1, "", "Add factor is " + c.getAddFactor());
    }
    else {
        message = "Dimensions are different for " + u1_string + " and " + u2_string;
      console.error ( 3, routine, message );
      throw new Error ( message );
    }

    // Else, units groups are of different types - need to do more than
    // one step.  These are currently special cases and do not handle a
    // generic conversion (dimensional analysis like Unicalc)!

  /*  Not yet enabled in java...
    else if	(((u1_dim.getDimension() === DataDimension.VOLUME) &&
      (u2_dim.getDimension() === DataDimension.LENGTH)) ||
      ((u1_dim.getDimension() === DataDimension.DISCHARGE)&&
      (u2_dim.getDimension() === DataDimension.LENGTH))) {
      // 1) Convert volume to M3, 2) convert area to M2, 3) divide
      // volume by area, 4) convert depth to correct units...
      //
      // If dealing with discharge, ignore time (for now)...
      DataUnitsConversion c2;
      if ( u1_dim.getDimension() === DataDimension.VOLUME ) {
        try {	c2 = getConversion ( u1_string, "M3" );
        }
        catch ( Exception e ) {
          throw new Exception (
          "can't get M3 conversion" );
        }
        mfac = c2.getMultFactor();
        afac = c2.getAddFactor();
        c.setMultFactor ( c2.getMultFactor() );
      }
      else if ( u1_dim.getDimension() === DataDimension.DISCHARGE ) {
        try {	c2 = getConversion ( u1_string, "CMS" );
        }
        catch ( Exception e ) {
          throw new Exception (
          "can't get M3 conversion" );
        }
        mfac = c2.getMultFactor();
        afac = c2.getAddFactor();
        c.setMultFactor ( c2.getMultFactor() );
      }
      try {	c2 = getConversion ( aunits, "M2" );
      }
      catch ( Exception e ) {
        throw new Exception ( "can't get M2 conversion" );
      }
      double add, mult = c.getMultFactor();
      mfac = c2.getMultFactor();
      afac = c2.getAddFactor();
      area	= aux;
      area	*= mfac;
      mult	/= area;
      c.setMultFactor ( mult );
      try {	c2 = getConversion ( "M", u2_string );
      }
      catch ( Exception e ) {
        throw new Exception ( "can't get M conversion" );
      }
      mfac = c2.getMultFactor();
      mult	*= mfac;	
      add	= 0.0;
      c.setMultFactor ( mult );
    }
  */
    return c;
  }

  /**
  Return a DataDimension instance for the units.
  @return A DataDimension instance for the units.
  @see DataDimension
  */
  public getDimension ( ): DataDimension
  {	return this.__dimension;
  }

  /**
  Return the long name for the units.
  @return The long name for the units.
  */
  public getLongName ( ): string {
    return this.__long_name;
  }

  /**
  Return the multiplication factor used to convert to the base units.
  @return The multiplication factor used to convert to the base units.
  */
  public getMultFactor ( ): number {
    return this.__mult_factor;
  }

  /**
  Determine the format for output based on the units and precision.  A default precision of 2 is used.
  @return the printing format for data of a units type.
  @param units_string Units of data.
  @param width Width of output (if zero, no width will be used in the format).
  */
  public static getOutputFormat ( units_string: string, width: number ): DataFormat {
    return this.getOutputFormat3 ( units_string, width, 2 );
  }

  /**
  Determine the format for output based on the units and precision.
  @return the printing format for data of a units type.
  @param units_string Units of data.
  @param width Width of output (if zero, no width will be used in the format).
  @param default_precision Default precision if precision cannot be determined
  from the units.  If not specified, 2 will be used.
  */
  public static getOutputFormat3 ( units_string: string, width: number, default_precision: number ): DataFormat {
    var routine = "DataUnits.getOutputFormat";

    // Initialize the DataFormat for return...

    var format = new DataFormat();
    format.setWidth ( width );
    format.setPrecision ( default_precision );

    // Check for valid units request...

    if ( (units_string === null) || (units_string.length === 0) ) {
      // No units are specified...
      console.warn ( 3, routine, "No units abbreviation specified.  Using precision " + default_precision );
      return format;
    }

    // Get the units...

    try {
      var units: DataUnits = this.lookupUnits ( units_string );
      format.setPrecision ( units.getOutputPrecision() );
    }
    catch ( e ) {
      console.warn ( 3, "DataUnits.getOutputFormat",
      "Unable to find data for units \"" + units_string + "\".  Using format \"" + format.toString() + "\"" );
    }
    return format;
  }

  /**
  Get the output format string for data given the units, width and precision.
  @return the output format string in C-style format (e.g., %10.2f).
  @param units Units of data.
  @param width Width of output (if zero, no width will be used in the format).
  @param default_precision Default precision if precision cannot be determined
  from the units.  If not specified, 2 will be used.
  */
  public static getOutputFormatString ( units: string, width: number, default_precision: number ): string {
    return this.getOutputFormat3(units,width,default_precision).toString();
  }

  /**
  Return the output precision for the units.
  @return The output precision for the units (the number of digits after the decimal point).
  */
  public getOutputPrecision ( ): number {
    return this.__output_precision;
  }

  /**
  Return The source of the data units.
  @return The source of the data units (narrative).
  */
  public getSource ( ): string {
    return this.__source;
  }

  /**
  Return The units system.
  @return The units system.  See SYSTEM*.
  */
  public getSystem ( ) {
    return this.__system;
  }

  /**
  Return the units system as a string.
  @return The units system as a string ("SI", "ENGL", "" ). See SYSTEM*.
  */
  public getSystemString ( ): string
  {	if ( this.__system === DataUnits.SYSTEM_SI ) {
      return "SI";
    }
    else if ( this.__system === DataUnits.SYSTEM_ENGLISH ) {
      return "ENGL";
    }
    else if ( this.__system === DataUnits.SYSTEM_ALL ) {
      return "ALL";
    }
    else {
        return "";
    }
  }

  /**
  Return the list of units data.
  @return the list of units data (useful for debugging and GUI displays).
  Perhaps later overload to request by dimension, system, etc.
  */
  public static getUnitsData(): DataUnits[] {
    return this.__units_Vector;
  }

  /**
  Initialize data members.
  */
  private initialize (): void {
    this.setAbbreviation ( "" );
    this.setLongName ( "" );

    // _dimension is initialized in its class

    this.__base_flag = 0;
    this.__output_precision = 2;
    this.__system = DataUnits.SYSTEM_UNKNOWN;
    this.__mult_factor = 0.0; // This will cause obvious errors to show up if units are not defined correctly.
    this.__add_factor = 0.0;
    this.__behavior_mask = 0;
    this.__source = "";
  }

  /**
  Return a DataUnits instance, given the units abbreviation.  A copy is NOT made.
  @return A DataUnits instance, given the units abbreviation.
  @param units_string The units abbreviation to look up.
  @exception Exception If there is a problem looking up the units abbreviation.
  */
  public static lookupUnits ( units_string: string ): DataUnits {
    var routine = "DataUnits.lookupUnits";

    // First see if the units are already in the list...

    var size = this.__units_Vector.length;
    var pt: DataUnits = null;
    for ( var i = 0; i < size; i++ ) {
      pt = this.__units_Vector[i];
      // if ( Message.isDebugOn ) {
      //   Message.printDebug ( 20, routine, "Comparing \"" + units_string + "\" and \"" + pt.getAbbreviation() + "\"");
      // }
      if ( units_string.toUpperCase() === pt.getAbbreviation().toUpperCase() ) {
        // The requested units match something that is in the list.  Return the matching DataUnits...
        return pt;
      }
    }
    // Throw an exception...
    throw new Error ( "\"" + units_string + "\" units not found" );
  }

  /**
  Return all the DataUnits objects that have the Dimension abbreviation equal to the parameter passed in.
  @param system Requested units system.  Pass null or "" to get all systems,
  "ENGL" for English, or "SI" for SI units.
  @param dimension the dimension abbreviation to return units for.
  @return a list of all the DataUnits objects that match the dimension or an empty list if none exist.
  */
  public static lookupUnitsForDimension ( system: string, dimension: string ): DataUnits[] {
    var v: DataUnits[] = [];

    // First see if the units are already in the list...

    var size = this.__units_Vector.length;
    var pt: DataUnits = null;
    var dud: DataDimension;
    var dudDim: string;

    for ( var i = 0; i < size; i++ ) {
      pt = this.__units_Vector[i];
      if ( (system != null) && system !== "" && pt.getSystemString() !== "" &&
        pt.getSystemString().toUpperCase() !== system.toUpperCase() ) {
        // The system does not equal the requested value so
        // ignore the units object (system of "" is OK for ENGL and SI)...
        continue;
      }
      dud = pt.getDimension();
      dudDim = dud.getAbbreviation();
      if ( dimension.toUpperCase() === dudDim.toUpperCase() ) {
        v.push(pt);
      }
    }

    return v;
  }

  /**
  Read a file that is in NWS DATAUNIT format.  See the fully loaded method for
  more information.  This version calls the other version with define_dimensions as true.
  @param dfile Units file to read (can be a URL).
  */
  public static readNWSUnitsFile ( dfilePath: string, appService: AppService ): void {
    // Read in the file path or URL to the file asynchronously
    appService.getPlainText(dfilePath, 'DataUnit File').pipe(map((dfile: any) => {
      let dfileArray = dfile.split('\n');
      // Convert the returned string above into an array of strings as an argument
      this.readNWSUnitsFileBool ( dfileArray, true );
    }));
  }

  /**
  Read a file that is in NWS DATAUNIT format.
  This routine depends on on the values in the DATAUNIT file originally supplied
  by the NWS.  Because the units system cannot be determined from this file,
  the units system is hard-coded.  This may lead to some errors if the contents
  of the units file changes.  The typical format for this file are as follows:
  <p>
  <pre>
  *   11/8/90   'HYD.RFS.SYSTEM(DATAUNIT)'
  *
  * LENGTH
  L    BASE MM    MILLIMETER                          1 1.        .
  L    OTHR CM    CENTIMETER                          2 10.       .
  L    OTHR M     METER                               2 1000.     .
  L    OTHR KM    KILOMETER                           1 1000000.  .
  L    OTHR IN    INCH                                2 25.4      .
  L    OTHR FT    FOOT                                2 304.8     .
  L    OTHR MI    MILE (STATUTE)                      1 1609344.  .
  L    OTHR NM    MILE (NAUTICAL)                     1 1853248.  .
  * TEMPERATURE
  TEMP BASE DEGC  DEGREE CENTIGRADE                   1 1.        0.000
  TEMP OTHR DEGK  DEGREE KELVIN                       1 1.        -273.
  TEMP OTHR DEGF  DEGREE FAHRENHEIT                   1 .555556   -17.8
  TEMP OTHR DEGR  DEGREE RANKINE                      1 .555556   -273.
  * END DATAUNIT
  </pre>
  @param dfile Units file to read (can be a URL).
  @param define_dimensions If true, then DataDimension.addDimension() is called
  for each dimension referenced in the data units, with the name and abbreviation
  being the same.  This is required in many cases because defining a data unit
  instance checks the dimension against defined dimensions.
  */
  public static readNWSUnitsFileBool ( dfile: string[], define_dimensions: boolean ): void {
    var add_factor = 0.0, mult_factor = 1.0;
    var abbreviation: string, base_string: string, dimension: string,
    long_name: string, routine = "DataUnits.readNWSUnitsFile", string: string;

    var output_precision = 2;
    var engl_units: string[] = [
      "IN", "FT", "MI", "NM",
      "FT/S", "FT/M", "MI/H", "MI/D", "KNOT",
      "IN2", "FT2", "MI2", "NM2", "ACRE",
      "CFSD", "FT3", "IN3", "GAL", "ACFT",
      "CFS", "AF/D", "MGD", "GPM",
      "INHG",
      "DEGF" ];
    var si_units: string[] = [
      "MM", "CM", "M", "KM",
      "M/S", "CM/S", "KM/H", "KM/D",
      "M2", "MM2", "CM2", "KM2", "HECT",
      "M3", "CC", "LITR", "CMSD", "MCM", "CHM",
      "CMS", "CC/S", "CM/H",
      "MMHG",
      "DEGC" ];

    try {
        // Main try...
        // Open the file (allow the units file to be a normal file or a URL so
        // web applications can also be supported)...
        // try {
        //     fp = new BufferedReader(new InputStreamReader(IOUtil.getInputStream(dfile)));
        // }
        // catch ( e ) {
        //   console.warn ( 3, routine, e );
        //   throw new Error ( "Error opening units file \"" + dfile + "\" (" + e + ")." );
        // }
        var linecount = 0;
        var units: DataUnits = null;
        var system_found = false; // Indicates whether the system for the units has been found.
        while ( true ) {
          // Read a line...
          string = dfile[linecount];
          ++linecount;
          if ( string === null ) {
            // End of file...
            break;
          }
          try {
              // If exceptions are caught, ignore the data..
              string = string.trim();
              if ( string.length === 0 ) {
                // Skip blank lines...
                continue;
              }
              if ( string.charAt(0) === '*' ) {
                // A comment line...
                if ( string.startsWith('* END') ) {
                  // End of file...
                  break;
                }
                // Else ignore...
                continue;
              }
              // A line with conversion factors...
              dimension = string.substring(0,4).trim();
              base_string = string.substring(5,9).trim();
              abbreviation = string.substring(10,14).trim();
              long_name = string.substring(16,52).trim();
              // This is sometimes blank.  If so, default to 3...
              if ( string.substring(52,53).trim() === "") {
                output_precision = 3;
              }
              else {
                  output_precision = parseInt(string.substring(52,53).trim() );
              }
              mult_factor = parseFloat ( string.substring(54,64).trim());
              if ( dimension.toUpperCase() === "TEMP" ) {
                //if ( string.length() >= 71 ) {
                  //add_factor = StringUtil.atod(string.substring(64,71).trim() );
                //}
                //else {	
                  add_factor = parseFloat(string.substring(64).trim() );
                //}
              }
              else {
                  add_factor = 0.0;
              }
              // Now add as a new set of units (for now, we add everything and don't just add the ones that are
              // commonly used, as in the legacy HMData code)...
              units = new DataUnits(0);
              if ( define_dimensions ) {
                // Define the dimension in the DataDimension global
                // data so that it can be referenced below.  It is OK
                // to define more than once because DataDimension will keep only one unique definition.
                DataDimension.addDimension ( new DataDimension(dimension, dimension, false) );
              }
              units.setDimension ( dimension );
              if ( base_string.toUpperCase() === "BASE" ) {
                units.setBaseFlag ( 1 );
              }
              else {
                  units.setBaseFlag ( 0 );
              }
              units.setAbbreviation ( abbreviation );
              units.setLongName ( long_name );
              units.setOutputPrecision ( output_precision );
              units.setMultFactor ( mult_factor );
              units.setAddFactor ( add_factor );
              // Determine the system from hard-coded units...
              system_found = false;
              units.setSystem ( DataUnits.SYSTEM_ALL );	// default
              for ( iu = 0; iu < engl_units.length; iu++ ) {
                if ( abbreviation.toUpperCase() === engl_units[iu].toUpperCase() ) {
                  units.setSystem ( DataUnits.SYSTEM_ENGLISH );
                  system_found = true;
                  break;
                }
              }
              if ( !system_found ) {
                for ( var iu = 0; iu < si_units.length; iu++ ) {
                  if(abbreviation.toUpperCase() === si_units[iu].toUpperCase()){
                    units.setSystem ( DataUnits.SYSTEM_SI );
                    break;
                  }
                }
              }
              // Set how the units are defined
              units.setSource ( "Read from NWSRFS units file \"" + dfile + "\"" );
              this.addUnits ( units );
          }
          catch ( e ) {
            console.warn ( 3, routine,
            "Error reading units at line " + linecount + " of file \"" + dfile + "\" - ignoring line (" +
            e + ")." );
            console.warn ( 3, routine, e );
          }
        }
    }
    catch ( e ) {
      console.warn ( 3, routine, e );
      // Global catch...
      throw new Error ( "Error reading units file \"" + dfile + "\" (" + e + ")." );
    }
    finally {
        this.checkUnitsData();
    }
  }

  /**
  Read a file that is in RTi format.  See the fully loaded method for more information.
  This version calls the other version with define_dimensions as true.
  @param dfile Units file to read (can be a URL).
  */
  public static readUnitsFile ( dfileArray: string[] ): void {    
    // Convert the returned string above into an array of strings as an argument
    this.readUnitsFileBool ( dfileArray, true );
  }

  /**
  Read a file that is in RTi format.
  This routine depends on on the values in an RTi DATAUNIT file.  The format for this file is as follows:
  <p>
  <pre>
  # Dimension|BASE or OTHR|Abbreviation|System|Long name|Precision|MultFac|AddFac|
  # TEMPERATURE
  TEMP|BASE|DEGC|SI|DEGREE CENTIGRADE|1|1.|0.0|
  TEMP|OTHR|DEGK|ENG|DEGREE KELVIN|1|1.|-273.|
  TEMP|OTHR|DEGF||DEGREE FAHRENHEIT|1|.555556|-17.8|
  TEMP|OTHR|DEGR||DEGREE RANKINE|1|.555556|-273.|
  # TIME
  TIME|BASE|SEC||SECOND|2|1.|0.0|
  TIME|OTHR|MIN||MINUTE|2|60.|0.0|
  TIME|OTHR|HR||HOUR|2|3600.|0.0|
  TIME|OTHR|DAY||DAY|2|86400.|0.0|
  </pre>
  @param dfile Name of units file (can be a URL).
  @param define_dimensions If true, then DataDimension.addDimension() is called
  for each dimension referenced in the data units, with the name and abbreviation
  being the same. This is required in many cases because defining a data unit
  instance checks the dimension against defined dimensions.
  */
  public static readUnitsFileBool ( dfile: string[], define_dimensions: boolean ): void {
    var message: string, routine = "DataUnits.readUnitsFile";
    var units_file: string[] = null;

    try {
        // Main try...

        // Read the file into a list...
        // FIXME SAM 2009-03-25 Error handling needs to be improved here - remove nested exceptions
        try {
          units_file = dfile;
        }
        catch ( e ) {
          message = "Unable to read units file \"" + dfile + "\"";
          console.warn ( 3, routine, message );
          throw new Error ( message );
        }
        if ( units_file === null ) {
          message = "Empty contents for units file \"" + dfile + "\"";
          console.warn ( 3, routine, message );
          throw new Error ( message );
        }
        var nstrings: number = units_file.length;
        if ( nstrings === 0 ) {
          message = "Empty contents for units file \"" + dfile + "\"";
          console.warn ( 3, routine, message );
          throw new Error ( message );
        }
      
        // For each line, if not a comment, break apart and add units to the global list...
      
        var units: DataUnits;
        var string: string, token: string;
        var tokens: string[] = null;
        var first: string;
        for ( var i = 0; i < nstrings; i++ ) {
          try {
              string = units_file[i];
              
              if ( string === null ) {
                continue;
              }
              if ( string.length === 0 ) {
                continue;
              }
              first = string.charAt(0);
              if ( (first === '#') || (first === '\n') || (first === '\r') ) {
                continue;
              }
              // Break the line...
              tokens = StringUtil.breakStringList ( string, "|", 0 );
              if ( tokens === null ) {
                // A corrupt line...
                continue;
              }
              if ( tokens.length < 7 ) {
                // A corrupt line...
                continue;
              }
              // Else add the units...
              var units = new DataUnits (0);
              if ( define_dimensions ) {
                // Define the dimension in the DataDimension global data so that it can be referenced below.
                // It is OK to define more than once because DataDimension will
                // keep only one unique definition.
                DataDimension.addDimension (
                  new DataDimension( tokens[0].trim(), tokens[0].trim(), false));
              }
              units.setDimension ( tokens[0].trim() );
              token = tokens[1];
              if ( token.toUpperCase() === "BASE" ) {
                // Base units for the dimension...
                units.setBaseFlag ( 1 );
              }
              else {
                  units.setBaseFlag ( 0 );
              }
              units.setAbbreviation ( tokens[2].trim() );
              units.setSystemStr ( tokens[3].trim() );
              units.setLongName ( tokens[4].trim() );
              var precision: string = tokens[5].trim();
              if ( StringUtil.isInteger(precision) ) {
                  units.setOutputPrecision ( parseInt( precision) );
              }
              units.setMultFactor ( parseFloat( tokens[6].trim()) );
              var add: string = tokens[7].trim();
              if ( StringUtil.isDouble(add)) {
              units.setAddFactor ( parseFloat( add) );
              }
              // Set how the units are defined
              units.setSource ( "Read from units file \"" + dfile + "\"" );
              // Add the units to the list...
              this.addUnits ( units );
          }
          catch ( e ) {
            console.warn ( 3, routine,
            "Error reading units at line " + (i + 1) + " of file \"" + dfile +
            "\" - ignoring line (" + e + ")." );
          }
        }
      
        // Check the units for consistency...
      
        this.checkUnitsData();
    }
    catch ( e ) {
      console.warn ( 3, routine, e );
      // Global catch...
      throw new Error ( "Error reading units file \"" + dfile + "\" (" + e + ")." );
    }
  }

  /**
  Set the abbreviation string for the units.
  @param abbreviation Units abbreviation (e.g., "CFS").
  */
  public setAbbreviation ( abbreviation: string ): void {
    if ( abbreviation === null ) {
      return;
    }
    this.__abbreviation = abbreviation;
  }

  /**
  Set the addition factor when converting to the base units for the dimension.
  @param add_factor Add factor to convert to the base units.
  */
  public setAddFactor ( add_factor: number ): void {
    this.__add_factor = add_factor;
  }

  /**
  Indicate whether the units are base units (should only have one base for a dimension.
  @param base_flag Indicates if the units are base units.
  */
  public setBaseFlag ( base_flag: number ): void {
    this.__base_flag = base_flag;
  }

  /**
  Set the behavior flag for the units (used for converting to strings).  This is not used at this time.
  @param behavior_mask Indicates how units should be displayed. 
  */
  public setBehaviorMask ( behavior_mask: number ): void {
    this.__behavior_mask = behavior_mask;
  }

  /**
  Set the dimension for the units.
  @param dimension_string Dimension string (e.g., "L3/T").
  @exception Exception If the dimension string to be used is not recognized.
  @see DataDimension
  */
  public setDimension ( dimension_string: string ): void {
    var routine = "DataUnits.setDimension(String)";

    // Return if null...
    if ( dimension_string === null ) {
      return;
    }

    // First look up the dimension to make sure that it is valid...

    var dim: DataDimension;
    try {
        dim = DataDimension.lookupDimension(dimension_string);
    }
    catch ( e ) {
      // Problem finding dimension.  Don't set...
      var message: string;
      message = "Can't find dimension \"" + dimension_string + "\".  Not setting.";
      console.warn ( 3, routine, message );
      throw new Error(message);
    }

    // Now set the dimension...

    this.__dimension = dim;
  }

  /**
  Set the long name for the units (e.g., "cubic feet per second").
  @param long_name Long name for the units.
  */
  public setLongName ( long_name: string ): void {
    if ( long_name === null ) {
      return;
    }
    this.__long_name = long_name;
  }

  /**
  Set the multiplication factor used when converting to the base units.
  @param mult_factor Multiplication factor used when converting to the base units.
  */
  public setMultFactor ( mult_factor: number ): void {	
    this.__mult_factor = mult_factor;
  }

  /**
  Set the number of digits after the decimal to be used for output data of these units.
  @param output_precision Number of digits after the decimal to be used for output
  for data of these units.
  */
  public setOutputPrecision ( output_precision: number ): void {
    this.__output_precision = output_precision;
  }

  /**
  Set the source of the data units.
  @param source source of the data units (narrative).
  */
  public setSource ( source: string ): void {
    if ( source === null ) {
          return;
      }
      this.__source = source;
  }

  /**
  Set the system of units.
  @param system System of units (see SYSTEM_*).
  */
  public setSystem ( system: number ): void {
    this.__system = system;
  }

  /**
  Set the system of units.
  @param system System of units.  Recognized strings are "SI", "ENG", or nothing.
  If the system cannot be determined, SYSTEM_UNKNOWN is assumed.
  */
  public setSystemStr ( system: string ): void {
    if ( system === null ) {
      return;
    }
    if ( system.toUpperCase().startsWith('SI') ) {
      this.__system = DataUnits.SYSTEM_SI;
    }
    else if ( system.toUpperCase().startsWith('ENG') ) {
      this.__system = DataUnits.SYSTEM_ENGLISH;
    }
    else if ( system.toUpperCase().startsWith('ALL') ) {
      this.__system = DataUnits.SYSTEM_ALL;
    }
    else {
      this.__system = DataUnits.SYSTEM_UNKNOWN;
    }
  }

  /**
  Return A string representation of the units (verbose).
  @return A string representation of the units (verbose).
  */
  public toString (): string {
    return this.__dimension.getAbbreviation() + "|" +
    this.getBaseString() + "|" +
    this.__abbreviation + "|" +
    this.getSystemString() + "|" +
    this.__long_name + "|" +
    this.__output_precision + "|" +
    this.__mult_factor + "|" +
    this.__add_factor + "|";
  }

}