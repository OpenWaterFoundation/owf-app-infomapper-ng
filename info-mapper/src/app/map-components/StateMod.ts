import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StateMod {

  // TODO: UNCOMMENT THIS FUNCTION OUT AGAIN
  // getFileDataInterval ( filename ) {

  //   let message = null, routine = "StateMod_TS.getFileDataInterval";
  //   BufferedReader ifp = null;
  //   let iline = null;
  //   let intervalUnknown = -999; // Return if can't figure out interval
  //   let interval = intervalUnknown;
  //   // let full_filename = IOUtil.getPathUsingWorkingDir ( filename );
  //   try {
  //     ifp = new BufferedReader ( new FileReader ( filename));
  //   }
  //   catch ( e ) {
  //     message = "Unable to open file \"" + filename + "\" to determine data interval.";
  //     // Message.printWarning ( 2, routine, message );
  //     return intervalUnknown;
  //   }
  //   try {
  //       if ( filename.toUpperCase().endsWith("XOP") ) {
  //           // The *.xop file will have "Time Step:   Monthly"
  //           while ( true ) {
  //                 iline = ifp.readLine();
  //                 if ( iline == null ) {
  //                     break;
  //                 }
  //                 if ( iline.startsWith("#") && iline.toUpperCase().indexOf("TIME STEP:") > 0 ) {
  //                     let parts = iline.split(":");
  //                     if ( parts.length > 1 ) {
  //                         if ( parts[1].trim().equalsIgnoreCase("Monthly") ) {
  //                             interval = TimeInterval.MONTH;
  //                             break;
  //                         }
  //                         else if ( parts[1].trim().equalsIgnoreCase("Daily") ) {
  //                             interval = TimeInterval.DAY;
  //                             break;
  //                         }
  //                     }
  //                 }
  //           }
  //       }
  //       else {
  //         // Read while a comment or blank line...
  //         while ( true ) {
  //           iline = ifp.readLine();
  //           if ( iline == null ) {
  //             throw new Error ( "end of file" );
  //           }
  //           iline = iline.trim();
  //           if ( (iline.length() != 0) && (iline.charAt(0) != '#')){
  //             break; // iline should be the header line
  //           }
  //         }
  //         // Now should have the header.  Read one more to get to a data line...
  //         iline = ifp.readLine();
  //         if ( iline == null ) {
  //           throw new Error ( "end of file" );
  //         }
  //         // Should be first data line.  If longer than the threshold, assume daily.
  //         // Trim because some fixed-format write tools put extra spaces at the end
  //         if ( iline.trim().length() > 150 ) {
  //           interval = TimeInterval.DAY;
  //         }
  //         else {
  //           interval = TimeInterval.MONTH;
  //         }
  //       }
  //   }
  //   catch ( e ) {
  //     // Could not determine file interval
  //     return intervalUnknown;
  //   }
  //   finally {
  //     if ( ifp != null ) {
  //       try {
  //         ifp.close();
  //       }
  //       catch ( e ) {
  //         // Ignore - should not happen
  //       }
  //     }
  //   }
  //   return interval;
  // }

  /**
  Read a time series from a StateMod format file.  The TSID string is specified
  in addition to the path to the file.  It is expected that a TSID in the file
  matches the TSID (and the path to the file, if included in the TSID would not
  properly allow the TSID to be specified).  This method can be used with newer
  code where the I/O path is separate from the TSID that is used to identify the time series.
  The IOUtil.getPathUsingWorkingDir() method is applied to the filename.
  @return a pointer to a newly-allocated time series if successful, a NULL pointer if not.
  @param tsident_string The full identifier for the time series to read.
  @param filename The name of a file to read
  (in which case the tsident_string must match one of the TSID strings in the file).
  @param date1 Starting date to initialize period (null to read the entire time series).
  @param date2 Ending date to initialize period (null to read the entire time series).
  @param units Units to convert to.
  @param read_data Indicates whether data should be read (false=no, true=yes).
  */
  // When this function is called, it takes the below arguments (which I'll worry)
  // about later, and tries to read a StateMod file
  // TODO: This todo just let's me know where this all starts from & UNCOMMENT THIS ENTIRE FUNCTION OUT AGAIN
  // readTimeSeries(tsident_string: string, filename: string, date1: any, date2: any,
  //                                               units: string, read_data: boolean) {
  //   let ts = null;
  //   let routine = "StateMod_TS.readTimeSeries";

  //   if (filename == null) {
  //     console.error("Requesting StateMod file with null filename.");
  //   }
  //   let input_name: string = filename;
  //   // let full_fname: string = IOUtil.getPathUsingWorkingDir(filename);
  //   // if (!IOUtil.fileReadable(full_fname)) {
  //   //   Message.printWarning(2, routine, "Unable to determine file for \"" + filename + "\"");
  //   //   return ts;
  //   // }
  //   // BufferedReader in = null;
  //   let data_interval;
  //   throw new Error('You at least made it here :)');
  //   try {
  //     data_interval = this.getFileDataInterval(filename);
  //     // in = new BufferedReader(new InputStreamReader(IOUtil.getInputStream(full_fname)));
  //   }
  //   catch (e) {
  //     console.error("Unable to open file \"" + filename + "\"");
  //     return ts;
  //   }
  //   // Determine the interval of the file and create a time series that matches...
  //   ts = TSUtil.newTimeSeries(tsident_string, true);
  //   if (ts == null) {
  //     console.error("Unable to create time series for \"" + tsident_string + "\"");
  //     return ts;
  //   }
  //   ts.setIdentifier(tsident_string);
  //   // The specific time series is modified...
  //   // TODO SAM 2007-03-01 Evaluate logic
  //   let tslist = readTimeSeriesList(ts, in, full_fname, data_interval, date1, date2, units, read_data);
  //   // Get out the first time series because sometimes a new one is created, for example with XOP
  //   if ((tslist != null) && tslist.size() > 0) {
  //     ts = tslist.get(0);
  //   }
  //   ts.getIdentifier().setInputType("StateMod");
  //   ts.setInputName(full_fname);
  //   // Already in the low-level code
  //   //ts.addToGenesis ( "Read time series from \"" + full_fname + "\"" );
  //   ts.getIdentifier().setInputName(input_name);
  //   in.close();
  //   return ts;
  // }
}

class MonthTS {

}

class StringUtil {

  /**
  Indicates that strings should be sorted in ascending order.
  */
  static SORT_ASCENDING = 1;

  /**
  Indicates that strings should be sorted in descending order.
  */
  static SORT_DESCENDING = 2;

  /**
  Token types for parsing routines.
  */
  static TYPE_CHARACTER = 1; 
  static TYPE_DOUBLE = 2;
  static TYPE_FLOAT = 3;
  static TYPE_INTEGER = 4;
  static TYPE_STRING = 5;
  static TYPE_SPACE = 6;

  /**
  For use with breakStringList.  Skip blank fields (adjoining delimiters are merged).
  */
  static DELIM_SKIP_BLANKS = 0x1;
  /**
  For use with breakStringList.  Allow tokens that are surrounded by quotes.  For example, this is
  used when a data field might contain the delimiting character.
  */
  static DELIM_ALLOW_STRINGS = 0x2;
  /**
  For use with breakStringList.  When DELIM_ALLOW_STRINGS is set, include the quotes in the returned string.
  */
  static DELIM_ALLOW_STRINGS_RETAIN_QUOTES = 0x4;

