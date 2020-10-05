import { TS }           from '../TS/TS';
import { DateTime }     from '../Util/Time/DateTimeUtil';
import { TimeInterval } from '../Util/Time/TimeInterval';
import { TSData }       from '../TS/TSData';

export class MonthTS extends TS {

  private	_data: number[][]; // This is the data space for monthly values.  The dimensions are [year][month]
  _dataFlags: string[][]; // Data flags for each monthly value.  The dimensions are [year][month]
  _min_amon: number; // Minimum absolute month stored.
  _max_amon: number; // Maximum absolute month stored.
  private _pos: number[] = null; // Use to return data without creating memory all the time.

  /**
  Constructor.  Set the dates and call allocateDataSpace() to create space for data.
  */
  constructor ( ) {
    super();    
    this.monthTSInit();
  }

  /*
  Allocate the data space for the time series.  The start and end dates and the
  data interval multiplier must have been set.  Initialize the space with the missing data value.
  */
  public allocateDataSpace(): number {
    return this.allocateDataSpace1 ( this._missing );
  }

  /**
  Allocate the data space for the time series.  The start and end dates and the
  data interval multiplier must have been set.  Fill with the specified data value.
  @param value Value to initialize data space.
  @return 1 if the allocation fails, 0 if a success.
  */
  public allocateDataSpace1 ( value: number ): number {    
    // let routine="MonthTS.allocateDataSpace";
    let	iYear: number, nyears = 0;

    if ( (this._date1 == null) || (this._date2 == null) ) {
      // Message.printWarning ( 2, routine, "Dates have not been set.  Cannot allocate data space" );
      return 1;
    }
    if ( this._data_interval_mult != 1 ) {
      // Do not know how to handle N-month interval...
      // Message.printWarning ( 2, routine, "Only know how to handle 1 month data, not " + _data_interval_mult + "-month" );
      return 1;
    }
    
    nyears = this._date2.getYear() - this._date1.getYear() + 1;

    if( nyears == 0 ) {
      // Message.printWarning( 3, routine, "TS has 0 years POR, maybe dates haven't been set yet" );
      return 1;
    }

    this._data = new Array<Array<number>>();
    if ( this._has_data_flags ) {
      this._dataFlags = new Array<Array<string>>();
    }

    // Allocate memory...    

    let iMonth: number, nvals = 12;
    for ( iYear = 0; iYear < nyears; iYear++ ) {
      this._data[iYear] = new Array<number>(nvals);
      if ( this._has_data_flags ) {
        this._dataFlags[iYear] = new Array<string>(nvals);
      }

      // Now fill with the missing data value...

      for ( iMonth = 0; iMonth < nvals; iMonth++ ) {
        this._data[iYear][iMonth] = value;
        if ( this._has_data_flags ) {
          this._dataFlags[iYear][iMonth] = "";
        }
      }
    }

    // Set the data size...

    let datasize: number = this.calculateDataSize ( this._date1, this._date2, this._data_interval_mult);
    this.setDataSize ( datasize );

    // Set the limits used for set/get routines...

    this._min_amon = this._date1.getAbsoluteMonth();
    this._max_amon = this._date2.getAbsoluteMonth();

    // if ( Message.isDebugOn ) {
    //   Message.printDebug( 10, routine,
    //   "Successfully allocated " + nyears + " yearsx12 months of memory (" + datasize + " values)" ); 
    // }

    // routine = null;
    return 0;
  }

  /**
  Allocate the data flag space for the time series.  This requires that the data
  interval base and multiplier are set correctly and that _date1 and _date2 have
  been set.  The allocateDataSpace() method will allocate the data flags if
  appropriate.  Use this method when the data flags need to be allocated after the initial allocation.
  @param initialValue Initial value (null will be converted to an empty string).
  @param retainPreviousValues If true, the array size will be increased if necessary, but
  previous data values will be retained.  If false, the array will be reallocated and initialized to spaces.
  @exception Exception if there is an error allocating the memory.
  */
  public allocateDataFlagSpace ( initialValue: string, retainPreviousValues: boolean ): void {
    var	routine = "MonthTS.allocateDataFlagSpace", message: string;
    var	i: number, nyears = 0;

    if ( (this._date1 == null) || (this._date2 == null) ) {
      message ="Dates have not been set.  Cannot allocate data space";
      console.warn ( message );
      throw new Error ( message );
    }
    if ( this._data_interval_mult != 1 ) {
      // Do not know how to handle N-month interval...
      message = "Only know how to handle 1 month data, not " + this._data_interval_mult + "-month";
      console.warn ( message );
      throw new Error ( message );
    }
    
    if ( initialValue == null ) {
        initialValue = "";
    }
    
    nyears = this._date2.getYear() - this._date1.getYear() + 1;
    
    if( nyears == 0 ){
      message="TS has 0 years POR, maybe Dates haven't been set yet";
      console.warn( message );
      throw new Error ( message );
    }

    var dataFlagsPrev: string[][] = null;
    if ( this._has_data_flags && retainPreviousValues ) {
      // Save the reference to the old flags array...
      dataFlagsPrev = this._dataFlags;
    }
    else {
        // Turn on the flags...
      this._has_data_flags = true;
    }
    // Top-level allocation...
    this._dataFlags = new Array<Array<string>>(nyears);

    // Allocate memory...

    var j: number, nvals = 12;
    var internDataFlagStrings: boolean = super.getInternDataFlagStrings();
    for ( i = 0; i < nyears; i++ ) {
      this._dataFlags[i] = new Array<string>(nvals);

      // Now fill with the initial data value...

      for ( j = 0; j < nvals; j++ ) {
        // Initialize with initial value...
          if ( internDataFlagStrings ) {
            this._dataFlags[i][j] = initialValue; // .intern();
          }
          else {
            this._dataFlags[i][j] = initialValue;
          }
        if(retainPreviousValues && (dataFlagsPrev != null)){
          // Copy over the old values (typically shorter character arrays)...
            if ( internDataFlagStrings ) {
              this._dataFlags[i][j] = dataFlagsPrev[i][j]; // .intern();
            }
            else {
              this._dataFlags[i][j] = dataFlagsPrev[i][j];
            }
        }
      }
    }
  }

