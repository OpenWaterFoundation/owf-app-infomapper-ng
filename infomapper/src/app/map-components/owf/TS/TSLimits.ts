import { TS }       from '../TS/TS';
import { DateTime } from '../Util/Time/DateTimeUtil';


export class TSLimits {

  // Public flags...

  /**
  Flags used to indicate how limits are to be computed.
  The following indicates that a time series' full limits should be refreshed.
  This is generally used only by code internal to the TS library.
  */
  REFRESH_TS: number = 0x1;

  /**
  Do not compute the total limits (using this TSLimits class).  This is used by
  classes such as MonthTSLimits to increase performance.
  */
  NO_COMPUTE_TOTALS: number = 0x2;

  /**
  Do not compute the detailed limits (e.g., using MonthTSLimits).  This is used by
  classes such as MonthTSLimits to increase performance.
  */
  NO_COMPUTE_DETAIL: number = 0x4;

  /**
  Ignore values <= 0 when computing averages (treat as missing data).
  This make sense for time series
  such as reservoirs and flows.  It may be necessary at some point to allow any
  value to be ignored but <= 0 is considered a common and special case.
  */
  IGNORE_LESS_THAN_OR_EQUAL_ZERO: number = 0x8;

  // Data members...

  private __ts: TS = null;	// Time series being studied.
  private __date1: DateTime;
  private __date2: DateTime;
  public _flags: number;		// Flags to control behavior.
  private __max_value: number;
  private  __max_value_date: DateTime;
  private __mean: number;
  private __median: number;
  private __min_value: number;
  private __min_value_date: DateTime;
  private __missing_data_count: number;
  private __non_missing_data_count: number;
  private __non_missing_data_date1: DateTime;
  private __non_missing_data_date2: DateTime;
  private __skew: number;
  private __stdDev: number;
  private __sum: number;
  private __data_units: string = ""; // Data units (just copy from TS at the time of creation).

  private __found: boolean = false;

  /**
  Default constructor.  Initialize the dates to null and the limits to zeros.
  */
  constructor () {
    this.initialize();
  }


  /**
  Check to see if ALL the dates have been set (are non-null) and if so set the
  _found flag to true.  If a TSLimits is being used for something other than fill
  limits analysis, then external code may need to call setLimitsFound() to manually set the found flag.
  */
  private checkDates (): void {
    if ( (this.__date1 !== null) && (this.__date2 !== null) &&
      (this.__max_value_date !== null) && (this.__min_value_date !== null) &&
      (this.__non_missing_data_date1 !== null) && (this.__non_missing_data_date2 !== null) ) {
      // The dates have been fully processed (set)...
      this.__found = true;
    }
  }

  /**
  Return the first date for the time series according to the memory allocation.
  @return The first date for the time series according to the memory allocation.
  A copy of the date is returned.
  */
  public getDate1 (): DateTime {
    if ( this.__date1 === null ) {
      return this.__date1;
    }
    return DateTime.copyConstructor(this.__date1);
  }

  /**
  Return the last date for the time series according to the memory allocation.
  @return The last date for the time series according to the memory allocation.
  A copy of the date is returned.
  */
  public getDate2 (): DateTime
  {	if ( this.__date2 === null ) {
      return this.__date2;
    }
    return DateTime.copyConstructor ( this.__date2 );
  }


  /**
  Initialize the data.
  Need to rework code to use an instance of TS so we can initialize to missing
  data values used by the time series!
  */
  initialize () {	
    this.__ts = null;
    this.__data_units = "";
    this.__date1 = null;
    this.__date2 = null;
    this._flags = 0;
    this.__max_value = 0.0;
    this.__max_value_date = null;
    this.__mean = -999.0; // Assume.
    this.__median = NaN; // Assume.
    this.__min_value = 0.0;
    this.__min_value_date = null;
    this.__missing_data_count = 0;
    this.__non_missing_data_count = 0;
    this.__non_missing_data_date1 = null;
    this.__non_missing_data_date2 = null;
    this.__skew = NaN;
    this.__stdDev = NaN;
    this.__sum = -999.0;		// Assume.
    this.__found = false;
  }

  /**
  Set the first date for the time series.  This is used for memory allocation.
  @param date1 The first date for the time series.
  @see TS#allocateDataSpace
  */
  public setDate1 ( date1: DateTime ): void {
    if ( date1 !== null ) {
      this.__date1 = DateTime.copyConstructor(date1) ;
    }
    this.checkDates();
  }

  /**
  Set the last date for the time series.  This is used for memory allocation.
  @param date2 The last date for the time series.
  @see TS#allocateDataSpace
  */
  public setDate2 ( date2: DateTime ): void {
    if ( date2 !== null ) {
      this.__date2 = DateTime.copyConstructor(date2) ;
    }
    this.checkDates();
  }

  /**
  Set whether the limits have been found.  This is mainly used by routines in
  the package when only partial limits are needed (as opposed to checkDates(),
  which checks all the dates in a TSLimits).  Call this method after any methods
  that set the date to offset the check done by checkDates().
  @param flag Indicates whether the limits have been found (true or false).
  */
  public setLimitsFound ( flag: boolean ): void {
    this.__found = flag;
  }

}