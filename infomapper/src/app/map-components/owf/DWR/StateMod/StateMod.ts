import { TS }           from '../../TS/TS';
import { DateTime }     from '../../Util/Time/DateTimeUtil';
import { StringUtil }   from '../../Util/String/StringUtil';
import { TimeInterval } from '../../Util/Time/TimeInterval'
import { TimeUtil }     from '../../Util/Time/DateTimeUtil';
import { MonthTS }      from '../../TS/MonthTS';
import { TSIdent }      from '../../TS/TSIdent';
import { TSUtil }       from '../../TS/TSUtil';
import { YearType }     from '../../Util/Time/YearType';

import { Observable }   from 'rxjs';
import { map }          from 'rxjs/operators';

import { AppService }   from 'src/app/app.service';
import { PathType }     from '../../../map.service';

export class StateMod_TS {

  constructor(public appService: AppService) {}


  /**
  Read a time series from a StateMod format file.  The TSID string is specified
  in addition to the path to the file.  It is expected that a TSID in the file
  matches the TSID (and the path to the file, if included in the TSID would not
  properly allow the TSID to be specified).  This method can be used with newer
  code where the I/O path is separate from the TSID that is used to identify the time series.
  The IOUtil.getPathUsingWorkingDir() method is applied to the filename.
  @return a pointer to a newly-allocated time series if successful, a NULL pointer if not.
  @param tsident_string The full identifier for the time series to read.
  @param filename The name of a file to read
  (in which case the tsident_string must match one of the TSID strings in the file).
  @param date1 Starting date to initialize period (null to read the entire time series).
  @param date2 Ending date to initialize period (null to read the entire time series).
  @param units Units to convert to.
  @param read_data Indicates whether data should be read (false=no, true=yes).
  */
  // When this function is called, it takes the below arguments (which I'll worry)
  // about later, and tries to read a StateMod file
  // TODO: This just let's me know where this all starts from
  public readTimeSeries(tsident_string: string, filename: string, date1?: any, date2?: any,
                                                units?: string, read_data?: boolean): Observable<TS> {
    let ts = null;
    
    // let routine = "StateMod_TS.readTimeSeries";

    if (filename == null) {
      throw new Error("Requesting StateMod file with null filename.");
    }
    // let input_name: string = filename;
    // let full_fname: string = IOUtil.getPathUsingWorkingDir(filename);
    // if (!IOUtil.fileReadable(full_fname)) {
    //   Message.printWarning(2, routine, "Unable to determine file for \"" + filename + "\"");
    //   return ts;
    // }
    // BufferedReader in = null;
    var data_interval = TimeInterval.MONTH;
    // let message = null, routine = "StateMod_TS.getFileDataInterval";
    // BufferedReader ifp = null;
    // var ifp;
    // var iline = null;
    var intervalUnknown = -999; // Return if can't figure out interval
    var interval = intervalUnknown;
    // let full_filename = IOUtil.getPathUsingWorkingDir ( filename );
    // try {
    //   // ifp = 
    // }
    // catch ( e ) {
    //   // message = "Unable to open file \"" + filename + "\" to determine data interval.";
    //   // Message.printWarning ( 2, routine, message );
    //   return intervalUnknown;
    // }
    return this.appService.getPlainText(filename, PathType.sMP).pipe(map((stateModFile: any) => {
      let stateModArray = stateModFile.split('\n');

      // if ( filename.toUpperCase().endsWith("XOP") ) {
      //     // The *.xop file will have "Time Step:   Monthly"
      //     while ( true ) {
      //           iline = ifp.readLine();
      //           if ( iline == null ) {
      //               break;
      //           }
      //           if ( iline.startsWith("#") && iline.toUpperCase().indexOf("TIME STEP:") > 0 ) {
      //               let parts = iline.split(":");
      //               if ( parts.length > 1 ) {
      //                   if ( parts[1].trim().equalsIgnoreCase("Monthly") ) {
      //                       interval = TimeInterval.MONTH;
      //                       break;
      //                   }
      //                   else if ( parts[1].trim().equalsIgnoreCase("Daily") ) {
      //                       interval = TimeInterval.DAY;
      //                       break;
      //                   }
      //               }
      //           }
      //     }
      // }
      // else {
        var header: boolean = true;
        // Skip while a comment or blank line...
        for  ( let line of stateModArray ) {
          if ( line == null ) {
            throw new Error ( "end of file" );
          }
          line = line.trim();
          if ((line.length != 0) && (line.charAt(0) != '#')){
            continue;
          }
          // Now should have the header.  Read one more to get to a data line...
          if (header) {
            header = false;
            continue;
          }          
          // Should be first data line.  If longer than the threshold, assume daily.
          // Trim because some fixed-format write tools put extra spaces at the end
          if ( line.length > 150 ) {
            interval = TimeInterval.DAY;
          }
          else {
            interval = TimeInterval.MONTH;
          }
        }
      // }
        data_interval = interval;
        
      // Determine the interval of the file and create a time series that matches...      
      ts = TSUtil.newTimeSeries(tsident_string, true);

      if (ts == null) {
        console.error("Unable to create time series for \"" + tsident_string + "\"");
        return ts;
      }
      ts.setIdentifierString(tsident_string);
         
      // // The specific time series is modified...
      // // SAM 2007-03-01 Evaluate logic
      let tslist: TS[] = this.readTimeSeriesList(ts, stateModArray, data_interval, date1, date2, units, read_data);
      
      // Get out the first time series because sometimes a new one is created, for example with XOP
      if ((tslist != null) && tslist.length > 0) {
        ts = tslist[0];
      }
      ts.getIdentifier().setInputType("StateMod");
      ts.setInputName(filename);
      // Already in the low-level code
      //ts.addToGenesis ( "Read time series from \"" + full_fname + "\"" );
      ts.getIdentifier().setInputName(filename);       
      return ts;
    }));
  }