  /**
  Calculate and return the number of data points that have been allocated.
  @return The number of data points for a month time series
  given the data interval multiplier for the specified period, including missing data.
  @param start_date The first date of the period.
  @param end_date The last date of the period.
  @param interval_mult The time series data interval multiplier.
  */
  public calculateDataSize ( start_date: DateTime, end_date: DateTime, interval_mult: number ): number {
    // String routine = "MonthTS.calculateDataSize";
    let datasize = 0;

    // if ( start_date == null ) {
    //   Message.printWarning ( 2, routine, "Start date is null" );
    //   return 0;
    // }
    // if ( end_date == null ) {
    //   Message.printWarning ( 2, routine, "End date is null" );
    //   return 0;
    // }

    if ( interval_mult != 1 ) {
      // Message.printWarning ( 3, routine, "Do not know how to handle N-month time series" );
      console.error ( "Do not know how to handle N-month time series" );
      return 0;
    }
    datasize = end_date.getAbsoluteMonth() - start_date.getAbsoluteMonth() + 1;
    // routine = null;
    return datasize;
  }

  /**
  Return the data point for a date.
  <pre>
              Monthly data is stored in a two-dimensional array:
            |----------------> 12 calendar months
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
    if ( tsdata === null ) {
      // Allocate it (this is the only method that uses it and don't want to waste memory)...
      tsdata = new TSData();
    }
    if ( (date.lessThan(this._date1)) || (date.greaterThan(this._date2)) ) {
      // if ( Message.isDebugOn ) {
      //   Message.printDebug ( 50, "MonthTS.getDataValue",
      //   date + " not within POR (" + this._date1 + " - " + this._date2 + ")" );
      // }
      tsdata.setValues ( date, this._missing, this._data_units, "", 0 );
      return tsdata;
    }
    this.getDataPosition ( date );
    if ( this._has_data_flags ) {
      if ( this._internDataFlagStrings ) {
          tsdata.setValues ( date, this.getDataValue(date), this._data_units, this._dataFlags[this._pos[0]][this._pos[1]], 0 );
      }
      else {
          tsdata.setValues ( date, this.getDataValue(date), this._data_units, this._dataFlags[this._pos[0]][this._pos[1]], 0 );
      }
    }
    else {
      tsdata.setValues ( date, this.getDataValue(date), this._data_units, "", 0 );
    }
    return tsdata;
  }

  // TODO SAM 2010-07-30 Evaluate how to make private - currently StringMonthTS uses
  /**
  Return the data position.
  <pre>
                Monthly data is stored in a two-dimensional array:
            |----------------> 12 calendar months
            |
            \|/
          year 
  </pre>
  @return An array of integers containing the position in the data array
  corresponding to the date.  Return null if the date is outside the period of
  record.  The array that is used is re-used in order to increase performance.  You
  must copy the information after the return to ensure protecting the data.
  @param date Date of interest.
  */
  protected getDataPosition ( date: DateTime ): number[]
  {	// Do not define routine here to increase performance.

    // We don't care if data exists, but do care if dates are null...

    if ( date == null ) {
      return null;
    }
    if ( (this._date1 == null) || (this._date2 == null) ) {
      return null;
    }

    // Check the date coming in...

    var amon: number = date.getAbsoluteMonth();

    if ( (amon < this._min_amon) || (amon > this._max_amon) ) {
      // Print within debug to optimize performance...
      // if ( Message.isDebugOn ) {
      //   Message.printWarning( 50, "MonthTS.getDataPosition", date + " not within POR (" + _date1 + " - " + _date2 + ")" );
      // }
      return null;
    }

    this._pos[0] = date.getYear() - this._date1.getYear();
    this._pos[1] = date.getMonth() - 1;	// Zero offset!

    return this._pos;
  }

