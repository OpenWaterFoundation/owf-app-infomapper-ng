
export class TimeInterval {

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
  intervalBaseString: string;
  /**
  The string associated with the interval multiplier (may be "" if
  not specified in string used with the constructor).
  */
  intervalMultString: string;
  /**
  The base data interval.
  */
  intervalBase: number;
  /**
  The data interval multiplier.
  */
  intervalMult: number;

  /**
  Parse an interval string like "6Day" into its parts and return as a
  TimeInterval.  If the multiplier is not specified, the value returned from
  getMultiplierString() will be "", even if the getMultiplier() is 1.
  @return The TimeInterval that is parsed from the string.
  @param intervalString Time series interval as a string, containing an
  interval string and an optional multiplier.
  @exception InvalidTimeIntervalException if the interval string cannot be parsed.
  */
  static parseInterval( intervalString: string ) {    
    // let routine = "TimeInterval.parseInterval";
    let	digitCount = 0; // Count of digits at start of the interval string
    // let dl = 50;
    var i = 0;
    let length = intervalString.length;

    let interval = new TimeInterval ();

    // Need to strip of any leading digits.

    while ( i < length ){
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
        if ( intervalString.length == 0 ) {
        console.error("No interval specified." );
      }
      else {
        console.error("Unrecognized interval \"" +
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
  getBase (): number {
    return this.intervalBase;
  }

  /**
  Return the interval base as a string.
  @return The interval base as a string.
  */
  public getBaseString (): string {
    return this.intervalBaseString;
  }

  /**
  Return the interval multiplier.
  @return The interval multiplier.
  */
  getMultiplier (): number {
    return this.intervalMult;
  }

  /**
  Return the interval base as a string.
  @return The interval base as a string.
  */
  getMultiplierString (): string {
    return this.intervalMultString;
  }

  /**
  Set the interval multiplier.
  @param mult Time series interval.
  */
  setMultiplier ( mult: any ): void {
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
  setMultiplierString ( multiplier_string: string ): void {
    if ( multiplier_string != null ) {
      this.intervalMultString = multiplier_string;
    }
  }

  /**
  Set the interval base.
  @return Zero if successful, non-zero if not.
  @param base Time series interval.
  */
  setBase ( base: number ): void {
    this.intervalBase = base;
  }

  /**
  Set the interval base string.  This is normally only called by other methods within this class.
  @return Zero if successful, non-zero if not.
  @param base_string Time series interval base as string.
  */
  setBaseString ( base_string: string ): void {
    if ( base_string != null ) {
      this.intervalBaseString = base_string;
    }
  }

}