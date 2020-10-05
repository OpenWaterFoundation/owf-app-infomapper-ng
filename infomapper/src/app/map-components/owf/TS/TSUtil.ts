import { TS }           from '../TS/TS';
import { TSIdent }      from '../TS/TSIdent';
import { TimeInterval } from '../Util/Time/TimeInterval';
import { YearTS }       from '../TS/YearTS';
import { MonthTS }      from '../TS/MonthTS';
import { TSLimits }     from './TSLimits';
import { DateTime }     from '../Util/Time/DateTimeUtil';


export class TSUtil {

  /**
  Used with getPeriodFromTS, and getPeriodFromLimits and others.  Find the maximum period.
  */
  public static MAX_POR = 0;
  /**
  Used with getPeriodFromTS and others.  Find the minimum (overlapping) period.
  */
  public static MIN_POR = 1;


  // FIXME SAM 2009-10-05 Evaluate whether to keep this or intervalsMatch()
  /**
  Determine whether the intervals for the time series are the same (the base and
  multiplier for the interval must agree).
  @return true if the intervals are the same.
  @param tslist list of time series.
  */
  public static areIntervalsSame ( tslist: TS[] ): boolean
  {
    if ( tslist === null ) {
      // No units.  Decide later whether to throw an exception.
      return true;
    }
    var size = tslist.length;
    if ( size < 2 ) {
      // No need to compare...
      return true;
    }
    // Loop through the time series and the intervals...
    var ts: TS = null;
    var interval_base: number, interval_base0 = 0;
    var interval_mult: number, interval_mult0 = 0;
    var first_found = false;
    for ( var i = 0; i < size; i++ ) {
      ts = tslist[i];
      if ( ts == null ) {
        continue;
      }
      if ( !first_found ) {
        // Initialize...
        interval_base0 = ts.getDataIntervalBase();
        interval_mult0 = ts.getDataIntervalMult();
        first_found = true;
        continue;
      }
      interval_base = ts.getDataIntervalBase();
      interval_mult = ts.getDataIntervalMult();
      if ( (interval_base != interval_base0) || (interval_mult != interval_mult0) ) {
        return false;
      }
    }
    return true;
  }