  /**
  For use with padding routines.  Pad/unpad back of string.
  */
  static PAD_BACK = 0x1;
  /**
  For use with padding routines.  Pad/unpad front of string.
  */
  static PAD_FRONT = 0x2;
  /**
  For use with padding routines.  Pad/unpad middle of string.  This is private
  because for middle unpadding we currently only allow the full PAD_FRONT_MIDDLE_BACK option.
  */
  private static PAD_MIDDLE = 0x4;
  /**
  For use with padding routines.  Pad/unpad front and back of string.
  */
  static PAD_FRONT_BACK = StringUtil.PAD_FRONT | StringUtil.PAD_BACK;
  /**
  For use with padding routines.  Pad/unpad front, back, and middle of string.
  */
  static PAD_FRONT_MIDDLE_BACK = StringUtil.PAD_FRONT | StringUtil.PAD_MIDDLE|StringUtil.PAD_BACK;

  static breakStringList( string, delim, flag ) {
    let routine = "StringUtil.breakStringList";
    let list = [];
    
    if ( string == null ) {
      return list;
    }
    if ( string.length() == 0 ) {
      return list;
    }
    //if ( Message.isDebugOn ) {
    //	Message.printDebug ( 50, routine,
    //	Message.printStatus ( 1, routine,
    //	"SAMX Breaking \"" + string + "\" using \"" + delim + "\"" );
    //}
    let	length_string = string.length();
    let	instring = false;
    let retainQuotes = false;
    let	istring = 0;
    let cstring;
    let quote = '\"';
    let tempstr;
    let allow_strings = false, skip_blanks = false;
    if ( (flag & this.DELIM_ALLOW_STRINGS) != 0 ) {
      allow_strings = true;
    }
    if ( (flag & this.DELIM_SKIP_BLANKS) != 0 ) {
      skip_blanks = true;
    }
      if ( allow_strings && ((flag & this.DELIM_ALLOW_STRINGS_RETAIN_QUOTES) != 0) ) {
          retainQuotes = true;
      }
    // Loop through the characters in the string.  If in the main loop or
    // the inner "while" the end of the string is reached, the last
    // characters will be added to the last string that is broken out...
    let at_start = true;	// If only delimiters are at the front this will be true.
    for ( istring = 0; istring < length_string; ) {
      cstring = string.charAt(istring);
      // Start the next string in the list.  Move characters to the
      // temp string until a delimiter is found.  If inside a string
      // then go until a closing delimiter is found.
      instring = false;
      tempstr.setLength ( 0 );	// Clear memory.
      while ( istring < length_string ) {
        // Process a sub-string between delimiters...
        cstring = string.charAt ( istring );
        // Check for escaped special characters...
        if ( (cstring == '\\') && (istring < (length_string - 1)) &&
            (string.charAt(istring + 1) == '\"') ) {
            // Add the backslash and the next character - currently only handle single characters
            tempstr += cstring;
            // Now increment to the next character...
            ++istring;
            cstring = string.charAt ( istring );
            tempstr += cstring;
            ++istring;
            continue;
        }
        //Message.printStatus ( 2, routine, "SAMX Processing character " + cstring );
        if ( allow_strings ) {
          // Allowing quoted strings so do check for the start and end of quotes...
          if ( !instring && ((cstring == '"')||(cstring == '\'')) ){
            // The start of a quoted string...
            instring = true;
            at_start = false;
            quote = cstring;
            if ( retainQuotes ) {
              tempstr += cstring;
            }
            // Skip over the quote since we don't want to /store or process again...
            ++istring;
            // cstring set at top of while...
            //Message.printStatus ( 1, routine, "SAMX start of quoted string " + cstring );
            continue;
          }
          // Check for the end of the quote...
          else if ( instring && (cstring == quote) ) {
            // In a quoted string and have found the closing quote.  Need to skip over it.
            // However, could still be in the string and be escaped, so check for that
            // by looking for another string. Any internal escaped quotes will be a pair "" or ''
            // so look ahead one and if a pair, treat as characters to be retained.
            // This is usually only going to be encountered when reading CSV files, etc.
                      if ( (istring < (length_string - 1)) && (string.charAt(istring + 1) == quote) ) {
                        // Found a pair of the quote character so absorb both and keep looking for ending quote for the token
                        tempstr += cstring; // First quote retained because it is literal
                        //Message.printStatus(2,routine,"found ending quote candidate at istring=" + istring + " adding as first in double quote");
                        ++istring;
                        if ( retainQuotes ) {
                          // Want to retain all the quotes
                          tempstr += cstring; // Second quote
                            //Message.printStatus(2,routine,"Retaining 2nd quote of double quote at istring=" + istring );
                        }
                        ++istring;
                        // instring still true
                        continue;
                      }
                      // Else... process as if not an escaped string but an end of quoted string
                      if ( retainQuotes ) {
                        tempstr += cstring;
                      }
            instring = false;
            //Message.printStatus ( 1, routine, "SAMX end of quoted string" + cstring );
            ++istring;
            if ( istring < length_string ) {
              cstring = string.charAt(istring);
              // If the current string is now another quote, just continue so it can be processed
              // again as the start of another string (but don't by default add the quote character)...
              if ( (cstring == '\'') || (cstring == '"') ) {
                            if ( retainQuotes ) {
                              tempstr += cstring;
                            }
                continue;
              }
            }
            else {
              // The quote was the last character in the original string.  Break out so the
              // last string can be added...
              break;
            }
            // If here, the closing quote has been skipped but don't want to break here
            // in case the final quote isn't the last character in the sub-string
            // (e.g, might be ""xxx).
          }
        }
        // Now check for a delimiter to break the string...
        if ( delim.indexOf(cstring) != -1 ) {
          // Have a delimiter character that could be in a string or not...
          if ( !instring ) {
            // Not in a string so OK to break...
            //Message.printStatus ( 1, routine, "SAMX have delimiter outside string" + cstring );
            break;
          }
        }
        else {
          // Else, treat as a character that needs to be part of the token and add below...
          at_start = false;
        }
        // It is OK to add the character...
        tempstr += cstring;
        // Now increment to the next character...
        ++istring;
        // Go to the top of the "while" and evaluate the current character that was just set.
        // cstring is set at top of while...
      }
      // Now have a sub-string and the last character read is a
      // delimiter character (or at the end of the original string).
      //
      // See if we are at the end of the string...
      // if ( instring ) {
      //   if ( Message.isDebugOn ) {
      //     Message.printWarning ( 10, routine, "Quoted string \"" + tempstr + "\" is not closed" );
      //   }
      //   // No further action is required...
      // }
      // Check for and skip any additional delimiters that may be present in a sequence...
      if ( skip_blanks ) {
        while ( (istring < length_string) && (delim.indexOf(cstring) != -1) ) {
          //Message.printStatus ( 1, routine, "SAMX skipping delimiter" + cstring );
          ++istring;
          if ( istring < length_string ) {
            cstring = string.charAt ( istring );
          }
        }
        if ( at_start ) {
          // Just want to skip the initial delimiters without adding a string to the returned list...
          at_start = false;
          continue;
        }
        // After this the current character will be that which needs to be evaluated.  "cstring" is reset
        // at the top of the main "for" loop but it needs to be assigned here also because of the check
        // in the above while loop
      }
      else {
        // Not skipping multiple delimiters so advance over the character that triggered the break in
        // the main while loop...
        ++istring;
        // cstring will be assigned in the main "for" loop
      }
      // Now add the string token to the list...
      list.push ( tempstr.toString() );
      //if ( Message.isDebugOn ) {
        //Message.printDebug ( 50, routine,
        //Message.printStatus ( 1, routine,
        //"SAMX Broke out list[" + (list.size() - 1) + "]=\"" + tempstr + "\"" );
      //}
    }
    return list;
  }
}

