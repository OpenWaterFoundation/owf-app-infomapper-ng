import { TimeInterval } from './TimeInterval';
import { TimeUtil }     from './TimeUtil';
import { StringUtil }   from './StringUtil';

export class DateTime {

  /**
  Flags for constructing DateTime instances, which modify their behavior.
  These flags have values that do not conflict with the TimeInterval base interval
  values and the flags can be combined in a DateTime constructor.
  The following flag indicates that a DateTime be treated strictly, meaning that
  the following dependent data are reset each time a date field changes:
  <p>
  day of year<br>
  whether a leap year<br>
  <p>
  This results in slower processing of dates and is the default behavior.  For
  iterators, it is usually best to use the DATE_FAST behavior.
  */
  public static DATE_STRICT: number	= 0x1000;

  /**
  Indicates that dates need not be treated strictly.  This is useful for faster
  processing of dates in loop iterators.
  */
  public static DATE_FAST: number = 0x2000;

  /**
  Create a DateTime with zero data and blank time zone, which is the default.
  */
  public static DATE_ZERO: number = 0x4000;

  /**
  Create a DateTime with the current date and time.
  */
  public static DATE_CURRENT: number = 0x8000;

  /**
  Create a DateTime and only use the time fields.  This works in conjunction with the precision flag.
  */
  public static TIME_ONLY: number = 0x10000;

  /**
  The following are meant to be used in the constructor and will result in the
  the precision for the date/time being limited only to the given date/time field.
  These flags may at some
  point replace the flags used for the equals method.  If not specified, all of
  the date/time fields for the DateTime are carried (PRECISION_HSECOND).  Note
  that these values are consistent with the TimeInterval base interval values.
  */

  /**
  Create a DateTime with precision only to the year.
  */
  public static PRECISION_YEAR: number = 70; // TimeInterval.YEAR;

  /**
  Create a DateTime with a precision only to the month.
  */
  public static PRECISION_MONTH: number	= 60; // TimeInterval.MONTH;

  /**
  Create a DateTime with a precision only to the day.
  */
  public static PRECISION_DAY: number = 40; // TimeInterval.DAY;

  /**
  Create a DateTime with a precision only to the hour.
  */
  public static PRECISION_HOUR: number = 30; // TimeInterval.HOUR;

  /**
  Create a DateTime with a precision only to the minute.
  */
  public static PRECISION_MINUTE: number = 20; // TimeInterval.MINUTE;

  /**
  Create a DateTime with a precision only to the second.
  */
  public static PRECISION_SECOND: number = 10; // TimeInterval.SECOND;

  /**
  Create a DateTime with a precision to the hundredth-second.
  */
  public static PRECISION_HSECOND: number = 5; // TimeInterval.HSECOND;

  /**
  Create a DateTime with a precision that includes the time zone (and may include another precision flag).
  */
  public static PRECISION_TIME_ZONE: number = 0x20000;

