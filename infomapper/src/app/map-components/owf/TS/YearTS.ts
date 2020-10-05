import { TS }           from '../TS/TS';
import { DateTime }     from '../Util/Time/DateTimeUtil';
import { TimeInterval } from '../Util/Time/TimeInterval';
import { TSData }       from '../TS/TSData';

export class YearTS extends TS {

  private _data: number[]; // This is the data space for yearly data.
  private _dataFlags: string[]; // Data flags for each yearly value.
  private _year1: number; // Bounds for allocated data.
  private _year2: number; // Bounds for allocated data.


  constructor() {
    super();
    this.yearTSinit();
  }


  /**
Allocate the data flag space for the time series.  This requires that the data
interval base and multiplier are set correctly and that _date1 and _date2 have
been set.  The allocateDataSpace() method will allocate the data flags if
appropriate.  Use this method when the data flags need to be allocated after the initial allocation.
@param initialValue Initial value (null is allowed and will result in the flags being initialized to spaces).
@param retainPreviousValues If true, the array size will be increased if necessary, but
previous data values will be retained.  If false, the array will be reallocated and initialized to spaces.
@exception Exception if there is an error allocating the memory.
*/
public allocateDataFlagSpace ( initialValue: string, retainPreviousValues: boolean ): void {
  var routine="YearTS.allocateDataFlagSpace", message: string;

	if ( (this._date1 == null) || (this._date2 == null) ) {
		message = "Dates have not been set.  Cannot allocate data flag space";
		console.warn ( 2, routine, message );
		throw new Error ( message );
	}
	if ( this._data_interval_mult != 1 ) {
		// Do not know how to handle N-year interval...
		message = "Only know how to handle 1 year data, not " + this._data_interval_mult + "-year";
		console.warn ( 3, routine, message );
		throw new Error ( message );
	}
	
	if ( initialValue == null ) {
	    initialValue = "";
	}
	
	var nyears: number = this._date2.getYear() - this._date1.getYear() + 1;

	if ( nyears == 0 ) {
		message="TS has 0 years POR, maybe dates haven't been set yet.";
		console.warn( 2, routine, message );
		throw new Error ( message );
	}

	var dataFlagsPrev: string[] = null;
	if ( this._has_data_flags && retainPreviousValues ) {
		// Save the reference to the old flags array...
		dataFlagsPrev = this._dataFlags;
	}
	else {
	    // Turn on the flags...
      this._has_data_flags = true;
	}
	// Top-level allocation...
	this._dataFlags = new String[nyears];

	// Allocate memory...

	var internDataFlagStrings: boolean = this.getInternDataFlagStrings();
	for ( let iYear = 0; iYear < nyears; iYear++ ) {
	    if ( internDataFlagStrings ) {
        this._dataFlags[iYear] = initialValue;// .intern();
	    }
	    else {
        this._dataFlags[iYear] = initialValue;
	    }
		if(retainPreviousValues && (dataFlagsPrev != null)){
			// Copy the old values (typically shorter character arrays)...
		    if ( internDataFlagStrings ) {
          this._dataFlags[iYear] = dataFlagsPrev[iYear]; //.intern();
		    }
		    else {
          this._dataFlags[iYear] = dataFlagsPrev[iYear];
		    }
		}
	}
}

  /**
  Allocate the data space and initialize using the default missing data value.
  @return Zero if successful, non-zero if not.
  */
  public allocateDataSpace(): number {
    return this.allocateDataSpace1 ( this._missing );
  }