  /**
  Read one or more time series from a StateMod format file.
  @return a list of time series if successful, null if not.  The calling code
  is responsible for freeing the memory for the time series.
  @param req_ts Pointer to time series to fill.  If null,
  return all new time series in the list.  All data are reset, except for the
  identifier, which is assumed to have been set in the calling code.
  @param in Reference to open input stream.
  @param full_filename Full path to filename, used for messages.
  @param reqDate1 Requested starting date to initialize period (or NULL to read the entire time series).
  @param fileInterval Indicates the file type (TimeInterval.DAY or TimeInterval.MONTH).
  @param reqDate2 Requested ending date to initialize period (or NULL to read the entire time series).
  @param units Units to convert to (currently ignored).
  @param readData Indicates whether data should be read.
  @exception Exception if there is an error reading the time series.
  */
  private readTimeSeriesList ( req_ts: TS, stateModArray: any[], fileInterval: number, reqDate1: any, reqDate2: any,
    reqUnits: string, readData: boolean ): TS[] {

    var dl: number = 40,
        i: number,
        line_count: number = 0,
        m1: number,
        m2: number,
        y1: number,
        y2: number,
        currentTSindex: number,
        current_month: number = 1,
        current_year: number = 0,
        doffset: number = 2,
        init_month: number = 1,
        init_year: number,
        ndata_per_line: number = 12,
        numts: number = 0;

    var chval: string,
        line: string = ""
        // routine: string = "StateMod_TS.readTimeSeriesList";

    var v: any[] = [];
    var date: any = null;
    
    // TODO: jpkeahey 2020.06.10 - I'm not worrying about xop file extensions right now
    // if ( fullFilename.toUpperCase().endsWith("XOP") ) {
    //     // XOP file is similar to the normal time series format but has some differences
    //     // in that the header is different, station identifier is provided in the header, and
    //     // time series are listed vertically one after another, not interwoven by interval like *.stm
    //     return readXTimeSeriesList ( req_ts, in, fullFilename, fileInterval, reqDate1, reqDate2, reqUnits, readData);
    // }
    var fileIntervalString: string = "";
    if ( fileInterval == TimeInterval.DAY ) {
      date = new DateTime ( DateTime.PRECISION_DAY );
      doffset = 3; // Used when setting data to skip the leading fields on the data line
      fileIntervalString = "Day";
    }
    else if ( fileInterval == TimeInterval.MONTH ){
        date = new DateTime ( DateTime.PRECISION_MONTH );
        fileIntervalString = "Month";
    }
    else {
      throw new Error ( "Requested file interval is invalid." );
    }
    var req_id_found: boolean = false; // Indicates if we have found the requested TS in the file.
    var standard_ts: boolean = true; // Non-standard indicates 12 monthly averages in file.

    var tslist: TS[] = null; // List of time series to return.
    var req_id: string = null;
    if ( req_ts != null ) {
      req_id = req_ts.getLocation();
    }
    // Declare here so are visible in final catch to provide feedback for bad format files
    var date1_header: any = null, date2_header: any = null;
    var units: string = "";
    var yeartype: YearType = YearType.CALENDAR;

    try {
      while (true) {
        line = stateModArray[line_count];
        

        if ( line == null ) {
          // in.close();
          // Message.printWarning ( 2, routine, "Zero length file." );
          return null;
        }
        if ( line.trim().length < 1 ) {
          // in.close();
          // Message.printWarning ( 2, routine, "Zero length file." );
          return null;
        }
        if (line.startsWith('#')) {
          ++line_count;
          continue; // line should be the header line
        }
        break;
      }

      var format_fileContents: string = null;
      if ( line.charAt(3) === '/' ) {
        console.error (
        "Non-standard header - allowing with work-around." );
        format_fileContents = "i3x1i4x5i5x1i4s5s5";
      }
      else {
        // Probably formatted correctly...
        format_fileContents = "i5x1i4x5i5x1i4s5s5";
      }
      
      v = StringUtil.fixedReadTwo( line, format_fileContents );
      v = v.filter(function(element) {
        return element !== undefined;
      });
            
      m1 = (parseInt(v[0]));
      y1 = (parseInt(v[1]));
      m2 = (parseInt(v[2]));
      y2 = (parseInt(v[3]));      
      if ( fileInterval == TimeInterval.DAY ) {
        date1_header = new DateTime ( DateTime.PRECISION_DAY );
        date1_header.setYear( y1 );
        date1_header.setMonth( m1 );
        date1_header.setDay( 1 );
      }
      else {
        date1_header = new DateTime ( DateTime.PRECISION_MONTH );
        date1_header.setYear( y1 );
        date1_header.setMonth( m1 );
      }
      if ( fileInterval == TimeInterval.DAY ) {
        date2_header = new DateTime ( DateTime.PRECISION_DAY );
        date2_header.setYear( y2 );
        date2_header.setMonth( m2 );
        date2_header.setDay( TimeUtil.numDaysInMonth(m2,y2) );
      }
      else {
        date2_header = new DateTime ( DateTime.PRECISION_MONTH );
        date2_header.setYear ( y2 );
        date2_header.setMonth ( m2 );
      }
      units = v[4].toString().trim();
      var yeartypes: string = v[5].trim();
      // Year type is used in one place to initialize the year when
      // transferring data.  However, it is assumed that m1 is always correct for the year type.
      if ( yeartypes.toUpperCase() === "WYR" ) {
        yeartype = YearType.WATER;
      }
      else if ( yeartypes.toUpperCase() === "IYR" ) {
        yeartype = YearType.NOV_TO_OCT;
      }

      // year that are specified are used to set the period.
      // if ( Message.isDebugOn ) {
      //   Message.printDebug ( dl, routine, "Parsed m1=" + m1 + " y1=" +
      //   y1 + " m2=" + m2 + " y2=" + y2 + " units=\"" + units + "\" yeartype=\"" + yeartypes + "\"" );
      // }
    
      var format: any[] = null;
      var format_w: any[] = null;
      if ( fileInterval == TimeInterval.DAY ) {
        format = new Array<number>(35);
        format_w = new Array<number>(35);
        format[0] = StringUtil.TYPE_INTEGER;
        format[1] = StringUtil.TYPE_INTEGER;
        format[2] = StringUtil.TYPE_SPACE;
        format[3] = StringUtil.TYPE_STRING;
        for ( var iFormat = 4; iFormat <= 34; ++iFormat ) {
            format[iFormat] = StringUtil.TYPE_DOUBLE;
        }
        format_w[0] = 4;
        format_w[1] = 4;
        format_w[2] = 1;
        format_w[3] = 12;
        for ( var iFormat = 4; iFormat <= 34; ++iFormat ) {
            format_w[iFormat] = 8;
        }
      }
      else {
        format = new Array<number>(14);
        format[0] = StringUtil.TYPE_INTEGER;
        format[1] = StringUtil.TYPE_STRING;
        for ( var iFormat = 2; iFormat <= 13; ++iFormat ) {
            format[iFormat] = StringUtil.TYPE_DOUBLE;
        }
        format_w = new Array<number>(14);
        format_w[0] = 5;
        format_w[1] = 12;
        for ( var iFormat = 2; iFormat <= 13; ++iFormat ) {
            format_w[iFormat] = 8;
        }
      }
      if ( y1 == 0 ) {
        // average monthly series
        standard_ts = false;
        // if ( Message.isDebugOn ) {
        //   Message.printDebug ( dl, routine, "Found average monthly series" );	
        // }
    
        format[0] = StringUtil.TYPE_STRING;	// Year not used.
        current_year = 0; // Start year will be calendar year 0
        init_year = 0;
        if ( m2 < m1 ) {
          y2 = 1; // End year is calendar year 1.
        }
      }
      else {
        // standard time series, includes a year on input lines
        // if ( Message.isDebugOn ) {
        //   Message.printDebug ( dl, routine, "Found time series" );	
        // }
    
        current_year = y1;
        if ( (fileInterval == TimeInterval.MONTH) && (m2 < m1) ) {
          // Monthly data and not calendar year - the first year
          // shown in the data will be water or irrigation year
          // and will not match the calendar dates shown in the header...
          init_year = y1 + 1;
        }
        else {
          init_year = y1;
        }
      }
      current_month = m1;
      init_month = m1;
    
      // Read remaining data lines.  If in the first year, allocate memory
      // for each time series as a new station is encountered...
      currentTSindex = 0;
      var currentTS: TS = null, ts: TS = null; // Used to fill data.
      // TODO SAM 2007-03-01 Evaluate use
      //int req_ts_index; // Position of requested TS in data.
      var id: string = null; // Identifier for a row.
    
      // Sometimes, the time series files have empty lines at the
      // bottom, checking it's length seemed to solve the problem.
      var second_line = null;
      var single_ts: boolean = false; // Indicates whether a single time series is in the file.
      var have_second_line: boolean = false;
      var data_line_count: number = 0;
      // jpkeahey added this line so it 'reads' the next line in the file.
      ++line_count;

      while ( true ) {
        if ( data_line_count == 0 ) {
          line = stateModArray[line_count];

          if ( line == null ) {
            break;
          }
          else if ( line.startsWith("#") ) {
            // Comment line.  Count the line but do not treat as data...
            ++line_count;
            continue;
          }
          // To allow for the case where only one time series is
          // in the file and a req_id is specified that may
          // be different (but always return the file contents), read the second line...
          ++line_count;
          second_line = stateModArray[line_count];
          
          have_second_line = true;
          if ( second_line != null ) {
            // Check to see if the year from the first line
            // is different from the second line, and the
            // identifiers are the same.  If so, assume one time series in the file...
            var line1_year: number = StringUtil.atoi( line.substring(0,5).trim() );
            var line2_year: number = StringUtil.atoi( second_line.substring(0,5).trim() );
            var line1_id: string = line.substring(5,17).trim();
            var line2_id: string = second_line.substring(5,17).trim();
            if ( line1_id === line2_id && (line1_year != line2_year) ) {              
              single_ts = true;
              // Message.printStatus ( 2, routine, "Single TS detected - reading all." );
              if ( (req_id != null) && line1_id.toUpperCase() !== req_id.toUpperCase() ) {
                console.error (
                "Reading StateMod file, the requested ID is \"" +
                req_id + "\" but the file contains only \"" + line1_id + "\"." );
                console.error (
                "Will read the file's data but use the requested identifier." );
              }
            }
          }
        }
        else if ( have_second_line ) {
          // Special case where the 2nd line was read immediately after the first to check to
          // see if only one time series is in the file.  If here, set the line to
          // what was read before...
          have_second_line = false;
          line = second_line;
          second_line = null;
        }
        else {
          // Read another line...
          ++line_count;
          line = stateModArray[line_count];
        }
        if ( line == null ) {
          // No more data...
          break;
        }
        // This ++line_count was incorrectly reading lines from the dataArray, causing it to skip
        // every other line
        // ++line_count;
        if ( line.startsWith("#") ) {
          // Comment line.  Count the line but do not treat as data...
          continue;
        }
        ++data_line_count;
        if ( line.length == 0 ) {
          // Treat as a blank data line...
          continue;
        }

        // if ( Message.isDebugOn ) {
        //   Message.printDebug ( dl, routine, "Parsing line: \"" + iline + "\" line_count=" + line_count +
        //     " data_line_count=" + data_line_count );
        // }
    
        // The first thing that we do is get the time series identifier
        // so we can check against a requested identifier.  If there is
        // only one time series in the file, always use it.
        if ( req_id != null ) {
          // Have a requested identifier and there are more than one time series.
          // Get the ID from the input line.  Don't parse
          // out the remaining lines unless this line is a match...
          if ( fileInterval == TimeInterval.MONTH ) {
            chval = line.substring(5,17);
          }
          else {
            // Daily, offset for month...
            chval = line.substring(9,21);
          }
          // Need this below...
          id = chval.trim();
          
          if ( !single_ts ) {
            if ( id.toUpperCase() !== req_id.toUpperCase() ) {
              // We are not interested in this time series so don't process...
              // if ( Message.isDebugOn ) {
              //   Message.printDebug ( dl,routine, "Looking for \"" + req_id +
              //   "\".  Not interested in \"" +id+ "\".  Continuing." );
              // }
              continue;
            }
          }
        }
        
        // Parse the data line...
        StringUtil.fixedReadFour ( line, format, format_w, v );

        if ( standard_ts ) {
          // This is monthly and includes year
          current_year = ( parseInt(v[0]));
          if ( fileInterval == TimeInterval.DAY ) {
            current_month = ( parseInt(v[1]));
            // if ( Message.isDebugOn ) {
            //   Message.printDebug ( dl, routine,
            //   "Found id!  Current date is " + current_year + "-" + current_month );
            // }
          }
          else {
            // if ( Message.isDebugOn ) {
            //   Message.printDebug ( dl, routine, "Found id!  Current year is " + current_year );
            // }
          }
        }
        else {
          // if ( Message.isDebugOn ) {
          //   Message.printDebug ( dl, routine, "Found ID!  Read average format." );
          // }
        }

        // If we are reading the entire file, set id to current id
        if ( req_id == null ) {
          if ( fileInterval == TimeInterval.DAY ) {
            // Have year, month, and then ID...
            id = v[2].toString().trim();
          }
          else {
            // Have year, and then ID...
            id = v[1].toString().trim();
          }
        }
        
        // We are still establishing the list of stations in file
        // if ( Message.isDebugOn ) {
        //   Message.printDebug ( dl, routine, "Current year: " + current_year + ", Init year: " + init_year );
        // }
        if ( ((fileInterval == TimeInterval.DAY) && (current_year == init_year) &&
          (current_month == init_month)) || ((fileInterval == TimeInterval.MONTH) &&
          (current_year == init_year)) ) {            
          if ( req_id == null ) {
            // Create a new time series...
            if ( fileInterval == TimeInterval.DAY ) {
              // TODO: jpkeahey 2020.06.10 - Josh commented this out for now.
              // ts = new DayTS();
            }
            else {
              ts = new MonthTS();
            }
          }
          else if ( id.toUpperCase() === req_id.toUpperCase() || single_ts ) {
            // We want the requested time series to get filled in...
            ts = req_ts;
                 
            req_id_found = true;
            numts = 1;
            // Save this index as that used for the requested time series...
            // TODO SAM 2007-04-10 Evaluate use
            //req_ts_index = currentTSindex;
          }
          // Else, we already caught this in a check above and would not get to here.
          if ( (reqDate1 != null) && (reqDate2 != null) ) {
            // Allocate memory for the time series based on the requested period.            
            ts.setDate1 ( reqDate1 );
            ts.setDate2 ( reqDate2 );
            ts.setDate1Original ( date1_header );
            ts.setDate2Original ( date2_header );
          }
          else {            
            // Allocate memory for the time series based on the file header....
            date.setMonth ( m1 );
            date.setYear ( y1 );
            if ( fileInterval === TimeInterval.DAY ) {
              date.setDay ( 1 );
            }
            ts.setDate1 ( date );
            ts.setDate1Original ( date1_header );
            date.setMonth ( m2 );
            date.setYear ( y2 );
            if ( fileInterval === TimeInterval.DAY ) {
              date.setDay ( TimeUtil.numDaysInMonth ( m2, y2 ) );
            }
            ts.setDate2 ( date );
            ts.setDate2Original ( date2_header );
          }

          if ( readData ) {
            ts.allocateDataSpace();
          }
          // if ( Message.isDebugOn ) {
          //   Message.printDebug ( dl, routine, "Setting data units to " + units );
          // }
          ts.setDataUnits ( units );
          ts.setDataUnitsOriginal ( units );

          // The input name is the full path to the input file...
          // TODO: jpkeahey 2020.06.10 - Josh commented the below line out
          // ts.setInputName ( fullFilename );
          // Set other identifier information.  The readTimeSeries() version that takes a full
          // identifier will reset the file information because it knows
          // whether the original filename was from the scenario, etc.
          var ident: TSIdent = new TSIdent ();
          ident.setLocation1 ( id );
          // TODO SAM 2008-05-11 - should not need now that input type is default
          //ident.setSource ( "StateMod" );
          if ( fileInterval == TimeInterval.DAY ) {
            ident.setInterval ( "DAY" );
          }
          else {
              ident.setInterval ( "MONTH" );
          }
          ident.setInputType ( "StateMod" );
          // TODO: jpkeahey 2020.06.10 - Josh commented this out since this function does not get the filename anymore.
          // ident.setInputName ( fullFilename );
          ts.setDescription ( id );
          // May be forcing a read if only one time series but only reset the identifier if the
          // file identifier does match the requested...
          if ( ((req_id != null) && req_id_found && id.toUpperCase() === req_id.toUpperCase() || (req_id == null)) ) {
            // Found the matching ID.
            ts.setIdentifierObject ( ident );
            // if ( Message.isDebugOn) {
            //   Message.printDebug ( dl, routine, "Setting id to " + id + " and ident to " + ident );
            // }
            // ts.addToGenesis ( "Read StateMod TS for " +
            // ts.getDate1() + " to " + ts.getDate2() + " from \"" + fullFilename + "\"" );
          }
          if ( !req_id_found ) {
            // Attach new time series to list.  This is only done if we have not passed
            // in a requested time series to fill.
            if ( tslist == null ) {
              tslist = [];
            }            
            tslist.push ( ts );
            numts++;
          }
        }
        else {
          if ( !readData ) {
            // Done reading the data.
            break;
          }
        }

        // If we are working through the first year, currentTSindex will
        // be the last element index.  On the other hand, if we have
        // already established the list and are filling the rest of the
        // rows, currentTSindex should be reset to 0.  This assumes that
        // the number and order of stations is consistent in the file from year to year.
    
        if ( currentTSindex >= numts ) {
          currentTSindex = 0;
        }
    
        if ( !req_id_found ) {
          // Filling a vector of TS...
          currentTS = tslist[currentTSindex];
        }
        else {
          // Filling a single time series...
          currentTS = req_ts;
        }
    
        if ( fileInterval == TimeInterval.DAY ) {
          // Year from the file is always calendar year...
          date.setYear ( current_year );
          // Month from the file is always calendar month...
          date.setMonth ( current_month );
          // Day always starts at 1...
          date.setDay (1);
        }
        else {
          // Monthly data.  The year is for the calendar type and
          // therefore the starting year may actually need to
          // be set to the previous year.  Don't do the shift for average monthly values.
          if ( standard_ts && (yeartype != YearType.CALENDAR) ) {
            date.setYear ( current_year - 1 );
          }
          else {
            date.setYear ( current_year );
          }
          // Month is assumed from calendar type - it is assumed that the header is correct...
          date.setMonth (m1);
        }
        if ( reqDate2 != null ) {
          if ( date.greaterThan(reqDate2) ) {
            break;
          }
        }
    
        if ( readData ) {
          if ( fileInterval == TimeInterval.DAY ) {
            // Need to loop through the proper number of days for the month...
            ndata_per_line = TimeUtil.numDaysInMonth(date.getMonth(), date.getYear() );
          }
          for ( i=0; i < ndata_per_line; i++ ) {
            // if ( Message.isDebugOn ) {
            //   Message.printDebug ( dl, routine, "Setting data value for " +
            //   date.toString() + " to " + ((Double)v.get(i + doffset)));
            // }
            currentTS.setDataValueTwo ( date, Number(v[i + doffset]));
            if ( fileInterval == TimeInterval.DAY ) {
              date.addDay ( 1 );
            }
            else {              
              date.addMonth ( 1 );              
            }
          }
        }
        currentTSindex++;
      }
    } // Main try around routine.
    catch ( e ) {
        var message: string = "Error reading file near line " + line_count + " header indicates interval " + fileIntervalString +
        ", period " + date1_header + " to " + date2_header + ", units =\"" + units + "\" line: " + line;
      // Message.printWarning ( 3, routine, message );
      // Message.printWarning ( 3, routine, e );
      throw new Error ( message + " (" + e + ") - CHECK DATA FILE FORMAT." );
    }
    return tslist;
  }

}