class TimeInterval {

  static UNKNOWN = -1; // Unknown, e.g., for initialization
  static IRREGULAR = 0;
  static HSECOND = 5;
  static SECOND = 10;
  static MINUTE = 20;
  static HOUR = 30;
  static DAY = 40;
  static WEEK = 50;
  static MONTH = 60;
  static YEAR = 70;

  /**
  The string associated with the base interval (e.g, "Month").
  */
  intervalBaseString;
  /**
  The string associated with the interval multiplier (may be "" if
  not specified in string used with the constructor).
  */
  intervalMultString;
  /**
  The base data interval.
  */
  intervalBase;
  /**
  The data interval multiplier.
  */
  intervalMult;

  /**
  Parse an interval string like "6Day" into its parts and return as a
  TimeInterval.  If the multiplier is not specified, the value returned from
  getMultiplierString() will be "", even if the getMultiplier() is 1.
  @return The TimeInterval that is parsed from the string.
  @param intervalString Time series interval as a string, containing an
  interval string and an optional multiplier.
  @exception InvalidTimeIntervalException if the interval string cannot be parsed.
  */
  static parseInterval ( intervalString ) {
    let routine = "TimeInterval.parseInterval";
    let	digitCount = 0; // Count of digits at start of the interval string
    let dl = 50;
    var i = 0;
    let length = intervalString.length();

    let interval = new TimeInterval ();

    // Need to strip of any leading digits.

    while( i < length ){
      if(intervalString[i] >= '0' && intervalString[i] <= '9') {
        digitCount++;
        i++;
      }
      else {
          // We have reached the end of the digit part of the string.
        break;
      }
    }

    if( digitCount == 0 ){
      //
      // The string had no leading digits, interpret as one.
      //
      interval.setMultiplier ( 1 );
    }
    else if( digitCount == length ){
      //
      // The whole string is a digit, default to hourly (legacy behavior)
      //
      interval.setBase ( this.HOUR );
      interval.setMultiplier ( parseInt( intervalString ));
      // if ( Message.isDebugOn ) {
      //   Message.printDebug( dl, routine, interval.getMultiplier() + " Hourly" );
      // }
      return interval;
    }
    else {
      let intervalMultString = intervalString.substring(0,digitCount);
      interval.setMultiplier ( parseInt((intervalMultString)) );
      interval.setMultiplierString ( intervalMultString );
    }

    // if ( Message.isDebugOn ) {
    //   Message.printDebug ( dl, routine, "Multiplier: " + interval.getMultiplier() );
    // }

    // Now parse out the Base interval

    let intervalBaseString = intervalString.substring(digitCount).trim();
    let intervalBaseStringUpper = intervalBaseString.toUpperCase();
    if (intervalBaseStringUpper.startsWith("MIN")) {
      interval.setBaseString ( intervalBaseString );
      interval.setBase ( this.MINUTE );
    }
    else if(intervalBaseStringUpper.startsWith("HOUR") || intervalBaseStringUpper.startsWith("HR")) {
      interval.setBaseString ( intervalBaseString );
      interval.setBase ( this.HOUR );
    }
    else if(intervalBaseStringUpper.startsWith("DAY") || intervalBaseStringUpper.startsWith("DAI")) {
      interval.setBaseString ( intervalBaseString );
      interval.setBase ( this.DAY );
    }
    else if(intervalBaseStringUpper.startsWith("SEC")) {
      interval.setBaseString ( intervalBaseString );
      interval.setBase ( this.SECOND );
    }
    else if(intervalBaseStringUpper.startsWith("WEEK") || intervalBaseStringUpper.startsWith("WK")) {
      interval.setBaseString ( intervalBaseString );
      interval.setBase ( this.WEEK );
    }
    else if(intervalBaseStringUpper.startsWith("MON")) {
      interval.setBaseString ( intervalBaseString );
      interval.setBase ( this.MONTH );
    }
    else if(intervalBaseStringUpper.startsWith("YEAR") || intervalBaseStringUpper.startsWith("YR")) {
      interval.setBaseString ( intervalBaseString );
      interval.setBase ( this.YEAR );
    }
    else if(intervalBaseStringUpper.startsWith("IRR")) {
      interval.setBaseString ( intervalBaseString );
      interval.setBase ( this.IRREGULAR );
    }
    else {
        if ( intervalString.length() == 0 ) {
        console.error( 2, routine, "No interval specified." );
      }
      else {
        console.error( 2, routine, "Unrecognized interval \"" +
        intervalString.substring(digitCount) + "\"" );
      }
      console.error( "Unrecognized time interval \"" + intervalString + "\"" );
    }

    // if ( Message.isDebugOn ) {
    //   Message.printDebug( dl, routine, "Base: " +
    //   interval.getBase() + " (" + interval.getBaseString() + "), Mult: " + interval.getMultiplier() );
    // }

    return interval;
  }

  /**
  Return the interval base (see TimeInterval.INTERVAL*).
  @return The interval base (see TimeInterval.INTERVAL*).
  */
  getBase () {
    return this.intervalBase;
  }

  /**
  Return the interval base as a string.
  @return The interval base as a string.
  */
  public getBaseString () {
    return this.intervalBaseString;
  }

  /**
  Return the interval multiplier.
  @return The interval multiplier.
  */
  getMultiplier () {
    return this.intervalMult;
  }

  /**
  Return the interval base as a string.
  @return The interval base as a string.
  */
  getMultiplierString () {
    return this.intervalMultString;
  }

  /**
  Set the interval multiplier.
  @param mult Time series interval.
  */
  setMultiplier ( mult: any ) {
    if (typeof mult == 'number')
      this.intervalMult = mult;
    else if (typeof mult == 'string') {
      if ( mult != null ) {
        this.intervalMultString = mult;
      }
    }
  }

  /**
  Set the interval multiplier string.  This is normally only called by other methods within this class.
  @param multiplier_string Time series interval base as string.
  */
  setMultiplierString ( multiplier_string ) {
    if ( multiplier_string != null ) {
      this.intervalMultString = multiplier_string;
    }
  }

  /**
  Set the interval base.
  @return Zero if successful, non-zero if not.
  @param base Time series interval.
  */
  setBase ( base ) {
    this.intervalBase = base;
  }

  /**
  Set the interval base string.  This is normally only called by other methods within this class.
  @return Zero if successful, non-zero if not.
  @param base_string Time series interval base as string.
  */
  setBaseString ( base_string )
  {	if ( base_string != null ) {
      this.intervalBaseString = base_string;
    }
  }

}

class TS {


}

class TSIdent {
  /**
  Mask indicating that no sub-location should be allowed (treat as part of the main location), used by setLocation().
  */
  NO_SUB_LOCATION	= 0x1;

  /**
  Mask indicating that no sub-source should be allowed (treat as part of the main source), used by setSource().
  */
  NO_SUB_SOURCE = 0x2;

  /**
  Mask indicating that no sub-type should be allowed (treat as part of the main type), used by setType().
  */
  NO_SUB_TYPE = 0x4;

  /**
  Mask indicating that no validation of data should occur.  This is useful for storing
  identifier parts during manipulation (e.g., use wildcards, or specify parts of identifiers).
  */
  NO_VALIDATION = 0x8;

