// DataFormat - data format class

import { StringUtil } from '../../StringUtil';

/* NoticeStart
CDSS Common Java Library
CDSS Common Java Library is a part of Colorado's Decision Support Systems (CDSS)
Copyright (C) 1994-2019 Colorado Department of Natural Resources
CDSS Common Java Library is free software:  you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.
    CDSS Common Java Library is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.
    You should have received a copy of the GNU General Public License
    along with CDSS Common Java Library.  If not, see <https://www.gnu.org/licenses/>.
NoticeEnd */
/**
The DataFormat is a simple class used to hold information about data
formatting (e.g., precision for output).  It is primarily used by the DataUnits class.
@see DataUnits
*/
export class DataFormat {

  private _format_string: string;		// C-style format string for data.
  private _precision: number;		// The number of digits of precision
            // after the decimal point on output.
  private _width: number;			// The total width of the format.

  /**
  Construct and set the output width to 10 digits, 2 after the decimal
  point, and use a %g format.
  */
  constructor (format?: DataFormat) {
    if (format) {
      this.initialize ();
    } else {
      this.initialize();
      this.setFormatString1 ( format._format_string );
      this.setPrecision ( format._precision );
      this.setWidth ( format._width );
    }
  }

  /**
  Finalize before garbage collection.
  @exception Throwable if there is an error.
  */
  protected finalize (): void
  {
    this._format_string = null;
    // super.finalize();
  }

  /**
  Return the format string to use for output.
  @return The format string to use for output.  This is a C-style format string
  (use with StringUtil.formatString()).
  @see RTi.Util.String.StringUtil#formatString
  */
  public getFormatString ( ): string {
    return this._format_string;
  }

  /**
  Return the precision (number of digits after the decimal point).
  @return The precision (number of digits after the decimal point) to use for
  formatting.
  */
  public getPrecision ( ): number {
    return this._precision;
  }

  /**
  Return the width of the output when formatting.
  @return The width of the output when formatting.
  */
  public getWidth ( ): number {
    return this._width;
  }

  /**
  Initialize data members.
  */
  private initialize (): void {
    this._precision = 2;
    this._width = 10;
    this.setFormatString();
  }

  private reverseString(og_string: string): string {
    
    return og_string.split('').reverse().join('');
  }

  /**
  Refresh the value of the format string based on the width and precision.
  */
  private setFormatString (): void {
    if ( this._width <= 0 ) {
      this._format_string = "%." + this._precision + "f";
    }
    else {	this._format_string = "%" + this._width + "." + this._precision + "f";
    }
  }

  /**
  Set the format string.  This is a C-style format string.
  @param format_string Format string to use for output.
  @see RTi.Util.String.StringUtil#formatString
  */
  public setFormatString1 ( format_string: string ): void {
    if ( format_string == null ) {
      return;
    }
    this._format_string = format_string;
    var dot_pos: number = format_string.indexOf(".");
    if ( dot_pos < 0 ) {
      // Like %f
      this._width = 0;
      this._precision = 0;
    }
    else {	// Get the width...
      this._width = 0;
      var b1: string = '';
      if ( dot_pos > 0 ) {
        for (	var i = dot_pos - 1;
          (i >= 0) &&
          (format_string.charAt(i) >= '0' && format_string.charAt(i) <= '9');
          i++ ) {
          b1 += format_string.charAt(i);
        }
        if ( b1.length > 0 ) {
          b1 = this.reverseString(b1);
          this._width = StringUtil.atoi(b1.toString() );
        }
      }
      b1 = null;
      // Get the precision...
      this._precision = 0;
      var b2: string = '';
      var length: number = format_string.length;
      for (	var i = dot_pos + 1;
        (i < length) &&
        (format_string.charAt(i) >= '0' && format_string.charAt(i) <= '9');
        i++ ) {
        b2 += format_string.charAt(i);
      }
      if ( b2.length > 0 ) {
        this._precision = StringUtil.atoi(b2.toString() );
      }
      b2 = null;
    }
  }

  /**
  Set the number of digits after the decimal point to use for output.
  @param precision Number of digits after the decimal point.
  */
  public setPrecision ( precision: number ): void {
    this._precision = precision;
    this.setFormatString();
  }

  /**
  Set the total number of characters to use for output.
  @param width Total number of characters for output.
  */
  public setWidth ( width: number ): void {
    this._width = width;
    this.setFormatString();
  }

  /**
  Return string version.
  @return A string representation of the format (e.g., "%10.2f").
  */
  public toString ( ): string {
    return this._format_string;
  }

} // End of DataFormat