  // Alphabetize the formats, but the numbers may not be in order because they
  // are added over time (do not renumber because some dependent classes may not get recompiled).
  /**
  The following are used to format date/time output.
  <pre>
    Y = year
    M = month
    D = day
    H = hour
    m = minute
    s = second
    h = 100th second
    Z = time zone
  </pre>
  */
  /**
  The following returns an empty string for formatting but can be used to
  indicate no formatting in other code.
  */
  public static FORMAT_NONE: number = 1;
  /**
  The following returns the default format and can be used to
  indicate automatic formatting in other code.
  */
  public static FORMAT_AUTOMATIC: number = 2;
  /**
  The following formats a date as follows:  "DD/MM/YYYY".  This date format
  cannot be parsed properly by parse(); FORMAT_MM_SLASH_DD_SLASH_YYYY will be returned instead.
  */
  public static FORMAT_DD_SLASH_MM_SLASH_YYYY: number = 27;
  /**
  The following formats a date as follows:  "HH:mm".
  */
  public static FORMAT_HH_mm: number = 3;
  /**
  The following formats a date as follows (military time):  "HHmm".
  */
  public static FORMAT_HHmm: number = 4;
  /**
  The following formats a date as follows:  "MM".  Parsing of this date format
  without specifying the format is NOT supported because it is ambiguous.
  */
  public static FORMAT_MM: number = 5;
  /**
  The following formats a date as follows:  "MM-DD".
  */
  public static FORMAT_MM_DD: number = 6;
  /**
  The following formats a date as follows:  "MM/DD".
  */
  public static FORMAT_MM_SLASH_DD: number = 7;
  /**
  The following formats a date as follows:  "MM/DD/YY".
  */
  public static FORMAT_MM_SLASH_DD_SLASH_YY: number = 8;
  /**
  The following formats a date as follows:  "MM/DD/YYYY".
  */
  public static FORMAT_MM_SLASH_DD_SLASH_YYYY: number = 9;
  /**
  The following formats a date as follows:  "MM/DD/YYYY HH".
  */
  public static FORMAT_MM_SLASH_DD_SLASH_YYYY_HH: number = 10;
  /**
  The following formats a date as follows:  "MM-DD-YYYY HH".
  */
  public static FORMAT_MM_DD_YYYY_HH: number = 11;
  /**
  The following formats a date as follows:  "MM/DD/YYYY HH:mm".  For the parse() method,
  months, days, and hours that are not padded with zeros will also be parsed properly.
  */
  public static FORMAT_MM_SLASH_DD_SLASH_YYYY_HH_mm: number = 12;
  /**
  The following formats a date as follows:  "MM/YYYY".
  */
  public static FORMAT_MM_SLASH_YYYY: number = 13;
  /**
  The following formats a date as follows:  "YYYY".
  */
  public static FORMAT_YYYY: number = 14;
  /**
  The following formats a date as follows:  "YYYY-MM".
  */
  public static FORMAT_YYYY_MM: number = 15;
  /**
  The following formats a date as follows:  "YYYY-MM-DD".
  */
  public static FORMAT_YYYY_MM_DD: number = 16;
  /**
  The following is equivalent to FORMAT_YYYY_MM_DD.
  */
  public static FORMAT_Y2K_SHORT: number = DateTime.FORMAT_YYYY_MM_DD;
  /**
  The following formats a date as follows:  "YYYY-MM-DD HH".
  */
  public static FORMAT_YYYY_MM_DD_HH: number = 17;
  /**
  The following formats a date as follows:  "YYYY-MM-DD HH ZZZ".
  */
  public static FORMAT_YYYY_MM_DD_HH_ZZZ: number = 18;
  /**
  The following formats a date as follows:  "YYYY-MM-DD HH:mm".
  */
  public static FORMAT_YYYY_MM_DD_HH_mm: number	= 19;
  /**
  The following is equivalent to FORMAT_YYYY_MM_DD_HH_mm.
  */
  public static FORMAT_Y2K_LONG: number = DateTime.FORMAT_YYYY_MM_DD_HH_mm;
  /**
  The following formats a date as follows:  "YYYY-MM-DD HHmm".
  */
  public static FORMAT_YYYY_MM_DD_HHmm: number = 20;
  /**
  The following formats a date as follows:  "YYYYMMDDHHmm".
  */
  public static FORMAT_YYYYMMDDHHmm: number = 21;
  /**
  The following formats a date as follows:  "YYYY-MM-DD HH:mm ZZZ".
  This format is currently only supported for toString() (not parse).
  */
  public static FORMAT_YYYY_MM_DD_HH_mm_ZZZ: number = 22;
  /**
  The following formats a date as follows:  "YYYY-MM-DD HH:mm:SS".
  */
  public static FORMAT_YYYY_MM_DD_HH_mm_SS: number = 23;
  /**
  The following formats a date as follows:  "YYYY-MM-DD HH:mm:SS:hh".
  */
  public static FORMAT_YYYY_MM_DD_HH_mm_SS_hh: number = 24;
  /**
  The following formats a date as follows:  "YYYY-MM-DD HH:mm:SS:hh ZZZ".
  This is nearly ISO 8601 but it does not include the T before time and the time zone has a space.
  */
  public static FORMAT_YYYY_MM_DD_HH_mm_SS_hh_ZZZ: number = 25;
  /**
  The following formats a date as follows:  "YYYY-MM-DD HH:mm:SS ZZZ".
  */
  public static FORMAT_YYYY_MM_DD_HH_mm_SS_ZZZ: number = 26;
  /**
  The following formats a date as follows:  "MM/DD/YYYY HH:mm:SS".
  */
  public static FORMAT_MM_SLASH_DD_SLASH_YYYY_HH_mm_SS: number = 28;
  /**
  The following formats a date as follows:  "YYYYMMDD".
  */
  public static FORMAT_YYYYMMDD: number = 29;
  /**
  The following formats a date/time according to ISO 8601, for example for longest form:
  2017-06-30T23:03:33.123+06:00
  */
  public static FORMAT_ISO_8601: number = 30;
  /**
  The following formats a date as follows, for debugging:  year=YYYY, month=MM, etc..
  */
  public static FORMAT_VERBOSE: number = 200;

  /**
  Hundredths of a second (0-99).
  */
  private __hsecond: number;

  /**
  Seconds (0-59).
  */
  private __second: number;

  /**
  Minutes past hour (0-59).
  */
  private __minute: number;

  /**
  Hours past midnight (0-23).  Important - hour 24 in data should be handled as
  hour 0 of the next day.
  */
  private __hour: number;

  /**
  Day of month (1-31).
  */
  private __day: number;

  /**
  Month (1-12).
  */
  private __month: number;

  /**
  Year (4 digit).
  */
  private __year: number;

  /**
  Time zone abbreviation.
  */
  private __tz: string;

  /**
  Indicate whether the year a leap year (true) or not (false).
  */
  private	__isleap: boolean;

  /**
  Is the DateTime initialized to zero without further changes?
  */
  private	__iszero: boolean;

  /**
  Day of week (0=Sunday).  Will be calculated in getWeekDay().
  */
  private __weekday: number = -1;

  /**
  Day of year (0-365).
  */
  private __yearday: number;

  /**
  Absolute month (year*12 + month).
  */
  private __abs_month: number;