  /**
  Separator string for TSIdent string parts.
  */
  SEPARATOR = ".";

  /**
  Separator string between the TSIdent location type and start of the location ID.
  */
  LOC_TYPE_SEPARATOR = ":";

  /**
  Separator string for TSIdent location parts.
  */
  LOCATION_SEPARATOR = "-";

  /**
  Separator string for TSIdent source parts.
  */
  SOURCE_SEPARATOR = "-";

  /**
  Separator string for TSIdent data type parts.
  */
  TYPE_SEPARATOR = "-";

  /**
  Start of sequence identifier (old sequence number).
  */
  SEQUENCE_NUMBER_LEFT = "[";

  /**
  End of sequence identifier (old sequence number).
  */
  SEQUENCE_NUMBER_RIGHT = "]";

  /**
  Separator string for input type and datastore at end of TSID.
  */
  INPUT_SEPARATOR = "~";

  /**
  The quote can be used to surround TSID parts that have periods, so as to protect the part.
  This is typically used with location and data type, although not common.
  */
  static PERIOD_QUOTE = "'";
  static PERIOD_QUOTE_CHAR = '\'';

  /**
  The whole identifier, including the input type.
  */
  identifier;

  /**
  A comment that can be used to describe the TSID, for example one-line TSTool software comment.
  */
  comment = "";

  /**
  A short alias for the time series identifier.
  */
  alias;

  /**
  The location (combining the main location and the sub-location).
  */
  full_location;

  /**
  Location type (optional).
  */
  locationType = "";

  /**
  The main location.
  */
  main_location;

  /**
  The sub-location (2nd+ parts of the location, using the LOCATION_SEPARATOR.
  */
  sub_location;

  /**
  The time series data source (combining the main source and the sub-source).
  */
  full_source;

  /**
  The main source.
  */
  main_source;

  /**
  The sub-source.
  */
  sub_source;

  /**
  The time series data type (combining the main and sub types).
  */
  full_type;

  /**
  The main data type.
  */
  main_type;

  /**
  The sub data type.
  */
  sub_type;

  /**
  The time series interval as a string.
  */
  interval_string;

  /**
  The base data interval.
  */
  interval_base;

  /**
  The data interval multiplier.
  */
  interval_mult;

  /**
  The time series scenario.
  */
  scenario;

  /**
  Identifier used for ensemble trace (e.g., if a list of time series is
  grouped as a set of traces in an ensemble, the trace ID can be the year that the trace starts).
  */
  sequenceID;

  /**
  Type of input (e.g., "DateValue", "RiversideDB")
  */
  input_type;

  /**
  Name of input (e.g., a file, data store, or database connection name).
  */
  input_name;

  /**
  Mask that controls behavior (e.g., how sub-fields are handled).
  */
  behavior_mask;

  /**
  Construct using a full string identifier, which will be parsed and the
  individual parts of the identifier set.
  @param identifier Full string identifier (optionally, with right-most fields omitted).
  @exception if the identifier is invalid (usually the interval is incorrect).
  */
  constructor ( identifier ) {
    this.init();
    this.setIdentifier ( identifier );
  }

  /**
  Initialize data members.
  */
  init () {
    this.behavior_mask = 0; // Default is to process sub-location and sub-source

    // Initialize to null strings so that there are not problems with the recursive logic...

    this.identifier = null;
    this.full_location = null;
    this.main_location = null;
    this.sub_location = null;
    this.full_source = null;
    this.main_source = null;
    this.sub_source = null;
    this.full_type = null;
    this.main_type = null;
    this.sub_type = null;
    this.interval_string = null;
    this.scenario = null;
    this.sequenceID = null;
    this.input_type = null;
    this.input_name = null;

    this.setAlias("");

    // Initialize the overall identifier to an empty string...

    this.setFullIdentifier ("");

    // Initialize the location components...

    this.setMainLocation("");

    this.setSubLocation("");

    // Initialize the source...

    this.setMainSource("");
    this.setSubSource("");

    // Initialize the data type...

    this.setType("");
    this.setMainType("");
    this.setSubType("");

    // Initialize the interval...

    this.interval_base = TimeInterval.UNKNOWN;
    this.interval_mult = 0;

    try {
        this.setInterval("");
    }
    catch ( e ) {
      // Can ignore here.
    }

    // Initialize the scenario...

    this.setScenario("");

    // Initialize the input...

    this.setInputType("");
    this.setInputName("");
  }

