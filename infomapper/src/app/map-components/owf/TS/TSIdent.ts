import { TimeInterval } from '../Util/Time/TimeInterval';
import { StringUtil } from '../Util/String/StringUtil';


export class TSIdent {
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
  identifier: string;

  /**
  A comment that can be used to describe the TSID, for example one-line TSTool software comment.
  */
  comment: string = "";

  /**
  A short alias for the time series identifier.
  */
  alias: string;

  /**
  The location (combining the main location and the sub-location).
  */
  full_location: string;

  /**
  Location type (optional).
  */
  locationType: string = "";

  /**
  The main location.
  */
  main_location: string;

  /**
  The sub-location (2nd+ parts of the location, using the LOCATION_SEPARATOR.
  */
  sub_location: string;

  /**
  The time series data source (combining the main source and the sub-source).
  */
  full_source: string;

  /**
  The main source.
  */
  main_source: string;

  /**
  The sub-source.
  */
  sub_source: string;

  /**
  The time series data type (combining the main and sub types).
  */
  full_type: string;

  /**
  The main data type.
  */
  main_type: string;

  /**
  The sub data type.
  */
  sub_type: string;

  /**
  The time series interval as a string.
  */
  interval_string: string;

  /**
  The base data interval.
  */
  interval_base: number;

  /**
  The data interval multiplier.
  */
  interval_mult: number;

  /**
  The time series scenario.
  */
  scenario: string;

  /**
  Identifier used for ensemble trace (e.g., if a list of time series is
  grouped as a set of traces in an ensemble, the trace ID can be the year that the trace starts).
  */
  sequenceID: string;

  /**
  Type of input (e.g., "DateValue", "RiversideDB")
  */
  input_type: string;

  /**
  Name of input (e.g., a file, data store, or database connection name).
  */
  input_name: string;

  /**
  Mask that controls behavior (e.g., how sub-fields are handled).
  */
  behavior_mask: number;

  /**
  Construct using a full string identifier, which will be parsed and the
  individual parts of the identifier set.
  @param identObject Full string identifier (optionally, with right-most fields omitted).
  identifier - A string identifier in the identObject
  mask - A number for a mask. Differentiates a TSIdent object from one with identifier above.
  @exception if the identifier is invalid (usually the interval is incorrect).
  */
  constructor ( identObject?: any ) {
    if (identObject === undefined) {
      this.init();
    } else if (identObject.id) {
      this.init();
      this.setIdentifier ( identObject.id );
    } else if (identObject.behavior_flag) {
      this.init();
    }
  }

