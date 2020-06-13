import { DateTime }   from './DateTime';

import * as moment from 'moment';


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


  public static formatTimeString(d0: DateTime, format: string): string {

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