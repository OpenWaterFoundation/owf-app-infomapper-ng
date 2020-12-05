import { DateTime }           from '../Util/Time/DateTimeUtil';
import { PropList }           from '../Util/IO/PropList';
import { StringUtil }         from '../Util/String/StringUtil';
import { TS }                 from '../TS/TS'; 
import { TSUtil }             from '../TS/TSUtil';
import { TSIdent }            from '../TS/TSIdent';
import { TimeInterval }       from '../Util/Time/TimeInterval';
import { TSDataFlagMetadata } from './TSDataFlagMetadata';

import { Observable }         from 'rxjs';
import { map }                from 'rxjs/operators';

import { AppService }         from '../../../app.service';
import * as IM                from '../../../../infomapper-types';


export class DateValueTS {


  constructor(private appService: AppService) { }


  /**
  Parse a data string of the form "{dataflag1:"description",dataflag2:"description"}"
  @param value the DateValue property value to parse
  */
  private static parseDataFlagDescriptions(value: string): TSDataFlagMetadata[] {
    var metaList: TSDataFlagMetadata[] = [];
    value = value.trim().replace("{", "").replace("}", "");
    var parts: string[] = StringUtil.breakStringList(value, ",", StringUtil.DELIM_ALLOW_STRINGS | StringUtil.DELIM_ALLOW_STRINGS_RETAIN_QUOTES);
    for (let part of parts) {
      // Now have flag:description
      var parts2: string[] = StringUtil.breakStringList(part.trim(), ":", StringUtil.DELIM_ALLOW_STRINGS | StringUtil.DELIM_ALLOW_STRINGS_RETAIN_QUOTES);
      if (parts2.length == 2) {
        var propName: string = parts2[0].trim();
        var propVal: string = parts2[1].trim();
        if (propVal.startsWith("\"") && propVal.endsWith("\"")) {
          // Have a quoted string
          metaList.push(new TSDataFlagMetadata(propName, propVal.substring(1, propVal.length - 1)));
        }
        else if (propVal.toUpperCase() === "NULL") {
          metaList.push(new TSDataFlagMetadata(propName, ""));
        }
      }
    }
    return metaList;
  }

  // TODO SAM 2015-05-18 This is brute force - need to make more elegant
  /**
  Parse a properties string of the form "{stringprop:"propval",intprop:123,doubleprop=123.456}"
  */
  private static parseTimeSeriesProperties(value: string): PropList {
    var props: PropList = new PropList("");
    value = value.trim().replace("{", "").replace("}", "");
    var parts: string[] = StringUtil.breakStringList(value, ",", StringUtil.DELIM_ALLOW_STRINGS | StringUtil.DELIM_ALLOW_STRINGS_RETAIN_QUOTES);
    for (let part of parts) {
      // Now have Name:value
      var parts2: string[] = StringUtil.breakStringList(part.trim(), ":", StringUtil.DELIM_ALLOW_STRINGS | StringUtil.DELIM_ALLOW_STRINGS_RETAIN_QUOTES);
      if (parts2.length == 2) {
        var propName: string = parts2[0].trim();
        var propVal: string = parts2[1].trim();
        if (propVal.startsWith("\"") && propVal.endsWith("\"")) {
          // Have a quoted string
          props.setUsingObject(propName, propVal.substring(1, propVal.length - 1));
        }
        else if (propVal.toUpperCase() === "NULL") {
          props.setUsingObject(propName, null);
        }
        // else if ( StringUtil.isInteger(propVal) ) {
        //   props.setUsingObject(propName, Integer.parseInt(propVal));
        // }
        // else if ( StringUtil.isDouble(propVal) ) {
        //   props.setUsingObject(propName, Double.parseDouble(propVal));
        // }
        else if (!isNaN(Number(propVal))) {
          props.setUsingObject(propName, Number(propVal));
        }
      }
    }
    return props;
  }

