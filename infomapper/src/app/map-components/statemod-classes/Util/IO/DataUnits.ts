// // DataUnits - class to provide capabilities for reading and storing data units and conversion between units

// /* NoticeStart
// CDSS Common Java Library
// CDSS Common Java Library is a part of Colorado's Decision Support Systems (CDSS)
// Copyright (C) 1994-2019 Colorado Department of Natural Resources
// CDSS Common Java Library is free software:  you can redistribute it and/or modify
//     it under the terms of the GNU General Public License as published by
//     the Free Software Foundation, either version 3 of the License, or
//     (at your option) any later version.
//     CDSS Common Java Library is distributed in the hope that it will be useful,
//     but WITHOUT ANY WARRANTY; without even the implied warranty of
//     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//     GNU General Public License for more details.
//     You should have received a copy of the GNU General Public License
//     along with CDSS Common Java Library.  If not, see <https://www.gnu.org/licenses/>.
// NoticeEnd */

// /**
// The DataUnits class provides capabilities for reading and storing 
// data units and conversion between units.  Units are maintained internally using a list of DataUnits.
// */
// export class DataUnits {

//   /**
//   Indicates that the units system is unknown.
//   */
//   public static SYSTEM_UNKNOWN = 0;
//   /**
//   Indicates that the units are for the English System.
//   */
//   public static SYSTEM_ENGLISH = 1;
//   /**
//   Indicates that the units are for the International System.
//   */
//   public static SYSTEM_SI = 2;
//   /**
//   Indicates that the units are for both English and International System.
//   */
//   public static SYSTEM_ALL = 3;

//   // Data members...

//   /**
//   The units abbreviation (e.g., "AF").
//   */
//   private __abbreviation: string;
//   /**
//   The long name (e.g., "ACRE-FOOT").
//   */
//   private __long_name: string;
//   /**
//   The dimension (e.g., "L3").
//   */
//   // TODO
//   // private DataDimension __dimension;
//   /**
//   Indicates whether it the base unit in the dimension.
//   */
//   private __base_flag;
//   /**
//   The number of digits of precision after the decimal poon output.
//   */
//   private __output_precision;
//   /**
//   Units system (SYSTEM_SI, SYSTEM_ENGLISH, SYSTEM_ALL, or SYSTEM_UNKNOWN).
//   */
//   private __system: number;
//   /**
//   Multiplier for conversion (relative to base).
//   */
//   private __mult_factor: number;
//   /**
//   Add factor for conversion (relative to base).
//   */
//   private __add_factor: number;
//   /**
//   Behavior flag (e.g., whether to output in upper-case).
//   */
//   private __behavior_mask: number;
//   /**
//   Note indicating source of the data units.
//   */
//   private __source: string;

//   /**
//   List of internally-maintained available units, make sure to be non-null.
//   */
//   // TODO
//   // private static List<DataUnits> __units_Vector = new Vector<DataUnits>(20);

//   /**
//   Construct and set all data members to empty strings and zeros.
//   */
//   constructor ( ) {
//     this.initialize ();
//   }

//   /**
//   Construct using the individual data items.  The data source is set to an empty string.
//   @param dimension Units dimension (see DataDimension).
//   @param base_flag 1 if the units are the base units for conversion purposes, for the dimension.
//   @param abbreviation Abbreviation for the units.
//   @param long_name Long name for the units.
//   @param output_precision The output precision for the units (the number of
//   digits output after the decimal point).
//   @param mult_factor Multiplication factor used when converting to the base units for the dimension.
//   @param add_factor Addition factor used when converting to the base units for the dimension.
//   @see DataDimension
//   */
//   public DataUnits ( String dimension, base_flag, String abbreviation,
//       String long_name, output_precision, double mult_factor, double add_factor )
//   {
//       this ( dimension, base_flag, abbreviation, long_name, output_precision, mult_factor, add_factor, "" );
//   }

//   /**
//   Construct using the individual data items.
//   @param dimension Units dimension (see DataDimension).
//   @param base_flag 1 if the units are the base units for conversion purposes, for the dimension.
//   @param abbreviation Abbreviation for the units.
//   @param long_name Long name for the units.
//   @param output_precision The output precision for the units (the number of
//   digits output after the decimal point).
//   @param mult_factor Multiplication factor used when converting to the base units for the dimension.
//   @param add_factor Addition factor used when converting to the base units for the dimension.
//   @param source note about the source of the data units, useful for troubleshooting conflicts or limitations
//   in the data units definitions.
//   @see DataDimension
//   */
//   public DataUnits ( String dimension, base_flag, String abbreviation,
//       String long_name, output_precision, double mult_factor, double add_factor, String source )
//   {	initialize ();
//     try {
//         setDimension ( dimension );
//     }
//     catch ( Exception e ) {
//       // Do nothing for now.
//     }
//     __base_flag = base_flag;
//     setAbbreviation ( abbreviation );
//     setLongName ( long_name );
//     __output_precision = output_precision;
//     __mult_factor = mult_factor;
//     __add_factor = add_factor;
//     setSource ( source );
//   }