  /**
  Precision of the DateTime (allows some optimization and automatic
  decisions when converting). This is the PRECISION_* value only
  (not a bit mask).  _use_time_zone and _time_only control other precision information.
  */
  private __precision: number;

  /**
  Flag for special behavior of dates.  Internally this contains all the
  behavior flags but for the most part it is only used for ZERO/CURRENT and FAST/STRICT checks.
  */
  private __behavior_flag: number;

  /**
  Indicates whether the time zone should be used when processing the DateTime.
  SetTimeZone() will set to true if the time zone is not empty, false if empty.
  Setting the precision can override this if time zone flag is set.
  */
  private  __use_time_zone: boolean = false;

  /**
  Use only times for the DateTime.
  */
  private	__time_only: boolean = false;


  /**
  Construct using the constructor modifiers (combination of PRECISION_*,
  DATE_CURRENT, DATE_ZERO, DATE_STRICT, DATE_FAST).  If no modifiers are given,
  the date/time is initialized to zeros and precision is PRECISION_MINUTE.
  @param flag Constructor modifier.
  */
  constructor( input: any ) {
    // If the input given is a number, use the constructor for it
    if (typeof input === 'undefined' || input === null) {
      this.setToZero();
      this.reset();
    }
    else if (typeof input === 'number') {
      var flag: number = input;
      if ( (flag & DateTime.DATE_CURRENT) != 0 ) {
        this.setToCurrent();
      }
      else {
        // Default...
        this.setToZero();
      }
  
      this.__behavior_flag = flag;
      this.setPrecisionOne( flag );
      this.reset();
    }
    // If the input given is a Date Object, use the constructor for it instead.
    else if (typeof input === 'object') {
      // jpkeahey - Josh changed d from built-in Date to DateTime to deal with internally
      // made code instead o
      var d: DateTime = input;
      // If a null date is passed in, behave like the default DateTime() constructor.
      if (d == null) {
        this.setToZero();
        this.reset();
        return;
      }

      // use_deprecated indicates whether to use the deprecated Date
      // functions.  These should be fast (no strings) but are, of course, deprecated.
      // TODO: jpkeahey 2020.06.10 - Josh changed this to true, as there is no Gregorian Calendar
      // library for Typescript.
      var	use_deprecated: boolean = false;

      if ( use_deprecated ) {
        // // Returns the number of years since 1900!
        // var year: number = d.getYear();
        // this.setYear ( year + 1900 );
        // // Returned month is 0 to 11!
        // this.setMonth ( d.getMonth() + 1 );
        // // Returned day is 1 to 31
        // this.setDay ( d.getDate() );
        // this.setPrecisionOne ( DateTime.PRECISION_DAY );
        // // Sometimes Dates are instantiated from data where hours, etc.
        // // are not available (e.g. from a database date/time).
        // // Therefore, catch exceptions at each step...
        // try {
        //         // Returned hours are 0 to 23
        //   this.setHour ( d.getHours() );
        //   this.setPrecisionOne ( DateTime.PRECISION_HOUR );
        // }
        // catch ( e ) {
        //   // Don't do anything.  Just leave the DateTime default.
        // }
        // try {
        //         // Returned hours are 0 to 59 
        //   this.setMinute ( d.getMinutes() );
        //   this.setPrecisionOne ( DateTime.PRECISION_MINUTE );
        // }
        // catch ( e ) {
        //   // Don't do anything.  Just leave the DateTime default.
        // }
        // try {
        //         // Returned seconds are 0 to 59
        //   this.setSecond ( d.getSeconds() );
        //   this.setPrecisionOne ( DateTime.PRECISION_SECOND );
        // }
        // catch ( e ) {
        //   // Don't do anything.  Just leave the DateTime default.
        // }
        // // TODO SAM 2015-08-12 For now do not set the hundredths of a second
        // this.__tz = "";
      }
      else {
        // Date/Calendar are ugly to work with, let's get information by formatting strings...

        // year month
        // Use the formatTimeString routine instead of the following...

        // String format = "yyyy M d H m s S";
        // String time_date = TimeUtil.getTimeString ( d, format );
        // var format: string = "%Y %m %d %H %M %S";
        var format: string = 'YYYY MMMM DD hh mm ss';
                
        var time_date: string = TimeUtil.formatTimeString ( d, format );
        
        var v: string[] = StringUtil.breakStringList ( time_date, " ", StringUtil.DELIM_SKIP_BLANKS );        
        this.setYear ( parseInt(v[0]) );
        this.setMonth ( parseInt(v[1]) );
        this.setDay ( parseInt(v[2]) );
        this.setHour ( parseInt(v[3]) );
        this.setMinute ( parseInt(v[4]) );
        this.setSecond ( parseInt(v[5]) );
        
        // VVV NO TOUCHY VVV
        // milliseconds not supported in formatTimeString...
        // Convert from milliseconds to 100ths of a second...
        // setHSecond ( Integer.parseInt(v.elementAt(6))/10 );
        // setTimeZone ( v.elementAt(7) );
        // ^^^ NO TOUCHY ^^^

        this.__tz = "";
      }

      this.reset();
      this.__iszero = false;
    }
    
  }


