// DataUnitsConversion - data units conversion class

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
The DataUnitsConversion class stores the conversion factors for changing from
one set of units to another.  An instance is returned from
DataUnits.getConversion.
The DataUnits.getConversion() method normally initializes some of the fields in
this class.  Currently, there are no plans to move getConversion() to this class
because that function depends on DataUnits data.
@see DataUnits#getConversion
*/
export class DataUnitsConversion {

  private _add_factor: number;		// Factor to add to convert from
            // _original_units to _new_units.
  private _mult_factor: number;		// Factor to multiply by to convert from
            // _original_units to _new_units.
  private _original_units: string;	// The original data units.
  private _new_units: string;		// The new data units (result of
            // applying the factors).

  /**
  Construct and set the multiplication factor to 1.0 and the add factor to 0.0.
  */
  constructor ( initObj: any ) {
    if (initObj === null) {
      this.initialize ();
    }
    /**
    Construct using data values.
    Construct using data values.  The add factor is set to zero.
    @param original_units Units before conversion.
    @param new_units Units after conversion.
    @param mult_factor Factor to multiply old units by to get new units.
    @param add_factor Factor to add old units (after multiplication) to get
    new units.
    */
    else if (initObj.add_factor) {
      this.initialize ();
      this.setOriginalUnits ( initObj.original_units );
      this.setNewUnits ( initObj.new_units );
      this._mult_factor = initObj.mult_factor;
      this._add_factor = initObj.add_factor;
    }
    /**
    Construct using data values.  The add factor is set to zero.
    @param original_units Units before conversion.
    @param new_units Units after conversion.
    @param mult_factor Factor to multiply old units by to get new units.
    */
    else if (initObj.mult_factor) {
      this.initialize ();
      this.setOriginalUnits ( initObj.original_units );
      this.setNewUnits ( initObj.new_units );
      this._mult_factor = initObj.mult_factor;
      this._add_factor = 0.0;
    }
    /**
    Copy constructor.
    @param conv DataUnitsConversion instance to copy.
    */
    else if (initObj instanceof DataUnitsConversion) {
      this.initialize();
      this.setAddFactor ( initObj._add_factor );
      this.setMultFactor ( initObj._mult_factor );
      this.setOriginalUnits ( initObj._original_units );
      this.setNewUnits ( initObj._new_units );
    }
  }

  /**
  Finalize before garbage collection.
  @exception Throwable if an error occurs.
  */
  protected finalize(): void {
    this._original_units = null;
    this._new_units = null;
  }

  /**
  Return the factor to add by to perform the conversion.
  @return The factor to add by to perform the conversion.
  */
  public getAddFactor ( ): number {
    return this._add_factor;
  }

  /**
  Return the factor to multiply by to perform the conversion.
  @return The factor to multiply by to perform the conversion.
  */
  public getMultFactor ( ): number {
    return this._mult_factor;
  }

  /**
  Return the new units (after conversion).
  @return The new units (after conversion).
  */
  public getNewUnits ( ): string {
    return this._new_units;
  }

  /**
  Return the original units (before conversion).
  @return The original units (before conversion).
  */
  public getOriginalUnits ( ): string {
    return this._original_units;
  }

  /**
  Initialize data members.
  */
  private initialize (): void {
    this._original_units = "";
    this._new_units = "";
    this._add_factor = 0.0;	// Results in no conversion.
    this._mult_factor = 1.0;
  }

  /**
  Set the addition factor for the conversion (this is normally only needed for
  temperature conversions).
  @param add_factor The addition factor.
  */
  public setAddFactor ( add_factor: number ): void {
    this._add_factor = add_factor;
  }

  /**
  Set the multiplication factor for the conversion.
  @param mult_factor The multiplication factor.
  */
  public setMultFactor ( mult_factor: number ): void {
    this._mult_factor = mult_factor;
  }

  /**
  Set the new units (after conversion).
  @param new_units Data units after conversion.
  */
  public setNewUnits ( new_units: string ): void {
    if ( new_units == null ) {
      return;
    }
    this._new_units = new_units;
  }

  /**
  Set the original units (before conversion).
  @param original_units Data units before conversion.
  */
  public setOriginalUnits ( original_units: string ): void {
    if ( original_units == null ) {
      return;
    }
    this._original_units = original_units;
  }

  /**
  Return a string representation of the units (verbose output).
  @return A string representation of the units (verbose output).
  */
  public toString (): string {
    return "Conv:  \"" + this._original_units + "\" to \"" + this._new_units +
            "\", MultBy:" + this._mult_factor + ", Add:" + this._add_factor;
  }

} // End of DataUnitsConversion