//   /**
//   Copy constructor.
//   @param units Instance of DataUnits to copy.
//   */
//   public DataUnits ( DataUnits units )
//   {	initialize();
//     setAbbreviation ( units.__abbreviation );
//     setLongName ( units.__long_name );
//     try {
//         // Converts to integer, etc.
//       setDimension ( units.__dimension.getAbbreviation() );	
//     }
//     catch ( Exception e ) {
//         String routine = "DataUnits";
//         // Message.printWarning(3, routine, "Error copying units." );
//         // Message.printWarning(3, routine, e);
//       // Do nothing for now...
//     }
//     __base_flag = units.__base_flag;
//     __output_precision = units.__output_precision;
//     __system = units.__system;
//     __mult_factor = units.__mult_factor;
//     __add_factor = units.__add_factor;
//     __behavior_mask = units.__behavior_mask;
//   }

//   /**
//   Add a set of units to the internal list of units.  After adding, the units can
//   be used throughout the application.
//   @param units Instance of DataUnits to add to the list.
//   */
//   public static addUnits ( units: DataUnits ): void {
//     // First see if the units are already in the list...

//     var size: number = __units_Vector.size();
//     var pt: DataUnits = null;
//     for ( var i = 0; i < size; i ++ ) {
//       // Get the units for the loop index...
//       pt = __units_Vector.get(i);
//       // Now compare...
//       if ( units.getAbbreviation().equalsIgnoreCase(pt.getAbbreviation() ) ) {
//         // The requested units match something that is already in the list.  Reset the list...
//         __units_Vector.set ( i, units );
//         return;
//       }
//     }
//     // Need to add the units to the list...
//     __units_Vector.add ( units );
//   }

//   /**
//   Determine whether a list of units strings are compatible.
//   The units are allowed to be different as long as they are within the same
//   dimension (e.g., each is a length).
//   If it is necessary to guarantee that the units are exactly the same, call the
//   version of this method that takes the boolean flag.
//   @param units_strings list of units strings.
//   */
//   public static boolean areUnitsStringsCompatible ( List<String> units_strings )
//   {	return areUnitsStringsCompatible ( units_strings, false );
//   }

//   /**
//   Determine whether a two units strings are compatible.
//   The units are allowed to be different as long as they are within the same dimension (e.g., each is a length).
//   @param units_string1 First units strings.
//   @param units_string2 Second units strings.
//   @param require_same Flag indicating whether the units must exactly match (no
//   conversion necessary).  If true, the units must be the same.  If false, the
//   units must only be in the same dimension (e.g., "CFS" and "GPM" would be compatible).
//   */
//   public static boolean areUnitsStringsCompatible ( String units_string1, String units_string2, boolean require_same )
//   {	List<String> units_strings = new Vector<String>(2);
//     units_strings.add ( units_string1 );
//     units_strings.add ( units_string2 );
//     boolean result = areUnitsStringsCompatible ( units_strings, require_same);
//     return result;
//   }

//   /**
//   Determine whether a list of units strings are compatible.
//   @param units_strings list of units strings.
//   @param require_same Flag indicating whether the units must exactly match (no
//   conversion necessary).  If true, the units must be the same, either in
//   spelling or have the a conversion factor of unity.  If false, the
//   units must only be in the same dimension (e.g., "CFS" and "GPM" would be compatible).
//   */
//   public static boolean areUnitsStringsCompatible ( List<String> units_strings, boolean require_same )
//   {	if ( units_strings == null ) {
//       // No units.  Decide later whether to throw an exception.
//       return true;
//     }
//     size = units_strings.size();
//     if ( size < 2 ) {
//       // No need to compare...
//       return true;
//     }
//     String units1 = units_strings.get(0);
//     if ( units1 == null ) {
//       return true;
//     }
//     String units2;
//     // Allow nulls because it is assumed that later they will result in an ignored conversion...
//     DataUnitsConversion conversion = null;
//     for ( i = 1; i < size; i++ ) {
//       units2 = units_strings.get(i);
//       if ( units2 == null ) {
//         continue;
//       }
//       // Get the conversions and return false if a conversion cannot be obtained...
//       try {
//           conversion = getConversion ( units1, units2 );
//         if ( require_same ) {
//           // If the factors are not unity, return false.
//           // This will allow AF and ACFT to compare exactly...
//           if ( (conversion.getAddFactor() != 0.0) || (conversion.getMultFactor() != 1.0) ) {
//             return false;
//           }
//         }
//       }
//       catch ( Exception e ) {
//         return false;
//       }
//     }
//     return true;
//   }

//   /**
//   This routine checks the internal list of units data for integrity.  This
//   consists of making sure that for units of a dimension, there is
//   base unit only.  THIS ROUTINE IS CURRENTLY A PLACEHOLDER.
//   @TODO SAM 2009-03-25 THE FUNCTIONALITY NEEDS TO BE ADDED.
//   */
//   private static void checkUnitsData ( )
//   {	// First see if the units are already in the list...

//     //Message.printWarning ( 3, routine, "No functionality here yet!" );
//   }

//   /**
//   Finalize before garbage collection.
//   @exception Throwable if an error occurs.
//   */
//   protected void finalize ()
//   throws Throwable
//   {	__abbreviation = null;
//     __long_name = null;
//     __dimension = null;
//     super.finalize();
//   }

//   /**
//   Return the units abbreviation string.
//   @return The units abbreviation string.
//   */
//   public String getAbbreviation ( )
//   {	return __abbreviation;
//   }

//   /**
//   Return The addition factor when converting to the base units.
//   @return The addition factor when converting to the base units.
//   */
//   public double getAddFactor ( )
//   {	return __add_factor;
//   }

