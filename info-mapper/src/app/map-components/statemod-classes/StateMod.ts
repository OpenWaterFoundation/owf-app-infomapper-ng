import { DateTime }     from './DateTime';
import { StringUtil }   from './StringUtil';
import { TimeInterval } from './TimeInterval'
import { TimeUtil }     from './TimeUtil';

import { Observable }   from 'rxjs';
import { map }          from 'rxjs/operators';

import { AppService } from 'src/app/app.service';

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
  readTimeSeries(tsident_string: string, filename: string, date1?: any, date2?: any,
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
    return this.appService.getPlainText(filename, 'StateMod Data File').pipe(map((stateModFile: any) => {
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
            currentTS.setDataValue ( date, Number(v[i + doffset]));
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


export class TS {

  /**
  Data flavor for transferring this object.
  */
  // public static DataFlavor tsFlavor = new DataFlavor(RTi.TS.TS.class,"RTi.TS.TS");

  /**
  General string to use for status of the time series (use as appropriate by
  high-level code).  This value is volatile - do not assume its value will remain
  for long periods.  This value is not used much now that the GRTS package has been updated.
  */
  _status: string;

  /**
  Beginning date/time for data, at a precision appropriate for the data.
  Missing data may be included in the period.
  */
  _date1: any;

  /**
  Ending date/time for data, at a precision appropriate for the data.
  Missing data may be included in the period.
  */
  _date2: any;

  /**
  Original starting date/time for data, at a precision appropriate for the data.
  For example, this may be used to indicate the period in a database, which is
  different than the period that was actually queried and saved in memory.
  */
  _date1_original: any;

  /**
  Original ending date/time for data, at a precision appropriate for the data.
  For example, this may be used to indicate the period in a database, which is
  different than the period that was actually queried and saved in memory.
  */
  _date2_original: any;

  /**
  The data interval base.  See TimeInterval.HOUR, etc.
  */
  _data_interval_base: number;	

  /**
  The base interval multiplier (what to multiply _interval_base by to get the
  real interval).  For example 15-minute data would have
  _interval_base = TimeInterval.MINUTE and _interval_mult = 15.
  */
  _data_interval_mult: number;

  /**
  The data interval in the original data source (for example, the source may be
  in days but the current time series is in months).
  */
  _data_interval_base_original: number;

  /**
  The data interval multiplier in the original data source.
  */
  _data_interval_mult_original: number;

  /**
  Number of data values inclusive of _date1 and _date2.  Set in the
  allocateDataSpace() method.  This is useful for general information.
  */
  _data_size: any;	

  /**
  Data units.  A list of units and conversions is typically maintained in the DataUnits* classes.
  */
  _data_units: string;

  /**
  Units in the original data source (e.g., the current data may be in CFS and the
  original data were in CMS).
  */
  _data_units_original: string;

  /**
  Indicates whether data flags are being used with data.  If enabled, the derived
  classes that store data should override the allocateDataSpace(boolean, int)
  method to create a data array to track the data flags.  It is recommended to
  save space that the flags be handled using String.intern().
  */
  _has_data_flags: boolean = false;

  /**
  Indicate whether data flags should use String.intern().
  */
  _internDataFlagStrings: boolean = true;

  // FIXME SAM 2007-12-13 Need to phase this out in favor of handling in DAO code.
  /**
  Version of the data format (mainly for use with files).
  */
  _version: string;

  // FIXME SAM 2007-12-13 Need to evaluate renaming to avoid confusion with TSIdent input name.
  // Implementing a DataSource concept for input/output may help (but also have data source in TSIdent!).
  /**
  Input source information.  Filename if read from file or perhaps a database
  name and table (e.g., HydroBase.daily_flow).  This is the actual location read,
  which should not be confused with the TSIdent storage name (which may not be fully expanded).
  */
  _input_name: string;	

  /**
  Time series identifier, which provides a unique and absolute handle on the time series.
  An alias is provided within the TSIdent class.
  */
  _id: TSIdent;

  /**
  Indicates whether the time series data have been modified by calling
  setDataValue().  Call refresh() to update the limits.  This is not used with header data.
  */
  _dirty: boolean;

  /**
  Indicates whether the time series is editable.  This primarily applies to the
  data (not the header information).  UI components can check to verify whether
  users should be able to edit the time series.  It is not intended to be checked
  by low-level code (manipulation is always granted).
  */
  _editable: boolean = false;

  /**
  A short description (e.g, "XYZ gage at ABC river").
  */
  _description: string;

  /**
  Comments that describe the data.  This can be anything from an original data
  source.  Sometimes the comments are created on the fly to generate a standard
  header (e.g., describe drainage area).
  */
  _comments: any[];

  /**
  List of metadata about data flags.  This provides a description about flags
  encountered in the time series.
  */
  // private List<TSDataFlagMetadata> __dataFlagMetadataList = new Vector<TSDataFlagMetadata>();

  /**
  History of time series.  This is not the same as the comments but instead
  chronicles how the time series is manipulated in memory.  For example the first
  genesis note may be about how the time series was read.  The second may
  indicate how it was filled.  Many TSUtil methods add to the genesis.
  */
  _genesis: any[];

  /**
  TODO SAM 2010-09-21 Evaluate whether generic "Attributable" interface should be implemented instead.
  Properties for the time series beyond the built-in properties.  For example, location
  information like county and state can be set as a property.
  */
  // private LinkedHashMap<String,Object> __property_HashMap = null;

  /**
  The missing data value.  Default for some legacy formats is -999.0 but increasingly Double.NaN is used.
  */
  _missing: number;

  /**
  Lower bound on the missing data value (for quick comparisons and when missing data ranges are used).
  */
  _missingl: number;

  /**
  Upper bound on the missing data value (for quick comparisons and when missing data ranges are used).
  */
  _missingu: number;

  /**
  Limits of the data.  This also contains the date limits other than the original dates.
  */
  _data_limits: TSLimits;

  /**
  Limits of the original data.  Currently only used by apps like TSTool.
  */
  // TSLimits _data_limits_original;

  //TODO SAM 2007-12-13 Evaluate need now that GRTS is available.
  /**
  Legend to show when plotting or tabulating a time series.  This is generally a short legend.
  */
  _legend: string;

  // TODO SAM 2007-12-13 Evaluate need now that GRTS is available.
  /**
  Legend to show when plotting or tabulating a time series.  This is usually a
  long legend.  This may be phased out now that the GRTS package has been phased in for visualization.
  */
  _extended_legend: string;

  /**
  Indicates whether time series is enabled (used to "comment" out of plots, etc).
  This may be phased out.
  */
  _enabled: boolean;

  /**
  Indicates whether time series is selected (e.g., as result of a query).
  Often time series might need to be programmatically selected (e.g., with TSTool
  selectTimeSeries() command) to simplify output by other commands.
  */
  _selected: boolean;


  /**
  Construct a time series and initialize the member data.  Derived classes should
  set the _data_interval_base.
  */
  constructor () {    
    this.TSInit();
  }

  /**
  Initialize data members.
  */
  TSInit() {
    this._version = "";

    this._input_name = "";

    // Need to initialize an empty TSIdent...    
    this._id = new TSIdent ();
    this._legend = "";
    this._extended_legend = "";
    this._data_size = 0;
    // DateTime need to be initialized somehow...
    this.setDataType( "" );
    this._data_interval_base = 0;
    this._data_interval_mult = 1;
    this._data_interval_base_original = 1;
    this._data_interval_mult_original = 0;
    this.setDescription( "" );
    // TODO: jpkeahey 2020.06.09 - Add these in later
    // this._comments = new Vector<String>(2,2);
    // this._genesis = new Vector<String>(2,2);
    this.setDataUnits( "" );
    this.setDataUnitsOriginal( "" );
    this.setMissing ( -999.0 );
    this._data_limits = new TSLimits();
    this._dirty = true;	// We need to recompute limits when we get the chance
    this._enabled = true;
    this._selected = false;	// Let other code select, e.g., as query result
    this._editable = false;
  }

  /**
  Allocate the data space for the time series.  This requires that the data
  interval base and multiplier are set correctly and that _date1 and _date2 have
  been set.  If data flags are used, hasDataFlags() should also be called before
  calling this method.  This method is meant to be overridden in derived classes
  (e.g., MinuteTS, MonthTS) that are optimized for data storage for different intervals.
  @return 0 if successful allocating memory, non-zero if failure.
  */
  public allocateDataSpace ( ): number {
    console.error ( 1, "TS.allocateDataSpace", "TS.allocateDataSpace() is virtual, define in derived classes." );
    return 1;
  }

  /**
  Determine if a data value for the time series is missing.  The missing value can
  be set to a range of values or a single value, using setMissing().
  There is no straightforward way to check to see if a value is equal to NaN
  (the code: if ( value == Double.NaN ) will always return false if one or both
  values are NaN).  Consequently there is no way to see know if only one or both
  values is NaN, using the standard operators.  Instead, we assume that NaN
  should be interpreted as missing and do the check if ( value != value ), which
  will return true if the value is NaN.  Consequently, code that uses time series
  data should not check for missing and treat NaN differently because the TS class treats NaN as missing.
  @return true if the data value is missing, false if not.
  @param value Value to check.
  */
  public isDataMissing ( value: number ): boolean {
    if ( isNaN(value) ) {
      return true;
    }
    if ( (value >= this._missingl) && (value <= this._missingu) ) {
      return true;
    }
    return false;
  }

  /**
  Return the data interval base.
  @return The data interval base (see TimeInterval.*).
  */
  public getDataIntervalBase(): number {
    return this._data_interval_base;
  }

  /**
  Return the original data interval base.
  @return The data interval base of the original data.
  */
  public getDataIntervalBaseOriginal(): number {
    return this._data_interval_base_original;
  }

  /**
  Return the data interval multiplier.
  @return The data interval multiplier.
  */
  public getDataIntervalMult(): number {
    return this._data_interval_mult;
  }

  /**
  Return the original data interval multiplier.
  @return The data interval multiplier of the original data.
  */
  public getDataIntervalMultOriginal(): number {
    return this._data_interval_mult_original;
  }

  /**
  Return the first date in the period of record (returns a copy).
  @return The first date in the period of record, or null if the date is null.
  */
  public getDate1(): DateTime {
    if ( this._date1 == null ) {
      return null;
    }    
    return DateTime.copyConstructor ( this._date1 );
  }

  /**
  Return the first date in the original period of record (returns a copy).
  @return The first date of the original data source (generally equal to or
  earlier than the time series that is actually read), or null if the date is null.
  */
  public getDate1Original(): DateTime {
    if ( this._date1_original == null ) {
      return null;
    }
    return DateTime.copyConstructor ( this._date1_original);
  }

  /**
  Return the last date in the period of record (returns a copy).
  @return The last date in the period of record, or null if the date is null.
  */
  public getDate2(): DateTime {
    if ( this._date2 == null ) {
      return null;
    }
    return DateTime.copyConstructor ( this._date2 );
  }

  /**
  Return the last date in the original period of record (returns a copy).
  @return The last date of the original data source (generally equal to or
  later than the time series that is actually read), or null if the date is null.
  */
  public getDate2Original(): DateTime {
    if ( this._date2_original == null ) {
      return null;
    }
    return DateTime.copyConstructor ( this._date2_original );
  }

  /**
  Return the location part of the time series identifier.  Does not include location type.
  @return The location part of the time series identifier (from TSIdent).
  */
  public getLocation(): string {
    return this._id.getLocation();
  }

  /**
  Return the time series identifier as a TSIdent.
  @return the time series identifier as a TSIdent.
  @see TSIdent
  */
  public getIdentifier(): TSIdent {	
    return this._id;
  }

  /**
  Set the first date in the period.  A copy is made.
  The date precision is set to the precision appropriate for the time series.
  @param t First date in period.
  @see DateTime
  */
  public setDate1 ( t: any ): void {
    if ( t != null ) {
      this._date1 = DateTime.copyConstructor ( t );
      if ( this._data_interval_base != TimeInterval.IRREGULAR ) {
          // For irregular, rely on the DateTime precision
          this._date1.setPrecisionOne ( this._data_interval_base );
      }
    }
  }

  /**
  Set the first date in the period in the original data.  A copy is made.
  The date precision is set to the precision appropriate for the time series.
  @param t First date in period in the original data.
  @see DateTime
  */
  public setDate1Original( t: any ): void {
    if ( t != null ) {
      this._date1_original = DateTime.copyConstructor ( t );
      if ( this._data_interval_base != TimeInterval.IRREGULAR ) {
              // For irregular, rely on the DateTime precision
          this._date1_original.setPrecisionOne ( this._data_interval_base );
      }
    }
  }

  /**
  Set the last date in the period.  A copy is made.
  The date precision is set to the precision appropriate for the time series.
  @param t Last date in period.
  @see DateTime
  */
  public setDate2 ( t: any ): void {
    if ( t != null ) {
      this._date2 = DateTime.copyConstructor ( t );
      if ( this._data_interval_base != TimeInterval.IRREGULAR ) {
              // For irregular, rely on the DateTime precision
          this._date2.setPrecisionOne ( this._data_interval_base );
      }
    }
  }

  /**
  Set the last date in the period in the original data. A copy is made.
  The date precision is set to the precision appropriate for the time series.
  @param t Last date in period in the original data.
  @see DateTime
  */
  public setDate2Original( t: any ): void {
    if ( t != null ) {
      this._date2_original = DateTime.copyConstructor ( t );
      if ( this._data_interval_base != TimeInterval.IRREGULAR ) {
              // For irregular, rely on the DateTime precision
          this._date2_original.setPrecisionOne ( this._data_interval_base );
      }
    }
  }

  /**
  Set the data interval.
  @param base Base interval (see TimeInterval.*).
  @param mult Base interval multiplier.
  */
  setDataInterval ( base: number, mult: number ) {
    this._data_interval_base = base;
    this._data_interval_mult = mult;
  }

  /**
  Set the data interval for the original data.
  @param base Base interval (see TimeInterval.*).
  @param mult Base interval multiplier.
  */
  setDataIntervalOriginal ( base: number, mult: number ) {
    this._data_interval_base_original = base;
    this._data_interval_mult_original = mult;
  }

  /**
  Set the data type.
  @param data_type Data type abbreviation.
  */
  setDataType( data_type: string ) {
    if ( (data_type != null) && (data_type !== 'undefined') && (this._id != null) ) {      
      this._id.setType ( data_type );
    }
  }

  /**
  Set the data units.
  @param data_units Data units abbreviation.
  @see RTi.Util.IO.DataUnits
  */
  setDataUnits( data_units: string ) {
    if (( data_units != null ) && (data_units !== 'undefined')) {
      this._data_units = data_units;
    }
  }

  /**
  Set the data units for the original data.
  @param units Data units abbreviation.
  @see RTi.Util.IO.DataUnits
  */
  setDataUnitsOriginal( units: string ) {
    if ( units != null ) {
      this._data_units_original = units;
    }
  }

  /**
  Set the number of data points including the full period.  This should be called by refresh().
  @param data_size Number of data points in the time series.
  */
  protected setDataSize ( data_size: number ): void {
    this._data_size = data_size;
  }

  /**
  Set a data value for the specified date.
  @param date Date of interest.
  @param val Data value for date.
  @see RTi.Util.Time.DateTime
  */
  public setDataValue ( date: DateTime, val: number ): void {
    console.error ("TS.setDataValue", "TS.setDataValue is " +
    "virtual and should be redefined in derived classes" );
  }

  /**
  Set the description.
  @param description Time series description (this is not the comments).
  */
  setDescription( description: string ) {
    if ( description != null ) {
      this._description = description;
    }
  }

  /**
  Set the time series identifier using a string.
  Note that this only sets the identifier but
  does not set the separate data fields (like data type).
  @param identifier Time series identifier.
  @exception Exception If there is an error setting the identifier.
  */
  setIdentifierString( identifier: string ) {    
    if ( identifier != null ) {
        this._id.setIdentifier( identifier );
    }
  }

  /**
  Set the time series identifier using a TSIdent.
  Note that this only sets the identifier but
  does not set the separate data fields (like data type).
  @param id Time series identifier.
  @see TSIdent
  @exception Exception If there is an error setting the identifier.
  */
  public setIdentifierObject ( id: any ): void {
    if ( id != null ) {
      this._id = new TSIdent ( id );
    }
  }

  /**
  Set the input name (file or database table).
  */
  public setInputName ( input_name: string ): void {
    if ( input_name != null ) {
      this._input_name = input_name;
    }
  }

  /**
  Set the missing data value for the time series.  The upper and lower bounds
  of missing data are set to this value +.001 and -.001, to allow for precision truncation.
  The value is constrained to Double.MAX and Double.Min.
  @param missing Missing data value for time series.
  */
  setMissing ( missing: number ) {
    this._missing = missing;
    if ( isNaN(missing) ) {
      // Set the bounding limits also just to make sure that values like -999 are not treated as missing.
        this._missingl = NaN;
        this._missingu = NaN;
      return;
    }
    // TODO: jpkeahey 2020.06.09 - Is MAX_SAFE_INTEGER correct here? It used to be Double.MAX_VALUE for Java
    // Will this value work with Typescript?
    if ( missing == Number.MAX_SAFE_INTEGER ) {
      this._missingl = missing - .001;
      this._missingu = missing;
    }
    else {
      // Set a range on the missing value check that is slightly on each side of the value
      this._missingl = missing - .001;
      this. _missingu = missing + .001;
    }
  }

}

export class TSIdent {
  /**
  Mask indicating that no sub-location should be allowed (treat as part of the main location), used by setLocation().
  */
  NO_SUB_LOCATION	= 0x1;

  /**
  Mask indicating that no sub-source should be allowed (treat as part of the main source), used by setSource().
  */
  NO_SUB_SOURCE = 0x2;

  /**
  Mask indicating that no sub-type should be allowed (treat as part of the main type), used by setType().
  */
  NO_SUB_TYPE = 0x4;

  /**
  Mask indicating that no validation of data should occur.  This is useful for storing
  identifier parts during manipulation (e.g., use wildcards, or specify parts of identifiers).
  */
  NO_VALIDATION = 0x8;

  /**
  Separator string for TSIdent string parts.
  */
  SEPARATOR = ".";

  /**
  Separator string between the TSIdent location type and start of the location ID.
  */
  LOC_TYPE_SEPARATOR = ":";

  /**
  Separator string for TSIdent location parts.
  */
  LOCATION_SEPARATOR = "-";

  /**
  Separator string for TSIdent source parts.
  */
  SOURCE_SEPARATOR = "-";

  /**
  Separator string for TSIdent data type parts.
  */
  TYPE_SEPARATOR = "-";

  /**
  Start of sequence identifier (old sequence number).
  */
  SEQUENCE_NUMBER_LEFT = "[";

  /**
  End of sequence identifier (old sequence number).
  */
  SEQUENCE_NUMBER_RIGHT = "]";

  /**
  Separator string for input type and datastore at end of TSID.
  */
  INPUT_SEPARATOR = "~";

  /**
  The quote can be used to surround TSID parts that have periods, so as to protect the part.
  This is typically used with location and data type, although not common.
  */
  static PERIOD_QUOTE = "'";
  static PERIOD_QUOTE_CHAR = '\'';

  /**
  The whole identifier, including the input type.
  */
  identifier: string;

  /**
  A comment that can be used to describe the TSID, for example one-line TSTool software comment.
  */
  comment: string = "";

  /**
  A short alias for the time series identifier.
  */
  alias: string;

  /**
  The location (combining the main location and the sub-location).
  */
  full_location: string;

  /**
  Location type (optional).
  */
  locationType: string = "";

  /**
  The main location.
  */
  main_location: string;

  /**
  The sub-location (2nd+ parts of the location, using the LOCATION_SEPARATOR.
  */
  sub_location: string;

  /**
  The time series data source (combining the main source and the sub-source).
  */
  full_source: string;

  /**
  The main source.
  */
  main_source: string;

  /**
  The sub-source.
  */
  sub_source: string;

  /**
  The time series data type (combining the main and sub types).
  */
  full_type: string;

  /**
  The main data type.
  */
  main_type: string;

  /**
  The sub data type.
  */
  sub_type: string;

  /**
  The time series interval as a string.
  */
  interval_string: string;

  /**
  The base data interval.
  */
  interval_base: number;

  /**
  The data interval multiplier.
  */
  interval_mult: number;

  /**
  The time series scenario.
  */
  scenario: string;

  /**
  Identifier used for ensemble trace (e.g., if a list of time series is
  grouped as a set of traces in an ensemble, the trace ID can be the year that the trace starts).
  */
  sequenceID: string;

  /**
  Type of input (e.g., "DateValue", "RiversideDB")
  */
  input_type: string;

  /**
  Name of input (e.g., a file, data store, or database connection name).
  */
  input_name: string;

  /**
  Mask that controls behavior (e.g., how sub-fields are handled).
  */
  behavior_mask: number;

  /**
  Construct using a full string identifier, which will be parsed and the
  individual parts of the identifier set.
  @param identObject Full string identifier (optionally, with right-most fields omitted).
  identifier - A string identifier in the identObject
  mask - A number for a mask. Differentiates a TSIdent object from one with identifier above.
  @exception if the identifier is invalid (usually the interval is incorrect).
  */
  constructor ( identObject?: any ) {
    if (identObject === undefined) {
      this.init();
    } else if (identObject.id) {
      this.init();
      this.setIdentifier ( identObject.id );
    } else if (identObject.behavior_flag) {
      this.init();
    }
  }

  /**
  Initialize data members.
  */
  init() {
    this.behavior_mask = 0; // Default is to process sub-location and sub-source

    // Initialize to null strings so that there are not problems with the recursive logic...

    this.identifier = null;
    this.full_location = null;
    this.main_location = null;
    this.sub_location = null;
    this.full_source = null;
    this.main_source = null;
    this.sub_source = null;
    this.full_type = null;
    this.main_type = null;
    this.sub_type = null;
    this.interval_string = null;
    this.scenario = null;
    this.sequenceID = null;
    this.input_type = null;
    this.input_name = null;

    this.setAlias("");

    // Initialize the overall identifier to an empty string...

    this.setFullIdentifier ("");

    // Initialize the location components...

    this.setMainLocation("");

    this.setSubLocation("");

    // Initialize the source...

    this.setMainSource("");
    this.setSubSource("");

    // Initialize the data type...

    this.setType("");
    this.setMainType("");
    this.setSubType("");

    // Initialize the interval...    
    this.interval_base = TimeInterval.UNKNOWN;
    this.interval_mult = 0;

    try {
        this.setInterval("");
    }
    catch ( e ) {
      // Can ignore here.
    }

    // Initialize the scenario...

    this.setScenario("");

    // Initialize the input...

    this.setInputType("");
    this.setInputName("");
  }

  /**
  Parse a TSIdent instance given a String representation of the identifier.
  @return A TSIdent instance given a full identifier string.
  @param identifier Full identifier as string.
  @param behavior_flag Behavior mask to use when creating instance.
  @exception if an error occurs (usually a bad interval).
  */
  parseIdentifier ( identifier: string, behavior_flag: number ) {     
    // let routine="TSIdent.parseIdentifier";
    // let	dl = 100;
    
    // Declare a TSIdent which we will fill and return...

    // if ( Message.isDebugOn ) {
    //   Message.printDebug ( dl, routine, "Declare TSIdent within this routine..." );
    // }
    let	tsident = new TSIdent( {behavior_flag: behavior_flag} );
    // if ( Message.isDebugOn ) {
    //   Message.printDebug ( dl, routine, "...done declaring TSIdent" );
    // }

    // First parse the datastore and input type information.
    // - does not matter if TSID parts are quoted at this point

    let identifierNoInputName = identifier;    
    let inputTypeList = StringUtil.breakStringList ( identifier, "~", 0 );
    if ( inputTypeList != null ) {
      let nlist = inputTypeList.length;
      // Reset to first part for processing below checks below...
      identifierNoInputName = inputTypeList[0];
      if ( nlist == 2 ) {
        tsident.setInputType ( inputTypeList[1] );
      }
      else if ( nlist >= 3 ) {
        tsident.setInputType ( inputTypeList[1] );
        // File name may have a ~ so find the second instance
        // of ~ and use the remaining string...
        let pos = identifier.indexOf ( "~" );
        if ( (pos >= 0) && identifier.length > (pos + 1) ) {
          // Have something at the end...
          let sub = identifier.substring ( pos + 1 );
          pos = sub.indexOf ( "~" );
          if ( (pos >= 0) && (sub.length > (pos + 1))) {
            // The rest is the file...
            tsident.setInputName ( sub.substring(pos + 1) );
          }
        }
      }
    }

    // Now parse the 5-part identifier that does not have trailing ~...

    let full_location = "", full_source = "", interval_string = "", scenario = "", full_type = "";

    let tsidPartList = null;  // TSID parts, as delimited by .
    let posQuote = identifierNoInputName.indexOf(TSIdent.PERIOD_QUOTE);
    // 'list' below are the TSID parts split by periods
    //   list[0] = location
    //   list[1] = data source
    //   list[2] = data type
    //   list[3] = data interval
    //   list[4] = scenario, with [trace] at end
    if ( posQuote >= 0 ) {
      // Have at least one quote so assume TSID something like the following where data type is escaped:
      //   LocaId.Source.'DataType-some.parts.with.periods'.Interval
      // or location ID is escaped:
      //   'LocaId.xx'.Source.'DataType-some.parts.with.periods'.Interval
      tsidPartList = this.parseIdentifier_SplitWithQuotes(identifierNoInputName);
    }
    else {
      // No quote in TSID so do simple parse
      tsidPartList = StringUtil.breakStringList ( identifierNoInputName, ".", 0 );
    }
    let tsidPartListSize = tsidPartList.length;
    // for ( int i = 0; i < tsidPartListSize; i++ ) {
    //   if ( Message.isDebugOn ) {
    //     Message.printDebug ( dl, routine, "TS ID list[" + i + "]:  \"" + tsidPartList.get(i) + "\"" );
    //   }
    // }

    // if ( Message.isDebugOn ) {
    //   Message.printDebug ( dl, routine, "Full TS ID:  \"" + identifier +"\"");
    // }

    // Parse out location and split the rest of the ID...
    //
    // FIXME SAM 2013-06-16 Actually, may need quotes for more new use cases where periods are in identifier parts
    // This field is allowed to be surrounded by quotes since some
    // locations cannot be identified by a simple string.  Allow
    // either ' or " to be used and bracket it.

    // Location type
    // - does not need to be surrounded by single quotes
    let locationTypeSepPos = -1;
    let locationPart = tsidPartList[0];  // LocationType:FullLocation or FullLocation
    let locationIdPart = locationPart; // Full string used if location type is not used
    locationTypeSepPos = locationPart.indexOf(this.LOC_TYPE_SEPARATOR);
    let locationType = "";
    if ( locationTypeSepPos >= 0 ) {
        // Have a location type so split out and set, then treat the rest of the location
        // as the location identifier for further processing
        locationType = locationPart.substring(0,locationTypeSepPos);
        // Remaining location part is the remainder of the LocType:locationPart string,
        // which will be processed below.
        locationIdPart = locationPart.substring(locationTypeSepPos + 1);
    }
    
    // Location identifier (without leading LocationType: from above)
    // - may be surrounded by single quotes ( smalers 2020-02-13 double quotes allowed for history)
    if ( tsidPartListSize >= 1 ) {
      //  smalers 2020-02-13 treat like datatype and keep surrounding quotes
      //if ( (locationIdPart.charAt(0) == '\'') || (locationIdPart.charAt(0) == '\"')) {
        // Read the location excluding the delimiter
      //	full_location = StringUtil.readToDelim ( locationPart.substring(1), locationPart.charAt(0) );
      //}
      //else {        
          full_location = locationIdPart;
          
      //	}
    }

    // Data source...
    if ( tsidPartListSize >= 2 ) {
      full_source = tsidPartList[1];
    }

    // Data type...
    if ( tsidPartListSize >= 3 ) {
      // Data type will include surrounding quotes - otherwise would need to add when rebuilding the full TSID string      
      full_type = tsidPartList[2];
    }

    // Data interval...
    let sequenceId = null;
    if ( tsidPartListSize >= 4 ) {
      interval_string = tsidPartList[3];
      // If no scenario is used, the interval string may have the sequence ID on the end, so search for the [ and split the
      // sequence ID out of the interval string...
      let index = interval_string.indexOf ( this.SEQUENCE_NUMBER_LEFT );
      // Get the sequence ID...
      if ( index >= 0 ) {
        if ( interval_string.endsWith(this.SEQUENCE_NUMBER_RIGHT)){
          // Should be a properly-formed sequence ID, but need to remove the brackets...
          sequenceId = interval_string.substring( index + 1, interval_string.length - 1).trim();
        }
        if ( index == 0 ) {
          // There is no interval, just the sequence ID (should not happen)...
          interval_string = "";
        }
        else {
                  interval_string = interval_string.substring(0,index);
        }
      }
    }

    // Scenario...  It is possible that the scenario has delimiters
    // in it.  Therefore, we need to concatenate all the remaining
    // fields to compose the complete scenario...
    if ( tsidPartListSize >= 5 ) {
      let scenarioBuffer: string;
      scenarioBuffer += tsidPartList[4];
      for ( let i = 5; i < tsidPartListSize; i++ ) {
        // Append the delimiter to create the original un-parsed string
        scenarioBuffer += "." ;
        scenarioBuffer += tsidPartList[i];
      }
      scenario = scenarioBuffer;
    }
    // The scenario may now have the sequence ID on the end, search for the [ and split out of the scenario...
    let index = scenario.indexOf ( this.SEQUENCE_NUMBER_LEFT );
    // Get the sequence ID...
    if ( index >= 0 ) {
      if ( scenario.endsWith(this.SEQUENCE_NUMBER_RIGHT) ) {
        // Should be a properly-formed sequence ID...
        sequenceId = scenario.substring ( index + 1, scenario.length - 1 ).trim();
      }
      if ( index == 0 ) {
        // There is no scenario, just the sequence ID...
        scenario = "";
      }
      else {
              scenario = scenario.substring(0,index);
      }
    }
    // if ( Message.isDebugOn ) {
    //   Message.printDebug ( dl, routine,
    //     "After split: full_location=\"" + full_location +
    //     "\" full_source=\"" + full_source +
    //     "\" type=\"" + full_type +
    //     "\" interval=\"" + interval_string +
    //     "\" scenario=\"" + scenario +
    //     "\" sequenceId=\"" + sequenceId + "\"" );
    // }

    // Now set the identifier component parts...

    tsident.setLocationType ( locationType );    
    tsident.setLocation1 ( full_location );
    tsident.setSource1 ( full_source );
    tsident.setType ( full_type );
    tsident.setInterval ( interval_string );
    tsident.setScenario ( scenario );
    tsident.setSequenceID ( sequenceId );

    // Return the TSIdent object for use elsewhere...

    // if ( Message.isDebugOn ) {
    //   Message.printDebug ( dl, routine, "Returning local TSIdent..." );
    // }
    return tsident;
  }

  /**
  Parse a TSID that has quoted part with periods in one or more parts.
  @param identifier TSID main part (no ~).
  @return list of parts for TSID
  */
  parseIdentifier_SplitWithQuotes( identifier) {
    // Process by getting one token at a time.
    // -tokens are between periods
    // -if first character of part is single quote, get to the next single quote
    let parts = [];
    let inPart = true; // should always have a part at the front
    let inQuote = false;
    let c;
    let b;
    let ilen = identifier.length();
    // Use debug messages for now but code seems to be OK
    // - remove debug messages later.
    for ( let i = 0; i < ilen; i++ ) {
      c = identifier.charAt(i);
      // if ( Message.isDebugOn ) {
      // 	Message.printDebug(1, "", "Character is: " + c);
      // }
      if ( c == '.' ) {
        // if ( Message.isDebugOn ) {
        //   Message.printDebug(1, "", "Found period" );
        // }
        if ( inQuote ) {
          // In a quote so just keep adding characters
          // if ( Message.isDebugOn ) {
          //   Message.printDebug(1, "", "In quote" );
          // }
          b.append(c);
        }
        else {
          // Not in quote
          // if ( Message.isDebugOn ) {
          //   Message.printDebug(1, "", "Not in quote" );
          // }
          if ( inPart ) {
            // Between periods.  Already in part so end it without adding period
            // if ( Message.isDebugOn ) {
            //   Message.printDebug(1, "", "In part, ending part" );
            // }
            parts.push(b.toString());
            b.setLength(0);
            // Will be in part at top of loop because current period will be skipped
            // - but if last period treat the following part as empty string
            if ( i == (ilen - 1) ) {
              // Add an empty string
              parts.push("");
            }
            else {
              // Keep processing
              // Set to not be in part
              inPart = false;
              --i; // Re-process period to trigger in a part in next iteration
            }
          }
          else {
            // Was not in a part so start it
            // if ( Message.isDebugOn ) {
            //   Message.printDebug(1, "", "Not in part, starting part" );
            // }
            inPart = true;
            // Don't add period to part.
          }
        }
      }
      else if ( c == TSIdent.PERIOD_QUOTE_CHAR ) {
        // Found a quote, which will surround a point, as in:  .'some.part.xx'.
        // if ( Message.isDebugOn ) {
        //   Message.printDebug(1, "", "Found quote" );
        // }
        if ( inQuote ) {
          // At the end of the quoted part.
          // Always include the quote in the part
          // if ( Message.isDebugOn ) {
          //   Message.printDebug(1, "", "In quote, ending quote" );
          // }
          b.append(c);
          parts.push(b.toString());
          b.setLength(0);
          // Next period immediately following will cause next part to be added, even if period at end of string
          inQuote = false;
          inPart = false;
        }
        else {
          // Need to start a part
          // if ( Message.isDebugOn ) {
          //   Message.printDebug(1, "", "Not in quote, starting quote" );
          // }
          b.append(c); // Keep the quote
          inQuote = true;
        }
      }
      else {
        // Character to add to part
        b.append(c);
        if ( i == (ilen - 1) ) {
          // Last part
          parts.push(b.toString());
        }
      }
    }
    // if ( Message.isDebugOn ) {
    //   String routine = "TSIdent.parseIdentifier_SplitWithQuotes";
    //   for ( String s : parts ) {
    //     Message.printDebug(1, routine, "TSID part is \"" + s + "\"");
    //   }
    // }
    return parts;
  }

  /**
  Return the full identifier given the parts.  This method may be called
  internally.  Null fields are treated as empty strings.
  @return The full identifier string given the parts.
  @param locationType location type
  @param full_location Full location string.
  @param full_source Full source string.
  @param full_type Full data type.
  @param interval_string Data interval string.
  @param scenario Scenario string.
  @param sequenceID sequence identifier for the time series (in an ensemble).
  @param input_type Input type.  If blank, the input type will not be added.
  @param input_name Input name.  If blank, the input name will not be added.
  */
  getIdentifierFromParts (  locationType: string,  full_location: string,
     full_source: string,  full_type: string,  interval_string: string,  scenario: string,
     sequenceID: string,  input_type: string,  input_name: string ) {
    let full_identifier: string;
    

    if ( (locationType != null) && (locationType !== 'undefined') && (locationType.length > 0) ) {
        full_identifier += locationType + this.LOC_TYPE_SEPARATOR ;
    }
    if (( full_location != null ) && (full_location !== 'undefined')) {
      full_identifier += full_location;
    }
    full_identifier += this.SEPARATOR;
    if (( full_source != null ) && (full_source !== 'undefined')) {
      full_identifier += full_source;
    }
    full_identifier += this.SEPARATOR;
    if (( full_type != null ) && (full_type !== 'undefined')) {
      full_identifier += ( full_type );
    }
    full_identifier += this.SEPARATOR;
    if (( interval_string != null ) && (interval_string !== 'undefined')) {
      full_identifier += interval_string;
    }
    if ( (scenario != null) && (scenario !== 'undefined') && (scenario.length != 0) ) {
      full_identifier += this.SEPARATOR;
      full_identifier += scenario;
    }
    if ( (sequenceID != null) && (sequenceID !== 'undefined') && (sequenceID.length != 0) ) {
      full_identifier += this.SEQUENCE_NUMBER_LEFT + sequenceID + this.SEQUENCE_NUMBER_RIGHT;
    }
    if ( (input_type != null) && (input_type !== 'undefined') && (input_type.length != 0) ) {
      full_identifier += "~" + input_type;
    }
    if ( (input_name != null) && (input_name !== 'undefined') && (input_name.length != 0) ) {
      full_identifier += "~" + input_name;
    }
    // TODO: jpkeahey 2020.06.09 - This was newly added by Josh in hopes to get it working
    if (full_identifier.includes('undefined')) {
      full_identifier = full_identifier.replace('undefined', '')
    }
    
    return full_identifier;
  }

  /**
  Return the input name.
  @return The input name.
  */
  getInputName () {
    return this.input_name;
  }

  /**
  Return the input type.
  @return The input type.
  */
  getInputType () {
    return this.input_type;
  }


  /**
  Return the full interval string.
  @return The full interval string.
  */
  getInterval () {
    return this.interval_string;
  }

  /**
  Return the data interval base as an int.
  @return The data interval base (see TimeInterval.*).
  */
  getIntervalBase () {
    return this.interval_base;
  }

  /**
  Return the data interval multiplier.
  @return The data interval multiplier.
  */
  getIntervalMult () {
    return this.interval_mult;
  }

  /**
  Return the full location.
  @return The full location string.
  */
  getLocation( ) {
    return this.full_location;
  }

  /**
  Return the location type.
  @return The location type string.
  */
  getLocationType( ) {
  return this.locationType;
  }

  /**
  Return the sequence identifier for the time series.
  @return The sequence identifier for the time series.  This is meant to be used
  when an array of time series traces is maintained, for example in an ensemble.
  @return time series sequence identifier.
  */
  getSequenceID () {
    if ( this.sequenceID == null ) {
      return "";
    }
    else {
      return this.sequenceID;
    }
  }

  /**
  Return the scenario string.
  @return The scenario string.
  */
  getScenario( ) {
    return this.scenario;
  }

  /**
  Return the full source string.
  @return The full source string.
  */
  getSource() {
    return this.full_source;
  }

  /**
  Return the data type.
  @return The full data type string.
  */
  getType( ) {    
    return this.full_type;
  }

  /**
  Set the time series alias.
  @param alias Alias for the time series.
  */
  setAlias ( alias )
  {	if ( alias != null ) {
      this.alias = alias;
    }
  }

  /**
  Set the input name.
  The input name.
  */
  setInputName ( input_name ) {
    if ( input_name != null ) {
      this.input_name = input_name;
    }
  }

  /**
  Set the input type.
  The input type.
  */
  setInputType ( input_type ) {
    if ( input_type != null ) {
      this.input_type = input_type;
    }
  }

  /**
  Set the interval given the interval string.
  @param interval_string Data interval string.
  @exception if there is an error parsing the interval string.
  */
  setInterval ( interval_string: string ) {    
    // let routine="TSIdent.setInterval(String)";
    // let	dl = 100;
    
    let tsinterval = null;

    if ( interval_string == null ) {
      return;
    }

    // if ( Message.isDebugOn ) {
    // 	Message.printDebug ( dl, routine, "Setting interval to \"" + interval_string + "\"" );
    // }

    if ( interval_string !== "*" && interval_string.length > 0 ) {
      // First split the string into its base and multiplier...

      if ( (this.behavior_mask & this.NO_VALIDATION) == 0 ) {
          try {
              tsinterval = TimeInterval.parseInterval ( interval_string );
          }
          catch ( e ) {
              // Not validating so let this pass...
          }
      }
      else {
          // Want to validate so let this throw an exception...
          tsinterval = TimeInterval.parseInterval ( interval_string );
      }

      // Now set the base and multiplier...
      if ( tsinterval != null ) {
      this.interval_base = tsinterval.getBase();
      this.interval_mult = tsinterval.getMultiplier();
      // if ( Message.isDebugOn ) {
      // 	Message.printDebug ( dl, routine, "Setting interval base to " + __interval_base	+ " mult: " +
      //                 __interval_mult );
      // }
      }
    }
    // Else, don't do anything (leave as zero initialized values).

    // Now set the interval string.  Use the given interval base string
    // because we need to preserve existing file names, etc.
    this.setIntervalString ( interval_string );
    this.setIdentifier0();
  }

  /**
  Set the interval string.  This is normally only called from this class.
  @param interval_string Interval string.
  */
  setIntervalString ( interval_string ) {
    if ( interval_string != null ) {
      this.interval_string = interval_string;
    }
  }

  setIdentifier0() {
    // let routine = "TSIdent.setIdentifier(void)";
      // let	dl = 100;

      // Assume that all the individual set routines have handled the
      // __behavior_mask accordingly and therefore we can just concatenate
      // strings here...

      // if ( Message.isDebugOn ) {
      //   Message.printDebug ( dl, routine,
      //   "Setting full identifier from parts: \"" + __full_location +
      //   "." + __full_source + "." + __full_type +"."+__interval_string +
      //   "." + __scenario + "~" + __input_type + "~" + __input_name );
      // }

      let full_identifier: string;
      // if ( Message.isDebugOn ) {
      //   Message.printDebug ( dl, routine, "Calling getIdentifierFromParts..." );
      // }      
      full_identifier = this.getIdentifierFromParts(this.locationType, this.full_location, this.full_source,
        this.full_type, this.interval_string, this.scenario, this.sequenceID, this.input_type, this.input_name );
      // if ( Message.isDebugOn ) {
      //   Message.printDebug ( dl, routine, "...successfully called getIdentifierFromParts..." );
      // }    
      this.setFullIdentifier ( full_identifier );

      // if ( Message.isDebugOn ) {
      //   Message.printDebug ( dl, routine, "ID..." );
      //   Message.printDebug ( dl, routine, "\"" + __identifier + "\"" );
      // }
  }

  /**
  Set the identifier by parsing the given string.
  @param identifier Full identifier string.
  @exception if the identifier cannot be set (usually the interval is incorrect).
  */
  setIdentifier (identifier: string) {
      
    // let routine = "TSIdent.setIdentifier";
    // let	dl = 100;

    if ( identifier == null ) {
      return;
    }

    // if ( Message.isDebugOn ) {
    //   Message.printDebug ( dl, routine, "Trying to set identifier to \"" + identifier + "\"" );
    // }

    if ( identifier.length == 0 ) {
      // Cannot parse the identifier because doing so would result in
      // an infinite loop.  If this routine is being called with an
      // empty string, it is a mistake.  The initialization code will
      // call setFullIdentifier() directly.
      // if ( Message.isDebugOn ) {
      //   Message.printDebug ( dl, routine, "Identifier string is empty, not processing!" );
      // }
      return;
    }

    // Parse the identifier using the public static function to create a temporary identifier object...

    // if ( Message.isDebugOn ) {
    //   Message.printDebug ( dl, routine, "Done declaring temp TSIdent." );
    //   Message.printDebug ( dl, routine, "Parsing identifier..." );
    // }      
    let tsident = this.parseIdentifier ( identifier, this.behavior_mask );         
    // if ( Message.isDebugOn ) {
    //   Message.printDebug ( dl, routine, "...back from parsing identifier" );
    // }

    // Now copy the temporary copy into this instance...

    // if ( Message.isDebugOn ) {
    //   Message.printDebug ( dl, routine, "Setting the individual parts..." );
    // }      
    this.setLocationType( tsident.getLocationType() );      
    this.setLocation1( tsident.getLocation() );
    this.setSource1( tsident.getSource() );    
    this.setType( tsident.getType() );
    this.setInterval( tsident.getInterval() );
    this.setScenario( tsident.getScenario() );
    this.setSequenceID ( tsident.getSequenceID() );
    this.setInputType ( tsident.getInputType() );
    this.setInputName ( tsident.getInputName() );
    // if ( Message.isDebugOn ) {
    //   Message.printDebug ( dl, routine, "... done setting the individual parts" );
    // }
  }

  /**
  Set the full identifier (this does not result in a parse).  It is normally only
  called from within this class.
  @param full_identifier Full identifier string.
  */
  setFullIdentifier ( full_identifier ) {
    
    if ( full_identifier == null ) {
      return;
    }
    this.identifier = full_identifier;
    // DO NOT call setIdentifier() from here!
  }

  /**
  Set the full location (this does not result in a parse).  It is normally only
  called from within this class.
  @param full_location Full location string.
  */
  setFullLocation ( full_location: string ) {    
    if (( full_location == null ) || (full_location === 'undefined')) {
      return;
    }
    // TODO: jpkeahey 2020.06.09 - This was newly added by Josh in hopes to get it working
    if (full_location.includes('undefined')) {
      full_location = full_location.replace('undefined', '');
    }    
    this.full_location = full_location;
    // DO NOT call setIdentifier() from here!
  }

  /**
  Set the full source (this does not result in a parse).  It is normally only
  called from within this class.
  @param full_source Full source string.
  */
  setFullSource ( full_source ) {
    if ( full_source == null ) {
      return;
    }
    // TODO: jpkeahey 2020.06.09 - This was newly added by Josh in hopes to get it working
    if (full_source.includes('undefined')) {
      full_source = full_source.replace('undefined', '');
    }
    this.full_source = full_source;
    // DO NOT call setIdentifier() from here!
  }

  /**
  Set the full data type (this does not result in a parse).  It is normally only
  called from within this class.
  @param full_type Full data type string.
  */
  setFullType ( full_type ) {    
    if ( full_type == null ) {
      return;
    }
    // TODO: jpkeahey 2020.06.09 - This was newly added by Josh in hopes to get it working
    if (full_type.includes('undefined')) {
      full_type = full_type.replace('undefined', '');
    }
    this.full_type = full_type;
    // DO NOT call setIdentifier() from here!
  }

  /**
  Set the full location from its parts.  This method is generally called from
  setMainLocation() and setSubLocation() methods to reset __full_location.
  */
  setLocation () {
    // let	routine = "TSIdent.setLocation";
    // let	dl = 100;

    // if ( Message.isDebugOn ) {
    //   Message.printDebug ( dl, routine, "Resetting full location from parts..." );
    // }
    if ( (this.behavior_mask & this.NO_SUB_LOCATION) != 0 ) {
      // Just use the main location as the full location...
      if (( this.main_location != null ) && (this.main_location !== 'undefined')) {        
        // There should always be a main location after the object is initialized...        
        this.setFullLocation ( this.main_location );
      }
    }
    else {
      // Concatenate the main and sub-locations to get the full location.
      let full_location: string;
      // We may want to check for __main_location[] also...
      if (( this.main_location != null ) && (this.main_location !== 'undefined')) {
        // This should always be the case after the object is initialized...        
        full_location += this.main_location;
        if (( this.sub_location != null ) && (this.sub_location !== 'undefined')) {
          // We only want to add the sublocation if it is
          // not an empty string (it will be an empty
          // string after the object is initialized).
          if ( this.sub_location.length > 0 ) {
            // Have a sub_location so append it to the main location...
            full_location += this.LOCATION_SEPARATOR;
            full_location += this.sub_location;
          }
        }

        this.setFullLocation ( full_location );
      }
    }
    // Now reset the full identifier...
    this.setIdentifier0();
  }

  /**
  Set the full location from its full string.
  @param full_location The full location string.
  */
  setLocation1 ( full_location ) {
    
    
    // let routine = "TSIdent.setLocation(String)";
    // let	dl = 100;

    if ( full_location == null ) {
      return;
    }

    // if ( Message.isDebugOn ) {
    //   Message.printDebug ( dl, routine, "Trying to set location to \"" + full_location + "\"" );
    // }

    if ( (this.behavior_mask & this.NO_SUB_LOCATION) != 0 ) {
      // The entire string passed in is used for the main location...
      this.setMainLocation ( full_location );
    }
    else {
        // Need to split the location into main and sub-location...
      let list: any[] = [];
      let sub_location: string;
      let nlist;      
      list = StringUtil.breakStringList ( full_location, this.LOCATION_SEPARATOR, 0 );
      nlist = list.length;
      if ( nlist >= 1 ) {
        // Set the main location...
        
        this.setMainLocation ( list[0] );
      }
      if ( nlist >= 2 ) {
        // Now set the sub-location.  This allows for multiple
        // delimited parts (everything after the first delimiter is treated as the sublocation).
        let iend = nlist - 1;
        for ( let i = 1; i <= iend; i++ ) {
          if ( i != 1 ) {
            sub_location += this.LOCATION_SEPARATOR;
          }
          sub_location += list[i];
        }
        this.setSubLocation ( sub_location );
      }
      else {
          // Since only setting the main location need to set the sub-location to an empty string...
        this.setSubLocation ( "" );
      }
    }
  }

  /**
  Set the location type.
  @param locationType location type.
  */
  setLocationType( locationType ) {
    if ( locationType == null ) {
          return;
      }
      this.locationType = locationType;
      this.setIdentifier0();
  }

  /**
  Set the main location string (and reset the full location).
  @param main_location The main location string.
  */
  setMainLocation ( main_location ) {
    if (( main_location == null ) || (main_location == 'undefined')) {
      return;
    }
    
    this.main_location = main_location;
    this.setLocation();
  }

  /**
  Set the main source string (and reset the full source).
  @param main_source The main source string.
  */
  setMainSource ( main_source ) {
    if (( main_source == null ) || (main_source == 'undefined')) {
      return;
    }
    this.main_source = main_source;
    this.setSource();
  }

  /**
  Set the main data type string (and reset the full type).
  @param main_type The main data type string.
  */
  setMainType ( main_type ) {    
    if (( main_type == null ) || (main_type == 'undefined')) {
      return;
    }    
    this.main_type = main_type;
    this.setType0();
  }

  /**
  Set the scenario string.
  @param scenario The scenario string.
  */
  setScenario( scenario ) {
    if (( scenario == null ) && (scenario == 'undefined')) {
      return;
    }
    this.scenario = scenario;
    this.setIdentifier0();
  }

  /**
  Set the sequence identifier, for example when the time series is part of an ensemble.
  @param sequenceID sequence identifier for the time series.
  */
  setSequenceID ( sequenceID ) {
    this.sequenceID = sequenceID;
    this.setIdentifier0();
  }

  /**
  Set the full source from its parts.
  */
  setSource ( ) {
    if ( (this.behavior_mask & this.NO_SUB_SOURCE) != 0 ) {
      // Just use the main source as the full source...
      if ( this.main_source != null ) {
        // There should always be a main source after the object is initialized...
        this.setFullSource ( this.main_source );
      }
    }
    else {
        // Concatenate the main and sub-sources to get the full source.
      let full_source;
      if ( this.main_source != null ) {
        // We only want to add the subsource if it is not an
        // empty string (it will be an empty string after the
        // object is initialized).
        full_source += this.main_source;
        if ( this.sub_source != null ) {
          // We have sub_source so append it to the main source...
          // We have a sub_source so append it to the main source...
          if ( this.sub_source.length > 0 ) {
            full_source += this.SOURCE_SEPARATOR;
            full_source += this.sub_source;
          }
        }
        this.setFullSource ( full_source.toString() );
      }
    }
    // Now reset the full identifier...
    this.setIdentifier0();
  }

  /**
Set the full source from a full string.
@param source The full source string.
*/
setSource1 ( source ) {
  if ( source == null ) {
		return;
	}

	if ( source === "" ) {
		this.setMainSource ( "" );
		this.setSubSource ( "" );
	}
	else if ( (this.behavior_mask & this.NO_SUB_SOURCE) != 0 ) {
		// The entire string passed in is used for the main source...
		this.setMainSource ( source );
	}
	else {
	    // Need to split the source into main and sub-source...
		let list: any[] = [];
		let sub_source: string;
		let nlist;
		list =	StringUtil.breakStringList ( source,
			this.SOURCE_SEPARATOR, 0 );
		nlist = list.length;
		if ( nlist >= 1 )  {
			// Set the main source...
			this.setMainSource ( list[0] );
		}
		if ( nlist >= 2 ) {
			// Now set the sub-source...
			let iend = nlist - 1;
			for ( let i = 1; i <= iend; i++ ) {
				sub_source += list[i];
				if ( i != iend ) {
					sub_source += this.SOURCE_SEPARATOR;
				}
			}
			this.setSubSource ( sub_source.toString() );
		}
		else {
		    // Since we are only setting the main location we
			// need to set the sub-location to an empty string...
			this.setSubSource ( "" );
		}
	}
}

  /**
  Set the sub-location string (and reset the full location).
  @param sub_location The sub-location string.
  */
  setSubLocation ( sub_location ) {
    if ( sub_location == null ) {
      return;
    }
    this.sub_location = sub_location;
    this.setLocation();
  }

  /**
  Set the sub-source string (and reset the full source).
  @param sub_source The sub-source string.
  */
  setSubSource ( sub_source ) {
    if ( sub_source == null ) {
      return;
    }
    this.sub_source = sub_source;
    this.setSource();
  }

  /**
  Set the sub-type string (and reset the full data type).
  @param sub_type The sub-type string.
  */
  setSubType ( sub_type ) {
    if ( sub_type == null ) {
      return;
    }
    this.sub_type = sub_type;
    this.setType0();
  }

  /**
  Set the full data type from its parts.  This method is generally called from
  setMainType() and setSubType() methods to reset __full_type.
  */
  setType0 () {
    // let	routine = "TSIdent.setType";
    // let	dl = 100;
    
    // if ( Message.isDebugOn ) {
    //   Message.printDebug ( dl, routine, "Resetting full type from parts..." );
    // }
    if ( (this.behavior_mask & this.NO_SUB_TYPE) != 0 ) {
      // Just use the main type as the full type...
      if (( this.main_type != null ) && (this.main_type !== 'undefined')) {
        // There should always be a main type after the object is initialized...
        this.setFullType ( this.main_type );
      }
    }
    else {
        // Concatenate the main and sub-types to get the full type.
      let full_type: string;
      if ( this.main_type != null ) {
        // This should always be the case after the object is initialized...

        full_type += this.main_type;
        if (( this.sub_type != null ) && (this.sub_type) !== 'undefined') {
          // We only want to add the subtype if it is
          // not an empty string (it will be an empty
          // string after the object is initialized).
          if ( this.sub_type.length > 0 ) {
            // We have a sub type so append it to the main type...
            full_type += this.TYPE_SEPARATOR;
            full_type += this.sub_type ;
          }
        }        
        this.setFullType ( full_type );
      }
    }
    // Now reset the full identifier...
    this.setIdentifier0();
  }

  /**
  Set the full data type from its full string.
  @param type The full data type string.
  */
  setType ( type ) {    
    // let	routine = "TSIdent.setType";
    // let	dl = 100;

    if ( type == null ) {
      return;
    }

    // if ( Message.isDebugOn ) {
    // 	Message.printDebug ( dl, routine, "Trying to set data type to \"" + type + "\"" );
    // }

    if ( (this.behavior_mask & this.NO_SUB_TYPE) != 0 ) {
      // The entire string passed in is used for the main data type...
      this.setMainType ( type );
    }
    else {
      // Need to split the data type into main and sub-location...
      let list;
      let sub_type: string;
      let nlist;
      
      list =	StringUtil.breakStringList ( type, this.TYPE_SEPARATOR, 0 );
      nlist = list.length;
      if ( nlist >= 1 ) {
        // Set the main type...        
        this.setMainType ( list[0] );
      }
      if ( nlist >= 2 ) {
        // Now set the sub-type...
        let iend = nlist - 1;
        for ( let i = 1; i <= iend; i++ ) {
          sub_type += list[i];
          if ( i != iend ) {
            sub_type += this.TYPE_SEPARATOR;
          }
        }
        this.setSubType ( sub_type );
      }
      else {
          // Since we are only setting the main type we
        // need to set the sub-type to an empty string...
        this.setSubType ( "" );
      }
    }
  }
    
}


export class TSLimits {

  // Public flags...

  /**
  Flags used to indicate how limits are to be computed.
  The following indicates that a time series' full limits should be refreshed.
  This is generally used only by code internal to the TS library.
  */
  REFRESH_TS: number = 0x1;

  /**
  Do not compute the total limits (using this TSLimits class).  This is used by
  classes such as MonthTSLimits to increase performance.
  */
  NO_COMPUTE_TOTALS: number = 0x2;

  /**
  Do not compute the detailed limits (e.g., using MonthTSLimits).  This is used by
  classes such as MonthTSLimits to increase performance.
  */
  NO_COMPUTE_DETAIL: number = 0x4;

  /**
  Ignore values <= 0 when computing averages (treat as missing data).
  This make sense for time series
  such as reservoirs and flows.  It may be necessary at some point to allow any
  value to be ignored but <= 0 is considered a common and special case.
  */
  IGNORE_LESS_THAN_OR_EQUAL_ZERO: number = 0x8;

  // Data members...

  private __ts: TS = null;	// Time series being studied.
  private __date1;
  private __date2;
  _flags: number;		// Flags to control behavior.
  private __max_value: number;
  private  __max_value_date;
  private __mean: number;
  private __median: number;
  private __min_value: number;
  private __min_value_date;
  private __missing_data_count: number;
  private __non_missing_data_count: number;
  private __non_missing_data_date1;
  private __non_missing_data_date2;
  private __skew: number;
  private __stdDev: number;
  private __sum: number;
  private __data_units: string = ""; // Data units (just copy from TS at the time of creation).

  private __found: boolean = false;

  /**
  Default constructor.  Initialize the dates to null and the limits to zeros.
  */
  constructor () {
    this.initialize();
  }

  /**
  Initialize the data.
  Need to rework code to use an instance of TS so we can initialize to missing
  data values used by the time series!
  */
  initialize () {	
    this.__ts = null;
    this.__data_units = "";
    this.__date1 = null;
    this.__date2 = null;
    this._flags = 0;
    this.__max_value = 0.0;
    this.__max_value_date = null;
    this.__mean = -999.0; // Assume.
    this.__median = NaN; // Assume.
    this.__min_value = 0.0;
    this.__min_value_date = null;
    this.__missing_data_count = 0;
    this.__non_missing_data_count = 0;
    this.__non_missing_data_date1 = null;
    this.__non_missing_data_date2 = null;
    this.__skew = NaN;
    this.__stdDev = NaN;
    this.__sum = -999.0;		// Assume.
    this.__found = false;
  }

}


export class TSUtil {

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
        throw new Error('YearTS has not yet been implemented');
        // ts = new YearTS();
      }
      else if ( intervalBase == TimeInterval.IRREGULAR ) {
        throw new Error('IrregularTS has not yet been implemented');
        // ts = new IrregularTS();
      }
      else {
            console.error("Cannot create a new time series for \"" + id + "\" (the interval \"" +
                intervalString + "\" [" + intervalBase + "] is not recognized).");
        // Message.printWarning ( 3, "TSUtil.newTimeSeries", message );
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
  public setDataValue( date: DateTime, value: number ): void {
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

}

export class YearTS extends TS {


}

enum YearType {

  CALENDAR,
  NOV_TO_OCT,
  WATER,
  YEAR_MAY_TO_APR

}