  /**
  Allocate the data space and initialize using the specified data value.
  @return Zero if successful, non-zero if not.
  @param value Value used to initialize data space.
  */
  public allocateDataSpace1( value: number ): number {
    if ( (this._date1 == null) || (this._date2 == null) ) {
      console.warn ( 2, "YearTS.allocateDataSpace",
      "Dates have not been set.  Cannot allocate data space" );
      return 1;
    }
    
    var nyears: number = this._date2.getYear() - this._date1.getYear() + 1;

    if( nyears == 0 ){
      console.warn( 2, "YearTS.allocateDataSpace",
      "TS has 0 years POR, maybe Dates haven't been set yet" );
      return 1;
    }
    
    this._data = new Array<number>(nyears);

    if ( this._has_data_flags ) {
      this._dataFlags = new Array<string>(nyears);
    }

    for ( let iYear = 0; iYear < nyears; iYear++ ) {
      this._data[iYear] = value;
      if ( this._has_data_flags ) {
        this._dataFlags[iYear] = "";
      }
    }

    // Calculate the data size...

    var datasize = YearTS.calculateDataSize(this._date1, this._date2, this._data_interval_mult);
    this.setDataSize ( datasize );

    // Calculate the date limits to optimize the set/get routines...

    this._year1 = this._date1.getYear();
    this._year2 = this._date2.getYear();

    // if ( Message.isDebugOn ) {
    //   Message.printDebug( 10, "YearTS.allocateDataSpace", "Successfully allocated " + nyears +
    //   " years of memory " + _year1 + " to " + _year2 + " (" + datasize + " values)" ); 
    // }

    return 0;
  }

  /**
  Determine the number of data intervals in a period.
  @return The number of data points for a year time series.
  given the data interval multiplier for the specified period.
  @param start_date The first date of the period.
  @param end_date The last date of the period.
  @param interval_mult The time series data interval multiplier.
  */
  public static calculateDataSize ( start_date: DateTime, end_date: DateTime, interval_mult: number ): number {
    var routine = "YearTS.calculateDataSize";

    if ( start_date == null ) {
      console.warn ( 2, routine, "Start date is null" );
      routine = null;
      return 0;
    }
    if ( end_date == null ) {
      console.warn ( 2, routine, "End date is null" );
      routine = null;
      return 0;
    }
    if ( interval_mult != 1 ) {
      console.warn ( 1, routine, "Do not know how to handle N-year (" + interval_mult + ") time series" );
      routine = null;
      return 0;
    }
    var datasize: number = end_date.getYear() - start_date.getYear() + 1;
    routine = null;
    return datasize;
  }

  /**
  Return a data point for the date.
  <pre>
                Yearly data is stored in a one-dimensional array:
            |
            |
            \|/
          year 
  </pre>
  @param date date/time to get data.
  @param tsdata if null, a new instance of TSData will be returned.  If non-null, the provided
  instance will be used (this is often desirable during iteration to decrease memory use and
  increase performance).
  @return a TSData for the specified date/time.
  @see TSData
  */
  public getDataPoint ( date: DateTime, tsdata: TSData ): TSData {
    // Initialize data to most of what we need...
    if ( tsdata == null ) {
      // Allocate it...
      tsdata = new TSData();
    }
      if ( (this._data === null) || (date === null) ) {
          tsdata.setDate(null);
          tsdata.setDataValue(this._missing);
          tsdata.setDataFlag("");
          return tsdata;
      }
    if ( (date.lessThan(this._date1)) || (date.greaterThan(this._date2)) ) {
      // if ( Message.isDebugOn ) {
      //   Message.printDebug ( 50, "YearTS.getDataValue",
      //       date + " not within POR (" + _date1 + " - " + _date2 + ")" );
      // }
      tsdata.setValues ( date, this._missing, this._data_units, "", 0 );
      return tsdata;
    }
    if ( this._has_data_flags ) {
      var index: number = date.getYear() - this._year1;
      if ( (index < 0) || (index >= this._dataFlags.length) ) {
        tsdata.setValues ( date, this.getDataValue(date),
        this._data_units, "", // No flag for date
          0 );
      }
      else {
          if ( this._internDataFlagStrings ) {
              tsdata.setValues ( date, this.getDataValue(date), this._data_units, this._dataFlags[date.getYear()-this._year1], 0 );
          }
          else {
              tsdata.setValues ( date, this.getDataValue(date), this._data_units, this._dataFlags[date.getYear()-this._year1], 0 ); 
          }
      }
    }
    else {
      tsdata.setValues ( date, this.getDataValue(date), this._data_units, "", 0 );
    }
    return tsdata;
  }