//   /**
//   Return One (1) if the units are the base units for a dimension, zero otherwise.
//   @return One (1) if the units are the base units for a dimension, zero otherwise.
//   */
//   public getBaseFlag ( )
//   {	return __base_flag;
//   }

//   /**
//   Return "BASE" if the unit is the base unit for conversions, and "OTHR" if not.
//   @return "BASE" if the unit is the base unit for conversions, and "OTHR" if not.
//   */
//   public String getBaseString ( )
//   {	if ( __base_flag == 1 ) {
//       return "BASE";
//     }
//     else {
//         return "OTHR";
//     }
//   }

//   /**
//   Get the conversion from units string to another.
//   @return A DataUnitsConversion instance with the conversion information from one set of units to another.
//   @param u1_string Original units.
//   @param u2_string The units after conversion.
//   @exception Exception If the conversion cannot be found.
//   */
//   public static DataUnitsConversion getConversion ( String u1_string, String u2_string )
//   throws Exception
//   {	// Call the routine that takes the auxiliary information.  This is not
//     // fully implemented at this time but provides a migration path from the legacy code...
//     return getConversion ( u1_string, u2_string, 0.0, "" );
//   }

//   /**
//   Get the conversion from units string to another.
//   @return A DataUnitsConversion instance with the conversion information from one set of units to another.
//   @param u1_string Original units.
//   @param u2_string The units after conversion.
//   @param aux An auxiliary piece of information when converting between units of different dimension.
//   @param aunits The units of "aux".
//   @exception Exception If the conversion cannot be found.
//   */
//   public static DataUnitsConversion getConversion ( String u1_string, String u2_string, double aux, String aunits )
//   throws Exception
//   {	int	dl = 20;
//     String routine = "DataUnits.getConversion", u1_dim, u2_dim;

//     if ( Message.isDebugOn ) {
//       Message.printDebug ( dl, routine,
//       "Trying to get conversion from \"" + u1_string + "\" to \"" + u2_string + "\"" );
//     }

//     // Make sure that the units strings are not NULL...

//     if ( ((u1_string == null) || (u1_string.equals(""))) && ((u2_string == null) || (u2_string.equals(""))) ) {
//       // Both units are unspecified so return a unit conversion...
//       DataUnitsConversion c = new DataUnitsConversion();
//       c.setMultFactor ( 1.0 );
//       c.setAddFactor ( 0.0 );
//       return c;
//     }

//     String message = "";
//     if ( u1_string == null ) {
//       message = "Source units string is NULL";
//       Message.printWarning ( 3, routine, message );
//       throw new Exception ( message );
//     }
//     if ( u2_string == null ) {
//       message = "Secondary units string is NULL";
//       Message.printWarning ( 3, routine, message );
//       throw new Exception ( message );
//     }

//     // Set the conversion units...

//     DataUnitsConversion c = new DataUnitsConversion();
//     c.setOriginalUnits ( u1_string );
//     c.setNewUnits ( u2_string );

//     // First thing we do is see if the units are the same.  If so, we are done...

//     if ( u1_string.trim().equalsIgnoreCase(u2_string.trim()) ) {
//       c.setMultFactor ( 1.0 );
//       c.setAddFactor ( 0.0 );
//       return c;
//     }

//     if ( u1_string.length() == 0 ) {
//       message = "Source units string is empty";
//       Message.printWarning ( 3, routine, message );
//       throw new Exception ( message );
//     }
//     if ( u2_string.length() == 0 ) {
//       message = "Secondary units string is empty";
//       Message.printWarning ( 3, routine, message );
//       throw new Exception ( message );
//     }

//     // First get the units data...

//     DataUnits u1, u2;
//     try {
//         u1 = lookupUnits ( u1_string );
//     }
//     catch ( Exception e ) {
//       message = "Unable to get units type for \"" + u1_string + "\"";
//       Message.printWarning ( 3, routine, message );
//       throw new Exception ( message );
      
//     }
//     try {
//         u2 = lookupUnits ( u2_string );
//     }
//     catch ( Exception e ) {
//       message = "Unable to get units type for \"" + u2_string + "\"";
//       Message.printWarning ( 3, routine, message );
//       throw new Exception ( message );
//     }

//     // Get the dimension for the units of interest...

//     u1_dim = u1.getDimension().getAbbreviation();
//     u2_dim = u2.getDimension().getAbbreviation();

//     if ( u1_dim.equalsIgnoreCase(u2_dim) ) {
//       // Same dimension...
//       c.setMultFactor ( u1.getMultFactor()/u2.getMultFactor() );
//       // For the add factor assume that a value over .001 indicates
//       // that an add factor should be considered.  This should only
//       // be the case for temperatures and all other dimensions should have a factor of 0.0.
//       if ( (Math.abs(u1.getAddFactor()) > .001) || (Math.abs(u2.getAddFactor()) > .001) ){
//         // The addition factor needs to take into account the
//         // different scales for the measurement range...
//         c.setAddFactor ( -1.0*u2.getAddFactor()/u2.getMultFactor() + u1.getAddFactor()/u2.getMultFactor() );
//       }
//       else {
//           c.setAddFactor ( 0.0 );
//       }
//       Message.printStatus(1, "", "Add factor is " + c.getAddFactor());
//     }
//     else {
//         message = "Dimensions are different for " + u1_string + " and " + u2_string;
//       Message.printWarning ( 3, routine, message );
//       throw new Exception ( message );
//     }

