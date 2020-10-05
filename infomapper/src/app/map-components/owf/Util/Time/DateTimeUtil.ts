import { TimeInterval } from './TimeInterval';
import { StringUtil }   from '../String/StringUtil';
import { YearType }     from '../Time/YearType';

import * as moment      from 'moment';


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
      if (d === null) {
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
        console.warn ( 2, "DateTime.addInterval", message );
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
  Determine if the instance is greater than another date.  Time zone is not
  considered in the comparison (no time zone shift is made).  The comparison is
  made at the precision of the instance.
  @return true if the instance is greater than the given date.
  @param t DateTime to compare.
  */
  public greaterThan ( t: DateTime ): boolean {
    if ( !this.__time_only ) {
      if ( this.__year < t.__year) {
        return false;
      }
      else {
        if(this.__year > t.__year) {
          return true;
        }
      }
    
      if ( this.__precision === DateTime.PRECISION_YEAR ) {
        // Equal so return false...
        return false;
      }

      // otherwise years are equal so check months
    
      if(this.__month < t.__month) {
        return false;
      }
      else {
        if(this.__month > t.__month) {
          return true;
        }
      }

      if ( this.__precision === DateTime.PRECISION_MONTH ) {
        // Equal so return false...
        return false;
      }

      // months must be equal so check day

      if (this.__day < t.__day) {
        return false;
      }
      else {
        if(this.__day > t.__day) {
          return true;
        }
      }

      if ( this.__precision === DateTime.PRECISION_DAY ) {
        // Equal so return false...
        return false;
      }
    }

    // days are equal so check hour

    if (this.__hour < t.__hour) {
      return false;
    }
    else {
      if(this.__hour > t.__hour) {
        return true;
      }
    }

    if ( this.__precision === DateTime.PRECISION_HOUR ) {
      // Equal so return false...
      return false;
    }

    // means that hours match - so check minute

    if( this.__minute < t.__minute ) {
      return false;
    }
    else {
          if( this.__minute > t.__minute ) {
        return true;
      }
    }

    if ( this.__precision === DateTime.PRECISION_MINUTE ) {
      // Equal so return false...
      return false;
    }

    // means that minutes match - so check second

    if( this.__second < t.__second ) {
      return false;
    }
    else {
          if( this.__second > t.__second ) {
        return true;
      }
    }

    if ( this.__precision === DateTime.PRECISION_SECOND ) {
      // Equal so return false...
      return false;
    }

    // means that seconds match - so check hundredths of seconds

    if( this.__hsecond < t.__hsecond ) {
      return false;
    }
    else {
      if( this.__hsecond > t.__hsecond ) {
        return true;
      }
    }
    // means they are equal

    return false;
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
  Determine if the DateTime is less than another DateTime.  Time zone is not
  considered in the comparison (no time zone shift is made).  The precision of the
  instance is used for the comparison.
  @return true if the instance is less than the given DateTime.
  @param t DateTime to compare.
  */
  public lessThan ( t: DateTime ): boolean
  {	// Inline the comparisons here even though we could call other methods
    // because we'd have to call greaterThan() and equals() to know for sure.
    if ( !this.__time_only ) {
      if( this.__year < t.__year) {
        return true;
      }
      else {
              if(this.__year > t.__year) {
          return false;
        }
      }
    
      if ( this.__precision == DateTime.PRECISION_YEAR ) {
        // Equal so return false...
        return false;
      }

      // otherwise years are equal so check months
    
      if(this.__month < t.__month) {
        return true;
      }
      else {
              if(this.__month > t.__month) {
          return false;
        }
      }
    
      if ( this.__precision == DateTime.PRECISION_MONTH ) {
        // Equal so return false...
        return false;
      }

      // months must be equal so check day
    
      if (this.__day < t.__day) {
        return true;
      }
      else {
              if(this.__day > t.__day) {
          return false;
        }
      }

      if ( this.__precision == DateTime.PRECISION_DAY ) {
        // Equal so return false...
        return false;
      }
    }

    // days are equal so check hour

    if (this.__hour < t.__hour) {
      return true;
    }
    else {
          if(this.__hour > t.__hour) {
        return false;
      }
    }

    if ( this.__precision == DateTime.PRECISION_HOUR ) {
      // Equal so return false...
      return false;
    }

    // hours are equal so check minutes

    if( this.__minute < t.__minute ) {
      return true;
    }
    else {
          if( this.__minute > t.__minute ) {
        return false;
      }
    }

    if ( this.__precision == DateTime.PRECISION_MINUTE ) {
      // Equal so return false...
      return false;
    }

    // means that minutes match - so check second

    if( this.__second < t.__second ) {
      return true;
    }
    else {
          if( this.__second > t.__second ) {
        return false;
      }
    }

    if ( this.__precision == DateTime.PRECISION_SECOND ) {
      // Equal so return false...
      return false;
    }

    // means that seconds match - so check hundredths of seconds

    if( this.__hsecond < t.__hsecond ) {
      return true;
    }
    else {
          if( this.__hsecond > t.__hsecond ) {
        return false;
      }
    }

    // everything must be equal so not less than

    return false;
  }

  /**
  Determine if the DateTime is <= another.  Time zone is not
  considered in the comparison (no time zone shift is made).
  @return true if the DateTime instance is less than or equal to given DateTime.
  @param d DateTime to compare.
  */
  public lessThanOrEqualTo ( d: DateTime ): boolean {
    return !this.greaterThan(d);
  }

  /**
  Parse a string and initialize a DateTime.  The time zone will be set
  by default but the PRECISION_TIME_ZONE flag will be set to false meaning that the time zone is not used.
  If only a time format is detected, then the TIME_ONLY flag will be set in the returned instance.
  This routine is the inverse of toString().
  @param dateString A date/time string in any of the formats supported by parse(String,int).
  The format will be automatically detected based on the contents of the string.
  If more specific handling is needed, use the method version that accepts a format specifier.
  @return A DateTime instance corresponding to the specified date/time string.
  @exception IllegalArgumentException If the string is not understood.
  @see #toString
  */
  public static parse ( dateString: string ): DateTime {
    var	length = 0;
    var c: string;	// Use to optimize code below

    // First check to make sure we have something...
    if( dateString == null ) {
      console.warn("Cannot get DateTime from null string." );
      throw new Error ( "Null DateTime string to parse" );
    } 
    length = dateString.length;
    if( length == 0 ) {
      console.warn("Cannot get DateTime from zero-length string." );
      throw new Error ( "Empty DateTime string to parse" );
    }
    
    // Try to determine if there is a time zone based on whether there is a space and then character at the end,
    // for example:  2000-01-01 00 GMT-8.0
    // This will work except if the string had AM, PM, etc., but that has never been handled anyhow
    // This also assumes that standard time zones are used, which will start with a character string (not number)
    // and don't themselves include spaces.
    // TODO SAM 2016-05-02 need to handle date/time format strings - maybe deal with in Java 8
    var lastSpacePos: number = dateString.lastIndexOf(' ');
    var lengthNoTimeZone: number = length;
    var dateStringNoTimeZone: string = dateString; // Assume no time zone and reset below if time zone is found
    var timeZone: string = null;
    if ( lastSpacePos > 0 ) {
      timeZone = dateString.substring(lastSpacePos).trim();
      if ( timeZone.length == 0 ) {
        // Don't actually have anything at the end of the string
        timeZone = null;
      }
      else {
        if ( !/^[a-zA-z]/.test(timeZone) ) {
          // Assume that end is not a time zone (could just be the time specified after a space)
          timeZone = null;
        }
        if ( timeZone != null ) {
          // Actually had the time zone so save some data to help with parsing
          dateStringNoTimeZone = dateString.substring(0,lastSpacePos).trim();
          lengthNoTimeZone = dateStringNoTimeZone.length;
        }
      }
    }

    // This if-elseif structure is used to determine the format of the date represented by date_string.
    // All of these parse the string without time zone.  If time zone was detected, it is added at the end.
    // TODO SAM 2016-05-02 need to remove some cases now previously checked for time zone now that
    // time zone is checked above.  The legacy code assumed 3-digit time zone but now longer time zone is accepted.
    var dateTime: DateTime = null;
    if( lengthNoTimeZone == 4 ){
      //
      // the date is YYYY 
      //
      dateTime = this.parse3( dateStringNoTimeZone, DateTime.FORMAT_YYYY, 0 );
    }
    else if( lengthNoTimeZone == 5 ){
      //
      // the date is MM/DD or MM-DD or HH:mm
      // Don't allow MM/YY!!!
      //
      c = dateStringNoTimeZone.charAt ( 2 );
      if ( c == ':' ) {
        dateTime = this.parse3( dateStringNoTimeZone, DateTime.FORMAT_HH_mm, 0 );
      }
      else if ( (c == '/') || (c == '-') ) {
        // The following will work for both...
        dateTime = this.parse3( dateStringNoTimeZone, DateTime.FORMAT_MM_SLASH_DD, 0 );
      }
      else {
              console.warn( 2, "DateTime.parse", "Cannot get DateTime from \"" + dateString + "\"" );
        throw new Error ( "Invalid DateTime string \"" + dateString + "\"" );
      }
    }
    else if( lengthNoTimeZone == 6 ){
      //
      // the date is M/YYYY
      //
      if ( dateStringNoTimeZone.charAt(1) == '/') {
        dateTime = this.parse3(" "+ dateStringNoTimeZone, DateTime.FORMAT_MM_SLASH_YYYY,0);
      }
      else {	console.warn( 2, "DateTime.parse", "Cannot get DateTime from \"" + dateString + "\"" );
        throw new Error ( "Invalid DateTime string \"" + dateString + "\"" );
      }
    }
    else if( lengthNoTimeZone == 7 ){
      //
      // the date is YYYY-MM or MM/YYYY
      //
      if( dateStringNoTimeZone.charAt(2) == '/' ) {
        dateTime = this.parse3( dateStringNoTimeZone, DateTime.FORMAT_MM_SLASH_YYYY, 0 );
      }
      else {
        dateTime = this.parse3( dateStringNoTimeZone, DateTime.FORMAT_YYYY_MM, 0 );
      }
    }
    else if ( lengthNoTimeZone == 8 ) {
      if ( (dateStringNoTimeZone.charAt(2) == '/') && (dateStringNoTimeZone.charAt(5) == '/') ) {
        //
        // the date is MM/DD/YY
        //
        dateTime = this.parse3(dateStringNoTimeZone, DateTime.FORMAT_MM_SLASH_DD_SLASH_YY, 0 );
      }
      else if((dateStringNoTimeZone.charAt(1) == '/') && (dateStringNoTimeZone.charAt(3) == '/') ) {
        //
        // the date is M/D/YYYY
        //
        dateTime = this.parse3(dateStringNoTimeZone, DateTime.FORMAT_MM_SLASH_DD_SLASH_YYYY, 8 );
      }
      else if (StringUtil.isInteger(dateStringNoTimeZone) ) {
        // Assume YYYYMMDD
        dateTime = this.parse3(dateStringNoTimeZone, DateTime.FORMAT_YYYYMMDD, 0 );
      }
      else {
        console.warn( 2, "DateTime.parse", "Cannot get DateTime from \"" + dateString + "\"" );
        throw new Error ( "Invalid DateTime string \"" + dateString + "\"" );
      }
    }
    else if ( lengthNoTimeZone == 9 ) {
      if ( (dateStringNoTimeZone.charAt(2) == '/') && (dateStringNoTimeZone.charAt(4) == '/') ) {
        //
        // the date is MM/D/YYYY
        //
        dateTime = this.parse3(dateStringNoTimeZone, DateTime.FORMAT_MM_SLASH_DD_SLASH_YYYY, 9 );
      }
      else if((dateStringNoTimeZone.charAt(1) == '/') && (dateStringNoTimeZone.charAt(4) == '/') ) {
        //
        // the date is M/DD/YYYY
        //
        dateTime = this.parse3(dateStringNoTimeZone, DateTime.FORMAT_MM_SLASH_DD_SLASH_YYYY, -9 );
      }
      else {
        console.warn( 2, "DateTime.parse", "Cannot get DateTime from \"" + dateString + "\"" );
        throw new Error ( "Invalid DateTime string \"" + dateString + "\"" );
      }
    }
    else if( lengthNoTimeZone == 10 ){
      //
      // the date is MM/DD/YYYY or YYYY-MM-DD 
      //
      if( dateStringNoTimeZone.charAt(2) == '/' ) {
        dateTime = this.parse3( dateStringNoTimeZone, DateTime.FORMAT_MM_SLASH_DD_SLASH_YYYY, 0 );
      }
      else {
        dateTime = this.parse3( dateStringNoTimeZone, DateTime.FORMAT_YYYY_MM_DD, 0 );
      }
    }
          //
          // Length 11 would presumably by YYYYMMDDHmm, but this is not currently allowed.
          //
    else if( lengthNoTimeZone == 12 ){
      //
      // the date is YYYYMMDDHHmm
      //
      dateTime = this.parse3( dateStringNoTimeZone, DateTime.FORMAT_YYYYMMDDHHmm, 0 );
    }
    else if( lengthNoTimeZone == 13 ){
      //
      // the date is YYYY-MM-DD HH
      // or          MM/DD/YYYY HH
      // or          MM-DD-YYYY HH
      //
      if ( dateStringNoTimeZone.charAt(2) == '/' ) {
        dateTime = this.parse3( dateStringNoTimeZone, DateTime.FORMAT_MM_SLASH_DD_SLASH_YYYY_HH, 0 );
      }
      else if ( dateStringNoTimeZone.charAt(2) == '-' ) {
        dateTime = this.parse3( dateStringNoTimeZone, DateTime.FORMAT_MM_DD_YYYY_HH, 0 );
      }
      else {
        dateTime = this.parse3( dateStringNoTimeZone, DateTime.FORMAT_YYYY_MM_DD_HH, 0 );
      }
    }
    else if ( (lengthNoTimeZone > 14) && /[a-zA-Z]/.test(dateStringNoTimeZone.charAt(14))){
      //
      // the date is YYYY-MM-DD HH Z...
      //
      dateTime = this.parse3( dateStringNoTimeZone, DateTime.FORMAT_YYYY_MM_DD_HH_ZZZ, 0 );
    }
    else if( lengthNoTimeZone == 15 ){
      //
      // the date is YYYY-MM-DD HHmm
      //
      dateTime = this.parse3( dateStringNoTimeZone, DateTime.FORMAT_YYYY_MM_DD_HHmm, 0 );
    }
    else if( lengthNoTimeZone == 16 ){
      //
      // the date is YYYY-MM-DD HH:mm or MM/DD/YYYY HH:mm
      //
      if( dateStringNoTimeZone.charAt(2) == '/' ) {
        dateTime = this.parse3( dateStringNoTimeZone, DateTime.FORMAT_MM_SLASH_DD_SLASH_YYYY_HH_mm, 0 );
      }
      else {
        dateTime = this.parse3( dateStringNoTimeZone, DateTime.FORMAT_YYYY_MM_DD_HH_mm,0);
      }
    }
    else if ( (lengthNoTimeZone > 17) && /[a-zA-Z]/.test(dateStringNoTimeZone.charAt(17))){
      //
      // the date is YYYY-MM-DD HH:MM Z...
      //
      dateTime = this.parse3( dateStringNoTimeZone, DateTime.FORMAT_YYYY_MM_DD_HH_mm_ZZZ, 0 );
    }
    else if( lengthNoTimeZone == 19 ){
      //
      // the date is YYYY-MM-DD HH:mm:SS or MM/DD/YYYY HH:mm:SS
      //
          if( dateStringNoTimeZone.charAt(2) == '/' ) {
            dateTime = this.parse3( dateStringNoTimeZone, DateTime.FORMAT_MM_SLASH_DD_SLASH_YYYY_HH_mm_SS, 0 );
      }
      else {
        dateTime = this.parse3( dateStringNoTimeZone, DateTime.FORMAT_YYYY_MM_DD_HH_mm_SS, 0 );
          }
    }
    else if( lengthNoTimeZone == 22 ){
      //
      // the date is YYYY-MM-DD HH:mm:SS:hh
      //
      dateTime = this.parse3( dateStringNoTimeZone, DateTime.FORMAT_YYYY_MM_DD_HH_mm_SS_hh, 0 );
    }
    else if( lengthNoTimeZone >= 23 && dateStringNoTimeZone.charAt(19) == ' ' ){
      //
      // the date is YYYY-MM-DD HH:mm:SS ZZZ...
      //
      dateTime = this.parse3( dateStringNoTimeZone, DateTime.FORMAT_YYYY_MM_DD_HH_mm_SS_ZZZ, 0);
    }
      else if( lengthNoTimeZone > 23 && dateStringNoTimeZone.charAt(19) == ':' && dateStringNoTimeZone.charAt(22) == ' ' ){
          //
          // the date is YYYY-MM-DD HH:mm:SS:hh ZZZ...
          //
          dateTime = this.parse3( dateStringNoTimeZone, DateTime.FORMAT_YYYY_MM_DD_HH_mm_SS_hh_ZZZ, 0 );
      }
      else if ( (lengthNoTimeZone > 10) && (dateString.charAt(11) == 'T') ) {
        // Assume ISO 8601 if string contains time and a T (ISO 8601 date-only should have been handled above)
        // - this is a bit tricky given T could be in time zone
        dateTime = this.parse3( dateStringNoTimeZone, DateTime.FORMAT_ISO_8601, 0 );
      }
    else {
        // Unknown format so throw an exception...
      throw new Error ( "Date/time string \"" + dateString +
        "\" format is not auto-recognized - may need to specify format." );
    }
    
    if ( dateTime == null ) {
      // Fall through... was not parsed
      throw new Error ( "Date/time string \"" + dateString +
        "\" format is not auto-recognized - may need to specify format." );
    }
    if ( timeZone == null ) {
      timeZone = "";
    }
    // Set the time zone to what was specified in the string.
    // If no time zone was specified then blank is used
    dateTime.setTimeZone(timeZone);
    return dateTime;
  }

  /**
  Parse a string and initialize a DateTime.  The calling code must specify the
  proper format for parsing.  This routine therefore has limited use but is
  relatively fast.  The precision for the date is set according to the format (the
  precision is set to the smallest time interval used in the format).
  This routine is the inverse of toString(int format).
  @return A DateTime corresponding to the date.
  @param date_string A string representation of a date/time.
  @param format Date format (see FORMAT_*).
  @exception IllegalArgumentException If there is an error parsing the date string.
  @param flag A flag to use internally.  If > 0, this is used by some
  internal code to indicate variations in formats.  For example, MM/DD/YYYY,
  MM/D/YYYY, M/DD/YYYY, M/D/YYYY are all variations on the same format.
  @see #toString
  */
  private static parse3 ( date_string: string, format: number, flag: number ): DateTime {
    var dl = 50;
    var is_year = false,	// Use to improve performance
        is_month = false,	// of checks at end of the
        is_day = false,		// method - use booleans rather
        is_hour = false,	// than doing repeated bit mask
        is_minute = false;	// checks
    var date: DateTime = null;
    var routine = "DateTime.parse";
    var v: any[] = null;

    // Note that if the fixedRead routine has problems, it will just return
    // zeros for the integers.  This allows defaults for the smaller date/time fields...

    // if ( Message.isDebugOn ) {
    //   Message.printDebug(dl,routine, "Trying to parse string \"" + date_string + "\" using format " + format );
    // }

    if ( format == DateTime.FORMAT_DD_SLASH_MM_SLASH_YYYY ) {
      date = new DateTime ( DateTime.PRECISION_DAY );
      is_day = true;
      // Various flavors of the format based on whether one or two
      // digits are used for the month and day...
      if ( flag == 0 ) {
        v = StringUtil.fixedReadTwo ( date_string, "i2x1i2x1i4" );
      }
      else if ( flag == 8 ) {
        v = StringUtil.fixedReadTwo ( date_string, "i1x1i1x1i4" );
      }
      else if ( flag == 9 ) {
        v = StringUtil.fixedReadTwo ( date_string, "i2x1i1x1i4" );
      }
      else if ( flag == -9 ) {
        v = StringUtil.fixedReadTwo ( date_string, "i1x1i2x1i4" );
      }
      date.__day = (Number(v[0]));
      date.__month = (Number(v[1]));
      date.__year = (Number(v[2]));
    }
    else if ( format == DateTime.FORMAT_HH_mm ) {
      date = new DateTime ( DateTime.PRECISION_MINUTE | DateTime.TIME_ONLY );
      is_minute = true;
      v = StringUtil.fixedReadTwo ( date_string, "i2x1i2" );
      date.__hour = (Number(v[0]));
      date.__minute = (Number(v[1]));
    }
    else if ( format == DateTime.FORMAT_HHmm ) {
      date = new DateTime ( DateTime.PRECISION_MINUTE | DateTime.TIME_ONLY );
      is_minute = true;
      v = StringUtil.fixedReadTwo ( date_string, "i2i2" );
      date.__hour = (Number(v[0]));
      date.__minute = (Number(v[1]));
    }
    else if ( format == DateTime.FORMAT_MM ) {
      date = new DateTime ( DateTime.PRECISION_MONTH );
      is_month = true;
      v = StringUtil.fixedReadTwo ( date_string, "i2" );
      date.__month = (Number(v[0]));
    }
    else if ( (format == DateTime.FORMAT_MM_DD) || (format == DateTime.FORMAT_MM_SLASH_DD) ) {
      date = new DateTime ( DateTime.PRECISION_DAY );
      is_day = true;
      v = StringUtil.fixedReadTwo ( date_string, "i2x1i2" );
      date.__month = (Number(v[0]));
      date.__day = (Number(v[1]));
    }
    else if ( format == DateTime.FORMAT_MM_SLASH_DD_SLASH_YYYY ) {
      date = new DateTime ( DateTime.PRECISION_DAY );
      is_day = true;
      // Various flavors of the format based on whether one or two
      // digits are used for the month and day...
      if ( flag == 0 ) {
        v = StringUtil.fixedReadTwo ( date_string, "i2x1i2x1i4" );
      }
      else if ( flag == 8 ) {
        v = StringUtil.fixedReadTwo ( date_string, "i1x1i1x1i4" );
      }
      else if ( flag == 9 ) {
        v = StringUtil.fixedReadTwo ( date_string, "i2x1i1x1i4" );
      }
      else if ( flag == -9 ) {
        v = StringUtil.fixedReadTwo ( date_string, "i1x1i2x1i4" );
      }
      date.__month = (Number(v[0]));
      date.__day = (Number(v[1]));
      date.__year = (Number(v[2]));
    }
    else if ( format == DateTime.FORMAT_MM_SLASH_DD_SLASH_YY ) {
      date = new DateTime ( DateTime.PRECISION_DAY );
      is_day = true;
      v = StringUtil.fixedReadTwo ( date_string, "i2x1i2x1i2" );
      date.__month = (Number(v[0]));
      date.__day = (Number(v[1]));
      date.__year = (Number(v[2]));
    }
    else if ( (format == DateTime.FORMAT_MM_SLASH_DD_SLASH_YYYY_HH) || (format == DateTime.FORMAT_MM_DD_YYYY_HH) ) {
      date = new DateTime (DateTime.PRECISION_HOUR );
      is_hour = true;
      v = StringUtil.fixedReadTwo ( date_string, "i2x1i2x1i4x1i2" );
      date.__month = (Number(v[0]));
      date.__day = (Number(v[1]));
      date.__year = (Number(v[2]));
      date.__hour = (Number(v[3]));
    }
    else if ( format == DateTime.FORMAT_MM_SLASH_DD_SLASH_YYYY_HH_mm ) {
      date = new DateTime ( DateTime.PRECISION_MINUTE );
      is_minute = true;
      if ( date_string.length < 16 ) {
          // The date string is not padded with zeros.  Parse the string
          // into its parts and then reform to a zero-padded string.  Use primitive
          // formatting to increase performance.
          var sarray: string[] = date_string.split("[/ :]" );
          var monthPad = "", dayPad = "", hourPad = "", minutePad = "";
          if ( (sarray != null) && (sarray.length > 4) ) {
              // Assume that have all the needed parts
              if ( sarray[0].length == 1 ) {
                  monthPad = "0";
              }
                  if ( sarray[1].length == 1 ) {
                      dayPad = "0";
                  }
                  if ( sarray[3].length == 1 ) {
                      hourPad = "0";
                  }
                  if ( sarray[4].length == 1 ) {
                      minutePad = "0";
                  }
                  date_string = monthPad + sarray[0] + "/" + dayPad + sarray[1] + "/" +
                      sarray[2] + " " + hourPad + sarray[3] + ":" + minutePad + sarray[4];
          }
      }
      v = StringUtil.fixedReadTwo ( date_string, "i2x1i2x1i4x1i2x1i2" );
      date.__month = (Number(v[0]));
      date.__day = (Number(v[1]));
      date.__year = (Number(v[2]));
      date.__hour = (Number(v[3]));
      date.__minute = (Number(v[4]));
    }
      else if (format == DateTime.FORMAT_MM_SLASH_DD_SLASH_YYYY_HH_mm_SS) {
      date = new DateTime (DateTime.PRECISION_SECOND );
      is_minute = true;
      v = StringUtil.fixedReadTwo ( date_string, "i2x1i2x1i4x1i2x1i2x1i2" );
      date.__month = (Number(v[0]));
      date.__day = (Number(v[1]));
      date.__year = (Number(v[2]));
      date.__hour = (Number(v[3]));
      date.__minute = (Number(v[4]));
      date.__second = (Number(v[5]));
    }
    else if ( format == DateTime.FORMAT_MM_SLASH_YYYY ) {
      date = new DateTime ( DateTime.PRECISION_MONTH );
      is_month = true;
      if ( date_string.length == 6 ) {
        v = StringUtil.fixedReadTwo ( date_string, "i1x1i4" );
      } 
      else {	// Expect a length of 7...
        v = StringUtil.fixedReadTwo ( date_string, "i2x1i4" );
      }
      date.__month = (Number(v[0]));
      date.__year = (Number(v[1]));
    }
    else if ( format == DateTime.FORMAT_YYYY ) {
      date = new DateTime ( DateTime.PRECISION_YEAR );
      is_year = true;
      v = StringUtil.fixedReadTwo ( date_string, "i4" );
      date.__year = Number(v[1]);
    }
    else if ( format == DateTime.FORMAT_YYYY_MM ) {
      date = new DateTime ( DateTime.PRECISION_MONTH );
      is_month = true;
      v = StringUtil.fixedReadTwo ( date_string, "i4x1i2" );
      date.__year = (Number(v[0]));
      date.__month = (Number(v[1]));
    }
    else if ( format == DateTime.FORMAT_YYYY_MM_DD ) {
      date = new DateTime ( DateTime.PRECISION_DAY );
      is_day = true;
      v = StringUtil.fixedReadTwo ( date_string, "i4x1i2x1i2" );
      date.__year = (Number(v[0]));
      date.__month = (Number(v[1]));
      date.__day = (Number(v[2]));
    }
    else if ( format == DateTime.FORMAT_YYYYMMDD ) {
      date = new DateTime ( DateTime.PRECISION_DAY );
      is_day = true;
      v = StringUtil.fixedReadTwo ( date_string, "i4i2i2" );
      date.__year = (Number(v[0]));
      date.__month = (Number(v[1]));
      date.__day = (Number(v[2]));
    }
    else if ( format == DateTime.FORMAT_YYYY_MM_DD_HH ) {
      date = new DateTime (DateTime.PRECISION_HOUR );
      is_hour = true;
      v = StringUtil.fixedReadTwo ( date_string, "i4x1i2x1i2x1i2" );
      date.__year = (Number(v[0]));
      date.__month = (Number(v[1]));
      date.__day = (Number(v[2]));
      date.__hour = (Number(v[3]));
    }
    else if ( format == DateTime.FORMAT_YYYY_MM_DD_HH_ZZZ ) {
      date = new DateTime ( DateTime.PRECISION_HOUR );
      is_hour = true;
      v = StringUtil.fixedReadTwo ( date_string, "i4x1i2x1i2x1i2x1s3" );
      date.__year = (Number(v[0]));
      date.__month = (Number(v[1]));
      date.__day = (Number(v[2]));
      date.__hour = (Number(v[3]));
      date.setTimeZone ( (String(v[4]).trim() ));
    }
    else if ( format == DateTime.FORMAT_YYYY_MM_DD_HH_mm ) {
      date = new DateTime ( DateTime.PRECISION_MINUTE );
      is_minute = true;
      v = StringUtil.fixedReadTwo ( date_string, "i4x1i2x1i2x1i2x1i2" );
      date.__year = (Number(v[0]));
      date.__month = (Number(v[1]));
      date.__day = (Number(v[2]));
      date.__hour = (Number(v[3]));
      date.__minute = (Number(v[4]));
    }
    else if ( format == DateTime.FORMAT_YYYYMMDDHHmm ) {
      date = new DateTime (DateTime.PRECISION_MINUTE );
      is_minute = true;
      v = StringUtil.fixedReadTwo ( date_string, "i4i2i2i2i2" );
      date.__year = (Number(v[0]));
      date.__month = (Number(v[1]));
      date.__day = (Number(v[2]));
      date.__hour = (Number(v[3]));
      date.__minute = (Number(v[4]));
    }
    else if ( format == DateTime.FORMAT_YYYY_MM_DD_HHmm ) {
      date = new DateTime ( DateTime.PRECISION_MINUTE );
      is_minute = true;
      v = StringUtil.fixedReadTwo ( date_string, "i4x1i2x1i2x1i2i2" );
      date.__year = (Number(v[0]));
      date.__month = (Number(v[1]));
      date.__day = (Number(v[2]));
      date.__hour = (Number(v[3]));
      date.__minute = (Number(v[4]));
    }
    else if ( format == DateTime.FORMAT_YYYY_MM_DD_HH_mm_SS ) {
      date = new DateTime ( DateTime.PRECISION_SECOND );
      v = StringUtil.fixedReadTwo ( date_string,"i4x1i2x1i2x1i2x1i2x1i2" );
      date.__year = (Number(v[0]));
      date.__month = (Number(v[1]));
      date.__day = (Number(v[2]));
      date.__hour = (Number(v[3]));
      date.__minute = (Number(v[4]));
      date.__second = (Number(v[5]));
    }
    else if ( format == DateTime.FORMAT_YYYY_MM_DD_HH_mm_SS_hh ) {
      date = new DateTime (DateTime.PRECISION_HSECOND );
      v = StringUtil.fixedReadTwo ( date_string,"i4x1i2x1i2x1i2x1i2x1i2x1i2" );
      date.__year = (Number(v[0]));
      date.__month = (Number(v[1]));
      date.__day = (Number(v[2]));
      date.__hour = (Number(v[3]));
      date.__minute = (Number(v[4]));
      date.__second = (Number(v[5]));
      date.__hsecond = (Number(v[6]));
    }
    else if ( format == DateTime.FORMAT_YYYY_MM_DD_HH_ZZZ ) {
      date = new DateTime ( DateTime.PRECISION_HOUR );
      v = StringUtil.fixedReadTwo ( date_string,
      "i4x1i2x1i2x1i2x1s3" );
      date.__year = (Number(v[0]));
      date.__month = (Number(v[1]));
      date.__day = (Number(v[2]));
      date.__hour = (Number(v[3]));
      date.setTimeZone ( String(v[4]) );
    }
    else if ( format == DateTime.FORMAT_YYYY_MM_DD_HH_mm_ZZZ ) {
      date = new DateTime ( DateTime.PRECISION_MINUTE );
      v = StringUtil.fixedReadTwo ( date_string,"i4x1i2x1i2x1i2x1i2x1s3" );
      date.__year = (Number(v[0]));
      date.__month = (Number(v[1]));
      date.__day = (Number(v[2]));
      date.__hour = (Number(v[3]));
      date.__minute = (Number(v[4]));
      date.setTimeZone ( String(v[5] ));
    }
    else if ( format == DateTime.FORMAT_YYYY_MM_DD_HH_mm_SS_ZZZ ) {
      date = new DateTime ( DateTime.PRECISION_SECOND );
      v = StringUtil.fixedReadTwo ( date_string, "i4x1i2x1i2x1i2x1i2x1i2x1s3" );
      date.__year = (Number(v[0]));
      date.__month = (Number(v[1]));
      date.__day = (Number(v[2]));
      date.__hour = (Number(v[3]));
      date.__minute = (Number(v[4]));
      date.__second = (Number(v[5]));
      date.setTimeZone ( (String(v[6]) ));
    }
    else if ( format == DateTime.FORMAT_YYYY_MM_DD_HH_mm_SS_hh_ZZZ ) {
      date = new DateTime ( DateTime.PRECISION_HSECOND );
      v = StringUtil.fixedReadTwo ( date_string, "i4x1i2x1i2x1i2x1i2x1i2x1i2x1s3" );
      date.__year = (Number(v[0]));
      date.__month = (Number(v[1]));
      date.__day = (Number(v[2]));
      date.__hour = (Number(v[3]));
      date.__minute = (Number(v[4]));
      date.__second = (Number(v[5]));
      date.__hsecond = (Number(v[6]));
      date.setTimeZone ( String(v[7] ));
    }
    else if ( format == DateTime.FORMAT_ISO_8601 ) {
      // ISO 8601 formats.  See:  https://en.wikipedia.org/wiki/ISO_8601
      // - do not support decimal parts other than seconds
      // - do not support weeks
      // - cannot rely on something like OffsetDateTime to parse because don't know if time zone is included, etc.
      // Could have a variety of formats:
      // Date: 2017-06-30
      // Various date/time:
      // 2017-06-30T23:03:33Z
      // 2017-06-30T23:03:33+01:00
      // 2017-06-30T23:03:33-01:00
      // 20170630T230333Z
      // 20170630T230333+0100
      // 20170630T230333+01
      // Ordinal date:  2017-181 (not yet supported below)
      // Date without year:  -06-30 (not yet supported below)
      //Message.printStatus(2, routine, "Processing date/time string \"" + date_string + "\"");
      var posT: number = date_string.indexOf("T");
      var d: string = null;
      var t: string = null;
      if ( posT > 0 ) {
        // Date and time
        d = date_string.substring(0, posT); // Before T
        t = date_string.substring(posT + 1); // After T
      }
      else {
        // Only date so no need to deal with time zone
        d = date_string;
      }
      var dateLen: number = d.length;
      // Instantiate date/time to full precision, but will set precision more specifically below as it is determined
      if ( (d != null) && (t != null) ) {
        // Full date/time
        date = new DateTime ( DateTime.PRECISION_HSECOND );
      }
      else if ( (d != null) && (t == null) ) {
        // Only Date
        date = new DateTime ( DateTime.PRECISION_DAY );
      }
      if ( d != null ) {
        var yearFormat = "i4";
        var monthFormat: string = null;
        var dayFormat: string = null;
        // Assume have delimiter for lengths and if not reset lengths below
        var yearLen = 4;
        var monthLen = 7;
        var dayLen = 10;
        if ( d.indexOf("-") >= 0 ) {
          monthFormat = "i4x1i2";
          dayFormat = "i4x1i2x1i2";
        }
        else {
          monthFormat = "i4i2";
          monthLen = 6;
          dayFormat = "i4i2i2";
          dayLen = 8;
        }
        // Date fields are delimited by dash and may be truncated
        if ( dateLen == yearLen ) {
          v = StringUtil.fixedReadTwo ( d, yearFormat );
          date.__year = (Number(v[0]));
          date.setPrecisionOne(DateTime.PRECISION_YEAR);				
        }
        else if ( dateLen == monthLen ) {
          v = StringUtil.fixedReadTwo ( d, monthFormat );
          date.__year = (Number(v[0]));
          date.__month = (Number(v[1]));
          date.setPrecisionOne(DateTime.PRECISION_MONTH);
        }
        else if ( dateLen == dayLen ) {
          v = StringUtil.fixedReadTwo ( d, dayFormat );
          date.__year = (Number(v[0]));
          date.__month = (Number(v[1]));
          date.__day = (Number(v[2]));
          date.setPrecisionOne(DateTime.PRECISION_DAY);
        }
        else {
          throw new Error ( "Don't know how to parse \"" + date_string + "\" date \"" + d + "\" using ISO 8601." );
        }
      }
      if ( t != null ) {
        var timeLen: number = t.length;
        var hourFormat = "i2";
        var minuteFormat: string = null;
        // Assume have delimiter for lengths and if not reset lengths below
        var hourLen = 2;
        var minuteLen = 5;
        var colonOffset = 1; // Used when processing seconds below
        if ( t.indexOf(":") >= 0 ) {
          minuteFormat = "i2x1i2";
        }
        else {
          minuteFormat = "i4i2";
          minuteLen = 4;
          colonOffset = 0;
        }
        // Time fields are delimited by colon and may be truncated
        // - read hour and minute using fixed read and then read second and time zone handling variable length
        date.__tz = ""; // Time zone unknown
        if ( timeLen >= minuteLen ) {
          v = StringUtil.fixedReadTwo ( t, minuteFormat );
          date.__hour = (Number(v[0]));
          date.__minute = (Number(v[1]));
          date.setPrecisionOne(DateTime.PRECISION_MINUTE);
        }
        else if ( timeLen >= hourLen ) {
          v = StringUtil.fixedReadTwo ( t, hourFormat );
          date.__hour = (Number(v[0]));
          date.setPrecisionOne(DateTime.PRECISION_HOUR);				
        }
        else {
          throw new Error ( "Don't know how to parse \"" + date_string + "\" time \"" + t + "\" using ISO 8601." );
        }
        if ( timeLen > minuteLen ) {
          // Have to parse seconds and/or time zone
          var secAndTz: string = t.substring(minuteLen + colonOffset); // +1 is to skip :
          //Message.printStatus(2, routine, "processing seconds and/or time zone in \"" + secAndTz + "\"");
          // See if time zone is specified, which will start with +, -, or Z
          var secString = "";
          var posZ = secAndTz.indexOf("Z");
          if ( posZ < 0 ) {
            posZ = secAndTz.indexOf("+");
          }
          if ( posZ < 0 ) {
            posZ = secAndTz.indexOf("-");
          }
          if ( posZ < 0 ) {
            // Default will be blank
            date.setTimeZone("");
            secString = secAndTz;
          }
          else {
            // Have time zone, use as is
            date.setTimeZone(secAndTz.substring(posZ));
            date.setPrecisionOne(DateTime.PRECISION_TIME_ZONE);
            date.__use_time_zone = true;
            secString = secAndTz.substring(0,posZ);
          }
          // Figure out the seconds, which will be between the minute and time zone
          //Message.printStatus(2, routine, "processing seconds in \"" + secString + "\"");
          if ( secString !== "" ) {
            // Have seconds
            var posPeriod: number = secString.indexOf(".");
            if ( posPeriod > 0 ) { // Not >= because expect seconds in front of decimal so 0 is not allowed
              date.setPrecisionOne(DateTime.PRECISION_HSECOND);
              date.setSecond(parseInt(secString.substring(0,posPeriod)));
              // DateTime class recognizes hundreds so want only the first two digits
              var hsecString: string = secString.substring(posPeriod + 1);
              if ( hsecString.length > 2 ) {
                hsecString = hsecString.substring(0, 2);
              }
              //Message.printStatus(2, routine, "Setting hseconds to \"" + hsecString + "\"");
              date.setHSecond(parseInt(hsecString));
            }
            else {
              date.setPrecisionOne(DateTime.PRECISION_SECOND);
              var sec: number = parseInt(secString);
              date.setSecond(sec);
            }
          }
        }
      }
      //Message.printStatus(2, routine, "After parsing ISO 8601, date/time is: \"" + date + "\"");
    }
    else {
      throw new Error ( "Date format " + format +	" is not recognized." );
    }
    // Check for hour 24...
    if ( date.__hour == 24 ) {
      // Assume the date that was parsed uses a 1-24 hour system. Change to hour 0 of the next day...
      date.__hour = 0;
      date.addDay(1);
    }
    // Verify that the date components are valid.  If not, throw an
    // exception.  This degrades performance some but not much since all checks are integer based.
    // Limit year to a reasonable value...
    if ( (date.__year < -1000) || (date.__year > 10000) ) {
      throw new Error ( "Invalid year " + date.__year + " in \"" + date_string + "\"" );
    }
    if ( is_year ) {
      date.reset();
      return date;
    }
    if ( (date.__month < 1) || (date.__month > 12) ) {
      throw new Error ( "Invalid month " + date.__month + " in \"" + date_string + "\"" );
    }
    if ( is_month ) {
      date.reset();
      return date;
    }
    // Split out checks to improve performance...
    if ( date.__month == 2 ) {
      if ( TimeUtil.isLeapYear ( date.__year ) ) {
        if ( (date.__day < 1) || (date.__day > 29) ) {
          throw new Error ( "Invalid day " + date.__day +	" in \"" + date_string + "\"" );
        }
      }
      else {
          if ( (date.__day < 1) || (date.__day > 28) ) {
          throw new Error ( "Invalid day " + date.__day + " in \"" + date_string + "\"" );
        }
      }
    }
    else {
        // Not a leap year...
      if ( (date.__day < 1) || (date.__day > TimeUtil.MONTH_DAYS[date.__month - 1]) ) {
        throw new Error ( "Invalid day " + date.__day + " in \"" + date_string + "\"" );
      }
    }
    if ( is_day ) {
      date.reset();
      return date;
    }
    if ( (date.__hour < 0) || (date.__hour > 23) ) {
      throw new Error ( "Invalid hour " + date.__hour + " in \"" + date_string + "\"" );
    }
    if ( is_hour ) {
      date.reset();
      return date;
    }
    if ( (date.__minute < 0) || (date.__minute > 59) ) {
      throw new Error ( "Invalid minute " + date.__minute + " in \"" + date_string + "\"" );
    }
    if ( is_minute ) {
      date.reset();
      return date;
    }
    date.reset();
    return date;
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
  Set the hundredths of seconds.
  @param hs Hundredths of seconds.
  */
  public setHSecond( hs: number ): void {	
    if( (this.__behavior_flag & DateTime.DATE_STRICT) != 0 ){
          if( hs > 99 || hs < 0 ) {
              var message = "Trying to set invalid hsecond (" + hs + ") in DateTime, must be between 0 and 99.";
              console.warn( message );
              throw new Error ( message );
          }
    }
    if ( hs >= 100 ) {
      // Truncate to first two digits
      var s = "" + hs;
      s = s.substring(0, 2);
      hs = parseInt(s);
    }
    this.__hsecond = hs;
    // This has the flaw of not changing the flag when the value is set to 0!
    if ( hs != 0 ) {
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
  Set the string time zone.  No check is made to verify that it is a valid time zone abbreviation.
  The time zone should normally only be set for DateTime that have a time component.
  For most analytical purposes the time zone should be GMT or a standard zone like MST.
  Time zones that use daylight savings or otherwise change over history or during the year are
  problematic to maintaining continuity.
  The getDate*() methods will consider the time zone if requested.
  @param zone Time zone abbreviation.  If non-null and non-blank, the
  DateTime precision is automatically set so that PRECISION_TIME_ZONE is on.
  If null or blank, PRECISION_TIME_ZONE is off.
  @return the same DateTime instance, which allows chained calls
  */
  public setTimeZone( zone: string ): DateTime
  {	if ( (zone == null) || (zone.length == 0) ) {
      this.__tz = "";
      this.__use_time_zone = false;
    }
    else {
          this.__use_time_zone = true;
      this.__tz = zone;
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

  /**
  Return string representation of the date and time.
  @return String representation of the date, using a format consistent with
  the precision for the date (see PRECISION_* and TIME_ONLY).  In general, the
  output formats are Y2K strings like YYYY-MM-DD or YYYY-MM-DD HH:mm.
  */
  public toString (): string {
    // Arrange these in probable order of use...
    if ( this.__precision === DateTime.PRECISION_MONTH ) {
      return this.toStringFull ( DateTime.FORMAT_YYYY_MM );
    }
    else if ( this.__precision === DateTime.PRECISION_DAY ) {
      return this.toStringFull ( DateTime.FORMAT_YYYY_MM_DD );
    }
    else if ( this.__precision === DateTime.PRECISION_HOUR ) {
      if ( this.__use_time_zone && (this.__tz.length > 0) ) {
        var prefix: string = this.__tz.charAt(0);
        if ( (prefix === '-') || (prefix === '+') || this.__tz === "Z" ) {
          return this.toStringFull ( DateTime.FORMAT_ISO_8601 );
        }
        else {
          return this.toStringFull ( DateTime.FORMAT_YYYY_MM_DD_HH_ZZZ );
        }
      }
      else {
        return this.toStringFull ( DateTime.FORMAT_YYYY_MM_DD_HH );
      }
    }
    else if ( this.__precision === DateTime.PRECISION_YEAR ) {
      return this.toStringFull ( DateTime.FORMAT_YYYY );
    }
    else if ( this.__precision === DateTime.PRECISION_MINUTE ) {
      if ( this.__time_only ) {
        return this.toStringFull ( DateTime.FORMAT_HH_mm );
      }
      else {
        if ( this.__use_time_zone && (this.__tz.length > 0) ) {
          var prefix: string = this.__tz.charAt(0);
          if ( (prefix === '-') || (prefix === '+') || this.__tz === "Z" ) {
            return this.toStringFull ( DateTime.FORMAT_ISO_8601 );
          }
          else {
            return this.toStringFull ( DateTime.FORMAT_YYYY_MM_DD_HH_mm_ZZZ );
          }
        }
        else {
          return this.toStringFull ( DateTime.FORMAT_YYYY_MM_DD_HH_mm );
        }
      }
    }
    else if ( this.__precision === DateTime.PRECISION_SECOND ) {
      if ( this.__use_time_zone && (this.__tz.length > 0) ) {
        var prefix: string = this.__tz.charAt(0);
        if ( (prefix === '-') || (prefix === '+') || this.__tz === "Z" ) {
          return this.toStringFull ( DateTime.FORMAT_ISO_8601 );
        }
        else {
          return this.toStringFull ( DateTime.FORMAT_YYYY_MM_DD_HH_mm_SS_ZZZ );
        }
      }
      else {
        return this.toStringFull ( DateTime.FORMAT_YYYY_MM_DD_HH_mm_SS );
      }
    }
    else if ( this.__precision === DateTime.PRECISION_HSECOND ) {
      if ( this.__use_time_zone && (this.__tz.length > 0) ) {
        var prefix: string = this.__tz.charAt(0);
        if ( (prefix === '-') || (prefix === '+') || this.__tz === "Z" ) {
          return this.toStringFull ( DateTime.FORMAT_ISO_8601 );
        }
        else {
          return this.toStringFull ( DateTime.FORMAT_YYYY_MM_DD_HH_mm_SS_hh_ZZZ );
        }
      }
      else {
        return this.toStringFull ( DateTime.FORMAT_YYYY_MM_DD_HH_mm_SS_hh );
      }
    }
    else {
      // Assume that hours and minutes but NOT time zone are desired...
      if ( this.__use_time_zone && (this.__tz.length > 0) ) {
        var prefix = this.__tz.charAt(0);
        if ( (prefix === '-') || (prefix === '+') || this.__tz === "Z" ) {
          return this.toStringFull ( DateTime.FORMAT_ISO_8601 );
        }
        else {
          return this.toStringFull ( DateTime.FORMAT_YYYY_MM_DD_HH_mm_ZZZ );
        }
      }
      else {
        return this.toStringFull ( DateTime.FORMAT_YYYY_MM_DD_HH_mm );
      }
    }
  }

  /**
  Convert to a string using the given format (see FORMAT_*).  This is not as
  flexible as formatTimeString but is useful where date formats need to be
  consistent.  Currently if a time zone is detected, it is set in the data but
  the PRECISION_TIME_ZONE flag is not set to true.
  @return A String representation of the date.
  @param format The format to use for the string.
  */
  public toStringFull ( format: number ): string {
    if ( format == DateTime.FORMAT_NONE ) {
      return "";
    }
    else if ( format == DateTime.FORMAT_AUTOMATIC ) {
      return toString();
    }
    else if ( format == DateTime.FORMAT_DD_SLASH_MM_SLASH_YYYY ) {
      return StringUtil.formatString(this.__day,"%02d") + "/" +
      StringUtil.formatString(this.__month,"%02d") + "/" +
      StringUtil.formatString(this.__year,"%04d");
    }	
    else if ( format == DateTime.FORMAT_HH_mm ) {
      return StringUtil.formatString(this.__hour,"%02d") + ":" +
      StringUtil.formatString(this.__minute,"%02d");
    }
    else if ( format == DateTime.FORMAT_HHmm ) {
      // This format is NOT parsed automatically (the 4-digit year parse is done instead).
      return StringUtil.formatString(this.__hour,"%02d") +
      StringUtil.formatString(this.__minute,"%02d");
    }
    else if ( format == DateTime.FORMAT_MM ) {
      return StringUtil.formatString(this.__month,"%02d");
    }
    else if ( format == DateTime.FORMAT_MM_DD ) {
      return StringUtil.formatString(this.__month,"%02d") + "-" +
      StringUtil.formatString(this.__day,"%02d");
    }
    else if ( format == DateTime.FORMAT_MM_SLASH_DD ) {
      return StringUtil.formatString(this.__month,"%02d") + "/" +
      StringUtil.formatString(this.__day,"%02d");
    }
    else if ( format == DateTime.FORMAT_MM_SLASH_DD_SLASH_YYYY ) {
      return StringUtil.formatString(this.__month,"%02d") + "/" +
      StringUtil.formatString(this.__day,"%02d") + "/" +
      StringUtil.formatString(this.__year,"%04d");
    }
    else if ( format == DateTime.FORMAT_MM_SLASH_DD_SLASH_YY ) {
      return StringUtil.formatString(this.__month,"%02d") + "/" +
      StringUtil.formatString(this.__day,"%02d") + "/" +
      StringUtil.formatString(TimeUtil.formatYear( this.__year,2),"%02d");
    }
    else if ( format == DateTime.FORMAT_MM_SLASH_DD_SLASH_YYYY_HH ) {
      return StringUtil.formatString(this.__month,"%02d") + "/" +
      StringUtil.formatString(this.__day,"%02d") + "/" +
      StringUtil.formatString(this.__year,"%04d") + " " +
      StringUtil.formatString(this.__hour,"%02d");
    }
    else if ( format == DateTime.FORMAT_MM_DD_YYYY_HH ) {
      return StringUtil.formatString(this.__month,"%02d") + "-" +
      StringUtil.formatString(this.__day,"%02d") + "-" +
      StringUtil.formatString(this.__year,"%04d") + " " +
      StringUtil.formatString(this.__hour,"%02d");
    }
    else if ( format == DateTime.FORMAT_MM_SLASH_DD_SLASH_YYYY_HH_mm ) {
      return StringUtil.formatString(this.__month,"%02d") + "/" +
      StringUtil.formatString(this.__day,"%02d") + "/" +
      StringUtil.formatString(this.__year,"%04d") + " " +
      StringUtil.formatString(this.__hour,"%02d") + ":" +
      StringUtil.formatString(this.__minute,"%02d");
    }
    else if ( format == DateTime.FORMAT_MM_SLASH_DD_SLASH_YYYY_HH_mm_SS ) {
      return StringUtil.formatString(this.__month,"%02d") + "/" +
      StringUtil.formatString(this.__day,"%02d") + "/" +
      StringUtil.formatString(this.__year,"%04d") + " " +
      StringUtil.formatString(this.__hour,"%02d") + ":" +
      StringUtil.formatString(this.__minute,"%02d") + ":" +
      StringUtil.formatString(this.__second,"%02d");
    }
    else if ( format == DateTime.FORMAT_MM_SLASH_YYYY ) {
      return StringUtil.formatString(this.__month,"%02d") + "/" +
      StringUtil.formatString(this.__year,"%04d");
    }
    else if ( format == DateTime.FORMAT_YYYY ) {
      return StringUtil.formatString(this.__year,"%04d");
    }
    else if ( format == DateTime.FORMAT_YYYY_MM ) {
      return StringUtil.formatString(this.__year,"%04d") + "-" +
      StringUtil.formatString(this.__month,"%02d");
    }
    else if ( format == DateTime.FORMAT_YYYY_MM_DD ) {
      return StringUtil.formatString(this.__year,"%04d") + "-" +
      StringUtil.formatString(this.__month,"%02d") + "-" +
      StringUtil.formatString(this.__day,"%02d");
    }
    else if ( format == DateTime.FORMAT_YYYY_MM_DD_HH ) {
      return StringUtil.formatString(this.__year,"%04d") + "-" +
      StringUtil.formatString(this.__month,"%02d") + "-" +
      StringUtil.formatString(this.__day,"%02d") + " " +
      StringUtil.formatString(this.__hour,"%02d");
    }
    else if ( format == DateTime.FORMAT_YYYY_MM_DD_HH_ZZZ ) {
      return StringUtil.formatString(this.__year,"%04d") + "-" +
      StringUtil.formatString(this.__month,"%02d") + "-" +
      StringUtil.formatString(this.__day,"%02d") + " " +
      StringUtil.formatString(this.__hour,"%02d") + " " + this.__tz;
    }
    else if ( format == DateTime.FORMAT_YYYY_MM_DD_HH_mm ) {
      return StringUtil.formatString(this.__year,"%04d") + "-" +
      StringUtil.formatString(this.__month,"%02d") + "-" +
      StringUtil.formatString(this.__day,"%02d") + " " +
      StringUtil.formatString(this.__hour,"%02d") + ":" +
      StringUtil.formatString(this.__minute,"%02d");
    }
    else if ( format == DateTime.FORMAT_YYYYMMDDHHmm ) {
      return StringUtil.formatString(this.__year,"%04d") +
      StringUtil.formatString(this.__month,"%02d") +
      StringUtil.formatString(this.__day,"%02d") +
      StringUtil.formatString(this.__hour,"%02d") +
      StringUtil.formatString(this.__minute,"%02d");
    }
    else if ( format == DateTime.FORMAT_YYYY_MM_DD_HHmm ) {
      return StringUtil.formatString(this.__year,"%04d") + "-" +
      StringUtil.formatString(this.__month,"%02d") + "-" +
      StringUtil.formatString(this.__day,"%02d") + " " +
      StringUtil.formatString(this.__hour,"%02d") +
      StringUtil.formatString(this.__minute,"%02d");
    }
    else if ( format == DateTime.FORMAT_YYYY_MM_DD_HH_mm_ZZZ ) {
      return StringUtil.formatString(this.__year,"%04d") + "-" +
      StringUtil.formatString(this.__month,"%02d") + "-" +
      StringUtil.formatString(this.__day,"%02d") + " " +
      StringUtil.formatString(this.__hour,"%02d") + ":" +
      StringUtil.formatString(this.__minute,"%02d" + " " + this.__tz );
    }
    else if ( format == DateTime.FORMAT_YYYY_MM_DD_HH_mm_SS ) {
      return StringUtil.formatString(this.__year,"%04d") + "-" +
      StringUtil.formatString(this.__month,"%02d") + "-" +
      StringUtil.formatString(this.__day,"%02d") + " " +
      StringUtil.formatString(this.__hour,"%02d") + ":" +
      StringUtil.formatString(this.__minute,"%02d") + ":" +
      StringUtil.formatString(this.__second,"%02d");
    }
    else if ( format == DateTime.FORMAT_YYYY_MM_DD_HH_mm_SS_hh ) {
      return StringUtil.formatString(this.__year,"%04d") + "-" +
      StringUtil.formatString(this.__month,"%02d") + "-" +
      StringUtil.formatString(this.__day,"%02d") + " " +
      StringUtil.formatString(this.__hour,"%02d") + ":" +
      StringUtil.formatString(this.__minute,"%02d") + ":" +
      StringUtil.formatString(this.__second,"%02d") + ":" +
      StringUtil.formatString(this.__hsecond,"%02d");
    }
    else if ( format == DateTime.FORMAT_YYYY_MM_DD_HH_mm_SS_ZZZ ) {
      return StringUtil.formatString(this.__year,"%04d") + "-" +
      StringUtil.formatString(this.__month,"%02d") + "-" +
      StringUtil.formatString(this.__day,"%02d") + " " +
      StringUtil.formatString(this.__hour,"%02d") + ":" +
      StringUtil.formatString(this.__minute,"%02d") + ":" +
      StringUtil.formatString(this.__second,"%02d") + " " + this.__tz;
    }
    else if ( format == DateTime.FORMAT_YYYY_MM_DD_HH_mm_SS_hh_ZZZ ) {
      return StringUtil.formatString(this.__year,"%04d") + "-" +
      StringUtil.formatString(this.__month,"%02d") + "-" +
      StringUtil.formatString(this.__day,"%02d") + " " +
      StringUtil.formatString(this.__hour,"%02d") + ":" +
      StringUtil.formatString(this.__minute,"%02d") + ":" +
      StringUtil.formatString(this.__second,"%02d") + ":" +
      StringUtil.formatString(this.__hsecond,"%02d") + " " + this.__tz;
    }
    else if ( format == DateTime.FORMAT_VERBOSE ) {
      return "year=" + this.__year + ", month=" + this.__month + ", day=" + this.__day
        + ", hour=" + this.__hour + ", min=" + this.__minute + ", second=" + this.__second + ", hsecond=" + this.__hsecond
        + ", tz=\"" + this.__tz + ", useTimeZone=" + this.__use_time_zone + ", isLeap=" + this.__isleap;
    }
    else if ( format == DateTime.FORMAT_ISO_8601 ) {
      // Output is sensitive to the precision, and use more verbose version for readability:
      // - use dash for date delimiter, colon for time delimiter
      // Precision values sort with Year as largest
      var b = ''; // TODO smalers 2017-07-01 Is this efficient or should there be a shared formatter?
      var dDelim = "-";
      var tDelim = ":";
      if ( this.__precision <= DateTime.PRECISION_YEAR ) {
        b += StringUtil.formatString(this.__year, "%04d");
      }
      if ( this.__precision <= DateTime.PRECISION_MONTH ) {
        b += dDelim;
        b += StringUtil.formatString(this.__month, "%02d");
      }
      if ( this.__precision <= DateTime.PRECISION_DAY ) {
        b += dDelim;
        b += StringUtil.formatString(this.__day, "%02d");
      }
      if ( this.__precision <= DateTime.PRECISION_HOUR ) {
        b += "T";
        b += StringUtil.formatString(this.__hour, "%02d");
      }
      if ( this.__precision <= DateTime.PRECISION_MINUTE ) {
        b += tDelim;
        b += StringUtil.formatString(this.__minute, "%02d");
      }
      if ( this.__precision <= DateTime.PRECISION_SECOND ) {
        b += tDelim;
        b += StringUtil.formatString(this.__second, "%02d");
      }
      if ( this.__precision <= DateTime.PRECISION_HSECOND ) {
        b += ".";
        b += StringUtil.formatString(this.__hsecond, "%02d");
      }
      // TODO smalers 2017-07-01 need to evaluate fractional seconds (milli or nano seconds)
      // According to ISO-8601 a missing time zone is ambiguous and will be interpreted as local time zone.
      // TSTool, for example, allows no time zone because often it is not relevant; however, to comply
      // with the standard include the time zone as best as possible
      if ( this.__precision <= DateTime.PRECISION_HOUR ) { // TODO smalers 2017-07-01 should this check for this.__use_time_zone?
        if ( this.__tz.length !== 0 ) {
          // Only output if the time zone is Z, or starts with + or -
          var prefix: string = this.__tz.charAt(0);
          if ( (prefix == '+') || (prefix == '-') || this.__tz === "Z" ) {
            b += this.__tz;
          }
          else {
            // Invalid time zone for ISO 8601 formatting
            // - throw an exception since this format is being phased in and want to be compliant
            // - this format should not be used by default yet as of 2017-07-01 so hopefully is not an issue
            // - may need another variant on this format, for example to not output delimiter
            throw new Error ( "Time zone \"" + this.__tz + "\" is incompatible with ISO 8601 format.  Should be Z or +NN:NN, etc.");
          }
        }
      }
      return b.toString();
    }
    else {
      // Use this as default for historical reasons
      // TODO smalers 2017-07-01 Need to evaluate switching to ISO
        return this.toStringFull ( DateTime.FORMAT_YYYY_MM_DD_HH_mm_SS_hh_ZZZ );
    }
  }

}


export abstract class TimeUtil {

  /**
  The TimeUtil class provides time utility methods for date/time data, independent
  of use in time series or other classes.  There is no "Time" or "Date" class
  other than what is supplied by Java or RTi's DateTime class (TSDate is being
  phased out).  Conventions used for all methods are:
  <p>
  Years are 4-digit.<br>
  Months are 1-12.<br>
  Days are 1-31.<br>
  Hours are 0-23.<br>
  Minutes are 0-59.<br>
  Seconds are 0-59.<br>
  HSeconds are 0-99.<br>
  <p>
  */


  /**
  Datum for absolute day = days inclusive of Dec 31, 1799.
  This has been computed by looping through years 1-1799 adding numDaysInYear.
  This constant can be used when computing absolute days (e.g., to calculate the
  number of days in a period).
  */
  public static ABSOLUTE_DAY_DATUM: number = 657071;
  
  /**
  Blank values for DateTime parts, used to "mask out" unused information.
  If these are used as data values, then DateTime.DATE_FAST should be used to
  prevent exceptions for invalid values.  For example, it may be necessary to show a DateTime
  as a string parameter to represent a window in a year ("MM-DD").  In this case the other
  date/time components are not used, but are needed in the string to allow for proper parsing.
  */
  public static BLANK_YEA: number = 9999;
  public static BLANK_MONTH: number = 99;
  public static BLANK_DAY: number = 99;
  public static BLANK_HOUR: number = 99;
  public static BLANK_MINUTE: number = 99;
  public static BLANK_SECOND: number = 99;

  /**
  The following indicates how time zones are handled when getLocalTimeZone() is
  called (which is used when DateTime instances are created).  The default is
  LOOKUP_TIME_ZONE_ONCE, which results in the best performance when the time
  zone is not expected to change within a run.  However, if a time zone change
  will cause a problem, LOOKUP_TIME_ZONE_ALWAYS should be used (however, this
  results in slower performance).
  */
  public static LOOKUP_TIME_ZONE_ONCE: number = 1;
  
  /**
  The following indicates that for DateTime construction the local time zone is
  looked up each time a DateTime is created.  This should be considered when
  running a real-time application that runs continuously between time zone changes.
  */
  public static LOOKUP_TIME_ZONE_ALWAYS: number	= 2;
  
  /**
  Abbreviations for months.
  */
  public static MONTH_ABBREVIATIONS: string[] = [ "Jan", "Feb", "Mar", "Apr",
              "May", "Jun", "Jul", "Aug",
              "Sep", "Oct", "Nov", "Dec" ];
  
  /**
  Full names for months.
  */
  public static MONTH_NAMES: string[] = [	"January", "February", "March",	
              "April", "May", "June",
              "July", "August", "September",
              "October", "November",
              "December" ];
  
  /**
  Abbreviations for days.
  */
  public static DAY_ABBREVIATIONS: string[] = [	"Sun", "Mon", "Tue",
                "Wed", "Thu", "Fri",
                "Sat" ];
  
  /**
  Full names for months.
  */
  public static DAY_NAMES: string[] = [		"Sunday", "Monday",
                "Tuesday", "Wednesday",
                "Thursday", "Friday",
                "Saturday" ];
  
  /**
  Days in months (non-leap year).
  */
  public static MONTH_DAYS: number[] = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
  
  /**
  For a month, the number of days in the year passed on the first day of the
  month (non-leap year).
  */
  public static MONTH_YEARDAYS: number[] = [	0, 31, 59, 90, 120, 151,
              181, 212, 243, 273, 304, 334 ];
  
  // Static data shared in package (so DateTime can get to easily)...
  // TODO: jpkeahey 2020.06.10 - UNCOMMENT THE NEXT LINE OUT
  // protected static _local_time_zone: TimeZone = null;
  public static _local_time_zone_string: string = "";
  public static _local_time_zone_retrieved: boolean = false;
  public static _time_zone_lookup_method: number = TimeUtil.LOOKUP_TIME_ZONE_ONCE;

  private static _offset_year = -10000;


  /**
  Format a DateTime using the given format.  The year type defaults to CALENDAR.
  @param dt DateTime object to format
  @param format format string (see overloaded version for details)
  */
  public static formatDateTime ( dt: DateTime, format: string ): string {
    return this.formatDateTimeFinal ( dt, YearType.CALENDAR, format );
  }

  /**
  Format a DateTime using the given format.
  @return The date/time as a string for the specified date using the specified format.
  @param d0 The date to format.  If the date is null, the current time is used.
  @param yearType the year type, for example NOV_TO_OCT will result in date/times in Nov-Dec of the first year having a year
  of the following calendar year for ${dt:YearForYearType} property
  @param format0 The date format.  If the format is null,
  the default is as follows:  "Fri Jan 03 16:05:14 MST 1998" (the UNIX date
  command output).  The date can be formatted using the format modifiers of the
  C "strftime" routine, as follows:
  <p>
  <table width=100% cellpadding=10 cellspacing=0 border=2>
  <tr>
  <td><b>Format Specifier</b></td>	<td><b>Description</b></td>
  </tr
  <tr>
  <td><b>%a</b></td>
  <td>The abbreviated weekday.</td>
  </tr>
  <tr>
  <td><b>%A</b></td>
  <td>The full weekday.</td>
  </tr>
  <tr>
  <td><b>%b</b></td>
  <td>The abbreviated month.</td>
  </tr>
  <tr>
  <td><b>%B</b></td>
  <td>The full month.</td>
  </tr>
  <tr>
  <td><b>%c</b></td>
  <td>Not supported.</td>
  </tr>
  <tr>
  <td><b>%d</b></td>
  <td>Day of month in range 1-31.</td>
  </tr>
  <tr>
  <td><b>%H</b></td>
  <td>Hour of day in range 0-23.</td>
  </tr>
  <tr>
  <td><b>%I</b></td>
  <td>Hour of day in range 0-12.</td>
  </tr>
  <tr>
  <td><b>%j</b></td>
  <td>Day of year in range 1-366.</td>
  </tr>
  <tr>
  <td><b>%m</b></td>
  <td>Month of year in range 1-12.</td>
  </tr>
  <tr>
  <td><b>%M</b></td>
  <td>Minute of hour in range 0-59.</td>
  </tr>
  <tr>
  <td><b>%p</b></td>
  <td>"AM" or "PM".</td>
  </tr>
  <tr>
  <td><b>%S</b></td>
  <td>Seconds of minute in range 0-59.</td>
  </tr>
  <tr>
  <td><b>%U</b> or <b>%W</b></td>
  <td>Week of year in range 1-52.</td>
  </tr>
  <tr>
  <td><b>%x</b></td>
  <td>Not supported.</td>
  </tr>
  <tr>
  <td><b>%X</b></td>
  <td>Not supported.</td>
  </tr>
  <tr>
  <td><b>%y</b></td>
  <td>Two digit year since 1900 (this is use discouraged because the datum is ambiguous).</td>
  </tr>
  <tr>
  <td><b>%Y</b></td>
  <td>Four digit year.</td>
  </tr>
  <tr>
  <td><b>%Z</b></td>
  <td>Three character time zone abbreviation.</td>
  </tr>
  <tr>
  <td><b>%%</b></td>
  <td>Literal % character.</td>
  </tr>
  </table>
  */
  public static formatDateTimeFinal ( d0: DateTime, yearType: YearType, format0: string ): string {
    var default_format = "%a %b %d %H:%M:%S %Z %Y";
    var format: string;

    if ( format0 === null ) {
      format = default_format;
    }
    else if ( format0.length === 0 ) {
      format = default_format;
    }
    else {
          format = format0;
    }

    var dateTime: DateTime;
    if ( d0 === null ) {
      // Get the current time...
      dateTime = new DateTime(DateTime.DATE_CURRENT);
    }
    else {
          dateTime = d0;
    }

    // Use the date to format and then use DateTime time zone
    // Date date = null;
    // // TODO SAM 2016-05-02 really need to handle time zone more explicitly here
    // // Get the date using the DateTime's time zone or if not specified use the local time
    // // This matches legacy behavior
    // date = dateTime.getDate(TimeZoneDefaultType.LOCAL);

    // if ( format === "datum_seconds" ) {
    //   // Want the number of seconds since the standard time datum	
    //   // Need to work on this...
    //   //long seconds = d.getTime ();
    //   //return Long.toString ( seconds/1000 );
    //   return "0";
    // }
    // // Convert format to string...
    // GregorianCalendar cal = new GregorianCalendar ();
    // cal.setTime ( date );
    // SimpleDateFormat sdf = new SimpleDateFormat();
    // DateFormatSymbols dfs = sdf.getDateFormatSymbols();
    // String[] short_weekdays = dfs.getShortWeekdays();
    // String[] short_months = dfs.getShortMonths();
    // String[] months = dfs.getMonths();
    // String[] weekdays = dfs.getWeekdays();
    // var len: number = format.length;
    // var formatted_string: string = '';
    // var c: string = '\0';
    // var ifield: number;
    // // The values returned are as follows:
    // //
    // //            Java              This code
    // //
    // // Year:      since 1900        4-digit
    // // Month:     0 to 11           1 to 12
    // // Day:       1 to 31           1 to 31
    // // Hour:      0 to 59           same
    // // Minute:    0 to 59           same
    // // Second:    0 to 59           same
    // // DayOfWeek: 0 to 7 with 0     same
    // //            being Sunday
    // //            in U.S.
    // // First go through the % format specifiers
    // for ( var i = 0; i < len; i++ ) {
    //   c = format.charAt(i);
    //   if ( c === '%' ) {
    //     // We have a format character...
    //     ++i;
    //     if ( i >= len ) {
    //       break;	// this will exit the whole loop
    //     }
    //     c = format.charAt(i);
    //     if ( c === 'a' ) {
    //       // Abbreviated weekday name.
    //       ifield = cal.get(Calendar.DAY_OF_WEEK);
    //       formatted_string += short_weekdays[ifield];
    //     }
    //     else if ( c === 'A' ) {
    //       // Full weekday name.
    //       ifield = cal.get(Calendar.DAY_OF_WEEK);
    //       formatted_string += weekdays[ifield];
    //     }
    //     else if ( c === 'b' ) {
    //       // Abbreviated month name.
    //       ifield = cal.get(Calendar.MONTH);
    //       formatted_string +=  short_months[ifield];
    //     }
    //     else if ( c === 'B' ) {
    //       // Long month name.
    //       ifield = cal.get(Calendar.MONTH);
    //       formatted_string +=  months[ifield];
    //     }
    //     else if ( c === 'c' ) {
    //       formatted_string +=  "%c not supported" );
    //     }
    //     else if ( c === 'd' ) {
    //       // Day of month
    //       formatted_string +=  StringUtil.formatString(dateTime.getDay(),"%02d");
    //     }
    //     else if ( c === 'H' ) {
    //       // Hour of day...
    //       formatted_string +=  StringUtil.formatString(dateTime.getHour(),"%02d");
    //     }
    //     else if ( c === 'I' ) {
    //       // Hour of day 1-12
    //       if ( dateTime.getHour() > 12 ) {
    //         formatted_string += StringUtil.formatString((dateTime.getHour() - 12),"%02d");
    //       }
    //       else {
    //                   formatted_string += StringUtil.formatString(dateTime.getHour(),"%02d");
    //       }
    //     }
    //     else if ( c === 'j' ) {
    //       // Day of year...
    //       formatted_string +=  StringUtil.formatString(dateTime.getYearDay(),"%03d");
    //     }
    //     else if ( c === 'm' ) {
    //       // Month of year...
    //       formatted_string +=  StringUtil.formatString( dateTime.getMonth(),"%02d");
    //     }
    //     else if ( c === 'M' ) {
    //       // Minute of hour...
    //       formatted_string +=  StringUtil.formatString( dateTime.getMinute(),"%02d");
    //     }
    //     else if ( c === 'p' ) {
    //       // AM or PM...
    //       if ( dateTime.getHour() < 12 ) {
    //         formatted_string += "AM";
    //       }
    //       else {
    //         formatted_string += "PM";
    //       }
    //     }
    //     else if ( c === 's' ) {
    //       // Seconds since 1970-01-01 00:00:00+0000 (UTC)...
    //       formatted_string += ""+date.getTime()/1000;
    //     }
    //     else if ( c === 'S' ) {
    //       // Seconds of minute...
    //       formatted_string += StringUtil.formatString( dateTime.getSecond(),"%02d"));
    //     }
    //     else if ( (c === 'U') || (c == 'W')) {
    //       // Week of year...
    //       ifield = cal.get(Calendar.WEEK_OF_YEAR);
    //       formatted_string +=  StringUtil.formatString(ifield,"%02d");
    //     }
    //     else if ( c === 'x' ) {
    //       formatted_string +=  "%x not supported";
    //     }
    //     else if ( c === 'X' ) {
    //       formatted_string +=  "%X not supported";
    //     }
    //     else if ( c === 'y' ) {
    //       // Two digit year...
    //       formatted_string += StringUtil.formatString(formatYear(dateTime.getYear(),2,true),"%02d");
    //     }
    //     else if ( c === 'Y' ) {
    //       formatted_string +=  StringUtil.formatString(dateTime.getYear(),"%04d");
    //     }
    //     else if ( c === 'Z' ) {
    //       formatted_string +=  dateTime.getTimeZoneAbbreviation();
    //     }
    //     else if ( c === '%' ) {
    //       // Literal percent...
    //       formatted_string +=  '%';
    //     }
    //     else {
    //       // Go ahead and add the % and the character
    //       // (e.g., so the format can be passed to a secondary formatter).
    //       formatted_string +=  '%';
    //       formatted_string +=  c;
    //     }
    //   }
    //   else if ( (c === '$') && (yearType !== null) ) {
    //       // TODO SAM 2013-12-23 For now hard-code one check but as more properties are added, make the code more elegant
    //       var prop = "${dt:YearForYearType}";
    //       var iEnd: number = i + prop.length; // Last char, zero index
    //       var year = "";
    //       if ( iEnd <= format.length ) {
    //           //Message.printStatus(2, "", "substring=\"" + format.substring(i,iEnd) + "\" prop=\"" + prop + "\"");
    //           if ( format.substring(i,iEnd).toUpperCase() === prop.toUpperCase() ) {
    //               year = "" + TimeUtil.getYearForYearType(dateTime, yearType);
    //                 formatted_string += year);
    //                 i = i + prop.length - 1; // -1 because the iterator will increment by one
    //           }
    //           else {
    //               // Just add the $ and march on
    //                 formatted_string +=  c;
    //           }
    //       }
    //       else {
    //           // Just add the $ and march on
    //           formatted_string +=  c;
    //       }
    //   }
    //   else {
    //     // Just add the character to the string...
    //     formatted_string +=  c;
    //   }
    // }
    // // Next go through the ${dt:property} specifiers

    // return formatted_string;
    return;
  }

  public static formatTimeString(d0: DateTime, format: string): string {
    
    if (d0 === null) {
      d0 = new DateTime(null);
    }

    const zeroPad = (num: number, places: number) => String(num).padStart(places, '0');

    let formattedString = '';

    formattedString += d0.getYear(), 2;
    formattedString += zeroPad(d0.getMonth(), 2);
    formattedString += zeroPad(d0.getDay(), 2);
    formattedString += 'T';
    formattedString += zeroPad(d0.getHour(), 2);
    formattedString += zeroPad(d0.getMinute(), 2);
    formattedString += zeroPad(d0.getSecond(), 2);
    return moment(formattedString).format(format);
  }

  /**
  Convert between 2 and 4 digit year representations, assuming that a future year
  is not allowed (this is mainly useful to convert a 4-digit year to 2-digit).
  @param year The year to convert.
  @param len The length of the output year (either 2 or 4).
  @return The formatted 2 or 4 digit year.
  */
  public static formatYear ( year: number, len: number ): number {
    return this.formatYearFull ( year, len, false );
  }

  /**
  Convert between 2 and 4 digit year representations.
  @param year0 The year to convert.
  @param len The length of the output year (either 2 or 4).
  @param allow_future If false, indicates that the resulting 4-digit year cannot
  be a future year, based on the system clock.
  @return The formatted 2 or 4 digit year.  Return -1 if there is an error.
  */
  public static formatYearFull ( year0: number, len: number, allow_future: boolean ): number {
    var	year: number;
    var	year_offset: number;

    // Initialize return value...

    year = year0;
    
    if ( len === 2 ) {
      if ( year0 < 100 ) {
        // OK as is...
        year = year0;
        return year;
      }
      else {
        // Truncate the year to return only the last 2 digits...
        year = (year0 - ((year0/100)*100));
        return year;
      }
    }
    else if ( len === 4 ) {
      if ( year0 > 100 ) {
        // OK as is...
        year = year0;
        return year;
      }
      else {
        // Get the year offset from the system (have to assume this so old data may have problems!).
        year_offset = this.getYearOffset ();
        if ( year_offset < 0 ) {
          console.warn ( 3, "TimeUtil.formatYear", "Unable to get system year offset" );
          return -1;
        }
        // Get the current system year...
        // This does not seem to work well - it converts to Pacific time.
        //String message = "{0,date,yyyy}";
        //MessageFormat mf = new MessageFormat ( message );
        //Date now = new Date();
        //Object [] o = { now };
        var t_year: number = parseInt ( this.formatTimeString(null, "%Y"));
        year = year0 + year_offset;
        if ( (year > t_year) && !allow_future ) {
          // Don't allow future years so subract 100.
          // This comes up, for example, if the input
          // is 70 and the current year is 2002.  In this
          // case, using the system offset would give a
          // year 2070, which is in the future.  Instead,
          // we actually want 1970.  There is no simple
          // way to deal with data that is older than
          // 100 years (the user would have to supply
          // some extra information and in that case this
          // routine is pretty worthless)!
          year -= 100;
        }
        return year;
      }
    }
    else {
      // Unknown format request...
      console.warn ( 3, "TimeUtil.formatYear", "Year ndigits " + len + " not 2 or 4!" );
      return -1;
    }
  }

  /**
  Return the current system time using the specified format.
  @return The current system time as a string, using the specified format, as used by formatDateTime.
  @param format Format for date (see formatDateTime).
  */
  public static getSystemTimeString ( format: string ): string {
    return this.formatDateTime ( null, format );
  }

  /**
  @return The year offset for a 4-digit year (e.g., 1900 for 1981).  If a
  two-digit year is passed in, the offset is determined using the current system clock.
  */
  public static getYearOffset ( ): number {
    if ( this._offset_year === -10000 ) {
      // This routine really only needs to be called once per run!
      // We are now using the C version...
      //string = getSystemTimeString ( "yyyy" );
      var string = this.getSystemTimeString ( "%Y" );
        //HMPrintWarning ( 2, routine,
        //"Trouble getting year offset" );
        //return HMSTATUS_FAILURE;
      var year: number = parseInt ( string );
      string = null;
      year = year - (year/100)*100;
      TimeUtil._offset_year = year;
    }
    return TimeUtil._offset_year;
  }

  /**
  Determine whether a year is a leap year.
  Leap years occur on years evenly divisible by four.
  However, years evenly divisible by 100 are not leap
  years unless they are also evenly divisible by 400.
  @return true if the specified year is a leap year and false if not.
  @param year 4-digit year to check.
  */
  public static isLeapYear ( year: number ): boolean {
    if ((((year%4) == 0) && ((year%100) != 0)) || (((year%100) == 0) && ((year%400) == 0)) ) {
      return true;
    }
    else {
        return false;
    }
  }

  /**
  Return the number of days in a month, checking for leap year for February.
  @return The number of days in a month, or zero if an error.
  @param dt The DateTime object to examine.
  */
  public static numDaysInMonthObject ( dt: DateTime ): number {
    return TimeUtil.numDaysInMonth ( dt.getMonth(), dt.getYear() );
  }

  /**
  Return the number of days in a month, checking for leap year for February.
  @return The number of days in a month, or zero if an error.
  @param month The month of interest (1-12).
  @param year The year of interest.
  */
  public static numDaysInMonth ( month: number, year: number ): number {
    var	ndays: number;

    if ( month < 1 ) {
      // Assume that something is messed up...
      ndays = 0;
    }
    else if ( month > 12 ) {
      // Project out into the future...
      return TimeUtil.numDaysInMonth ( (month%12), (year + month/12) );
    }
    else {
      // Usual case...
      ndays = TimeUtil.MONTH_DAYS[month - 1];
      if ( (month == 2) && this.isLeapYear(year) ) {
        ++ndays;
      }
    }
    return ndays;
  }

}