  /**
  Add day(s) to the DateTime.  Other fields will be adjusted if necessary.
  @param add Indicates the number of days to add (can be a multiple and can be negative).
  */
  public addDay ( add: number ): void {
    var i: number;

    if ( add == 1 ) {
      var num_days_in_month = TimeUtil.numDaysInMonth (this.__month, this.__year);
      ++this.__day;
      if ( this.__day > num_days_in_month ) {
        // Have gone into the next month...
        this.__day -= num_days_in_month;
        this.addMonth( 1 );
      }
      // Reset the private data members.
      this.setYearDay();
    }
    // Else...
    // Figure out if we are trying to add more than one day.
    // If so, recurse (might be a faster way, but this works)...
    else if ( add > 0 ) {
      for ( i = 0; i < add; i++ ) {
        this.addDay ( 1 );
      }
    }
    else if ( add == -1 ) {
      --this.__day;
      if ( this.__day < 1 ) {
        // Have gone into the previous month...
        // Temporarily set day to 1, determine the day and year, and then set the day.
        this.__day = 1;
        this.addMonth( -1 );
        this.__day = TimeUtil.numDaysInMonth( this.__month, this.__year );
      }
      // Reset the private data members.
      this.setYearDay();
    }
    else if ( add < 0 ) {
      for ( i = add; i < 0; i++ ){
        this.addDay ( -1 );
      }
    }
    this.__iszero = false;
  }

  /**
  Add hour(s) to the DateTime.  Other fields will be adjusted if necessary.
  @param add Indicates the number of hours to add (can be a multiple and can be negative).
  */
  public addHour ( add: number ): void {
    var	daystoadd: number;

    // First add the days, if necessary...

    if ( add >= 24 || add <= -24 ) {
      // First need to add/subtract days to time...
      daystoadd = add/24;
      this.addDay( daystoadd );
    }

    // Now add the remainder

    if ( add > 0 ) {
      this.__hour += (add%24);
      if ( this.__hour > 23 ) {
        // Have gone into the next day...
        this.__hour -= 24;
        this.addDay( 1 );
      }
    }
    else if ( add < 0 ) {
      this.__hour += (add%24);
      if ( this.__hour < 0 ) {
        // Have gone into the previous day...
        this.__hour += 24;
        this.addDay( -1 );
      }
    }
    this.__iszero = false;
  }

  /**
  Add a time series interval to the DateTime (see TimeInterval).  This is useful when iterating a date.
  An irregular interval is ignored (the date is not changed).
  @param interval Time series base interval.
  @param add Multiplier for base interval.
  */
  public addInterval ( interval: number, add: number ): void {
    // Based on the interval, call lower-level routines...
    if( interval === TimeInterval.SECOND ) {
      this.addSecond( add );
    }
    else if( interval === TimeInterval.MINUTE ) {
      this.addMinute( add );
    }
    else if( interval === TimeInterval.HOUR ) {
      this.addHour( add );
      }
      else if ( interval === TimeInterval.DAY ) {
        this.addDay( add );
      }
      else if ( interval === TimeInterval.WEEK ) {
        this.addDay( 7*add );
      }
    else if ( interval === TimeInterval.MONTH ) {
      this.addMonth( add );
      }
      else if ( interval === TimeInterval.YEAR ) {
        this.addYear( add );
      }
      else if ( interval === TimeInterval.IRREGULAR ) {
      return;
      }
      else {
        // Unsupported interval...
        // TODO SAM 2007-12-20 Evaluate throwing InvalidTimeIntervalException
        let message = "Interval " + interval + " is unsupported";
        // Message.printWarning ( 2, "DateTime.addInterval", message );
        return;
      }
    this.__iszero = false;
  }

  /**
  Add minute(s) to the DateTime.  Other fields will be adjusted if necessary.
  @param add Indicates the number of minutes to add (can be a multiple and can be negative).
  */
  public addMinute ( add: number ): void {
    var	hrs: number;

    // First see if multiple hours need to be added...

    if ( add >= 60 || add <= -60 ) {
      // Need to add/subtract hour(s) first
      hrs = add/60;
      this.addHour( hrs );
    }

    if ( add > 0 ) {
      this.__minute += add % 60;
      if ( this.__minute > 59 ) {
        // Need to add an hour and subtract the same from minute
        this.__minute -= 60;
        this.addHour( 1 );
      }
    }
    else if ( add < 0 ) {
      this.__minute += add % 60;
      if ( this.__minute < 0 ) {
        // Need to subtract an hour and add the same to minute
        this.__minute += 60;
        this.addHour( -1 );
      }
    }
    this.__iszero = false;
  }