//     // Else, units groups are of different types - need to do more than
//     // one step.  These are currently special cases and do not handle a
//     // generic conversion (dimensional analysis like Unicalc)!

//   /*  Not yet enabled in java...
//     else if	(((u1_dim.getDimension() == DataDimension.VOLUME) &&
//       (u2_dim.getDimension() == DataDimension.LENGTH)) ||
//       ((u1_dim.getDimension() == DataDimension.DISCHARGE)&&
//       (u2_dim.getDimension() == DataDimension.LENGTH))) {
//       // 1) Convert volume to M3, 2) convert area to M2, 3) divide
//       // volume by area, 4) convert depth to correct units...
//       //
//       // If dealing with discharge, ignore time (for now)...
//       DataUnitsConversion c2;
//       if ( u1_dim.getDimension() == DataDimension.VOLUME ) {
//         try {	c2 = getConversion ( u1_string, "M3" );
//         }
//         catch ( Exception e ) {
//           throw new Exception (
//           "can't get M3 conversion" );
//         }
//         mfac = c2.getMultFactor();
//         afac = c2.getAddFactor();
//         c.setMultFactor ( c2.getMultFactor() );
//       }
//       else if ( u1_dim.getDimension() == DataDimension.DISCHARGE ) {
//         try {	c2 = getConversion ( u1_string, "CMS" );
//         }
//         catch ( Exception e ) {
//           throw new Exception (
//           "can't get M3 conversion" );
//         }
//         mfac = c2.getMultFactor();
//         afac = c2.getAddFactor();
//         c.setMultFactor ( c2.getMultFactor() );
//       }
//       try {	c2 = getConversion ( aunits, "M2" );
//       }
//       catch ( Exception e ) {
//         throw new Exception ( "can't get M2 conversion" );
//       }
//       double add, mult = c.getMultFactor();
//       mfac = c2.getMultFactor();
//       afac = c2.getAddFactor();
//       area	= aux;
//       area	*= mfac;
//       mult	/= area;
//       c.setMultFactor ( mult );
//       try {	c2 = getConversion ( "M", u2_string );
//       }
//       catch ( Exception e ) {
//         throw new Exception ( "can't get M conversion" );
//       }
//       mfac = c2.getMultFactor();
//       mult	*= mfac;	
//       add	= 0.0;
//       c.setMultFactor ( mult );
//     }
//   */
//     return c;
//   }

//   /**
//   Return a DataDimension instance for the units.
//   @return A DataDimension instance for the units.
//   @see DataDimension
//   */
//   public DataDimension getDimension ( )
//   {	return __dimension;
//   }

//   /**
//   Return the long name for the units.
//   @return The long name for the units.
//   */
//   public String getLongName ( )
//   {	return __long_name;
//   }

//   /**
//   Return the multiplication factor used to convert to the base units.
//   @return The multiplication factor used to convert to the base units.
//   */
//   public double getMultFactor ( )
//   {	return __mult_factor;
//   }

//   /**
//   Determine the format for output based on the units and precision.  A default precision of 2 is used.
//   @return the printing format for data of a units type.
//   @param units_string Units of data.
//   @param width Width of output (if zero, no width will be used in the format).
//   */
//   public static DataFormat getOutputFormat ( String units_string, width )
//   {	return getOutputFormat ( units_string, width, 2 );
//   }

//   /**
//   Determine the format for output based on the units and precision.
//   @return the printing format for data of a units type.
//   @param units_string Units of data.
//   @param width Width of output (if zero, no width will be used in the format).
//   @param default_precision Default precision if precision cannot be determined
//   from the units.  If not specified, 2 will be used.
//   */
//   public static DataFormat getOutputFormat ( String units_string, width, default_precision )
//   {	String routine = "DataUnits.getOutputFormat";

//     // Initialize the DataFormat for return...

//     DataFormat format = new DataFormat();
//     format.setWidth ( width );
//     format.setPrecision ( default_precision );

//     // Check for valid units request...

//     if ( (units_string == null) || (units_string.length() == 0) ) {
//       // No units are specified...
//       Message.printWarning ( 3, routine, "No units abbreviation specified.  Using precision " + default_precision );
//       return format;
//     }

//     // Get the units...

//     try {
//         DataUnits units = lookupUnits ( units_string );
//       format.setPrecision ( units.getOutputPrecision() );
//     }
//     catch ( Exception e ) {
//       Message.printWarning ( 3, "DataUnits.getOutputFormat",
//       "Unable to find data for units \"" + units_string + "\".  Using format \"" + format.toString() + "\"" );
//     }
//     return format;
//   }

//   /**
//   Get the output format string for data given the units, width and precision.
//   @return the output format string in C-style format (e.g., %10.2f).
//   @param units Units of data.
//   @param width Width of output (if zero, no width will be used in the format).
//   @param default_precision Default precision if precision cannot be determined
//   from the units.  If not specified, 2 will be used.
//   */
//   public static String getOutputFormatString ( String units, width, default_precision )
//   {	return getOutputFormat(units,width,default_precision).toString();
//   }

//   /**
//   Return the output precision for the units.
//   @return The output precision for the units (the number of digits after the decimal point).
//   */
//   public getOutputPrecision ( )
//   {	return __output_precision;
//   }

//   /**
//   Return The source of the data units.
//   @return The source of the data units (narrative).
//   */
//   public String getSource ( )
//   {   return __source;
//   }

