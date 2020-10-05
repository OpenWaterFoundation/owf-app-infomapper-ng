import { DateTime } from '../Util/Time/DateTimeUtil';


/**
This class provides a simple class for storing a time series data point
consisting of a date, a data value, units and a data flag.  It is used by
IrregularTS to store data returned by getDataPoint() methods.
@see IrregularTS
*/
export class TSData {

/**
Data value.
*/
private	_dataValue: number;
/**
Data flag (often used for quality, etc.).
*/
private _data_flag: string;
/**
Date/time associated with data value.
*/
private _date: DateTime;
/**
Duration of the value (seconds)
*/
private _duration: number;
/**
Pointer to next TSData in list (an internally maintained linked list).
*/
private _next: TSData;	
/**
Pointer to previous TSData in list (an internally maintained linked list).
*/
private _previous: TSData;	
/**
Units of data.
*/
private _units: string;

/**
Default constructor.  The date is set to null and the data value is set to zero.
*/
constructor() {
	this.initialize();
}

// /**
// Construct and set the data values.
// @param date date for data value.
// @param value data value.
// */
// public TSData ( DateTime date, double value )
// {   super();
//     initialize();
//     setDate( date );
//     setDataValue( value );
// }

// /**
// Construct and set the data values.
// @param date date for data value.
// @param value data value.
// @param units data units.
// @see DataUnits
// */
// public TSData ( DateTime date, double value, String units )
// {   super();
//     initialize();
//     setDate( date );
//     setDataValue( value );
//     setUnits( units );
// }

// /**
// Construct and set the data values.
// @param date date for data value.
// @param value data value.
// @param units data units.
// @param flag Data flag.
// @see DataUnits
// */
// public TSData ( DateTime date, double value, String units, String flag )
// {   super();
//     initialize();
//     setDate( date );
//     setDataValue( value );
//     setUnits( units );
//     setDataFlag( flag );
// }

// /**
// Create a copy of the object.
// A deep copy is made except for the next and
// previous pointers, which are copied as is.  If a sequence of new data are
// being created, the next/previous pointers will need to be reset accordingly.
// @param tsdata the instance that is being copied.
// */
// public TSData ( TSData tsdata )
// {	_data_flag = tsdata._data_flag;
// 	_duration = tsdata._duration;
// 	_units = tsdata._units;
// 	_dataValue = tsdata._dataValue;
// 	_date = new DateTime ( tsdata._date );
// 	_next = tsdata._next;
// 	_previous = tsdata._previous;
// }

/**
Append a data flag string to an existing flag.  If the first character of the flag is "+",
then the flag will be appended with flag (without the +).  If the first two characters are "+,",
then the flag will be appended and a comma will be included only if a previous flag was set.
@param flagOrig original data flag
@param flag data flag to append
@return the new merged data flag string
*/
public static appendDataFlag ( flagOrig: string, flag: string ): string
{   //Message.printStatus(2, "", "Before append flagOrig= \"" + flagOrig + "\" flag=\"" + flag + "\"" );
    if ( flagOrig === null ) {
        flagOrig = "";
    }
    if( (flag !== null) && (flag.length > 0) ){
        if ( flag.startsWith("+") && (flag.length > 1) ) {
            // Have +X... so append to the flag...
            if ( (flag.charAt(1) === ',') && (flagOrig.length === 0) ) {
                // Original flag is empty so append without leading comma
                if ( flag.length > 2 ) {
                    flagOrig += flag.substring(2);
                }
            }
            else {
                // Append the string after the +, including the comma if provided
                flagOrig += flag.substring(1);
            }
        }
        else {
            // Just set the flag, overriding the previous flag...
            flagOrig = flag;
        }
    }
    //Message.printStatus(2, "", "Flag after append = \"" + flagOrig + "\"" );
    return flagOrig;
}

// /**
// Clone the object.   The Object base class clone() method is called and then the local data are cloned.
// A deep copy is made except for the next and
// previous pointers, which are copied as is.  If a sequence of new data are
// being created, the next/previous pointers will need to be reset accordingly.
// */
// public Object clone ()
// {	try {
//         TSData tsdata = (TSData)super.clone();
// 		tsdata._date = (DateTime)_date.clone();
// 		tsdata._next = _next;
// 		tsdata._previous = _previous;
// 		tsdata._duration = _duration;
// 		return tsdata;
// 	}
// 	catch ( CloneNotSupportedException e ) {
// 		// Should not happen because everything is cloneable.
// 		throw new InternalError();
// 	}
// }

// /**
// Finalize before garbage collection.
// @exception Throwable if there is an error.
// */
// protected void finalize()
// throws Throwable
// {	_data_flag = null;
// 	_date = null;
// 	_next = null;
// 	_previous = null;
// 	_units = null;
// 	super.finalize();
// }

/**
Return the data value.
@return The data value.
*/
public getDataValue(): number {
  return this._dataValue;
}

// /**
//  * Return the data value.
//  * @return The data value.
//  */
// @Deprecated
// public double getData() {
//     return getDataValue();
// }

// /**
// Return the data flag.
// @return The data flag.
// */
// public String getDataFlag()
// {	return _data_flag;
// }

// /**
// Return the data for the data.
// @return The date associated with the value.  A copy is returned.
// */
// public DateTime getDate()
// {	return new DateTime (_date);
// }

// /**
// Return the duration (seconds) for the data.
// @return The duration (seconds) associated with the value.
// */
// public int getDuration()
// {	return _duration;
// }

// /**
// Return the reference to the next data item.
// @return Return the reference to the next data item (used when an
// internally-maintained linked list is used).
// */
// public TSData getNext()
// {	return _next;
// }

// /**
// Return the reference to the previous data item.
// @return Return the reference to the previous data item (used when an
// internally-maintained linked list is used).
// */
// public TSData getPrevious()
// {	return _previous;
// }

// /**
// Return the data units.
// @return The units for the data.
// REVISIT -- Incorrect tag usage: see DataUnits
// */
// public String getUnits()
// {	return _units;
// }

/**
Initialize the data.
*/
private initialize ( ): void {
  this._data_flag = "";
	this._date = null;
	this._duration = 0;
	this._units = "";
	this._dataValue = 0.0;
	this._next = null;
	this._previous = null;
}

/**
Set the data value.
@param d Data value.
*/
public setDataValue( d: number ): void {
  this._dataValue = d;
}

/**
Set the data flag.  If the first character of the flag is "+", then the flag will be appended
with flag (without the +).  If the first two characters are "+,", then the flag will be appended and a
comma will be included only if a previous flag was set.
@param flag Data flag.
*/
public setDataFlag( flag: string ): void {
  if ( (flag !== null) && (flag.length > 0) && (flag.charAt(0) === '+') ) {
        // Appending the flag
        this._data_flag = TSData.appendDataFlag(this._data_flag,flag);
    }
    else {
        // Simple set.  Do this because calling only the above code can result in
        // previous flag values getting carried forward during iteration.
        this._data_flag = flag;
    }
}

/**
Set the date.  A copy of the date is made.
@param d Date corresponding to data.
*/
public setDate( d: DateTime ): void {
  if( d != null ){
		this._date = new DateTime ( d );
	}
}

// /**
// Set the duration (seconds).
// @param duration Duration corresponding to data.
// */
// public void setDuration ( int duration )
// {	_duration = duration;
// }

// /**
// Set the next reference (used when maintaining and internal linked-list).
// @param d Reference to TSData.
// */
// public void setNext( TSData d )
// {	_next = d;
// }

// /**
// Set the previous reference (used when maintaining and internal linked-list).
// @param d Reference to TSData.
// */
// public void setPrevious( TSData d )
// {	_previous = d;
// }

/**
Set the units for the data value.
@param units Data units.
@see DataUnits
*/
public setUnits( units: string ): void {
  if( units != null ){
		this._units	= units;
	}
}

// /**
// Set the data values.
// @param date Date for data value.
// @param d Data value.
// @param units Data units.
// @param flag Data flag.
// @see DataUnits
// */
// public void setValues( DateTime date, double d, String units, String flag )
// {	setDate( date );
// 	setDataValue( d );
// 	setUnits( units );
// 	setDataFlag( flag );
// }

/**
Set the data values.
@param date Date for data value.
@param d Data value.
@param units Data units.
@param flag Data flag.
@param duration Duration (seconds).
@see DataUnits
*/
public setValues ( date: DateTime, d: number, units: string, flag: string, duration: number ): void {
  this.setDate( date );
	this._dataValue = d;
	this.setUnits( units );
	this.setDataFlag( flag );
	this._duration = duration;
}

// /**
// Return a string representation of the instance.
// @return A string representation of a TSData.
// */
// public String toString()
// {	return "TSData: " +
// 	" Date: \"" + _date +
// 	"\" Value: " + _dataValue +
// 	" Units: \"" + _units +
// 	"\" Flag: \"" + _data_flag + "\" Duration: " + _duration;
// }

// /**
// Return a string representation of the instance using the format.  The format
// can contain any of the format specifiers used in TimeUtil.formatDateTime() or
// any of the following specifiers:  %v (data value, formatted based on units),
// %U (data units), %q (data flag).  Any format information not recognized as a
// format specifier is treated as a literal string.
// @return A string representation of a TSData.
// @param full_format Format string containing TimeUtil.formatDateTime() format specifiers, %v, %U, or %q.
// @param value_format Format to use for data value (e.g., %.4f).  This should
// in most cases be determined before calling this method repeatedly, in order to improve performance.
// @param date Date for the data value (can be null if no date format specifiers are given).
// @param value1 Data value to format (can be ignored if %v is not specified).
// @param value2 Second value to format (can be ignored if %v is not specified) -
// use when plotting time series on each axis.
// @param flag Data quality flag to format (can be ignored if %q is not specified).
// @param units Data units (can be ignored if %v and %U are not specified.
// */
// public static String toString (	String full_format, String value_format,
//     DateTime date, double value1, double value2, String flag, String units )
// {	// Format the date first...
// 	String format = TimeUtil.formatDateTime ( date, full_format );
// 	// Now format the %v, %U, and %q (copy this code from
// 	// TimeUtil.formatDateTime() and modify...

// 	if ( format == null ) {
// 		return "";
// 	}

// 	String value_format2 = value_format;	// Used for %v
// 	if ( value_format == null ) {
// 		value_format2 = "%f";
// 	}

// 	// Convert format to string...
// 	int len = format.length();
// 	StringBuffer formatted_string = new StringBuffer ();
// 	char c = '\0';
// 	boolean value1_found = false;
// 	for ( int i = 0; i < len; i++ ) {
// 		c = format.charAt(i);
// 		if ( c == '%' ) {
// 			// We have a format character...
// 			++i;
// 			if ( i >= len ) {
// 				break;	// this will exit the whole loop
// 			}
// 			c = format.charAt(i);
// 			if ( c == 'v' ) {
// 				// Data value.
// 				if ( !value1_found ) {
// 					formatted_string.append(StringUtil.formatString(value1,value_format2) );
// 					value1_found = true;
// 				}
// 				else {
// 				    formatted_string.append(StringUtil.formatString(value2,value_format2) );
// 				}
// 			}
// 			else if ( c == 'U' ) {
// 				// Data units...
// 				formatted_string.append( units );
// 			}
// 			else if ( c == 'q' ) {
// 				// Data flag...
// 				formatted_string.append( flag );
// 			}
// 			else if ( c == '%' ) {
// 				// Literal percent...
// 				formatted_string.append ( '%' );
// 			}
// 		}
// 		else {
// 		    // Just add the character to the string...
// 			formatted_string.append ( c );
// 		}
// 	}

// 	return formatted_string.toString();
// }

}