  /**
  Return the data value for a date.
  <pre>
              Monthly data is stored in a two-dimensional array:
            |----------------> 12 calendar months
            |
            \|/
          year 
  </pre>
  @return The data value corresponding to the date, or missing if the date is not found.
  @param date Date of interest.
  */
  public getDataValue( date: DateTime ): number {
    // Do not define routine here to increase performance.

    if ( this._data == null ) {
      return this._missing;
    }

    // Check the date coming in...

    var amon = date.getAbsoluteMonth();

    if ( (amon < this._min_amon) || (amon > this._max_amon) ) {
      // Print within debug to optimize performance...
      // if ( Message.isDebugOn ) {
      //   Message.printWarning( 50, "MonthTS.getDataValue", date + " not within POR (" + _date1 + " - " + _date2 + ")" );
      // }
      return this._missing;
    }

    // THIS CODE NEEDS TO BE EQUIVALENT IN setDataValue...

    var row: number = date.getYear() - this._date1.getYear();
    var column: number = date.getMonth() - 1; // Zero offset!

    // ... END OF EQUIVALENT CODE.

    // if ( Message.isDebugOn ) {
    //   Message.printDebug( 50, "MonthTS.getDataValue",
    //   _data[row][column] + " for " + date + " from _data[" + row + "][" + column + "]" );
    // }
    return( this._data[row][column] );
  }

  /**
  Initialize instance.
  */
  monthTSInit( ) {
    this._data = null;
    this._data_interval_base = TimeInterval.MONTH;
    this._data_interval_mult = 1;
    this._data_interval_base_original = TimeInterval.MONTH;
    this._data_interval_mult_original = 1;
    this._pos = [];
    this._pos[0] = 0;
    this._pos[1] = 0;
    this._min_amon = 0;
    this._max_amon = 0;
  }

  /**
  Set the data value for the specified date.
  @param date Date of interest.
  @param value Value corresponding to date.
  */
  public setDataValueTwo( date: DateTime, value: number ): void {
    // Do not define routine here to increase performance.
    // Check the date coming in...

    if ( date == null ) {
      return;
    }

    let amon = date.getAbsoluteMonth();

    if ( (amon < this._min_amon) || (amon > this._max_amon) ) {
      // Print within debug to optimize performance...
      // if ( Message.isDebugOn ) {
      //   Message.printWarning( 50, "MonthTS.setDataValue", date + " not within POR (" + _date1 + " - " + _date2 + ")" );
      // }
      return;
    }

    // THIS CODE NEEDS TO BE EQUIVALENT IN setDataValue...
    let row: number = date.getYear() - this._date1.getYear();
    let column: number = date.getMonth() - 1; // Zero offset!
    
    

    // ... END OF EQUIVALENT CODE.

    // if ( Message.isDebugOn ) {
    //   Message.printDebug( 50, "MonthTS.setDataValue", "Setting " + value + " " + date + " at " + row + "," + column );
    // }

    // Set the dirty flag so that we know to recompute the limits if desired...
    

    this._dirty = true;
    this._data[row][column] = value;

  }

  /**
  Set the data value for the specified date.
  @param date Date of interest.
  @param value Value corresponding to date.
  @param data_flag Data flag for value.
  @param duration Duration for value (ignored - assumed to be 1-month or instantaneous depending on data type).
  */
  public setDataValueFour ( date: DateTime, value: number, data_flag: string, duration: number ): void {
    // Do not define routine here to increase performance.

    // Check the date coming in...

    if ( date == null ) {
      return;
    }

    var amon: number = date.getAbsoluteMonth();

    if ( (amon < this._min_amon) || (amon > this._max_amon) ) {
      // Print within debug to optimize performance...
      // if ( Message.isDebugOn ) {
      //   Message.printWarning( 50, "MonthTS.setDataValue", date + " not within POR (" + _date1 + " - " + _date2 + ")" );
      // }
      return;
    }

    // THIS CODE NEEDS TO BE EQUIVALENT IN getDataValue...

    var row: number = date.getYear() - this._date1.getYear();
    var column: number = date.getMonth() - 1;	// Zero offset!

    // ... END OF EQUIVALENT CODE.

    // if ( Message.isDebugOn ) {
    //   Message.printDebug( 50, "MonthTS.setDataValue", "Setting " + value + " " + date + " at " + row + "," + column );
    // }

    // Set the dirty flag so that we know to recompute the limits if desired...

    this._dirty = true;
    this._data[row][column] = value;
      if ( (data_flag != null) && (data_flag.length > 0) ) {
          if ( !this._has_data_flags ) {
              // Trying to set a data flag but space has not been allocated, so allocate the flag space
              try {
                  this.allocateDataFlagSpace(null, false );
              }
              catch ( e ) {
                  // Generally should not happen - log as debug because could generate a lot of warnings
                  // if ( Message.isDebugOn ) {
                  //     Message.printDebug(30, "MonthTS.setDataValue", "Error allocating data flag space (" + e +
                  //         ") - will not use flags." );
                  // }
                  // Make sure to turn flags off
                  this._has_data_flags = false;
              }
          }
      }
      if ( this._has_data_flags && (data_flag != null) ) {
        if ( this._internDataFlagStrings ) {
          this._dataFlags[row][column] = data_flag; // .intern();
        }
        else {
          this._dataFlags[row][column] = data_flag;
        }
      }
  }

}