  /**
  Determine the limits for a list of time series.
  <pre>
  Example of POR calculation:
    |         ------------------------  	TS1
    |   -------------------    	TS2
    |                --------------  TS3
    ----------------------------------------------
        ------------------------------  MAX_POR
                      ------             MIN_POR
  </pre>
  @return The TSLimits for the list of time series (recomputed).  If the limits
  do not overlap, return the maximum.
  @param ts A vector of time series of interest.
  @param por_flag Use a *_POR flag.
  @exception RTi.TS.TSException If the period cannot be determined from the time series.
  */
  public static getPeriodFromTS ( ts: TS[], por_flag: number ): TSLimits {
    var	message: string, routine="TSUtil.getPeriodFromTS";
    var tsPtr: TS = null;
    var	dl = 10, i = 0;
    var end: DateTime, tsPtr_end: DateTime, tsPtr_start: DateTime, start: DateTime;

    if( ts == null ) {
      message = "Unable to get period for time series - time series list is null";
      console.warn(3, routine, message );
      throw new Error ( message );
    }

    var vectorSize: number = ts.length;
    // if ( Message.isDebugOn ) {
    //   Message.printDebug ( dl, routine,
    //   "Getting " + por_flag + "-flag limits for " + vectorSize + " time series" );
    // }
    if( vectorSize === 0 ) {
      message="Unable to get period for time series - time series list is zero size";
      console.warn(3, routine, message );
      throw new Error ( message );
    }
    if ( (por_flag !== TSUtil.MIN_POR) && (por_flag !== TSUtil.MAX_POR) ) {
      message = "Unknown option for TSUtil.getPeriodForTS" + por_flag;
      console.warn ( 3, routine, message );
      throw new Error ( message );
    }

    // Initialize the start and end dates to the first TS dates...

    var nullcount = 0;
    for ( var its = 0; its < vectorSize; its++ ) {
      tsPtr = ts[its];
      if ( tsPtr !== null ) {
        if ( tsPtr.getDate1() !== null ) {
          start = tsPtr.getDate1();
        }
        if ( tsPtr.getDate2() !== null ) {
          end = tsPtr.getDate2();
        }
        if ( (start !== null) && (end !== null) ) {
          // Done looking for starting date/times
          break;
        }
      }
      else {
        ++nullcount;
      }
    }
    // if ( Message.isDebugOn ) {
    //   Message.printDebug ( dl, routine, "Starting comparison dates " + start + " " + end );
    // }

    if ( (start === null) || (end === null) ) {
      message = "Unable to get period (all null dates) from " + vectorSize + " time series (" + nullcount +
          " null time series).";
      console.warn ( 2, routine, message );
      throw new Error ( message );
    }

    // Now loop through the remaining time series...

    for( var i = 1; i < vectorSize; i++ ) {
      tsPtr = ts[i];

      if( tsPtr === null ) {
        // Ignore the time series...
        continue;
      }
      tsPtr_start = tsPtr.getDate1();
      tsPtr_end = tsPtr.getDate2();
      if ( (tsPtr_start === null) || (tsPtr_end === null) ) {
        continue;
      }
      // Message.printDebug ( dl, routine, "Comparison dates " + tsPtr_start + " " + tsPtr_end );

      if ( por_flag === TSUtil.MAX_POR ) {
        if( tsPtr_start.lessThan(start) ) {
          start = new DateTime ( tsPtr_start );
        }
        if( tsPtr_end.greaterThan(end) ) {
          end = new DateTime ( tsPtr_end );
        }
      }
      else if ( por_flag === TSUtil.MIN_POR ) {
        if( tsPtr_start.greaterThan(start) ) {
          start = new DateTime ( tsPtr_start );
        }
        if( tsPtr_end.lessThan(end) ) {
          end = new DateTime ( tsPtr_end );
        }
      }
    }
    // If the time series do not overlap, then the limits may be reversed.  In this case, throw an exception...
    if ( start.greaterThan(end) ) {
      message = "Periods do not overlap.  Can't determine minimum period.";
      console.warn ( 2, routine, message );
      throw new Error ( message );
    }

    // if ( Message.isDebugOn ) {
    //   if ( por_flag == MAX_POR ) {
    //     Message.printDebug( dl, routine, "Maximum POR limits are " + start + " to " + end );
    //   }
    //   else if ( por_flag == MIN_POR ) {
    //     Message.printDebug( dl, routine, "Minimum POR limits are " + start + " to " + end );
    //   }
    // }

    // Now return the dates as a new instance so we don't mess up what was in the time series...

    var limits: TSLimits = new TSLimits();
    limits.setDate1 (start);
    limits.setDate2 (end);
    limits.setLimitsFound ( true );
    return limits;
  }

  static newTimeSeries( id: string, long_id: boolean ) {
    let intervalBase = 0;
    let intervalMult = 0;
    let intervalString = "";
    if ( long_id ) {
      // Create a TSIdent so that the type of time series can be determined...
      let tsident = new TSIdent({id: id});

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
        throw new Error('MinuteTS has not yet been implemented');
        // ts = new MinuteTS();
      }
      else if ( intervalBase == TimeInterval.HOUR ) {
        throw new Error('HourTS has not yet been implemented');
        // ts = new HourTS();
      }
      else if ( intervalBase == TimeInterval.DAY ) {
        throw new Error('DayTS has not yet been implemented');
        // ts = new DayTS();
      }
      else if ( intervalBase == TimeInterval.MONTH ) {        
        ts = new MonthTS();
      }
      else if ( intervalBase == TimeInterval.YEAR ) {
        // throw new Error('YearTS has not yet been implemented');
        ts = new YearTS();
      }
      else if ( intervalBase == TimeInterval.IRREGULAR ) {
        throw new Error('IrregularTS has not yet been implemented');
        // ts = new IrregularTS();
      }
      else {
            console.error("Cannot create a new time series for \"" + id + "\" (the interval \"" +
                intervalString + "\" [" + intervalBase + "] is not recognized).");
        // console.warn ( 3, "TSUtil.newTimeSeries", message );
        // throw new Exception ( message );
      }
  
      // Set the multiplier...
      ts.setDataInterval(intervalBase,intervalMult);
      ts.setDataIntervalOriginal(intervalBase,intervalMult);
      // Set the genesis information
      // ts.addToGenesis( "Created new time series with interval determined from TSID \"" + id + "\"" );
  
      // Return whatever was created...   
      return ts;
  }
}