  /**
  Parse a TSIdent instance given a String representation of the identifier.
  @return A TSIdent instance given a full identifier string.
  @param identifier Full identifier as string.
  @param behavior_flag Behavior mask to use when creating instance.
  @exception if an error occurs (usually a bad interval).
  */
  parseIdentifier ( identifier, behavior_flag ) {
    let routine="TSIdent.parseIdentifier";
    let	dl = 100;
    
    // Declare a TSIdent which we will fill and return...

    // if ( Message.isDebugOn ) {
    //   Message.printDebug ( dl, routine, "Declare TSIdent within this routine..." );
    // }
    let	tsident = new TSIdent( behavior_flag );
    // if ( Message.isDebugOn ) {
    //   Message.printDebug ( dl, routine, "...done declaring TSIdent" );
    // }

    // First parse the datastore and input type information.
    // - does not matter if TSID parts are quoted at this point

    let identifierNoInputName = identifier;
    let inputTypeList = StringUtil.breakStringList ( identifier, "~", 0 );
    if ( inputTypeList != null ) {
      let nlist = inputTypeList.length;
      // Reset to first part for processing below checks below...
      identifierNoInputName = inputTypeList[0];
      if ( nlist == 2 ) {
        tsident.setInputType ( inputTypeList[1] );
      }
      else if ( nlist >= 3 ) {
        tsident.setInputType ( inputTypeList[1] );
        // File name may have a ~ so find the second instance
        // of ~ and use the remaining string...
        let pos = identifier.indexOf ( "~" );
        if ( (pos >= 0) && identifier.length() > (pos + 1) ) {
          // Have something at the end...
          let sub = identifier.substring ( pos + 1 );
          pos = sub.indexOf ( "~" );
          if ( (pos >= 0) && (sub.length() > (pos + 1))) {
            // The rest is the file...
            tsident.setInputName ( sub.substring(pos + 1) );
          }
        }
      }
    }

    // Now parse the 5-part identifier that does not have trailing ~...

    let full_location = "", full_source = "", interval_string = "", scenario = "", full_type = "";

    let tsidPartList = null;  // TSID parts, as delimited by .
    let posQuote = identifierNoInputName.indexOf(TSIdent.PERIOD_QUOTE);
    // 'list' below are the TSID parts split by periods
    //   list[0] = location
    //   list[1] = data source
    //   list[2] = data type
    //   list[3] = data interval
    //   list[4] = scenario, with [trace] at end
    if ( posQuote >= 0 ) {
      // Have at least one quote so assume TSID something like the following where data type is escaped:
      //   LocaId.Source.'DataType-some.parts.with.periods'.Interval
      // or location ID is escaped:
      //   'LocaId.xx'.Source.'DataType-some.parts.with.periods'.Interval
      tsidPartList = this.parseIdentifier_SplitWithQuotes(identifierNoInputName);
    }
    else {
      // No quote in TSID so do simple parse
      tsidPartList = StringUtil.breakStringList ( identifierNoInputName, ".", 0 );
    }
    let tsidPartListSize = tsidPartList.size();
    // for ( int i = 0; i < tsidPartListSize; i++ ) {
    //   if ( Message.isDebugOn ) {
    //     Message.printDebug ( dl, routine, "TS ID list[" + i + "]:  \"" + tsidPartList.get(i) + "\"" );
    //   }
    // }

    // if ( Message.isDebugOn ) {
    //   Message.printDebug ( dl, routine, "Full TS ID:  \"" + identifier +"\"");
    // }

    // Parse out location and split the rest of the ID...
    //
    // FIXME SAM 2013-06-16 Actually, may need quotes for more new use cases where periods are in identifier parts
    // This field is allowed to be surrounded by quotes since some
    // locations cannot be identified by a simple string.  Allow
    // either ' or " to be used and bracket it.

    // Location type
    // - does not need to be surrounded by single quotes
    let locationTypeSepPos = -1;
    let locationPart = tsidPartList.get(0);  // LocationType:FullLocation or FullLocation
    let locationIdPart = locationPart; // Full string used if location type is not used
    locationTypeSepPos = locationPart.indexOf(this.LOC_TYPE_SEPARATOR);
    let locationType = "";
    if ( locationTypeSepPos >= 0 ) {
        // Have a location type so split out and set, then treat the rest of the location
        // as the location identifier for further processing
        locationType = locationPart.substring(0,locationTypeSepPos);
        // Remaining location part is the remainder of the LocType:locationPart string,
        // which will be processed below.
        locationIdPart = locationPart.substring(locationTypeSepPos + 1);
    }
    
    // Location identifier (without leading LocationType: from above)
    // - may be surrounded by single quotes (TODO smalers 2020-02-13 double quotes allowed for history)
    if ( tsidPartListSize >= 1 ) {
      // TODO smalers 2020-02-13 treat like datatype and keep surrounding quotes
      //if ( (locationIdPart.charAt(0) == '\'') || (locationIdPart.charAt(0) == '\"')) {
        // Read the location excluding the delimiter
      //	full_location = StringUtil.readToDelim ( locationPart.substring(1), locationPart.charAt(0) );
      //}
      //else {
          full_location = locationIdPart;
      //	}
    }

    // Data source...
    if ( tsidPartListSize >= 2 ) {
      full_source = tsidPartList.get(1);
    }

    // Data type...
    if ( tsidPartListSize >= 3 ) {
      // Data type will include surrounding quotes - otherwise would need to add when rebuilding the full TSID string
      full_type = tsidPartList.get(2);
    }

    // Data interval...
    let sequenceId = null;
    if ( tsidPartListSize >= 4 ) {
      interval_string = tsidPartList.get(3);
      // If no scenario is used, the interval string may have the sequence ID on the end, so search for the [ and split the
      // sequence ID out of the interval string...
      let index = interval_string.indexOf ( this.SEQUENCE_NUMBER_LEFT );
      // Get the sequence ID...
      if ( index >= 0 ) {
        if ( interval_string.endsWith(this.SEQUENCE_NUMBER_RIGHT)){
          // Should be a properly-formed sequence ID, but need to remove the brackets...
          sequenceId = interval_string.substring( index + 1, interval_string.length - 1).trim();
        }
        if ( index == 0 ) {
          // There is no interval, just the sequence ID (should not happen)...
          interval_string = "";
        }
        else {
                  interval_string = interval_string.substring(0,index);
        }
      }
    }

    // Scenario...  It is possible that the scenario has delimiters
    // in it.  Therefore, we need to concatenate all the remaining
    // fields to compose the complete scenario...
    if ( tsidPartListSize >= 5 ) {
      let scenarioBuffer;
      scenarioBuffer += tsidPartList.get(4);
      for ( let i = 5; i < tsidPartListSize; i++ ) {
        // Append the delimiter to create the original un-parsed string
        scenarioBuffer += "." ;
        scenarioBuffer += tsidPartList.get(i);
      }
      scenario = scenarioBuffer.toString ();
    }
    // The scenario may now have the sequence ID on the end, search for the [ and split out of the scenario...
    let index = scenario.indexOf ( this.SEQUENCE_NUMBER_LEFT );
    // Get the sequence ID...
    if ( index >= 0 ) {
      if ( scenario.endsWith(this.SEQUENCE_NUMBER_RIGHT) ) {
        // Should be a properly-formed sequence ID...
        sequenceId = scenario.substring ( index + 1, scenario.length - 1 ).trim();
      }
      if ( index == 0 ) {
        // There is no scenario, just the sequence ID...
        scenario = "";
      }
      else {
              scenario = scenario.substring(0,index);
      }
    }
    // if ( Message.isDebugOn ) {
    //   Message.printDebug ( dl, routine,
    //     "After split: full_location=\"" + full_location +
    //     "\" full_source=\"" + full_source +
    //     "\" type=\"" + full_type +
    //     "\" interval=\"" + interval_string +
    //     "\" scenario=\"" + scenario +
    //     "\" sequenceId=\"" + sequenceId + "\"" );
    // }

    // Now set the identifier component parts...

    tsident.setLocationType ( locationType );
    tsident.setLocation1 ( full_location );
    tsident.setSource1 ( full_source );
    tsident.setType ( full_type );
    tsident.setInterval ( interval_string );
    tsident.setScenario ( scenario );
    tsident.setSequenceID ( sequenceId );

    // Return the TSIdent object for use elsewhere...

    // if ( Message.isDebugOn ) {
    //   Message.printDebug ( dl, routine, "Returning local TSIdent..." );
    // }
    return tsident;
  }

  /**
  Parse a TSID that has quoted part with periods in one or more parts.
  @param identifier TSID main part (no ~).
  @return list of parts for TSID
  */
  parseIdentifier_SplitWithQuotes( identifier) {
    // Process by getting one token at a time.
    // -tokens are between periods
    // -if first character of part is single quote, get to the next single quote
    let parts = [];
    let inPart = true; // should always have a part at the front
    let inQuote = false;
    let c;
    let b;
    let ilen = identifier.length();
    // Use debug messages for now but code seems to be OK
    // - remove debug messages later.
    for ( let i = 0; i < ilen; i++ ) {
      c = identifier.charAt(i);
      // if ( Message.isDebugOn ) {
      // 	Message.printDebug(1, "", "Character is: " + c);
      // }
      if ( c == '.' ) {
        // if ( Message.isDebugOn ) {
        //   Message.printDebug(1, "", "Found period" );
        // }
        if ( inQuote ) {
          // In a quote so just keep adding characters
          // if ( Message.isDebugOn ) {
          //   Message.printDebug(1, "", "In quote" );
          // }
          b.append(c);
        }
        else {
          // Not in quote
          // if ( Message.isDebugOn ) {
          //   Message.printDebug(1, "", "Not in quote" );
          // }
          if ( inPart ) {
            // Between periods.  Already in part so end it without adding period
            // if ( Message.isDebugOn ) {
            //   Message.printDebug(1, "", "In part, ending part" );
            // }
            parts.push(b.toString());
            b.setLength(0);
            // Will be in part at top of loop because current period will be skipped
            // - but if last period treat the following part as empty string
            if ( i == (ilen - 1) ) {
              // Add an empty string
              parts.push("");
            }
            else {
              // Keep processing
              // Set to not be in part
              inPart = false;
              --i; // Re-process period to trigger in a part in next iteration
            }
          }
          else {
            // Was not in a part so start it
            // if ( Message.isDebugOn ) {
            //   Message.printDebug(1, "", "Not in part, starting part" );
            // }
            inPart = true;
            // Don't add period to part.
          }
        }
      }
      else if ( c == TSIdent.PERIOD_QUOTE_CHAR ) {
        // Found a quote, which will surround a point, as in:  .'some.part.xx'.
        // if ( Message.isDebugOn ) {
        //   Message.printDebug(1, "", "Found quote" );
        // }
        if ( inQuote ) {
          // At the end of the quoted part.
          // Always include the quote in the part
          // if ( Message.isDebugOn ) {
          //   Message.printDebug(1, "", "In quote, ending quote" );
          // }
          b.append(c);
          parts.push(b.toString());
          b.setLength(0);
          // Next period immediately following will cause next part to be added, even if period at end of string
          inQuote = false;
          inPart = false;
        }
        else {
          // Need to start a part
          // if ( Message.isDebugOn ) {
          //   Message.printDebug(1, "", "Not in quote, starting quote" );
          // }
          b.append(c); // Keep the quote
          inQuote = true;
        }
      }
      else {
        // Character to add to part
        b.append(c);
        if ( i == (ilen - 1) ) {
          // Last part
          parts.push(b.toString());
        }
      }
    }
    // if ( Message.isDebugOn ) {
    //   String routine = "TSIdent.parseIdentifier_SplitWithQuotes";
    //   for ( String s : parts ) {
    //     Message.printDebug(1, routine, "TSID part is \"" + s + "\"");
    //   }
    // }
    return parts;
  }