//   /**
//   Return The units system.
//   @return The units system.  See SYSTEM*.
//   */
//   public getSystem ( )
//   {	return __system;
//   }

//   /**
//   Return the units system as a string.
//   @return The units system as a string ("SI", "ENGL", "" ). See SYSTEM*.
//   */
//   public String getSystemString ( )
//   {	if ( __system == SYSTEM_SI ) {
//       return "SI";
//     }
//     else if ( __system == SYSTEM_ENGLISH ) {
//       return "ENGL";
//     }
//     else if ( __system == SYSTEM_ALL ) {
//       return "ALL";
//     }
//     else {
//         return "";
//     }
//   }

//   /**
//   Return the list of units data.
//   @return the list of units data (useful for debugging and GUI displays).
//   Perhaps later overload to request by dimension, system, etc.
//   */
//   public static List<DataUnits> getUnitsData()
//   {	return __units_Vector;
//   }

//   /**
//   Initialize data members.
//   */
//   private void initialize ()
//   {	setAbbreviation ( "" );
//     setLongName ( "" );

//     // _dimension is initialized in its class

//     __base_flag = 0;
//     __output_precision = 2;
//     __system = SYSTEM_UNKNOWN;
//     __mult_factor = 0.0; // This will cause obvious errors to show up if units are not defined correctly.
//     __add_factor = 0.0;
//     __behavior_mask = 0;
//     __source = "";
//   }

//   /**
//   Return a DataUnits instance, given the units abbreviation.  A copy is NOT made.
//   @return A DataUnits instance, given the units abbreviation.
//   @param units_string The units abbreviation to look up.
//   @exception Exception If there is a problem looking up the units abbreviation.
//   */
//   public static DataUnits lookupUnits ( String units_string )
//   throws Exception
//   {	String routine = "DataUnits.lookupUnits";

//     // First see if the units are already in the list...

//     size = __units_Vector.size();
//     DataUnits pt = null;
//     for ( i = 0; i < size; i++ ) {
//       pt = __units_Vector.get(i);
//       if ( Message.isDebugOn ) {
//         Message.printDebug ( 20, routine, "Comparing \"" + units_string + "\" and \"" + pt.getAbbreviation() + "\"");
//       }
//       if ( units_string.equalsIgnoreCase(pt.getAbbreviation() ) ) {
//         // The requested units match something that is in the list.  Return the matching DataUnits...
//         return pt;
//       }
//     }
//     // Throw an exception...
//     throw new Exception ( "\"" + units_string + "\" units not found" );
//   }

//   /**
//   Return all the DataUnits objects that have the Dimension abbreviation equal to the parameter passed in.
//   @param system Requested units system.  Pass null or "" to get all systems,
//   "ENGL" for English, or "SI" for SI units.
//   @param dimension the dimension abbreviation to return units for.
//   @return a list of all the DataUnits objects that match the dimension or an empty list if none exist.
//   */
//   public static List<DataUnits> lookupUnitsForDimension ( String system, String dimension )
//   {	List<DataUnits> v = new Vector<DataUnits>();

//     // First see if the units are already in the list...

//     size = __units_Vector.size();
//     DataUnits pt = null;
//     DataDimension dud;
//     String dudDim;

//     for ( i = 0; i < size; i++ ) {
//       pt = __units_Vector.get(i);
//       if ( (system != null) && !system.equals("") && !pt.getSystemString().equals("") &&
//         !pt.getSystemString().equalsIgnoreCase(system) ) {
//         // The system does not equal the requested value so
//         // ignore the units object (system of "" is OK for ENGL and SI)...
//         continue;
//       }
//       dud = pt.getDimension();
//       dudDim = dud.getAbbreviation();
//       if ( dimension.equalsIgnoreCase(dudDim) ) {
//         v.add(pt);
//       }
//     }

//     return v;
//   }

//   /**
//   Read a file that is in NWS DATAUNIT format.  See the fully loaded method for
//   more information.  This version calls the other version with define_dimensions as true.
//   @param dfile Units file to read (can be a URL).
//   */
//   public static void readNWSUnitsFile ( String dfile )
//   throws IOException
//   {	readNWSUnitsFile ( dfile, true );
//   }

