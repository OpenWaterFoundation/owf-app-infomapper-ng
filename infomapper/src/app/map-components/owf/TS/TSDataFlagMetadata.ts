

/**
Metadata about flags used with a time series.
Instances of this class can be added to a time series via addDataFlagMetaData() method.
This information is useful for output reports and displays, to explain the meaning of data flags.
The class is immutable.
*/
export class TSDataFlagMetadata {
    
/**
Data flag.  Although this is a string, flags are generally one character.
*/
private __dataFlag = "";

/**
Description for the data flag.
*/
private __description = "";

/**
Constructor.
@param dataFlag data flag (generally one character).
@param description description of the data flag.
*/
constructor ( dataFlag: string, description: string )
{
    this.setDataFlag ( dataFlag );
    this.setDescription ( description );
}

/**
Return the data flag.
@return the data flag
*/
public getDataFlag (): string
{
    return this.__dataFlag;
}

/**
Return the data flag description.
@return the data flag description
*/
public getDescription (): string
{
    return this.__description;
}

/**
Set the data flag.
@param dataFlag the data flag
*/
private setDataFlag ( dataFlag: string ): void
{
    this.__dataFlag = dataFlag;
}

/**
Set the description for the data flag.
@param description the data flag description
*/
private setDescription ( description: string ): void
{
    this.__description = description;
}

}