  /**
  Return the input name.
  @return The input name.
  */
  getInputName () {
    return this.input_name;
  }

  /**
  Return the input type.
  @return The input type.
  */
  getInputType () {
    return this.input_type;
  }


  /**
  Return the full interval string.
  @return The full interval string.
  */
  getInterval () {
    return this.interval_string;
  }

  /**
  Return the data interval base as an int.
  @return The data interval base (see TimeInterval.*).
  */
  getIntervalBase () {
    return this.interval_base;
  }

  /**
  Return the data interval multiplier.
  @return The data interval multiplier.
  */
  getIntervalMult () {
    return this.interval_mult;
  }

  /**
  Return the full location.
  @return The full location string.
  */
  getLocation( ) {
    return this.full_location;
  }

  /**
  Return the location type.
  @return The location type string.
  */
  getLocationType( ) {
  return this.locationType;
  }

  /**
  Return the sequence identifier for the time series.
  @return The sequence identifier for the time series.  This is meant to be used
  when an array of time series traces is maintained, for example in an ensemble.
  @return time series sequence identifier.
  */
  getSequenceID () {
    if ( this.sequenceID == null ) {
      return "";
    }
    else {
      return this.sequenceID;
    }
  }

  /**
  Return the scenario string.
  @return The scenario string.
  */
  getScenario( ) {
    return this.scenario;
  }

  /**
  Return the full source string.
  @return The full source string.
  */
  getSource() {
    return this.full_source;
  }

  /**
  Return the data type.
  @return The full data type string.
  */
  getType( ) {
    return this.full_type;
  }

  /**
  Set the time series alias.
  @param alias Alias for the time series.
  */
  setAlias ( alias )
  {	if ( alias != null ) {
      this.alias = alias;
    }
  }

  /**
  Set the input name.
  The input name.
  */
  setInputName ( input_name ) {
    if ( input_name != null ) {
      this.input_name = input_name;
    }
  }

  /**
  Set the input type.
  The input type.
  */
  setInputType ( input_type ) {
    if ( input_type != null ) {
      this.input_type = input_type;
    }
  }

  /**
  Set the interval given the interval string.
  @param interval_string Data interval string.
  @exception if there is an error parsing the interval string.
  */
  setInterval ( interval_string ) {
    let routine="TSIdent.setInterval(String)";
    let	dl = 100;
    let tsinterval = null;

    if ( interval_string == null ) {
      return;
    }

    // if ( Message.isDebugOn ) {
    // 	Message.printDebug ( dl, routine, "Setting interval to \"" + interval_string + "\"" );
    // }

    if ( !interval_string.equals("*") && interval_string.length() > 0 ) {
      // First split the string into its base and multiplier...

      if ( (this.behavior_mask & this.NO_VALIDATION) == 0 ) {
          try {
              tsinterval = TimeInterval.parseInterval ( interval_string );
          }
          catch ( e ) {
              // Not validating so let this pass...
          }
      }
      else {
          // Want to validate so let this throw an exception...
          tsinterval = TimeInterval.parseInterval ( interval_string );
      }

  // Now set the base and multiplier...
      if ( tsinterval != null ) {
      this.interval_base = tsinterval.getBase();
      this.interval_mult = tsinterval.getMultiplier();
      // if ( Message.isDebugOn ) {
      // 	Message.printDebug ( dl, routine, "Setting interval base to " + __interval_base	+ " mult: " +
      //                 __interval_mult );
      // }
      }
    }
    // Else, don't do anything (leave as zero initialized values).

    // Now set the interval string.  Use the given interval base string
    // because we need to preserve existing file names, etc.

    this.setIntervalString ( interval_string );
    this.setIdentifier();
  }

  /**
  Set the interval string.  This is normally only called from this class.
  @param interval_string Interval string.
  */
  setIntervalString ( interval_string ) {
    if ( interval_string != null ) {
      this.interval_string = interval_string;
    }
  }

  /**
  Set the identifier by parsing the given string.
  @param identifier Full identifier string.
  @exception if the identifier cannot be set (usually the interval is incorrect).
  */
  setIdentifier (identifier?) {
    if (identifier) {

      let routine = "TSIdent.setIdentifier";
      let	dl = 100;

      if ( identifier == null ) {
        return;
      }

      // if ( Message.isDebugOn ) {
      //   Message.printDebug ( dl, routine, "Trying to set identifier to \"" + identifier + "\"" );
      // }

      if ( identifier.length() == 0 ) {
        // Cannot parse the identifier because doing so would result in
        // an infinite loop.  If this routine is being called with an
        // empty string, it is a mistake.  The initialization code will
        // call setFullIdentifier() directly.
        // if ( Message.isDebugOn ) {
        //   Message.printDebug ( dl, routine, "Identifier string is empty, not processing!" );
        // }
        return;
      }

      // Parse the identifier using the public static function to create a temporary identifier object...

      // if ( Message.isDebugOn ) {
      //   Message.printDebug ( dl, routine, "Done declaring temp TSIdent." );
      //   Message.printDebug ( dl, routine, "Parsing identifier..." );
      // }
      let tsident = this.parseIdentifier ( identifier, this.behavior_mask );
      // if ( Message.isDebugOn ) {
      //   Message.printDebug ( dl, routine, "...back from parsing identifier" );
      // }

      // Now copy the temporary copy into this instance...

      // if ( Message.isDebugOn ) {
      //   Message.printDebug ( dl, routine, "Setting the individual parts..." );
      // }
      this.setLocationType( tsident.getLocationType() );
      this.setLocation1( tsident.getLocation() );
      this.setSource1( tsident.getSource() );
      this.setType( tsident.getType() );
      this.setInterval( tsident.getInterval() );
      this.setScenario( tsident.getScenario() );
      this.setSequenceID ( tsident.getSequenceID() );
      this.setInputType ( tsident.getInputType() );
      this.setInputName ( tsident.getInputName() );
      // if ( Message.isDebugOn ) {
      //   Message.printDebug ( dl, routine, "... done setting the individual parts" );
      // }
    } else {
      let routine = "TSIdent.setIdentifier(void)";
      let	dl = 100;

      // Assume that all the individual set routines have handled the
      // __behavior_mask accordingly and therefore we can just concatenate
      // strings here...

      // if ( Message.isDebugOn ) {
      //   Message.printDebug ( dl, routine,
      //   "Setting full identifier from parts: \"" + __full_location +
      //   "." + __full_source + "." + __full_type +"."+__interval_string +
      //   "." + __scenario + "~" + __input_type + "~" + __input_name );
      // }

      let full_identifier;
      // if ( Message.isDebugOn ) {
      //   Message.printDebug ( dl, routine, "Calling getIdentifierFromParts..." );
      // }
      // TODO: UNCOMMENT THE NEXT TWO LINES OUT
      // full_identifier = this.getIdentifierFromParts(this.locationType, this.full_location, this.full_source,
        // this.full_type, this.interval_string, this.scenario, this.sequenceID, this.input_type, this.input_name );
      // if ( Message.isDebugOn ) {
      //   Message.printDebug ( dl, routine, "...successfully called getIdentifierFromParts..." );
      // }

      this.setFullIdentifier ( full_identifier );

      // if ( Message.isDebugOn ) {
      //   Message.printDebug ( dl, routine, "ID..." );
      //   Message.printDebug ( dl, routine, "\"" + __identifier + "\"" );
      // }
    }
  }