//   /**
//   Read a file that is in NWS DATAUNIT format.
//   This routine depends on on the values in the DATAUNIT file orignally supplied
//   by the NWS.  Because the units system cannot be determined from this file,
//   the units system is hard-coded.  This may lead to some errors if the contents
//   of the units file changes.  The typical format for this file are as follows:
//   <p>
//   <pre>
//   *   11/8/90   'HYD.RFS.SYSTEM(DATAUNIT)'
//   *
//   * LENGTH
//   L    BASE MM    MILLIMETER                          1 1.        .
//   L    OTHR CM    CENTIMETER                          2 10.       .
//   L    OTHR M     METER                               2 1000.     .
//   L    OTHR KM    KILOMETER                           1 1000000.  .
//   L    OTHR IN    INCH                                2 25.4      .
//   L    OTHR FT    FOOT                                2 304.8     .
//   L    OTHR MI    MILE (STATUTE)                      1 1609344.  .
//   L    OTHR NM    MILE (NAUTICAL)                     1 1853248.  .
//   * TEMPERATURE
//   TEMP BASE DEGC  DEGREE CENTIGRADE                   1 1.        0.000
//   TEMP OTHR DEGK  DEGREE KELVIN                       1 1.        -273.
//   TEMP OTHR DEGF  DEGREE FAHRENHEIT                   1 .555556   -17.8
//   TEMP OTHR DEGR  DEGREE RANKINE                      1 .555556   -273.
//   * END DATAUNIT
//   </pre>
//   @param dfile Units file to read (can be a URL).
//   @param define_dimensions If true, then DataDimension.addDimension() is called
//   for each dimension referenced in the data units, with the name and abbreviation
//   being the same.  This is required in many cases because defining a data unit
//   instance checks the dimension against defined dimensions.
//   */
//   public static void readNWSUnitsFile ( String dfile, boolean define_dimensions )
//   throws IOException
//   {	double add_factor = 0.0, mult_factor = 1.0;
//     String abbreviation, base_string, dimension, long_name, routine = "DataUnits.readNWSUnitsFile", string;
//     output_precision = 2;
//     BufferedReader fp = null;
//     String [] engl_units = {
//         "IN", "FT", "MI", "NM",
//       "FT/S", "FT/M", "MI/H", "MI/D", "KNOT",
//       "IN2", "FT2", "MI2", "NM2", "ACRE",
//       "CFSD", "FT3", "IN3", "GAL", "ACFT",
//       "CFS", "AF/D", "MGD", "GPM",
//       "INHG",
//       "DEGF" };
//     String [] si_units = {
//         "MM", "CM", "M", "KM",
//       "M/S", "CM/S", "KM/H", "KM/D",
//       "M2", "MM2", "CM2", "KM2", "HECT",
//       "M3", "CC", "LITR", "CMSD", "MCM", "CHM",
//       "CMS", "CC/S", "CM/H",
//       "MMHG",
//       "DEGC" };

//     try {
//         // Main try...
//         // Open the file (allow the units file to be a normal file or a URL so
//         // web applications can also be supported)...
//         try {
//             fp = new BufferedReader(new InputStreamReader(IOUtil.getInputStream(dfile)));
//         }
//         catch ( Exception e ) {
//           Message.printWarning ( 3, routine, e );
//           throw new IOException ( "Error opening units file \"" + dfile + "\" (" + e + ")." );
//         }
//         linecount = 0;
//         DataUnits units = null;
//         boolean system_found = false; // Indicates whether the system for the units has been found.
//         while ( true ) {
//           // Read a line...
//           string = fp.readLine();
//           ++linecount;
//           if ( string == null ) {
//             // End of file...
//             break;
//           }
//           try {
//               // If exceptions are caught, ignore the data..
//               string = string.trim();
//               if ( string.length() == 0 ) {
//                 // Skip blank lines...
//                 continue;
//               }
//               if ( string.charAt(0) == '*' ) {
//                 // A comment line...
//                 if ( string.regionMatches(true,0,"* END",0,5) ) {
//                   // End of file...
//                   break;
//                 }
//                 // Else ignore...
//                 continue;
//               }
//               // A line with conversion factors...
//               dimension = string.substring(0,4).trim();
//               base_string = string.substring(5,9).trim();
//               abbreviation = string.substring(10,14).trim();
//               long_name = string.substring(16,52).trim();
//               // This is sometimes blank.  If so, default to 3...
//               if ( string.substring(52,53).trim().equals("") ) {
//                 output_precision = 3;
//               }
//               else {
//                   output_precision = Integer.parseInt(string.substring(52,53).trim() );
//               }
//               mult_factor = Double.parseDouble ( string.substring(54,64).trim());
//               if ( dimension.equalsIgnoreCase("TEMP") ) {
//                 //if ( string.length() >= 71 ) {
//                   //add_factor = StringUtil.atod(string.substring(64,71).trim() );
//                 //}
//                 //else {	
//                   add_factor = Double.parseDouble(string.substring(64).trim() );
//                 //}
//               }
//               else {
//                   add_factor = 0.0;
//               }
//               // Now add as a new set of units (for now, we add everything and don't just add the ones that are
//               // commonly used, as in the legacy HMData code)...
//               units = new DataUnits();
//               if ( define_dimensions ) {
//                 // Define the dimension in the DataDimension global
//                 // data so that it can be referenced below.  It is OK
//                 // to define more than once because DataDimension will keep only one unique definition.
//                 DataDimension.addDimension ( new DataDimension(dimension,dimension) );
//               }
//               units.setDimension ( dimension );
//               if ( base_string.equalsIgnoreCase("BASE") ) {
//                 units.setBaseFlag ( 1 );
//               }
//               else {
//                   units.setBaseFlag ( 0 );
//               }
//               units.setAbbreviation ( abbreviation );
//               units.setLongName ( long_name );
//               units.setOutputPrecision ( output_precision );
//               units.setMultFactor ( mult_factor );
//               units.setAddFactor ( add_factor );
//               // Determine the system from hard-coded units...
//               system_found = false;
//               units.setSystem ( SYSTEM_ALL );	// default
//               for ( iu = 0; iu < engl_units.length; iu++ ) {
//                 if ( abbreviation.equalsIgnoreCase(engl_units[iu]) ) {
//                   units.setSystem ( SYSTEM_ENGLISH );
//                   system_found = true;
//                   break;
//                 }
//               }
//               if ( !system_found ) {
//                 for ( iu = 0; iu < si_units.length; iu++ ) {
//                   if(abbreviation.equalsIgnoreCase(si_units[iu])){
//                     units.setSystem ( SYSTEM_SI );
//                     break;
//                   }
//                 }
//               }
//               // Set how the units are defined
//               units.setSource ( "Read from NWSRFS units file \"" + dfile + "\"" );
//               addUnits ( units );
//           }
//           catch ( Exception e ) {
//             Message.printWarning ( 3, routine,
//             "Error reading units at line " + linecount + " of file \"" + dfile + "\" - ignoring line (" +
//             e + ")." );
//             Message.printWarning ( 3, routine, e );
//           }
//         }
//     }
//     catch ( Exception e ) {
//       Message.printWarning ( 3, routine, e );
//       // Global catch...
//       throw new IOException ( "Error reading units file \"" + dfile + "\" (" + e + ")." );
//     }
//     finally {
//         if ( fp != null ) {
//             fp.close();
//         }
//         checkUnitsData();
//     }
//   }