  /**
  Initialize data members.
  */
  init() {
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
  Return the time series alias.
  @return The alias for the time series.
  */
  public getAlias (): string {
    return this.alias;
  }

  // TODO: jpkeahey - Am I doing this right?
  /**
  Return the full identifier String.
  @return The full identifier string.
  */
  public getIdentifier(): string {
    return "false"; //toString ( false );
  }

  /**
  Return the main location, which is the first part of the full location.
  @return The main location string.
  */
  public getMainLocation( ): string {
    return this.main_location;
  }

  /**
  Return the main source string.
  @return The main source string.
  */
  public getMainSource(): string {
    return this.main_source;
  }

  /**
  Return the sub-location, which will be an empty string if __behavior_mask has NO_SUB_LOCATION set.
  @return The sub-location string.
  */
  public getSubLocation(): string {
    return this.sub_location;
  }

  /**
  Return the sub-source, which will be an empty string if __behavior_mask has NO_SUB_SOURCE set.
  @return The sub-source string.
  */
  public getSubSource( ): string {
    return this.sub_source;
  }

  /**
  Parse a TSIdent instance given a String representation of the identifier.
  @return A TSIdent instance given a full identifier string.
  @param identifier Full identifier as string.
  @param behavior_flag Behavior mask to use when creating instance.
  @exception if an error occurs (usually a bad interval).
  */
  parseIdentifier ( identifier: string, behavior_flag: number ) {     
    // let routine="TSIdent.parseIdentifier";
    // let	dl = 100;
    
    // Declare a TSIdent which we will fill and return...

    // if ( Message.isDebugOn ) {
    //   Message.printDebug ( dl, routine, "Declare TSIdent within this routine..." );
    // }
    let	tsident = new TSIdent( {behavior_flag: behavior_flag} );
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
        if ( (pos >= 0) && identifier.length > (pos + 1) ) {
          // Have something at the end...
          let sub = identifier.substring ( pos + 1 );
          pos = sub.indexOf ( "~" );
          if ( (pos >= 0) && (sub.length > (pos + 1))) {
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
    let tsidPartListSize = tsidPartList.length;
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
    let locationPart = tsidPartList[0];  // LocationType:FullLocation or FullLocation
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
    // - may be surrounded by single quotes ( smalers 2020-02-13 double quotes allowed for history)
    if ( tsidPartListSize >= 1 ) {
      //  smalers 2020-02-13 treat like datatype and keep surrounding quotes
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
      full_source = tsidPartList[1];
    }

    // Data type...
    if ( tsidPartListSize >= 3 ) {
      // Data type will include surrounding quotes - otherwise would need to add when rebuilding the full TSID string      
      full_type = tsidPartList[2];
    }

    // Data interval...
    let sequenceId = null;
    if ( tsidPartListSize >= 4 ) {
      interval_string = tsidPartList[3];
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
      let scenarioBuffer: string;
      scenarioBuffer += tsidPartList[4];
      for ( let i = 5; i < tsidPartListSize; i++ ) {
        // Append the delimiter to create the original un-parsed string
        scenarioBuffer += "." ;
        scenarioBuffer += tsidPartList[i];
      }
      scenario = scenarioBuffer;
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
  Return the full identifier given the parts.  This method may be called
  internally.  Null fields are treated as empty strings.
  @return The full identifier string given the parts.
  @param locationType location type
  @param full_location Full location string.
  @param full_source Full source string.
  @param full_type Full data type.
  @param interval_string Data interval string.
  @param scenario Scenario string.
  @param sequenceID sequence identifier for the time series (in an ensemble).
  @param input_type Input type.  If blank, the input type will not be added.
  @param input_name Input name.  If blank, the input name will not be added.
  */
  getIdentifierFromParts (  locationType: string,  full_location: string,
     full_source: string,  full_type: string,  interval_string: string,  scenario: string,
     sequenceID: string,  input_type: string,  input_name: string ) {
    let full_identifier: string;
    

    if ( (locationType != null) && (locationType !== 'undefined') && (locationType.length > 0) ) {
        full_identifier += locationType + this.LOC_TYPE_SEPARATOR ;
    }
    if (( full_location != null ) && (full_location !== 'undefined')) {
      full_identifier += full_location;
    }
    full_identifier += this.SEPARATOR;
    if (( full_source != null ) && (full_source !== 'undefined')) {
      full_identifier += full_source;
    }
    full_identifier += this.SEPARATOR;
    if (( full_type != null ) && (full_type !== 'undefined')) {
      full_identifier += ( full_type );
    }
    full_identifier += this.SEPARATOR;
    if (( interval_string != null ) && (interval_string !== 'undefined')) {
      full_identifier += interval_string;
    }
    if ( (scenario != null) && (scenario !== 'undefined') && (scenario.length != 0) ) {
      full_identifier += this.SEPARATOR;
      full_identifier += scenario;
    }
    if ( (sequenceID != null) && (sequenceID !== 'undefined') && (sequenceID.length != 0) ) {
      full_identifier += this.SEQUENCE_NUMBER_LEFT + sequenceID + this.SEQUENCE_NUMBER_RIGHT;
    }
    if ( (input_type != null) && (input_type !== 'undefined') && (input_type.length != 0) ) {
      full_identifier += "~" + input_type;
    }
    if ( (input_name != null) && (input_name !== 'undefined') && (input_name.length != 0) ) {
      full_identifier += "~" + input_name;
    }
    // TODO: jpkeahey 2020.06.09 - This was newly added by Josh in hopes to get it working
    if (full_identifier.includes('undefined')) {
      full_identifier = full_identifier.replace('undefined', '')
    }
    
    return full_identifier;
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
  setInterval ( interval_string: string ) {    
    // let routine="TSIdent.setInterval(String)";
    // let	dl = 100;
    
    let tsinterval = null;

    if ( interval_string == null ) {
      return;
    }

    // if ( Message.isDebugOn ) {
    // 	Message.printDebug ( dl, routine, "Setting interval to \"" + interval_string + "\"" );
    // }

    if ( interval_string !== "*" && interval_string.length > 0 ) {
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
    this.setIdentifier0();
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

  setIdentifier0() {
    // let routine = "TSIdent.setIdentifier(void)";
      // let	dl = 100;

      // Assume that all the individual set routines have handled the
      // __behavior_mask accordingly and therefore we can just concatenate
      // strings here...

      // if ( Message.isDebugOn ) {
      //   Message.printDebug ( dl, routine,
      //   "Setting full identifier from parts: \"" + __full_location +
      //   "." + __full_source + "." + __full_type +"."+__interval_string +
      //   "." + __scenario + "~" + __input_type + "~" + __input_name );
      // }

      let full_identifier: string;
      // if ( Message.isDebugOn ) {
      //   Message.printDebug ( dl, routine, "Calling getIdentifierFromParts..." );
      // }      
      full_identifier = this.getIdentifierFromParts(this.locationType, this.full_location, this.full_source,
        this.full_type, this.interval_string, this.scenario, this.sequenceID, this.input_type, this.input_name );
      // if ( Message.isDebugOn ) {
      //   Message.printDebug ( dl, routine, "...successfully called getIdentifierFromParts..." );
      // }    
      this.setFullIdentifier ( full_identifier );

      // if ( Message.isDebugOn ) {
      //   Message.printDebug ( dl, routine, "ID..." );
      //   Message.printDebug ( dl, routine, "\"" + __identifier + "\"" );
      // }
  }

  /**
  Set the identifier by parsing the given string.
  @param identifier Full identifier string.
  @exception if the identifier cannot be set (usually the interval is incorrect).
  */
  setIdentifier (identifier: string) {
      
    // let routine = "TSIdent.setIdentifier";
    // let	dl = 100;

    if ( identifier == null ) {
      return;
    }

    // if ( Message.isDebugOn ) {
    //   Message.printDebug ( dl, routine, "Trying to set identifier to \"" + identifier + "\"" );
    // }

    if ( identifier.length == 0 ) {
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
  setFullLocation ( full_location: string ) {    
    if (( full_location == null ) || (full_location === 'undefined')) {
      return;
    }
    // TODO: jpkeahey 2020.06.09 - This was newly added by Josh in hopes to get it working
    if (full_location.includes('undefined')) {
      full_location = full_location.replace('undefined', '');
    }    
    this.full_location = full_location;
    // DO NOT call setIdentifier() from here!
  }

  /**
  Set the full source (this does not result in a parse).  It is normally only
  called from within this class.
  @param full_source Full source string.
  */
  setFullSource ( full_source ) {
    if ( full_source == null ) {
      return;
    }
    // TODO: jpkeahey 2020.06.09 - This was newly added by Josh in hopes to get it working
    if (full_source.includes('undefined')) {
      full_source = full_source.replace('undefined', '');
    }
    this.full_source = full_source;
    // DO NOT call setIdentifier() from here!
  }

  /**
  Set the full data type (this does not result in a parse).  It is normally only
  called from within this class.
  @param full_type Full data type string.
  */
  setFullType ( full_type ) {    
    if ( full_type == null ) {
      return;
    }
    // TODO: jpkeahey 2020.06.09 - This was newly added by Josh in hopes to get it working
    if (full_type.includes('undefined')) {
      full_type = full_type.replace('undefined', '');
    }
    this.full_type = full_type;
    // DO NOT call setIdentifier() from here!
  }

  /**
  Set the full location from its parts.  This method is generally called from
  setMainLocation() and setSubLocation() methods to reset __full_location.
  */
  setLocation () {
    // let	routine = "TSIdent.setLocation";
    // let	dl = 100;

    // if ( Message.isDebugOn ) {
    //   Message.printDebug ( dl, routine, "Resetting full location from parts..." );
    // }
    if ( (this.behavior_mask & this.NO_SUB_LOCATION) != 0 ) {
      // Just use the main location as the full location...
      if (( this.main_location != null ) && (this.main_location !== 'undefined')) {        
        // There should always be a main location after the object is initialized...        
        this.setFullLocation ( this.main_location );
      }
    }
    else {
      // Concatenate the main and sub-locations to get the full location.
      let full_location: string;
      // We may want to check for __main_location[] also...
      if (( this.main_location != null ) && (this.main_location !== 'undefined')) {
        // This should always be the case after the object is initialized...        
        full_location += this.main_location;
        if (( this.sub_location != null ) && (this.sub_location !== 'undefined')) {
          // We only want to add the sublocation if it is
          // not an empty string (it will be an empty
          // string after the object is initialized).
          if ( this.sub_location.length > 0 ) {
            // Have a sub_location so append it to the main location...
            full_location += this.LOCATION_SEPARATOR;
            full_location += this.sub_location;
          }
        }

        this.setFullLocation ( full_location );
      }
    }
    // Now reset the full identifier...
    this.setIdentifier0();
  }

  /**
  Set the full location from its full string.
  @param full_location The full location string.
  */
  setLocation1 ( full_location ) {
    
    
    // let routine = "TSIdent.setLocation(String)";
    // let	dl = 100;

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
        this.setSubLocation ( sub_location );
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
      this.setIdentifier0();
  }

  /**
  Set the main location string (and reset the full location).
  @param main_location The main location string.
  */
  setMainLocation ( main_location ) {
    if (( main_location == null ) || (main_location == 'undefined')) {
      return;
    }
    
    this.main_location = main_location;
    this.setLocation();
  }

  /**
  Set the main source string (and reset the full source).
  @param main_source The main source string.
  */
  setMainSource ( main_source ) {
    if (( main_source == null ) || (main_source == 'undefined')) {
      return;
    }
    this.main_source = main_source;
    this.setSource();
  }

  /**
  Set the main data type string (and reset the full type).
  @param main_type The main data type string.
  */
  setMainType ( main_type ) {    
    if (( main_type == null ) || (main_type == 'undefined')) {
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
    if (( scenario == null ) && (scenario == 'undefined')) {
      return;
    }
    this.scenario = scenario;
    this.setIdentifier0();
  }

  /**
  Set the sequence identifier, for example when the time series is part of an ensemble.
  @param sequenceID sequence identifier for the time series.
  */
  setSequenceID ( sequenceID ) {
    this.sequenceID = sequenceID;
    this.setIdentifier0();
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
          if ( this.sub_source.length > 0 ) {
            full_source += this.SOURCE_SEPARATOR;
            full_source += this.sub_source;
          }
        }
        this.setFullSource ( full_source.toString() );
      }
    }
    // Now reset the full identifier...
    this.setIdentifier0();
  }

  /**
Set the full source from a full string.
@param source The full source string.
*/
setSource1 ( source ) {
  if ( source == null ) {
		return;
	}

	if ( source === "" ) {
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
    // let	routine = "TSIdent.setType";
    // let	dl = 100;
    
    // if ( Message.isDebugOn ) {
    //   Message.printDebug ( dl, routine, "Resetting full type from parts..." );
    // }
    if ( (this.behavior_mask & this.NO_SUB_TYPE) != 0 ) {
      // Just use the main type as the full type...
      if (( this.main_type != null ) && (this.main_type !== 'undefined')) {
        // There should always be a main type after the object is initialized...
        this.setFullType ( this.main_type );
      }
    }
    else {
        // Concatenate the main and sub-types to get the full type.
      let full_type: string;
      if ( this.main_type != null ) {
        // This should always be the case after the object is initialized...

        full_type += this.main_type;
        if (( this.sub_type != null ) && (this.sub_type) !== 'undefined') {
          // We only want to add the subtype if it is
          // not an empty string (it will be an empty
          // string after the object is initialized).
          if ( this.sub_type.length > 0 ) {
            // We have a sub type so append it to the main type...
            full_type += this.TYPE_SEPARATOR;
            full_type += this.sub_type ;
          }
        }        
        this.setFullType ( full_type );
      }
    }
    // Now reset the full identifier...
    this.setIdentifier0();
  }

  /**
  Set the full data type from its full string.
  @param type The full data type string.
  */
  setType ( type ) {    
    // let	routine = "TSIdent.setType";
    // let	dl = 100;

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
      let sub_type: string;
      let nlist;
      
      list =	StringUtil.breakStringList ( type, this.TYPE_SEPARATOR, 0 );
      nlist = list.length;
      if ( nlist >= 1 ) {
        // Set the main type...        
        this.setMainType ( list[0] );
      }
      if ( nlist >= 2 ) {
        // Now set the sub-type...
        let iend = nlist - 1;
        for ( let i = 1; i <= iend; i++ ) {
          sub_type += list[i];
          if ( i != iend ) {
            sub_type += this.TYPE_SEPARATOR;
          }
        }
        this.setSubType ( sub_type );
      }
      else {
          // Since we are only setting the main type we
        // need to set the sub-type to an empty string...
        this.setSubType ( "" );
      }
    }
  }
    
}