  /**
  Add month(s) to the DateTime.  Other fields will be adjusted if necessary.
  @param add Indicates the number of months to add (can be a multiple and can be negative).
  */
  public addMonth ( add: number ): void {
    let	i: number;

    if ( add == 0 ) {
      return;
    }
    if ( add == 1 ) {
      // Dealing with one month...
      this.__month += add;
      // Have added one month so check if went into the next year
      if ( this.__month > 12 ) {
        // Have gone into the next year...
        this.__month = 1;
        this.addYear( 1 );
      }
    }
    // Else...
    // Loop through the number to add/subtract...
    // Use recursion because multi-month increments are infrequent
    // and the overhead of the multi-month checks is probably a wash.
    else if ( add > 0 ) {
      for ( i = 0; i < add; i++ ) {
        this.addMonth ( 1 );
      }
      // No need to reset because it was done int the previous call.
      return;
    }
    else if ( add == -1 ) {
      --this.__month;
      // Have subtracted the specified number so check if in the previous year
      if ( this.__month < 1 ) {
        // Have gone into the previous year...
        this.__month = 12;
        this.addYear( -1 );
      }
    }
    else if ( add < 0 ) {
      for ( i = 0; i > add; i-- ) {
        this.addMonth ( -1 );
      }
      // No need to reset because it was done int the previous call.
      return;
    }
    else {
        // Zero...
      return;
    }
    // Reset time
    this.setAbsoluteMonth();
    this.setYearDay();
    this.__iszero = false;
  }

  /**
  Add second(s) to the DateTime.  Other fields will be adjusted if necessary.
  @param add Indicates the number of seconds to add (can be a multiple and can be negative).
  */
  public addSecond ( add: number ): void {
    var	mins: number;

    // Add/subtract minutes, if necessary...

    if ( add >= 60 || add <= -60 ) {
      // Need to add/subtract minute(s) first
      mins = add/60;
      this.addMinute( mins );
    }

    if ( add > 0 ) {
      this.__second += add % 60;
      if ( this.__second > 59 ) {
        // Need to add a minute and subtract the same from second
        this.__second -= 60;
        this.addMinute( 1 );
      }
    }
    else if ( add < 0 ) {
      this.__second += add % 60;
      if ( this.__second < 0 ) {
        // Need to subtract a minute and add the same to second
        this.__second += 60;
        this.addMinute( -1 );
      }
    }
    this.__iszero = false;
  }

  // TODO SAM 2007-12-20 Evaluate what to do about adding a year if on Feb 29.
  /**
  Add year(s) to the DateTime.  The month and day are NOT adjusted if an
  inconsistency occurs with leap year information.
  @param add Indicates the number of years to add (can be a multiple and can be negative).
  */
  public addYear ( add: number ): void {	
    this.__year += add;
    this.reset();
    this.__iszero = false;
  }

  public static copyConstructor(t: DateTime): DateTime {
    var dateTime = new DateTime(null);

    if (t != null) {
      dateTime.__hsecond = t.__hsecond;
      dateTime.__second = t.__second;
      dateTime.__minute = t.__minute;
      dateTime.__hour = t.__hour;
      dateTime.__day = t.__day;
      dateTime.__month	= t.__month;
      dateTime.__year = t.__year;
      dateTime.__isleap = t.__isleap;
      dateTime.__weekday = t.__weekday;
      dateTime.__yearday = t.__yearday;
      dateTime.__abs_month	= t.__abs_month;
      dateTime.__behavior_flag	= t.__behavior_flag;
      dateTime.__precision	= t.__precision;
      dateTime.__use_time_zone	= t.__use_time_zone;
      dateTime.__time_only	= t.__time_only;
      dateTime.__iszero = t.__iszero;
      dateTime.__tz = t.__tz;
    } else {
      console.error("Constructing DateTime from null - will have zero date!");
    }
    // TODO: jpkeahey 2020.06.23 - Implement this later maybe?
    // reset()
    return dateTime;
  }

  /**
  Return the absolute day.
  @return The absolute day.  This is a computed value.
  @see RTi.Util.Time.TimeUtil#absoluteDay
  */
  // public getAbsoluteDay(): number {
  //   return TimeUtil.absoluteDay ( this.__year, this.__month, this.__day );
  // }

  /**
  Return the absolute month.
  @return The absolute month (year*12 + month).
  */
  public getAbsoluteMonth( ): number {
    // Since some data are public, recompute...
    return (this.__year*12 + this.__month);
  }

  /**
  Return the day.
  @return The day.
  */
  public getDay( ): number {
    return this.__day;
  }

  /**
  Return the hour.
  @return The hour.
  */
  public getHour( ): number {
    return this.__hour;
  }

  /**
  Return the 100-th second.
  @return The hundredth-second.
  */
  public getHSecond( ): number {
    return this.__hsecond;
  }

  /**
  Return the minute.
  @return The minute.
  */
  public getMinute( ): number {
    return this.__minute;
  }

  /**
  Return the second.
  @return The second.
  */
  public getSecond( ): number {
    return this.__second;
  }