  /**
  Set the full identifier (this does not result in a parse).  It is normally only
  called from within this class.
  @param full_identifier Full identifier string.
  */
  setFullIdentifier ( full_identifier ) {
    if ( full_identifier == null ) {
      return;
    }
    this.identifier = full_identifier;
    // DO NOT call setIdentifier() from here!
  }

  /**
  Set the full location (this does not result in a parse).  It is normally only
  called from within this class.
  @param full_location Full location string.
  */
  setFullLocation ( full_location ) {
    if ( full_location == null ) {
      return;
    }
    this.full_location = full_location;
    // DO NOT call setIdentifier() from here!
  }

  /**
  Set the full source (this does not result in a parse).  It is normally only
  called from within this class.
  @param full_source Full source string.
  */
  setFullSource ( full_source )
  {	if ( full_source == null ) {
      return;
    }
    this.full_source = full_source;
    // DO NOT call setIdentifier() from here!
  }

  /**
  Set the full data type (this does not result in a parse).  It is normally only
  called from within this class.
  @param full_type Full data type string.
  */
  setFullType ( full_type )
  {	if ( full_type == null ) {
      return;
    }
    this.full_type = full_type;
    // DO NOT call setIdentifier() from here!
  }

  /**
  Set the full location from its parts.  This method is generally called from
  setMainLocation() and setSubLocation() methods to reset __full_location.
  */
  setLocation () {
    let	routine = "TSIdent.setLocation";
    let	dl = 100;

    // if ( Message.isDebugOn ) {
    //   Message.printDebug ( dl, routine, "Resetting full location from parts..." );
    // }
    if ( (this.behavior_mask & this.NO_SUB_LOCATION) != 0 ) {
      // Just use the main location as the full location...
      if ( this.main_location != null ) {
        // There should always be a main location after the object is initialized...
        this.setFullLocation ( this.main_location );
      }
    }
    else {
          // Concatenate the main and sub-locations to get the full location.
      let full_location;
      // We may want to check for __main_location[] also...
      if ( this.main_location != null ) {
        // This should always be the case after the object is initialized...
        full_location.append ( this.main_location );
        if ( this.sub_location != null ) {
          // We only want to add the sublocation if it is
          // not an empty string (it will be an empty
          // string after the object is initialized).
          if ( this.sub_location.length() > 0 ) {
            // Have a sub_location so append it to the main location...
            full_location.append ( this.LOCATION_SEPARATOR );
            full_location.append ( this.sub_location );
          }
        }
        this.setFullLocation ( full_location.toString() );
      }
    }
    // Now reset the full identifier...
    this.setIdentifier ();
  }

  /**
  Set the full location from its full string.
  @param full_location The full location string.
  */
  setLocation1 ( full_location ) {
    let routine = "TSIdent.setLocation(String)";
    let	dl = 100;

    if ( full_location == null ) {
      return;
    }

    // if ( Message.isDebugOn ) {
    //   Message.printDebug ( dl, routine, "Trying to set location to \"" + full_location + "\"" );
    // }

    if ( (this.behavior_mask & this.NO_SUB_LOCATION) != 0 ) {
      // The entire string passed in is used for the main location...
      this.setMainLocation ( full_location );
    }
    else {
        // Need to split the location into main and sub-location...
      let list: any[] = [];
      let sub_location: string;
      let nlist;
      list = StringUtil.breakStringList ( full_location, this.LOCATION_SEPARATOR, 0 );
      nlist = list.length;
      if ( nlist >= 1 ) {
        // Set the main location...
        this.setMainLocation ( list[0] );
      }
      if ( nlist >= 2 ) {
        // Now set the sub-location.  This allows for multiple
        // delimited parts (everything after the first delimiter is treated as the sublocation).
        let iend = nlist - 1;
        for ( let i = 1; i <= iend; i++ ) {
          if ( i != 1 ) {
            sub_location += this.LOCATION_SEPARATOR;
          }
          sub_location += list[i];
        }
        this.setSubLocation ( sub_location.toString() );
      }
      else {
          // Since only setting the main location need to set the sub-location to an empty string...
        this.setSubLocation ( "" );
      }
    }
  }

  /**
  Set the location type.
  @param locationType location type.
  */
  setLocationType( locationType ) {
    if ( locationType == null ) {
          return;
      }
      this.locationType = locationType;
      this.setIdentifier ();
  }

  /**
  Set the main location string (and reset the full location).
  @param main_location The main location string.
  */
  setMainLocation ( main_location )
  {	if ( main_location == null ) {
      return;
    }
    this.main_location = main_location;
    this.setLocation();
  }

  /**
  Set the main source string (and reset the full source).
  @param main_source The main source string.
  */
  setMainSource ( main_source )
  {	if ( main_source == null ) {
      return;
    }
    this.main_source = main_source;
    this.setSource();
  }

  /**
  Set the main data type string (and reset the full type).
  @param main_type The main data type string.
  */
  setMainType ( main_type )
  {	if ( main_type == null ) {
      return;
    }
    this.main_type = main_type;
    this.setType0();
  }

  /**
  Set the scenario string.
  @param scenario The scenario string.
  */
  setScenario( scenario ) {
    if ( scenario == null ) {
      return;
    }
    this.scenario = scenario;
    this.setIdentifier ();
  }

  /**
  Set the sequence identifier, for example when the time series is part of an ensemble.
  @param sequenceID sequence identifier for the time series.
  */
  setSequenceID ( sequenceID )
  {	this.sequenceID = sequenceID;
    this.setIdentifier ();
  }

  /**
  Set the full source from its parts.
  */
  setSource ( ) {
    if ( (this.behavior_mask & this.NO_SUB_SOURCE) != 0 ) {
      // Just use the main source as the full source...
      if ( this.main_source != null ) {
        // There should always be a main source after the object is initialized...
        this.setFullSource ( this.main_source );
      }
    }
    else {
        // Concatenate the main and sub-sources to get the full source.
      let full_source;
      if ( this.main_source != null ) {
        // We only want to add the subsource if it is not an
        // empty string (it will be an empty string after the
        // object is initialized).
        full_source += this.main_source;
        if ( this.sub_source != null ) {
          // We have sub_source so append it to the main source...
          // We have a sub_source so append it to the main source...
          if ( this.sub_source.length() > 0 ) {
            full_source += this.SOURCE_SEPARATOR;
            full_source += this.sub_source;
          }
        }
        this.setFullSource ( full_source.toString() );
      }
    }
    // Now reset the full identifier...
    this.setIdentifier ();
  }