  /**
  Read a time series from a DateValue format file.  The TSID string is specified
  in addition to the path to the file.  It is expected that a TSID in the file
  matches the TSID (and the path to the file, if included in the TSID would not
  properly allow the TSID to be specified).  This method can be used with newer
  code where the I/O path is separate from the TSID that is used to identify the time series.
  The IOUtil.getPathUsingWorkingDir() method is applied to the filename.
  @return a time series if successful, null if not.
  @param tsident_string The full identifier for the time series to
  read.  This string can also be the alias for the time series in the file.
  @param filename The name of a file to read
  (in which case the tsident_string must match one of the TSID strings in the file).
  @param date1 Starting date to initialize period (null to read the entire time series).
  @param date2 Ending date to initialize period (null to read the entire time series).
  @param units Units to convert to.
  @param read_data Indicates whether data should be read (false=no, true=yes).
  */
  public readTimeSeries(tsident_string: string, filename: string,
    date1: DateTime, date2: DateTime, units: string, read_data: boolean): Observable<TS> {

    var ts: TS = null;

    // var input_name: string = filename;
    // var full_fname: any = IOUtil.getPathUsingWorkingDir ( filename );
    var full_fname = filename;

    // BufferedReader in = null;
    // if ( full_fname.toUpperCase().endsWith(".ZIP") ) {
    // // Handle case where DateValue file is compressed (single file in .zip)
    // ZipToolkit zt = new ZipToolkit();
    // in = zt.openBufferedReaderForSingleFile(full_fname,0);
    // }
    // else {
    // in = new BufferedReader ( new InputStreamReader(IOUtil.getInputStream ( full_fname )) );
    // }
    // Pass the file pointer and an empty time series, which
    // will be used to locate the time series in the file.
    // The following is somewhat ugly because if we are using an alias we
    // cannot get the time series from newTimeSeries() because it does not
    // have an interval.  In this case, assume daily data.  This requires
    // special treatment in the readTimeSeriesList() method in order to
    // reset the time series to what is actually found in the file.
    // TODO - clean this up, perhaps by moving the time series creation
    // into the readTimeSeriesList() method rather than doing it here.

    return this.appService.getPlainText(filename, IM.Path.dVP).pipe(map((dateValueFile: any) => {
      let dateValueArray = dateValueFile.split('\n');


      if (tsident_string.indexOf(".") >= 0) {
        // Normal time series identifier...
        ts = TSUtil.newTimeSeries(tsident_string, true);
      }
      else {
        // Assume an alias...
        // ts = new DayTS ();
      }
      if (ts == null) {
        console.error(
          "DateValueTS.readTimeSeries(String,...)", "Unable to create time series for \"" + tsident_string + "\"");
        return ts;
      }
      if (tsident_string.indexOf(".") >= 0) {
        ts.setIdentifier(tsident_string);
      }
      else {
        ts.setAlias(tsident_string);
      }
      var v: TS[] = this.readTimeSeriesList(ts, dateValueArray, date1, date2, units, read_data);
      if (tsident_string.indexOf(".") < 0) {
        // The time series was specified with an alias so it needs
        // to be replaced with what was read.  The alias will have been
        // assigned in the readTimeSeriesList() method.
        ts = v[0];
      }
      ts.getIdentifier().setInputType("DateValue");
      ts.setInputName(full_fname);
      // ts.addToGenesis ( "Read time series from \"" + full_fname + "\"" );
      ts.getIdentifier().setInputName(full_fname);

      return ts;
    }));
  }