  /**
  Return the Java Date corresponding to the DateTime, using the specified time zone.
  This should be called, for example, when the time zone in the object was not set but should be applied
  when constructing the returned Date OR, when the time zone in the object should be ignored in favor
  of the specified time zone.
  An alternative that will modify the DateTime instance is to call setTimeZone() and then getDate().
  @param tzId time zone string recognized by TimeZone.getTimeZone(), for example "America/Denver" or "MST".
  @return Java Date corresponding to the DateTime.
  @exception RuntimeException if there is no time zone set but defaultTimeZone = TimeZoneDefaultType.NONE
  */
  // public Date getDate ( String tzId )
  // {	GregorianCalendar c = new GregorianCalendar ( __year, (__month - 1), __day, __hour, __minute, __second );
  //   // Above is already in the default time zone
  //   //Message.printStatus(2,"","Calendar after initialization with data:  " + c);
  //   if ( !TimeUtil.isValidTimeZone(tzId) ) {
  //     // The following will throw an exception in daylight savings time because "MDT" is not a valid time zone
  //     // (it is a display name for "MST" when in daylight savings)
  //     // The check is needed because java.util.TimeZone.getTimeZone() will return GMT if an invalid time zone
  //     throw new RuntimeException ( "Time zone (" + __tz + ") in DateTime object is invalid - cannot return Date object." );
  //   }
  //   java.util.TimeZone tz = java.util.TimeZone.getTimeZone(tzId);
  //   // But this resets the time zone without changing the data so should be OK
  //   c.setTimeZone(tz);
  //   //Message.printStatus(2,"","Calendar after setting time zone:  " + c);
  //   return c.getTime(); // This returns the UNIX time considering how the date/time was set above
  // }

  /**
  Return the month.
  @return The month.
  */
  public getMonth( ): number {
    return this.__month;
  }

  /**
  Return the week day by returning getDate(TimeZoneDefaultType.GMT).getDay().
  @return The week day (Sunday is 0).
  */
  public getWeekDay ( ) {
    // Always recompute because don't know if DateTime was copied and modified.
    // Does not matter what timezone because internal date/time values are used in absolute sense.
    // this.__weekday = this.getDate(TimeZoneDefaultType.GMT).getDay();
    //   return this.__weekday;
  }

  /**
  Return the year.
  @return The year.
  */
  public getYear( ): number {
    return this.__year;
  }

  /**
  Indicate whether a leap year.
  @return true if a leap year.
  */
  public isLeapYear ( ): boolean {
    // Reset to make sure...
    this.__isleap = TimeUtil.isLeapYear( this.__year );
      return this.__isleap;
  }

  /**
  Reset the derived data (year day, absolute month, and leap year).  This is
  normally called by other DateTime functions but can be called externally if
  data are set manually.
  */
  public reset(): void {
    // Always reset the absolute month since it is cheap...
    this.setAbsoluteMonth();
    if ( (this.__behavior_flag & DateTime.DATE_FAST) != 0 ) {
      // Want to run fast so don't check...
      return;
    }
    this.setYearDay();
    this.__isleap = TimeUtil.isLeapYear( this.__year );
  }

  /**
  Set the absolute month from the month and year.  This is called internally.
  */
  private setAbsoluteMonth(): void {
    this.__abs_month = (this.__year * 12) + this.__month;
  }

  /**
  Set the hour.
  @param h Hour.
  */
  public setHour( h: number ): void {	
    if( (this.__behavior_flag & DateTime.DATE_STRICT) != 0 ){
      if( (h > 23) || (h < 0) ) {
        let message: string = "Trying to set invalid hour (" + h + ") in DateTime.";
              // Message.printWarning( 2, "DateTime.setHour", message );
              // throw new IllegalArgumentException ( message );
          }
    }
      this.__hour = h;
    // This has the flaw of not changing the flag when the value is set to 0!
    if ( this.__hour != 0 ) {
      this.__iszero = false;
    }
  }

  /**
  Set the day.
  @param d Day.
  */
  public setDay ( d: number ): void
  {	
    if( (this.__behavior_flag & DateTime.DATE_STRICT) != 0 ){
      if(	(d > TimeUtil.numDaysInMonth( this.__month, this.__year )) || (d < 1) ) {
              var message: string = "Trying to set invalid day (" + d + ") in DateTime for year " + this.__year;
              // Message.printWarning( 10, "DateTime.setDay", message );
              throw new Error ( message );
          }
    }
    this.__day = d;
    this.setYearDay();
    // This has the flaw of not changing the flag when the value is set to 1!
    if ( this.__day != 1 ) {
      this.__iszero = false;
    }
  }

  /**
  Set the minute.
  @param m Minute.
  */
  public setMinute( m: number ): void {	
    if( (this.__behavior_flag & DateTime.DATE_STRICT) != 0 ){
          if( m > 59 || m < 0 ) {
              let message = "Trying to set invalid minute (" + m + ") in DateTime.";
              // Message.printWarning( 2, "DateTime.setMinute", message );
              // throw new IllegalArgumentException ( message );
          }
    }
      this.__minute = m;
    // This has the flaw of not changing the flag when the value is set to 0!
    if ( m != 0 ) {
      this.__iszero = false;
    }
  }

  /**
  Set the second.
  @param s Second.
  */
  public setSecond( s: number ): void {
    if( (this.__behavior_flag & DateTime.DATE_STRICT) != 0 ){
          if( s > 59 || s < 0 ) {
              let message = "Trying to set invalid second (" + s + ") in DateTime.";
              // Message.printWarning( 2, "DateTime.setSecond", message );
              // throw new IllegalArgumentException ( message );
          }
    }
      this.__second = s;
    // This has the flaw of not changing the flag when the value is set to 0!
    if ( s != 0 ) {
      this.__iszero = false;
    }
  }