//   /**
//   Read a file that is in RTi format.  See the fully loaded method for more information.
//   This version calls the other version with define_dimensions as true.
//   @param dfile Units file to read (can be a URL).
//   */
//   public static void readUnitsFile ( String dfile )
//   throws IOException
//   {	readUnitsFile ( dfile, true );
//   }

//   /**
//   Read a file that is in RTi format.
//   This routine depends on on the values in an RTi DATAUNIT file.  The format for this file is as follows:
//   <p>
//   <pre>
//   # Dimension|BASE or OTHR|Abbreviation|System|Long name|Precision|MultFac|AddFac|
//   # TEMPERATURE
//   TEMP|BASE|DEGC|SI|DEGREE CENTIGRADE|1|1.|0.0|
//   TEMP|OTHR|DEGK|ENG|DEGREE KELVIN|1|1.|-273.|
//   TEMP|OTHR|DEGF||DEGREE FAHRENHEIT|1|.555556|-17.8|
//   TEMP|OTHR|DEGR||DEGREE RANKINE|1|.555556|-273.|
//   # TIME
//   TIME|BASE|SEC||SECOND|2|1.|0.0|
//   TIME|OTHR|MIN||MINUTE|2|60.|0.0|
//   TIME|OTHR|HR||HOUR|2|3600.|0.0|
//   TIME|OTHR|DAY||DAY|2|86400.|0.0|
//   </pre>
//   @param dfile Name of units file (can be a URL).
//   @param define_dimensions If true, then DataDimension.addDimension() is called
//   for each dimension referenced in the data units, with the name and abbreviation
//   being the same.  This is required in many cases because defining a data unit
//   instance checks the dimension against defined dimensions.
//   */
//   public static void readUnitsFile ( String dfile, boolean define_dimensions )
//   throws IOException
//   {	String message, routine = "DataUnits.readUnitsFile";
//     List<String> units_file = null;

//     try {
//         // Main try...

//         // Read the file into a list...
//         // FIXME SAM 2009-03-25 Error handling needs to be improved here - remove nested exceptions
//         try {
//           units_file = IOUtil.fileToStringList ( dfile );
//         }
//         catch ( Exception e ) {
//           message = "Unable to read units file \"" + dfile + "\"";
//           Message.printWarning ( 3, routine, message );
//           throw new IOException ( message );
//         }
//         if ( units_file == null ) {
//           message = "Empty contents for units file \"" + dfile + "\"";
//           Message.printWarning ( 3, routine, message );
//           throw new IOException ( message );
//         }
//         nstrings = units_file.size();
//         if ( nstrings == 0 ) {
//           message = "Empty contents for units file \"" + dfile + "\"";
//           Message.printWarning ( 3, routine, message );
//           throw new IOException ( message );
//         }
      
//         // For each line, if not a comment, break apart and add units to the global list...
      
//         DataUnits units;
//         String string, token;
//         List<String> tokens = null;
//         char first;
//         for ( i = 0; i < nstrings; i++ ) {
//           try {
//               string = units_file.get(i);
//               if ( string == null ) {
//                 continue;
//               }
//               if ( string.length() == 0 ) {
//                 continue;
//               }
//               first = string.charAt(0);
//               if ( (first == '#') || (first == '\n') || (first == '\r') ) {
//                 continue;
//               }
//               // Break the line...
//               tokens = StringUtil.breakStringList ( string, "|", 0 );
//               if ( tokens == null ) {
//                 // A corrupt line...
//                 continue;
//               }
//               if ( tokens.size() < 7 ) {
//                 // A corrupt line...
//                 continue;
//               }
//               // Else add the units...
//               units = new DataUnits ();
//               if ( define_dimensions ) {
//                 // Define the dimension in the DataDimension global data so that it can be referenced below.
//                   // It is OK to define more than once because DataDimension will
//                 // keep only one unique definition.
//                 DataDimension.addDimension (
//                   new DataDimension( tokens.get(0).trim(), tokens.get(0).trim()));
//               }
//               units.setDimension ( tokens.get(0).trim() );
//               token = tokens.get(1);
//               if ( token.equalsIgnoreCase("BASE") ) {
//                 // Base units for the dimension...
//                 units.setBaseFlag ( 1 );
//               }
//               else {
//                   units.setBaseFlag ( 0 );
//               }
//               units.setAbbreviation ( tokens.get(2).trim() );
//               units.setSystem ( tokens.get(3).trim() );
//               units.setLongName ( tokens.get(4).trim() );
//               String precision = tokens.get(5).trim();
//               if ( StringUtil.isInteger(precision) ) {
//                   units.setOutputPrecision ( Integer.parseInt( precision) );
//               }
//               units.setMultFactor ( Double.parseDouble( tokens.get(6).trim()) );
//               String add = tokens.get(7).trim();
//               if ( StringUtil.isDouble(add)) {
//                   units.setAddFactor ( Double.parseDouble( add) );
//               }
//                   // Set how the units are defined
//                   units.setSource ( "Read from units file \"" + dfile + "\"" );
//               // Add the units to the list...
//               addUnits ( units );
//           }
//           catch ( Exception e ) {
//             Message.printWarning ( 3, routine,
//             "Error reading units at line " + (i + 1) + " of file \"" + dfile +
//             "\" - ignoring line (" + e + ")." );
//           }
//         }
      