  /**
Read a time series from a DateValue format file.
@return a List of time series if successful, null if not.  The calling code
is responsible for freeing the memory for the time series.
@param req_ts time series to fill.  If null, return all new time series in the list.
All data are reset, except for the identifier, which is assumed to have been set in the calling code.
@param in Reference to open input stream.
@param req_date1 Requested starting date to initialize period (or null to read the entire time series).
@param req_date2 Requested ending date to initialize period (or null to read the entire time series).
@param units Units to convert to (currently ignored).
@param read_data Indicates whether data should be read.
@exception Exception if there is an error reading the time series.
*/
  private readTimeSeriesList(req_ts: TS, dateValueArray: any[], req_date1: DateTime,
    req_date2: DateTime, req_units: string, read_data: boolean): TS[] {

    var date_str: string, message: string = null, string = "", value, variable;
    var routine: string = "DateValueTS.readTimeSeriesList";
    var dl = 10, dl2 = 30, numts = 1;
    var date1 = new DateTime(null), date2 = new DateTime(null);
    // Do not allow consecutive delimiters in header or data values.  For example:
    // 1,,2 will return
    // 2 values for version 1.3 and 3 values for version 1.4 (middle value is missing).
    var delimParseFlag = 0;

    // Always read the header.  Optional is whether the data are read...

    var line_count = 0;
    // if ( Message.isDebugOn ) {
    // Message.printDebug ( dl, routine, "Processing header..." );
    // }
    var delimiter_default = " ";
    var alias = "", dataflag = "", datatype = "", delimiter = delimiter_default,
      description = "", identifier = "", missing = "", seqnum = "",
      units = "";
    var alias_v: string[] = null;
    var dataflag_v: string[] = null;
    var ts_has_data_flag: boolean[] = null;
    var ts_data_flag_length: number[] = null;
    var datatype_v: string[] = null;
    var description_v: string[] = null;
    var identifier_v: string[] = null;
    var missing_v: string[] = null;
    var propertiesList: PropList[] = null;
    var dataFlagMetadataList: TSDataFlagMetadata[][] = null;
    var seqnum_v: string[] = null;
    var units_v: string[] = null;
    var include_count = false;
    var include_total_time = false;
    var size = 0;
    var equal_pos = 0;	// Position of first '=' in line.
    var warning_count = 0;
    try {
      for (let string of dateValueArray) {
        ++line_count;
        // Trim the line to better deal with blank lines...
        string = string.trim();
        // if ( Message.isDebugOn ) {
        // Message.printDebug ( dl, routine,"Processing: \"" + string + "\"" );
        // }
        if (!read_data && string.startsWith("# Time series histories")) { // .regionMatches(true,0,"# Time series histories",0,23) ) {
          // if ( Message.isDebugOn ) {
          // Message.printDebug( 10, routine, "Detected end of header." );
          // }
          break;
        }
        if ((string === "")) {
          // Skip comments and blank lines for now...
          continue;
        }
        else if (string.charAt(0) == '#') {
          var version = "# DateValueTS";
          if (string.startsWith(version)) {
            // Have the file version so use to indicate how file is processed.
            // This property should be used at the top because it impacts how other data are parsed.
            var version_double =
              StringUtil.atod(StringUtil.getToken(string, " ", StringUtil.DELIM_SKIP_BLANKS, 2));
            if ((version_double > 0.0) && (version_double < 1.4)) {
              // Older settings...
              delimParseFlag = StringUtil.DELIM_SKIP_BLANKS;
            }
            else {
              // Default and new settings.
              delimParseFlag = 0;
            }
          }
          continue;
        }

        if ((equal_pos = string.indexOf('=')) == -1) {
          // Assume this not a header definition variable and that we are done with the header...
          // if ( Message.isDebugOn ) {
          // Message.printDebug( 10, routine, "Detected end of header." );
          // }
          break;
        }

        // Else, process the header string...

        // Don't parse out quoted strings here.  If any tokens use
        // quoted strings, they need to be processed below.  Because
        // some property values now contain the =, parse out manually..

        if (equal_pos == 0) {
          // if ( Message.isDebugOn ) {
          // Message.printDebug( 10, routine, "Bad property for \"" + string + "\"." );
          // ++warning_count;
          // }
          continue;
        }

        // Now the first token is the left side and the second token is the right side...

        variable = string.substring(0, equal_pos).trim();        
        if (equal_pos == (string.length - 1)) {
          value = "";
        }
        else {
          // Trim the value so no whitespace on either end.
          value = string.substring(equal_pos + 1).trim();
        }

        // Deal with the tokens...
        if (variable.toUpperCase() === "ALIAS") {
          // Have the alias...
          alias = value;
          alias_v = StringUtil.breakStringList(
            value, delimiter, delimParseFlag | StringUtil.DELIM_ALLOW_STRINGS);
          size = 0;
          if (alias_v != null) {
            size = alias_v.length;
          }
          if (size != numts) {
            console.error("Number of Alias values using delimiter \"" + delimiter +
              "\" (" + size + ") is != NumTS (" + numts + ").  Read errors may occur.");
            ++warning_count;
            for (let ia = size; ia < numts; ia++) {
              alias_v.push("");
            }
          }
        }
        else if (variable.toUpperCase().startsWith("DATAFLAGDESCRIPTIONS_")) {
          // Found a properties string of the form DataFlagDescriptions_NN = { ... }
          if (dataFlagMetadataList == null) {
            // Create a list of data flag metadata for each time series
            dataFlagMetadataList = new Array<Array<TSDataFlagMetadata>>(numts);
            for (let i = 0; i < numts; i++) {
              dataFlagMetadataList.push(new Array<TSDataFlagMetadata>());
            }
          }
          // Now parse out the properties for this time series and set in the list
          var pos1 = variable.indexOf("_");
          if (pos1 > 0) {
            var iprop = parseInt(variable.substring(pos1 + 1).trim());
            dataFlagMetadataList.splice((iprop - 1), 0, DateValueTS.parseDataFlagDescriptions(value));
          }
        }
        else if (variable.toUpperCase() === "DATAFLAGS") {
          // Have the data flags indicator which may or may not be surrounded by quotes...
          dataflag = value;
          dataflag_v = StringUtil.breakStringList(
            dataflag, delimiter, delimParseFlag | StringUtil.DELIM_ALLOW_STRINGS);
          size = 0;
          if (dataflag_v != null) {
            size = dataflag_v.length;
          }
          if (size != numts) {
            console.error("Number of DataFlag values using delimiter \"" + delimiter +
              "\" (" + size + ") is != NumTS (" + numts + "). Assuming no data flags.  Read errors may occur.");
            ++warning_count;
            for (let ia = size; ia < numts; ia++) {
              dataflag_v.push("false");
            }
          }
          // Now further process the data flag indicators.  Need a boolean for each time series to indicate whether
          // data flags are used and need a width for the data flags
          ts_has_data_flag = new Array<boolean>(numts);
          ts_data_flag_length = new Array<number>(numts);
          for (let ia = 0; ia < numts; ia++) {
            dataflag = dataflag_v[ia].trim();
            var v: string[] = StringUtil.breakStringList(dataflag, ",", 0);
            size = 0;
            if (v != null) {
              size = v.length;
            }
            if (size == 0) {
              // Assume no data flag...
              ts_has_data_flag[ia] = false;
              continue;
            }
            // If the first value is "true", assume that the data flag is used...
            if (v[0].trim().toUpperCase() === "TRUE") {
              ts_has_data_flag[ia] = true;
            }
            else {
              ts_has_data_flag[ia] = false;
            }
            // Now set the length...
            ts_data_flag_length[ia] = 2; // Default
            if (size > 1) {
              ts_data_flag_length[ia] = StringUtil.atoi(String(v[1]).trim());
            }
          }
        }
        else if (variable.toUpperCase() === "DATATYPE") {
          // Have the data type...
          datatype = value;
          datatype_v = StringUtil.breakStringList(
            datatype, delimiter, delimParseFlag | StringUtil.DELIM_ALLOW_STRINGS);
          size = 0;
          if (datatype_v != null) {
            size = datatype_v.length;
          }
          if (size != numts) {
            console.error("Number of DataType values using delimiter \"" + delimiter +
              "\" (" + size + ") is != NumTS (" + numts + "). Assuming blank.  Read errors may occur.");
            ++warning_count;
            for (let ia = size; ia < numts; ia++) {
              datatype_v.push("");
            }
          }
        }
        else if (variable.toUpperCase() === "DELIMITER") {
          // Have the delimiter.  This value is probably quoted so remove quotes.
          var delimiter_previous: string = delimiter;
          delimiter = StringUtil.remove(value, "\"");
          delimiter = StringUtil.remove(delimiter, "\'");
          if (value.length == 0) {
            delimiter = delimiter_default;
          }
          // console.error("Delimiter is \"" + delimiter +
          //   "\" for remaining properties and data columns (previously was \"" + delimiter_previous + "\").");
        }
        else if (variable.toUpperCase() === "DESCRIPTION") {
          // Have the description.  The description may contain "=" so get the second token manually...
          description = value;
          description_v = StringUtil.breakStringList(
            description, delimiter, delimParseFlag | StringUtil.DELIM_ALLOW_STRINGS);
          size = 0;
          if (description_v != null) {
            size = description_v.length;
          }
          if (size != numts) {
            console.error("Number of Description values using delimiter \"" + delimiter +
              "\" (" + size + ") is != NumTS (" + numts + ").  Assuming blank.  Read errors may occur.");
            ++warning_count;
            for (let ia = size; ia < numts; ia++) {
              description_v.push("");
            }
          }
        }
        else if (variable.toUpperCase() === "END") {
          // Have the ending date.  This may be reset below by the requested end date..
          date2 = DateTime.parse(value);
        }
        else if (variable.toUpperCase() === "INCLUDECOUNT") {
          // Will have data column for the count...
          if (value.toUpperCase() === "TRUE") {
            include_count = true;
          }
          else {
            include_count = false;
          }
        }
        else if (variable.toUpperCase() === "INCLUDETOTALTIME") {
          // Will have data column for the total time...
          if (value.toUpperCase() === "TRUE") {
            include_total_time = true;
          }
          else {
            include_total_time = false;
          }
        }
        else if (variable.toUpperCase() === "MISSINGVAL") {
          // Have the missing data value...
          missing = value;
          missing_v = StringUtil.breakStringList(
            missing, delimiter, delimParseFlag | StringUtil.DELIM_ALLOW_STRINGS);
          size = 0;
          if (missing_v != null) {
            size = missing_v.length;
          }
          if (size != numts) {
            console.error("Number of Missing values using delimiter \"" + delimiter +
              "\" (" + size + ") is != NumTS (" + numts + ").  Assuming -999.  Read errors may occur.");
            ++warning_count;
            for (let ia = size; ia < numts; ia++) {
              missing_v.push("");
            }
          }
        }
        else if (variable.toUpperCase() === "NUMTS") {
          // Have the number of time series...
          numts = StringUtil.atoi(value);
        }
        else if (variable.toUpperCase().startsWith("PROPERTIES_")) {
          // Found a properties string of the form Properties_NN = { ... }
          if (propertiesList === null) {
            // Create a PropList for each time series
            propertiesList = new Array<PropList>(numts);
            for (let i = 0; i < numts; i++) {
              propertiesList.push(new PropList(""));
            }
          }
          // Now parse out the properties for this time series and set in the list
          var pos1 = variable.indexOf("_");
          if (pos1 > 0) {
            var iprop = parseInt(variable.substring(pos1 + 1).trim());
            propertiesList.splice((iprop - 1), 0, DateValueTS.parseTimeSeriesProperties(value));
          }
        }
        else if (variable.toUpperCase() === "SEQUENCENUM" || variable.toUpperCase() === "SEQUENCEID") {
          // Have sequence numbers...
          seqnum = value;
          seqnum_v = StringUtil.breakStringList(
            seqnum, delimiter, delimParseFlag | StringUtil.DELIM_ALLOW_STRINGS);
          size = 0;
          if (seqnum_v != null) {
            size = seqnum_v.length;
            for (let i = 0; i < size; i++) {
              // Replace old -1 missing with blank string
              if (seqnum_v[i] === "-1") {
                seqnum_v.splice(i, 0, "");
              }
            }
          }
          if (size != numts) {
            console.error("Number of SequenceID (or SequenceNum) values using delimiter \"" + delimiter +
              "\" (" + size + ") is != NumTS (" + numts + ").  Assuming -1.  Read errors may occur.");
            ++warning_count;
            for (let ia = size; ia < numts; ia++) {
              seqnum_v.push("");
            }
          }
        }
        else if (variable.toUpperCase() === "START") {
          
          // Have the starting date.  This may be reset below by the requested start date....
          date1 = DateTime.parse(value);
        }
        else if (variable.toUpperCase() === "TSID") {
          // Have the TSIdent...
          identifier = value;
          identifier_v = StringUtil.breakStringList(
            identifier, delimiter, delimParseFlag | StringUtil.DELIM_ALLOW_STRINGS);
          size = 0;
          if (identifier_v != null) {
            size = identifier_v.length;
          }
          if (size != numts) {
            console.error("Number of TSID values using delimiter \"" + delimiter +
              "\" (" + size + ") is != NumTS (" + numts + "). Assuming blank.  Read errors may occur.");
            ++warning_count;
            for (let ia = size; ia < numts; ia++) {
              identifier_v.push("");
            }
          }
        }
        else if (variable.toUpperCase() === "UNITS") {
          // Have the data units...
          units = value;
          units_v = StringUtil.breakStringList(
            units, delimiter, delimParseFlag | StringUtil.DELIM_ALLOW_STRINGS);
          if (units_v != null) {
            size = units_v.length;
          }
          if (size != numts) {
            console.warn("Number of Units values using delimiter \"" + delimiter +
              "\" (" + size + ") is != NumTS (" + numts + "). Assuming blank. Read errors may occur.");
            ++warning_count;
            for (let ia = size; ia < numts; ia++) {
              units_v.push("");
            }
          }
        }
        else {
          console.warn("Property \"" + variable + "\" is not currently recognized.");
        }
      }
    }
    catch (e) {
      message = "Unexpected error processing line " + line_count + ": \"" + string + "\"";
      console.warn(message);
      console.warn(e);
      throw new Error(message);
    }
    if (warning_count > 0) {
      // Print a warning and throw an exception about the header not being properly
      message = "" + warning_count + " errors existing in file header.  Not reading data.";
      console.warn(message);
      // FIXME SAM 2008-04-14 Throw a more specific exception
      throw new Error(message);
    }
    // Reset for below.
    warning_count = 0;

    // Make sure the data flag boolean array is allocated.  This simplifies the logic below...

    if (ts_has_data_flag == null) {
      ts_has_data_flag = new Array<boolean>(numts);
      for (let i = 0; i < numts; i++) {
        ts_has_data_flag[i] = false;
      }
    }

    // Check required data lists and assign defaults if necessary...

    if (identifier_v == null) {
      identifier_v = new Array<string>(numts);
      // TODO SAM 2008-04-14 Evaluate tightening this constraint - throw exception?
      console.warn("TSID property in file is missing.  Assigning default TS1, TS2, ...");
      for (let i = 0; i < numts; i++) {
        identifier_v.push("TS" + (i + 1));
      }
    }

    // Declare the time series of the proper type based on the interval.
    // Use a TSIdent to parse out the interval information...

    var ident: TSIdent = null;
    var data_interval_base = 0;

    var req_ts_i = -1;	// Which time series corresponds to the requested time series.
    var req_ts_column = -1;	// Which column of data corresponds to the requested time series.
    var req_ts_column2 = -1;// Which column of data corresponds to the
    // requested time series, after adjustment for possible additional time column in date.
    var ts: TS = null;
    var tslist: TS[] = null;
    var ts_array: TS[] = null;	// Use this to speed processing so we don't have to search through tslist all the time
    // Set the time series to either the requested time series
    // or a newly-created time series.  If a requested time series is
    // given but only its alias is available, create a new time series
    // using the matching TSID, which will contain the interval, etc.
    if (req_ts != null) {
      req_ts_i = -1;	// Index of found time series...
      // If there is only one time series in the file, assume it should be used, regardless...
      if (numts == 1) {
        //Message.printStatus ( 1, "", "Using only TS because only one TS in file." );
        req_ts_i = 0;
      }
      if (req_ts_i < 0) {
        // Need to keep searching.  Loop through all the time series identifiers and compare exactly.
        // That way if only the scenarios are different we will find the correct time series.
        for (let i = 0; i < numts; i++) {
          // Check the alias for a match.  This takes precedence over the identifier.
          if (alias_v != null) {
            alias = alias_v[i].trim();
            if (alias !== "" && req_ts.getAlias().toUpperCase() === alias.toUpperCase()) {
              // Found a matching time series...
              req_ts_i = i;
              //Message.printStatus ( 1, "", "Found matching TS "+req_ts_i+ " based on alias." );
              break;
            }
          }
          // Now check the identifier...
          identifier = identifier_v[i].trim();
          if (req_ts.getIdentifierString().toUpperCase() === identifier.toUpperCase()) {
            // Found a matching time series...
            req_ts_i = i;
            //Message.printStatus ( 1, "", "SAMX Found matching TS " + req_ts_i + " based on full TSID." );
            break;
          }
        }
      }
      if (req_ts_i < 0) {
        // Did not find the requested time series...
        message = "Did not find the requested time series \"" + req_ts.getIdentifierString() + "\" Alias \"" +
          req_ts.getAlias() + "\"";
        console.warn(message);
        throw new Error(message);
      }
      // If here a requested time series was found.  However, if the requested TSID used the
      // alias only, need to create a time series of the correct type using the header information...
      if (req_ts.getLocation() === "" && req_ts.getAlias() !== "") {
        // The requested time series is only identified by the alias and needs to be recreated for the full
        // identifier.  This case is configured in the calling public readTimeSeries() method.
        identifier = identifier_v[req_ts_i].trim();
        //Message.printStatus ( 1, routine,"SAMX creating new req_ts for \"" +
        //identifier + "\" alias \"" + req_ts.getAlias() +"\"");
        ts = TSUtil.newTimeSeries(identifier, true);
        ts.setIdentifier(identifier);
        // Reset the requested time series to the new one because req_ts is checked below...
        ts.setAlias(req_ts.getAlias());
        req_ts = ts;
      }
      else {
        // A full TSID was passed in for the requested time series and there is no need to reassign the requested
        // time series...
        //Message.printStatus ( 1, routine, "SAMX using existing ts for \"" +
        //identifier + "\" alias \"" + req_ts.getAlias() +"\"");
        ts = req_ts;
        // Identifier is assumed to have been set previously.
      }
      // Remaining logic is the same...
      tslist = new Array<TS>(1);
      tslist.push(ts);
      ts_array = new Array<TS>(1);
      ts_array[0] = ts;
      // if ( Message.isDebugOn ) {
      // Message.printDebug ( 1, routine, "Adding requested time series to list." );
      // }
      ident = new TSIdent(ts.getIdentifier());
      data_interval_base = ident.getIntervalBase();
      // Offset other information because of extra columns...
      // Make sure to set the interval for use below...
      identifier = identifier_v[req_ts_i].trim();
      ident = new TSIdent(identifier);
      // Set the data type in the TS header using the information in the identifier.
      // It may be overwritten below if the DataType property is specified...
      ts.setDataType(ident.getType());
      // Reset the column to account for the date...
      req_ts_column = req_ts_i + 1;	// 1 is date.
      if (include_count) {
        ++req_ts_column;
      }
      if (include_total_time) {
        ++req_ts_column;
      }
      if (dataflag_v != null) {
        // At least one of the time series in the file uses data flags so adjust the column for
        // time series that may be before the requested time series...
        for (let ia = 0; ia < req_ts_i; ia++) {
          if (ts_has_data_flag[ia]) {
            ++req_ts_column;
          }
        }
      }
      // if ( Message.isDebugOn ) {
      // Message.printDebug ( 1, routine, "Time series \"" + req_ts.getIdentifierString() +
      // "\" will be read from data column " + req_ts_column + " (date column = 0)" );
      // }
    }
    else {
      // Allocate here as many time series as indicated by numts...
      tslist = new Array<TS>(numts);
      ts_array = new Array<TS>(numts);
      // if ( Message.isDebugOn ) {
      // Message.printDebug ( 1, routine, "Allocated space for " + numts + " time series in list." );
      // }
      for (let i = 0; i < numts; i++) {
        identifier = identifier_v[i].trim();
        ident = new TSIdent(identifier);
        // Need this to check whether time may be specified on data line...
        data_interval_base = ident.getIntervalBase();
        ts = TSUtil.newTimeSeries(identifier, true);
        if (ts == null) {
          console.warn("Unable to create new time series for \"" + identifier + "\"");
          return null;
        }
        // Only set the identifier if a new time series.
        // Otherwise assume the the existing identifier is to be used (e.g., from a file name).
        ts.setIdentifier(identifier);
        ts.getIdentifier().setInputType("DateValue");
        tslist.push(ts);
        ts_array[i] = ts;
        // if ( Message.isDebugOn ) {
        // Message.printDebug ( 1, routine, "Created memory for \"" + ts.getIdentifierString() + "\"" );
        // }
      }
    }

    // Set the parameters from the input variables and override with the
    // parameters in the file if necessary...
    if (req_date1 != null) {
      date1 = req_date1;
    }
    if (req_date2 != null) {
      date2 = req_date2;
    }
    if ((date1 != null) && (date2 != null) && date1.greaterThan(date2)) {
      console.warn("Date2 (" + date2 + ") is > Date1 (" + date1 + ").  Errors are likely.");
      ++warning_count;
    }
    try {
      for (let i = 0; i < numts; i++) {
        if (req_ts != null) {
          if (req_ts_i != i) {
            // A time series was requested but does not match so continue...
            continue;
          }
          else {	// Found the matching requested time series...
            ts = ts_array[0];
          }
        }
        else {	// Reading a list...
          ts = ts_array[i];
        }
        // if ( Message.isDebugOn ) {
        // Message.printDebug ( 1, routine, "Setting properties for \"" + ts.getIdentifierString() + "\"" );
        // }
        if (alias_v != null) {
          alias = alias_v[i].trim();
          if (alias !== "") {
            ts.setAlias(alias);
          }
        }
        if (datatype_v != null) {
          datatype = datatype_v[i].trim();
          if (datatype !== "") {
            ts.setDataType(datatype);
          }
        }
        if (units_v != null) {
          units = units_v[i].trim();
          ts.setDataUnits(units);
          ts.setDataUnitsOriginal(units);
        }
        ts.setDate1(date1);
        ts.setDate1Original(date1);
        ts.setDate2(date2);
        ts.setDate2Original(date2);
        if (description_v != null) {
          description = description_v[i].trim();
          ts.setDescription(description);
        }
        if (missing_v != null) {
          missing = missing_v[i].trim();
          if (missing.toUpperCase() === "NAN") {
            ts.setMissing(NaN);
          }
          else if (StringUtil.isDouble(missing)) {
            ts.setMissing(StringUtil.atod(missing));
          }
        }
        if (seqnum_v != null) {
          seqnum = seqnum_v[i].trim();
          ts.setSequenceID(seqnum);
        }
        if (ts_has_data_flag[i]) {
          // Data flags are being used.
          ts.hasDataFlags(true, true);
        }
        if (propertiesList != null) {
          // Transfer the properties
          var props: PropList = propertiesList[i];
          for (let prop of props.getList()) {
            ts.setProperty(prop.getKey(), prop.getContents());
          }
        }
        if (dataFlagMetadataList != null) {
          // Transfer the data flag descriptions
          var metaList: TSDataFlagMetadata[] = dataFlagMetadataList[i];
          for (let meta of metaList) {
            ts.addDataFlagMetadata(meta);
          }
        }
      }
    }
    catch (e) {
      message = "Unexpected error initializing time series.";
      console.warn(message);
      console.warn(e);
      ++warning_count;
    }
    if (warning_count > 0) {
      message = "" + warning_count + " errors occurred initializing time series.  Not reading data.";
      console.warn(message);
      // FIXME SAM 2008-04-14 Evaluate throwing more specific Error.
      throw new Error(message);
    }
    // if ( Message.isDebugOn ) {
    // Message.printDebug ( 10, routine, "Read TS header" );
    // }
    warning_count = 0; // Reset for reading data section below.

    // Check the header information.  If the data type has not been
    // specified but is included in the time series identifier, set in the data type...

    size = 0;
    if (tslist != null) {
      size = tslist.length;
    }
    for (let i = 0; i < size; i++) {
      if (ts.getDataType().trim() === "") {
        ts.setDataType(ts.getIdentifier().getType());
      }
    }

    if (!read_data) {
      return tslist;
    }

    // Allocate the memory for the data array.  This needs to be done
    // whether a requested time series or list is being done...

    if (req_ts != null) {
      ts = ts_array[0];
      if (ts.allocateDataSpace() != 0) {
        message = "Error allocating data space for time series.";
        console.warn(message);
        throw new Error(message);
      }
    }
    else {
      for (let i = 0; i < numts; i++) {
        ts = ts_array[i];
        if (ts.allocateDataSpace() != 0) {
          message = "Error allocating data space for time series.";
          console.warn(message);
          throw new Error(message);
        }
      }
    }

    // Now read the data.  Need to monitor if this is a real hog and optimize if so...
    warning_count = 0;

    // if ( Message.isDebugOn ) {
    // Message.printDebug ( dl, routine, "Reading data..." );
    // }

    var date: DateTime;
    var strings: string[];
    var dvalue: number;	// Double data value
    var svalue: string;	// String data value
    var first = true;
    var nstrings = 0;
    var use_time = false;
    if ((data_interval_base == TimeInterval.HOUR) || (data_interval_base == TimeInterval.MINUTE) ||
      (data_interval_base == TimeInterval.IRREGULAR)) {
      // if ( Message.isDebugOn ) {
      // Message.printDebug ( dl, routine, "Expect time to be given with dates - may be separate column." );
      // }
      use_time = true;
    }
    // Compute the number of expected columns...
    var num_expected_columns = numts + 1;	// Number of expected columns
    // given the number of time
    // series, extra columns at the
    // front, data flag columns, and
    // a column for times
    // Column 1 is the date
    var num_extra_columns = 0;		// Number of extra columns at
    // the front of the data
    // (record count and total
    // time).
    if (include_count) {			// Record count
      ++num_expected_columns;
      ++num_extra_columns;
    }
    if (include_total_time) {		// Total time...
      ++num_expected_columns;
      ++num_extra_columns;
    }
    // Adjust the number of expected columns if data flags are included...
    var its = 0, i = 0;
    for (its = 0; its < numts; its++) {
      if (ts_has_data_flag[its]) {
        ++num_expected_columns;
      }
    }
    var first_data_column = 0;
    var num_expected_columns_p1 = num_expected_columns + 1;
    // Start over for the data lines so we don't read over the commented out lines of the file and the metadata lines as well
    // Added by jpkeahey
    var data_line_count = 0;
    
    // Read lines until the end of the file...
    for (let string of dateValueArray) {
      // If the line number is less than what has been read so far, keep going through the array until we get to
      // the data lines
      if (data_line_count < line_count - 1) {
        ++data_line_count;
        continue;
      }

      try {
        if (first) {
          // Have read in the line above so process it in the
          // following code.  The line will either start with
          // "Date" or a date (e.g., MM/DD/YYYY), or will be
          // invalid.  Note that for some programs, the date and
          // all other columns actually have a suffix.  This may
          // be phased out at some time but is the reason why the
          // first characters are checked...
          first = false;
          ++data_line_count;          
          if (string.toUpperCase().startsWith("DATE")) {
            // Can ignore because it is the header line for columns...
            continue;
          }
        }
        else {
          // Need to read a line...
          // string = in.readLine();
          ++data_line_count;
          if (string == null) {
            // if ( Message.isDebugOn ) {
            // Message.printDebug ( dl, routine, "Detected end of file." );
            // }
            break;
          }
        }
        // Remove whitespace at front and back...
        string = string.trim();
        // if ( Message.isDebugOn ) {
        // Message.printDebug ( dl2, routine, "Processing: \"" + string + "\"" );
        // }
        if ((string.length == 0) || ((string.length > 0) && (string.charAt(0) == '#'))) {
          // Skip comments and blank lines for now...
          continue;
        }
        if (!/^\d/.test(string)) {
          // Not a data line...
          console.warn(
            "Error in data format for line " + line_count + ". Expecting number at start: \"" + string + "\"");
          ++warning_count;
          continue;
        }
        // Now parse the string...
        // If hour, or minute data, expect data line to be YYYY-MM-DD HH:MM Value
        // If there is a space between date and time, assume that the first two need to be concatenated.
        string = string.trim();
        if (dataflag_v == null) {
          // No data flags so parse without handling quoted strings.  This will in general be faster...
          strings = StringUtil.breakStringList(string, delimiter, delimParseFlag);
        }
        else {
          // Expect to have data flags so parse WITH handling quoted strings.  This will generally be slower...
          strings = StringUtil.breakStringList(string,
            delimiter, delimParseFlag | StringUtil.DELIM_ALLOW_STRINGS);
        }
        nstrings = 0;
        if (strings != null) {
          nstrings = strings.length;
        }
        if (nstrings == num_expected_columns) {
          // Assume that there is NO space between date and time or that time field is not used...
          date_str = String(strings[0]).trim();
          // Date + extra columns...
          first_data_column = 1 + num_extra_columns;
          req_ts_column2 = req_ts_column;
        }
        else if (use_time && (nstrings == num_expected_columns_p1)) {
          // Assume that there IS a space between the date and
          // time.  Concatenate together so that the DateTime.parse will work.
          date_str = String(strings[0]).trim() + " " + String(strings[1]).trim();
          // Date + time + extra column...
          first_data_column = 2 + num_extra_columns;
          // Adjusted requested time series column...
          req_ts_column2 = req_ts_column + 1;
        }
        else {
          console.warn(2, routine, "Error in data format for line " + line_count + ". Have " +
            nstrings + " fields using delimiter \"" + delimiter + "\" but expecting " +
            num_expected_columns + ": \"" + string);
          ++warning_count;
          //Message.printStatus ( 1, routine, "use_time=" + use_time + " num_expected_columns_p1=" +
          //num_expected_columns_p1 );
          // Ignore the line...
          strings = null;
          continue;
        }
        // Allow all common date formats, even if not the right precision...
        date = DateTime.parse(date_str);
        // The input line date may not have the proper resolution, so
        // set to the precision of the time series defined in the header.
        if (data_interval_base == TimeInterval.MINUTE) {
          date.setPrecisionOne(DateTime.PRECISION_MINUTE);
        }
        else if (data_interval_base == TimeInterval.HOUR) {
          date.setPrecisionOne(DateTime.PRECISION_HOUR);
        }
        else if (data_interval_base == TimeInterval.DAY) {
          date.setPrecisionOne(DateTime.PRECISION_DAY);
        }
        else if (data_interval_base == TimeInterval.MONTH) {
          date.setPrecisionOne(DateTime.PRECISION_MONTH);
        }
        else if (data_interval_base == TimeInterval.YEAR) {
          date.setPrecisionOne(DateTime.PRECISION_YEAR);
        }
        if (date.lessThan(date1)) {
          // No data of interest yet...
          strings = null;
          // if ( Message.isDebugOn ) {
          // Message.printDebug ( 1, routine, "Ignoring data - before start date" );
          // }
          continue;
        }
        else if (date.greaterThan(date2)) {
          // No need to keep reading...
          strings = null;
          // if ( Message.isDebugOn ) {
          // Message.printDebug ( 1, routine, "Stop reading data - after start date" );
          // }
          break;
        }

        // Else, save the data for each column...

        if (req_ts != null) {
          // Just have to process one column...
          svalue = String(strings[req_ts_column2]).trim();
          // This introduces a performance hit - maybe need to add a boolean array for each time series
          // to be able to check whether NaN is the missing - then can avoid the check.
          // For now just check the string.
          if (Number(svalue) === NaN || (svalue == null) || (svalue.length == 0)) {
            // Treat the data value as missing.
            dvalue = ts_array[0].getMissing();
          }
          else {
            // A numerical missing value like -999 will just get assigned.
            dvalue = StringUtil.atod(svalue);
          }
          if (ts_has_data_flag[req_ts_i]) {
            // Has a data flag...
            dataflag = String(strings[req_ts_column2 + 1]).trim();
            ts_array[0].setDataValueFour(date, dvalue, dataflag, 1);
            // if ( Message.isDebugOn ) {
            // Message.printDebug ( dl2, routine, "For date " + date.toString() +
            // ", value=" + dvalue + ", flag=\"" +	dataflag + "\"" );
            // }
          }
          else {	// No data flag...
            ts_array[0].setDataValueTwo(date, dvalue);
            // if ( Message.isDebugOn ) {
            // Message.printDebug ( dl2, routine, "For date " + date.toString() + ", value=" + dvalue );
            // }
          }
        }
        else {
          // Loop through all the columns...
          for (i = first_data_column, its = 0; i < nstrings; i++, its++) {
            // Set the data value in the requested time series.  If a requested time series is
            // being used, the array will only contain one time series, which is the requested time
            // series (SAMX 2002-09-05 so why the code above???)...
            //
            // This introduces a performance hit - maybe need to add a boolean array for each time
            // series to be able to check whether NaN is the missing - then can avoid the check.  For
            // now just check the string.
            svalue = String(strings[i]).trim();
            if (svalue === "NaN") {
              dvalue = ts_array[its].getMissing();
            }
            else {
              dvalue = StringUtil.atod(svalue);
            }
            if (ts_has_data_flag[its]) {
              dataflag = String(strings[++i]).trim();
              ts_array[its].setDataValueFour(date, dvalue, dataflag, 1);
              // if ( Message.isDebugOn ) {
              //   Message.printDebug ( dl2, routine, "For date " + date.toString() +
              //   ", value=" + dvalue + ", flag=\"" + dataflag + "\"" );
              // }
            }
            else {
              // No data flag...
              ts_array[its].setDataValueTwo(date, dvalue);
              // if ( Message.isDebugOn ) {
              //   Message.printDebug ( dl2, routine, "For date " + date.toString() + ", value=" + dvalue );
              // }
            }
          }
        }

        // Clean up memory...

        strings = null;
      }
      catch (e) {
        console.warn("Unexpected error processing line " + line_count + ": \"" +
          string + "\"");
        console.warn(e);
        ++warning_count;
      }
    }

    if (warning_count > 0) {
      message = "" + warning_count + " errors were detected reading data in file.";
      console.warn(message);
      // FIXME SAM 2008-04-14 Evaluate throwing a more specific Error
      throw new Error(message);
    }

    //if ( Message::isDebugOn ) {
    //	long address = (long)ts;
    //	Message::printDebug ( 1, routine,
    //	ts->getIdentifierString() + " Read data for " +
    //	ts->getDate1().toString() + " Address " +
    //	String::valueOf(address) + " to " + ts->getDate2().toString());
    //}
    // if ( req_ts != null ) {
    // req_ts.addToGenesis ( "Read DateValue time series from " + ts.getDate1() + " to " + ts.getDate2() );
    // }
    // else {
    // for ( i = 0; i < numts; i++ ) {
    // ts_array[i].addToGenesis ( "Read DateValue time series from " + ts.getDate1() + " to " + ts.getDate2() );
    // }
    // }
    return tslist;
  }

}