  /**
  Return a data value for the date.
          Year data is stored in a one-dimensional array:
            |
            |
           \|/
          year 
  @return The data value corresponding to the specified date.  If the date is
  not found in the period, a missing data value is returned.
  @param date Date of interest.
  */
  public getDataValue ( date: DateTime ): number
  {	// Check the date coming in...

    if ( (this._data == null) || (date == null) ) {
      return this._missing;
    }

    var year: number = date.getYear();

    if(	(year < this._year1) || (year > this._year2) ) {
      // Wrap in debug to improve performance...
      // if ( Message.isDebugOn ) {
      //   Message.printWarning( 2, "YearTS.getDataValue", year + " not within POR (" + _year1 + " - " + _year2 + ")" );
      // }
      return this._missing;
    }

    // THIS CODE MUST MATCH THAT IN setDataValue...

    var row: number = year - this._year1;

    // ... END MATCHING CODE

    // if ( Message.isDebugOn ) {
    //   Message.printDebug( 30, "YearTS.getDataValue", _data[row] + " for " + year + " from _data[" + row + "]" );
    // }

    return this._data[row];
  }

  /**
  Set the data value for the given date.
  @param date Date to set value.
  @param value Value for the date.
  */
  public setDataValueTwo( date: DateTime, value: number ): void {
    if ( date == null ) {
      return;
    }

    var year: number = date.getYear();

    if(	(year < this._year1) || (year > this._year2) ) {
      // Wrap in debug to improve performance...
      // if ( Message.isDebugOn ) {
      // 	Message.printWarning( 2, "YearTS.setDataValue", year + " not within POR (" + _year1 + " - " + _year2 + ")" );
      // }
      return;
    }

    // THIS CODE MUST MATCH THAT IN setDataValue...

    var row: number = year - this._year1;

    // ... END MATCHING CODE

    // if ( Message.isDebugOn ) {
    // 	Message.printDebug( 30, "YearTS.setDataValue", "Setting " + value + " " + year + " at " + row );
    // }

    // Set the dirty flag so that we know to recompute the limits if desired...

    this._dirty = true;

    this._data[row] = value;
  }

  /**
  Set the data value for the given date.
  @param date Date to set value.
  @param value Value for the date.
  @param data_flag data_flag Data flag for value.
  @param duration Duration for value (ignored - assumed to be 1-day or
  instantaneous depending on data type).
  */
  public setDataValueFour ( date: DateTime, value: number, data_flag: string, duration: number ): void {
    if ( date == null ) {
      return;
    }

    var year: number = date.getYear();

    if(	(year < this._year1) || (year > this._year2) ) {
      // Wrap in debug to improve performance...
      // if ( Message.isDebugOn ) {
      // 	Message.printWarning( 2, "YearTS.setDataValue", year + " not within POR (" + _year1 + " - " + _year2 + ")" );
      // }
      return;
    }

    // THIS CODE MUST MATCH THAT IN setDataValue...

    var row: number = year - this._year1;

    // ... END MATCHING CODE

    // if ( Message.isDebugOn ) {
    // 	Message.printDebug( 30, "YearTS.setDataValue", "Setting " + value + " " + year + " at " + row );
    // }

    // Set the dirty flag so that we know to recompute the limits if desired...

    this._dirty = true;

    this._data[row] = value;
      if ( (data_flag != null) && (data_flag.length > 0) ) {
          if ( !this._has_data_flags ) {
              // Trying to set a data flag but space has not been allocated, so allocate the flag space
              try {
                this.allocateDataFlagSpace(null, false );
              }
              catch ( e ) {
                  // Generally should not happen - log as debug because could generate a lot of warnings
                  // if ( Message.isDebugOn ) {
                  //     Message.printDebug(30, "YearTS.setDataValue", "Error allocating data flag space (" + e +
                  //         ") - will not use flags." );
                  // }
                  // Make sure to turn flags off
                  this._has_data_flags = false;
              }
          }
      }
    if ( this._has_data_flags && (data_flag != null) ) {
        if ( this._internDataFlagStrings ) {
          this._dataFlags[row] = data_flag; //.intern();
        }
        else {
          this._dataFlags[row] = data_flag;
        }
    }
  }


  /**
  Initialize instance.
  */
  private yearTSinit(): void {
    this._data = null;
    this._data_interval_base = TimeInterval.YEAR;
    this._data_interval_mult = 1;
    this._data_interval_base_original = TimeInterval.YEAR;
    this._data_interval_mult_original = 1;
    this._year1 = 0;
    this._year2 = 0;
  }

}