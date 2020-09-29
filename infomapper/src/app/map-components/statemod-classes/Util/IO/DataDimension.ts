// DataDimension - data dimension class

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
The DataDimension class stores data dimension data and provides methods to
interpret and use such data.  Data dimensions (e.g., "L" for length,
"L/T" for discharge) are primarily used when determining units conversions or
labels for output.  Standard dimensions that have been used in RTi software
include:
<pre>
DIRECTION (e.g., degrees).
CONSTANT
ENERGY
ENERGY_PER_AREA
POWER
LENGTH
SPEED
AREA
VOLUME
DISCHARGE
PRESSURE
TEMPERATURE
TIME
<pre>
*/
export class DataDimension {

  // Private static data members for object house-keeping...

  private static __dimensionList: DataDimension[] = [];

  // Data members...

  private __abbreviation: string;		// Abbreviation for dimension.  This is
            // used in data units files to group
            // units by dimension.  Example: "L"
  private	__long_name: string;		// Long name for dimension (e.g., "LENGTH).

  /**
  Construct using primitive data.
  @param abbreviation the abbreviation to use
  @param long_name the long_name to use
  */
  constructor ( abbreviation: string, long_name: string, isCopyConstructor: boolean, dim?: DataDimension ) {
    if (!isCopyConstructor) {
      this.setAbbreviation ( abbreviation );
      this.setLongName ( long_name );
    } else {
      this.setAbbreviation(dim.getAbbreviation());
      this.setLongName(dim.getLongName());
    }
    
  }

  /**
  Add a DataDimension to the internal list of dimensions.  After adding, the
  dimensions can be used throughout the application.
  @param dim Instance of DataDimension to add to the list.
  */
  public static addDimension ( dim: DataDimension ): void {
    // First see if the dimension is already in the list...

    var size: number = DataDimension.__dimensionList.length;
    var pt: DataDimension = null;
    for ( var i = 0; i < size; i++ ) {
      // Get the dimension for the loop index...
      pt = DataDimension.__dimensionList[i];
      // Now compare...
      if (pt) {
        if ( dim.getAbbreviation().toUpperCase() === pt.getAbbreviation().toUpperCase() ) {
          // The requested dimension matches something that is
          // already in the list.  Reset the list...
          DataDimension.__dimensionList[i] = new DataDimension ('', '', true, dim);
          return;
        }
      }
    }
    // Need to add the units to the list...
    DataDimension.__dimensionList.push ( new DataDimension('', '', true, dim) );
    pt = null;
  }

  /**
  Finalize before garbage collection.
  @exception Throwable if there is an error.
  */
  protected finalize(): void {
    this.__abbreviation = null;
    this.__long_name = null;
  }

  /**
  Return the dimension abbreviation.
  @return The dimension abbreviation.
  */
  public getAbbreviation ( ): string {
    return this.__abbreviation;
  }

  /**
  Return a list of DataDimension containing the static shared dimension data.
  @return a list of DataDimension containing the static shared dimension data.
  */
  public static getDimensionData (): DataDimension[] {
    return this.__dimensionList;
  }

  /**
  Return the dimension long name.
  @return The dimension long name.
  */
  public getLongName ( ): string {
    return this.__long_name;
  }

  /**
  Lookup a DataDimension given the dimension string abbreviation.
  @return DataDimension given the dimension string abbreviation.
  @param dimension_string Dimension abbreviation string.
  @exception Exception If the data dimension cannot be determined from the string.
  @deprecated Use lookupDimension
  */
  public static lookup ( dimension_string: string ): DataDimension {
    return this.lookupDimension ( dimension_string );
  }

  /**
  Lookup a DataDimension given the dimension string abbreviation.
  @return DataDimension given the dimension string abbreviation.
  @param dimension_string Dimension abbreviation string.
  @exception Exception If the data dimension cannot be determined from the string.
  */
  public static lookupDimension ( dimension_string: string ): DataDimension {
    if ( dimension_string == null ) {
      throw new Error ( "Null dimension string" );
    }
    if ( dimension_string.length <= 0 ) {
      throw new Error ( "Empty dimension string" );
    }
      
    var size = DataDimension.__dimensionList.length;
    var dim: DataDimension = null;
    for ( var i = 0; i < size; i++ ) {
      dim = DataDimension.__dimensionList[i];
      if ( dimension_string.toUpperCase() === dim.getAbbreviation().toUpperCase() ){
        // Have a match...
        return dim;
      }
    }
    // Unable to find...
    var message = "Unable to look up dimension \"" + dimension_string + "\"";
    console.warn ( 2, "DataDimension.lookupDimension", message );
    throw new Error ( message );
  }

  /**
  Set the dimension abbreviation.
  @param abbreviation The dimension abbreviation.
  */
  public setAbbreviation ( abbreviation: string ): void {
    if ( abbreviation == null ) {
      return;
    }
    this.__abbreviation = abbreviation;
  }

  /**
  Set the dimension long name.
  @param long_name The dimension long name.
  */
  public setLongName ( long_name: string ): void {
    if ( long_name == null ) {
      return;
    }
    this.__long_name = long_name;
  }

  /**
  Return a string representation of the DataDimension.
  @return A string representation of the DataDimension.
  */
  public toString (): string
  {	return "Dimension:  \"" + this.__abbreviation + "\", \"" + this.__long_name +"\"";
  }

}