  /**
Set the full source from a full string.
@param source The full source string.
*/
setSource1 ( source ) {
  if ( source == null ) {
		return;
	}

	if ( source.equals("") ) {
		this.setMainSource ( "" );
		this.setSubSource ( "" );
	}
	else if ( (this.behavior_mask & this.NO_SUB_SOURCE) != 0 ) {
		// The entire string passed in is used for the main source...
		this.setMainSource ( source );
	}
	else {
	    // Need to split the source into main and sub-source...
		let list: any[] = [];
		let sub_source: string;
		let nlist;
		list =	StringUtil.breakStringList ( source,
			this.SOURCE_SEPARATOR, 0 );
		nlist = list.length;
		if ( nlist >= 1 )  {
			// Set the main source...
			this.setMainSource ( list[0] );
		}
		if ( nlist >= 2 ) {
			// Now set the sub-source...
			let iend = nlist - 1;
			for ( let i = 1; i <= iend; i++ ) {
				sub_source += list[i];
				if ( i != iend ) {
					sub_source += this.SOURCE_SEPARATOR;
				}
			}
			this.setSubSource ( sub_source.toString() );
		}
		else {
		    // Since we are only setting the main location we
			// need to set the sub-location to an empty string...
			this.setSubSource ( "" );
		}
	}
}

  /**
  Set the sub-location string (and reset the full location).
  @param sub_location The sub-location string.
  */
  setSubLocation ( sub_location ) {
    if ( sub_location == null ) {
      return;
    }
    this.sub_location = sub_location;
    this.setLocation();
  }

  /**
  Set the sub-source string (and reset the full source).
  @param sub_source The sub-source string.
  */
  setSubSource ( sub_source ) {
    if ( sub_source == null ) {
      return;
    }
    this.sub_source = sub_source;
    this.setSource();
  }

  /**
  Set the sub-type string (and reset the full data type).
  @param sub_type The sub-type string.
  */
  setSubType ( sub_type ) {
    if ( sub_type == null ) {
      return;
    }
    this.sub_type = sub_type;
    this.setType0();
  }

  /**
  Set the full data type from its parts.  This method is generally called from
  setMainType() and setSubType() methods to reset __full_type.
  */
  setType0 () {
    let	routine = "TSIdent.setType";
    let	dl = 100;
    
    // if ( Message.isDebugOn ) {
    //   Message.printDebug ( dl, routine, "Resetting full type from parts..." );
    // }
    if ( (this.behavior_mask & this.NO_SUB_TYPE) != 0 ) {
      // Just use the main type as the full type...
      if ( this.main_type != null ) {
        // There should always be a main type after the object is initialized...
        this.setFullType ( this.main_type );
      }
    }
    else {
        // Concatenate the main and sub-types to get the full type.
      let full_type;
      if ( this.main_type != null ) {
        // This should always be the case after the object is initialized...
        full_type + this.main_type;
        if ( this.sub_type != null ) {
          // We only want to add the subtype if it is
          // not an empty string (it will be an empty
          // string after the object is initialized).
          if ( this.sub_type.length() > 0 ) {
            // We have a sub type so append it to the main type...
            full_type.append ( this.TYPE_SEPARATOR );
            full_type.append ( this.sub_type );
          }
        }
        this.setFullType ( full_type.toString() );
      }
    }
    // Now reset the full identifier...
    this.setIdentifier ();
  }

  /**
  Set the full data type from its full string.
  @param type The full data type string.
  */
  setType ( type ) {
    let	routine = "TSIdent.setType";
    let	dl = 100;

    if ( type == null ) {
      return;
    }

    // if ( Message.isDebugOn ) {
    // 	Message.printDebug ( dl, routine, "Trying to set data type to \"" + type + "\"" );
    // }

    if ( (this.behavior_mask & this.NO_SUB_TYPE) != 0 ) {
      // The entire string passed in is used for the main data type...
      this.setMainType ( type );
    }
    else {
      // Need to split the data type into main and sub-location...
      let list;
      let sub_type;
      let nlist;
      list =	StringUtil.breakStringList ( type, this.TYPE_SEPARATOR, 0 );
      nlist = list.size();
      if ( nlist >= 1 ) {
        // Set the main type...
        this.setMainType ( list.get(0) );
      }
      if ( nlist >= 2 ) {
        // Now set the sub-type...
        let iend = nlist - 1;
        for ( let i = 1; i <= iend; i++ ) {
          sub_type.append (list.get(i));
          if ( i != iend ) {
            sub_type.append ( this.TYPE_SEPARATOR );
          }
        }
        this.setSubType ( sub_type.toString() );
      }
      else {
          // Since we are only setting the main type we
        // need to set the sub-type to an empty string...
        this.setSubType ( "" );
      }
    }
  }
    
}

class TSUtil {

  static newTimeSeries ( id, long_id ) {
    let intervalBase = 0;
    let intervalMult = 0;
    let intervalString = "";
    if ( long_id ) {
      // Create a TSIdent so that the type of time series can be determined...

      let tsident = new TSIdent(id);

      // Get the interval and base...

      intervalString = tsident.getInterval();
      intervalBase = tsident.getIntervalBase();
      intervalMult = tsident.getIntervalMult();
    }
    else {
      // Parse a TimeInterval so that the type of time series can be determined...

      intervalString = id;
      let tsinterval = TimeInterval.parseInterval(intervalString);

      // Get the interval and base...

      intervalBase = tsinterval.getBase();
      intervalMult = tsinterval.getMultiplier();
    }
    // Now interpret the results and declare the time series...

    let ts = null;
    if ( intervalBase == TimeInterval.MINUTE ) {
      throw new Error('MinuteTS has not been implemented yet');
      // ts = new MinuteTS();
    }
    else if ( intervalBase == TimeInterval.HOUR ) {
      throw new Error('HourTS has not been implemented yet');
      // ts = new HourTS();
    }
    else if ( intervalBase == TimeInterval.DAY ) {
      throw new Error('DayTS has not been implemented yet');
      // ts = new DayTS();
    }
    else if ( intervalBase == TimeInterval.MONTH ) {
      ts = new MonthTS();
    }
    else if ( intervalBase == TimeInterval.YEAR ) {
      ts = new YearTS();
    }
    else if ( intervalBase == TimeInterval.IRREGULAR ) {
      throw new Error('IrregularTS has not been implemented yet');
      // ts = new IrregularTS();
    }
    else {
          console.error("Cannot create a new time series for \"" + id + "\" (the interval \"" +
              intervalString + "\" [" + intervalBase + "] is not recognized).");
      // Message.printWarning ( 3, "TSUtil.newTimeSeries", message );
      // throw new Exception ( message );
    }

    // Set the multiplier...
    ts.setDataInterval(intervalBase,intervalMult);
    ts.setDataIntervalOriginal(intervalBase,intervalMult);
    // Set the genesis information
    ts.addToGenesis( "Created new time series with interval determined from TSID \"" + id + "\"" );

    // Return whatever was created...

    return ts;
  }
}

class YearTS {

}