//         // Check the units for consistency...
      
//         checkUnitsData();
//     }
//     catch ( Exception e ) {
//       Message.printWarning ( 3, routine, e );
//       // Global catch...
//       throw new IOException ( "Error reading units file \"" + dfile + "\" (" + e + ")." );
//     }
//   }

//   /**
//   Set the abbreviation string for the units.
//   @param abbreviation Units abbreviation (e.g., "CFS").
//   */
//   public void setAbbreviation ( String abbreviation )
//   {	if ( abbreviation == null ) {
//       return;
//     }
//     __abbreviation = abbreviation;
//   }

//   /**
//   Set the addition factor when converting to the base units for the dimension.
//   @param add_factor Add factor to convert to the base units.
//   */
//   public void setAddFactor ( double add_factor )
//   {	__add_factor = add_factor;
//   }

//   /**
//   Indicate whether the units are base units (should only have one base for a dimension.
//   @param base_flag Indicates if the units are base units.
//   */
//   public void setBaseFlag ( base_flag )
//   {	__base_flag = base_flag;
//   }

//   /**
//   Set the behavior flag for the units (used for converting to strings).  This is not used at this time.
//   @param behavior_mask Indicates how units should be displayed. 
//   */
//   public void setBehaviorMask ( behavior_mask )
//   {	__behavior_mask = behavior_mask;
//   }

//   /**
//   Set the dimension for the units.
//   @param dimension_string Dimension string (e.g., "L3/T").
//   @exception Exception If the dimension string to be used is not recognized.
//   @see DataDimension
//   */
//   public void setDimension ( String dimension_string )
//   throws Exception
//   {	String routine = "DataUnits.setDimension(String)";

//     // Return if null...

//     if ( dimension_string == null ) {
//       return;
//     }

//     // First look up the dimension to make sure that it is valid...

//     DataDimension dim;
//     try {
//         dim = DataDimension.lookupDimension(dimension_string);
//     }
//     catch ( Exception e ) {
//       // Problem finding dimension.  Don't set...
//       String message;
//       message = "Can't find dimension \"" + dimension_string + "\".  Not setting.";
//       Message.printWarning ( 3, routine, message );
//       throw new Exception(message);
//     }

//     // Now set the dimension...

//     __dimension = dim;
//   }

//   /**
//   Set the long name for the units (e.g., "cubic feet per second").
//   @param long_name Long name for the units.
//   */
//   public void setLongName ( String long_name )
//   {	if ( long_name == null ) {
//       return;
//     }
//     __long_name = long_name;
//   }

//   /**
//   Set the multiplication factor used when converting to the base units.
//   @param mult_factor Multiplication factor used when converting to the base units.
//   */
//   public void setMultFactor ( double mult_factor )
//   {	__mult_factor = mult_factor;
//   }

//   /**
//   Set the number of digits after the decimal to be used for output data of these units.
//   @param output_precision Number of digits after the decimal to be used for output
//   for data of these units.
//   */
//   public void setOutputPrecision ( output_precision )
//   {	__output_precision = output_precision;
//   }

//   /**
//   Set the source of the data units.
//   @param source source of the data units (narrative).
//   */
//   public void setSource ( String source )
//   {   if ( source == null ) {
//           return;
//       }
//       __source = source;
//   }

//   /**
//   Set the system of units.
//   @param system System of units (see SYSTEM_*).
//   */
//   public void setSystem ( system )
//   {	__system = system;
//   }

//   /**
//   Set the system of units.
//   @param system System of units.  Recognized strings are "SI", "ENG", or nothing.
//   If the system cannot be determined, SYSTEM_UNKNOWN is assumed.
//   */
//   public void setSystem ( String system )
//   {	if ( system == null ) {
//       return;
//     }
//     if ( system.regionMatches(true,0,"SI",0,2) ) {
//       __system = SYSTEM_SI;
//     }
//     else if ( system.regionMatches(true,0,"ENG",0,3) ) {
//       __system = SYSTEM_ENGLISH;
//     }
//     else if ( system.regionMatches(true,0,"ALL",0,4) ) {
//       __system = SYSTEM_ALL;
//     }
//     else {
//         __system = SYSTEM_UNKNOWN;
//     }
//   }

//   /**
//   Return A string representation of the units (verbose).
//   @return A string representation of the units (verbose).
//   */
//   public String toString ()
//   {	return
//     __dimension.getAbbreviation() + "|" +
//     getBaseString() + "|" +
//     __abbreviation + "|" +
//     getSystemString() + "|" +
//     __long_name + "|" +
//     __output_precision + "|" +
//     __mult_factor + "|" +
//     __add_factor + "|";
//   }

// }