  /**
  Set to the current date/time.
  The default precision is PRECISION_SECOND and the time zone is set.
  This method is usually only called internally to initialize dates.
  If called externally, the precision should be set separately.
  */
  public setToCurrent(): void {
    // First get the current time (construct a new date because this code
    // is not executed that much).  If we call this a lot, inline the
    // code rather than constructing...

    var d = new Date(); // This will use local time zone
    var now = new DateTime ( d );

    // Now set...

    this.__hsecond = now.__hsecond;
    this.__second = now.__second;
    this.__minute = now.__minute;
    this.__hour = now.__hour;
    this.__day = now.__day;
    this.__month = now.__month;
    this.__year = now.__year;
    this.__isleap = now.isLeapYear();
    // this.__weekday = now.getWeekDay();
    // this.__yearday = now.getYearDay();
    // this.__abs_month	= now.getAbsoluteMonth();
    this.__tz = now.__tz;
    this.__behavior_flag	= DateTime.DATE_STRICT;
    this.__precision = DateTime.PRECISION_SECOND;
    this.__use_time_zone = false;
    this.__time_only = false;

    // Set the time zone.  Use TimeUtil directly to increase performance...
    // TODO SAM 2016-03-12 Need to rework this - legacy timezone was needed at one point but should use java.util.time or Java 8 API
    // TODO: jpkeahey 2020.06.10 - This can be brought back in at some point. I don't know if it will break things right now though
    // if ( TimeUtil._time_zone_lookup_method == TimeUtil.LOOKUP_TIME_ZONE_ONCE ) {
    //   if ( !TimeUtil._local_time_zone_retrieved ) {
    //     // Need to initialize...
    //     shiftTimeZone ( TimeUtil.getLocalTimeZoneAbbr() );
    //   }
    //   else {
    //           // Use the existing data...
    //     shiftTimeZone ( TimeUtil._local_time_zone_string );
    //   }
    // }
    // else if ( TimeUtil._time_zone_lookup_method == TimeUtil.LOOKUP_TIME_ZONE_ALWAYS ) {
    //   shiftTimeZone ( TimeUtil.getLocalTimeZoneAbbr() );
    // }

    this.__iszero = false;
  }

  /**
  Set the month.
  @param m Month.
  */
  public setMonth ( m: number): void {
    if( (this.__behavior_flag & DateTime.DATE_STRICT) != 0 ){
          if( m > 12 || m < 1 ) {
              var message: string = "Trying to set invalid month (" + m + ") in DateTime.";
              // Message.printWarning( 2, "DateTime.setMonth", message );
              throw new Error ( message );
          }
    }
    this.__month = m;
    this.setYearDay();
    this.setAbsoluteMonth();
    // This has the flaw of not changing the flag when the value is set to 1!
    if ( m != 1 ) {
      this.__iszero = false;
    }
  }

  /**
  Set the precision using a bit mask.  The precision can be used to optimize code
  (avoid performing unnecessary checks) and set more intelligent dates.  The
  overloaded version is called with a "cumulative" value of true.
  @param behavior_flag Full behavior mask containing precision bit (see
  PRECISION_*).  The precision is set when the first valid precision bit
  is found (starting with PRECISION_YEAR).
  @return this DateTime instance, which allows chained calls.
  */
  public setPrecisionOne ( behavior_flag: number ): DateTime {
    return this.setPrecisionTwo ( behavior_flag, true );
  }

  /**
  Set the precision using a bit mask.  The precision can be used to optimize code
  (avoid performing unnecessary checks) and set more intelligent dates.  This
  call automatically truncates unused date fields (sets them to initial values
  as appropriate).  Subsequent calls to getPrecision(), timeOnly(), and
  useTimeZone() will return the separate field values (don't need to handle as a bit mask upon retrieval).
  @param behavior_flag Full behavior mask containing precision bit (see
  PRECISION_*).  The precision is set when the first valid precision bit
  is found (starting with PRECISION_YEAR).
  @param cumulative If true, the bit-mask values will be set cumulatively.  If
  false, the values will be reset to defaults and only new values will be set.
  @return this DateTime instance, which allows chained calls.
  */
  public setPrecisionTwo ( behavior_flag: number, cumulative: boolean ): DateTime {
    // The behavior flag contains the precision (small bits) and higher
    // bit masks.  The lower precision values are not unique bit masks.
    // Therefore, get the actual precision value by cutting off the higher
    // values > 100 (the maximum precision value is 70).
    //_precision = behavior_flag - ((behavior_flag/100)*100);
    // Need to remove the effects of the higher order masks...
    //int behavior_flag_no_precision = behavior_flag;
    var precision: number = behavior_flag;
    if ( (behavior_flag & DateTime.DATE_STRICT) != 0 ) {
      //behavior_flag_no_precision |= DATE_STRICT;
      precision ^= DateTime.DATE_STRICT;
    }
    if ( (behavior_flag & DateTime.DATE_FAST) != 0 ) {
      //behavior_flag_no_precision |= DATE_FAST;
      precision ^= DateTime.DATE_FAST;
    }
    if ( (behavior_flag & DateTime.DATE_ZERO) != 0 ) {
      //behavior_flag_no_precision |= DATE_ZERO;
      precision ^= DateTime.DATE_ZERO;
    }
    if ( (behavior_flag & DateTime.DATE_CURRENT) != 0 ) {
      //behavior_flag_no_precision |= DATE_CURRENT;
      precision ^= DateTime.DATE_CURRENT;
    }
    if ( (behavior_flag & DateTime.TIME_ONLY) != 0 ) {
      //behavior_flag_no_precision |= TIME_ONLY;
      precision ^= DateTime.TIME_ONLY;
    }
    if ( (behavior_flag & DateTime.PRECISION_TIME_ZONE) != 0 ) {
      //behavior_flag_no_precision |= PRECISION_TIME_ZONE;
      precision ^= DateTime.PRECISION_TIME_ZONE;
    }
    // Now the precision should be what is left...
    if ( precision == DateTime.PRECISION_YEAR ) {
      this.__month = 1;
      this.__day = 1;
      this.__hour = 0;
      this.__minute = 0;
      this.__second = 0;
      this.__hsecond = 0;
      this.__precision = precision;
    }
    else if ( precision == DateTime.PRECISION_MONTH ) {
      this.__day = 1;
      this.__hour = 0;
      this.__minute = 0;
      this.__second = 0;
      this.__hsecond = 0;
      this.__precision = precision;
    }
    else if ( precision == DateTime.PRECISION_DAY ) {
      this.__hour = 0;
      this.__minute = 0;
      this.__second = 0;
      this.__hsecond = 0;
      this.__precision = precision;
    }
    else if ( precision == DateTime.PRECISION_HOUR ) {
      this.__minute = 0;
      this.__second = 0;
      this.__hsecond = 0;
      this.__precision = precision;
    }
    else if ( precision == DateTime.PRECISION_MINUTE ) {
      this.__second = 0;
      this.__hsecond = 0;
      this.__precision = precision;
    }
    else if ( precision == DateTime.PRECISION_SECOND ) {
      this.__hsecond = 0;
      this.__precision = precision;
    }
    else if ( precision == DateTime.PRECISION_HSECOND ) {
      this.__precision = precision;
    }
    // Else do not set _precision - assume that it was set previously (e.g., in a copy constructor).

    // Time zone is separate and always gets set...

    if ( (behavior_flag & DateTime.PRECISION_TIME_ZONE) != 0 ) {
      this.__use_time_zone = true;
    }
    else if ( !cumulative ) {
      this.__use_time_zone = false;
    }

    // Time only is separate and always gets set...

    if ( (behavior_flag & DateTime.TIME_ONLY) != 0 ) {
      this.__time_only = true;
    }
    else if ( !cumulative ) {
      this.__time_only = false;
    }
    return this;
  }

  /**
  Set the date/time to all zeros, except day and month are 1.  The time zone is set to "".
  The default precision is PRECISION_SECOND and the time zone is not used.  This
  method is usually only called internally to initialize dates.  If called
  externally, the precision should be set separately.
  */
  public setToZero ( ): void {
    this.__hsecond = 0;
    this.__second = 0;
    this.__minute = 0;
    this.__hour = 0;
    this.__day = 1;
    this.__month = 1;
    this.__year = 0;
    this.__isleap = false;
    this.__weekday = 0;
    this.__yearday = 0;
    this.__abs_month	= 0;
    this.__tz = "";
    this.__behavior_flag	= DateTime.DATE_STRICT;
    this.__precision = DateTime.PRECISION_SECOND;
    this.__use_time_zone = false;
    this.__time_only = false;

    // Indicate that the date/time has been zero to zeros...

    this.__iszero = true;
  }

  /**
  Set the year.
  */
  public setYear( y: number ): void {
    if( (this.__behavior_flag & DateTime.DATE_STRICT) != 0 ) {
          /* TODO SAM 2007-12-20 Evaluate whether negative year should be allowed.
          if( y < 0 ) {
              String message = "Trying to set invalid year (" + y + ") in DateTime.";
              Message.printWarning( 2, "DateTime.setYear", message );
              throw new IllegalArgumentException ( message );
          }
          */
    }    
    this.__year = y;
    this.setYearDay();
    this.setAbsoluteMonth();
    this.__isleap = TimeUtil.isLeapYear( this.__year );
    if ( y != 0 ) {
      this.__iszero = false;
    }
  }

  /**
  Set the year day from other data.
  The information is set ONLY if the DATE_FAST bit is not set in the behavior mask.
  */
  private setYearDay(): void {
    if ( (this.__behavior_flag & DateTime.DATE_FAST) != 0 ) {
      // Want to run fast so don't check...
      return;
    }

    var i: number;

      // Calculate the year day...

      this.__yearday = 0;

      // Get the days from the previous months...

      for( i = 1; i < this.__month; i++ ) {
          this.__yearday += TimeUtil.numDaysInMonth( i, this.__year );
      }

      // Add the days from the current month...

      this.__yearday += this.__day;
  }

}
