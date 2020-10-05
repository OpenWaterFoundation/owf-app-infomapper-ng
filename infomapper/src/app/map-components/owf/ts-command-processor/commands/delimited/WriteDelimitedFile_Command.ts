import { TS }                     from '../../../TS/TS';
import { DateTime }               from '../../../Util/Time/DateTimeUtil';
import { DateTimeFormatterType }  from '../../../../owf/Util/Time/DateTimeFormatterType';
import { StringUtil }             from '../../../Util/String/StringUtil';
import { TSLimits }               from '../../../TS/TSLimits';
import { TSUtil }                 from '../../../TS/TSUtil';
import { TimeUtil }               from '../../../Util/Time/DateTimeUtil';
import { TimeInterval }           from '../../../Util/Time/TimeInterval';
import { AbstractCommand }        from '../../../Util/IO/AbstractCommand';
import { TSCommandProcessorUtil } from '../../core/TSCommandProcessorUtil';
import { TSData }                 from '../../../TS/TSData';

/**
This class initializes, checks, and runs the WriteDelimitedFile() command.
*/
export class WriteDelimitedFile_Command extends AbstractCommand {

  /**
  Values for MissingValue parameter.
  */
  protected _Blank = "Blank";

  /**
  Constructor.
  */
  constructor() {
    super();
    this.setCommandName("WriteDelimitedFile");
  }


  // /**
  // Run the command.
  // @param command_number Command number in sequence.
  // @exception CommandWarningException Thrown if non-fatal warnings occur (the command could produce some results).
  // @exception CommandException Thrown if fatal warnings occur (the command could not produce output).
  // */
  // public runCommand ( command_number: number ): void {
  //   var routine = ".runCommand", message: string;
  //   var warning_level = 2;
  //   var command_tag = "" + command_number;
  //   var warning_count = 0;
    
  //   // Clear the output file
    
  //   // setOutputFile ( null );
    
  //   // Check whether the processor wants output files to be created...

  //   var processor: CommandProcessor = this.getCommandProcessor();
  //   // if ( !TSCommandProcessorUtil.getCreateOutput(processor) ) {
  //   //     Message.printStatus ( 2, routine,
  //   //     "Skipping \"" + toString() + "\" because output is not being created." );
  //   // }
    
  //   // CommandStatus status = getCommandStatus();
  //   // CommandPhaseType commandPhase = CommandPhaseType.RUN;
  //   //   Boolean clearStatus = new Boolean(true); // default
  //     try {
  //       var o = processor.getPropContents("CommandsShouldClearRunStatus");
  //       // if ( o !== null ) {
  //       //   clearStatus = (Boolean)o;
  //       // }
  //     }
  //     catch ( e ) {
  //       // Should not happen
  //     }
  //   //   if ( clearStatus ) {
  //   //   status.clearLog(CommandPhaseType.RUN);
  //   // }

  //   var parameters: PropList = this.getCommandParameters();
  //   var TSList: string = parameters.getValue ( "TSList" );
  //     if ( (TSList == null) || TSList === "" ) {
  //         TSList = TSListType.ALL_TS.toString();
  //     }
  //   var TSID: string = parameters.getValue ( "TSID" );
  //   if ( (TSID != null) && (TSID.indexOf("${") >= 0) ) {
  //     TSID = TSCommandProcessorUtil.expandParameterValue(processor, this, TSID);
  //   }
  //     var EnsembleID: string = parameters.getValue ( "EnsembleID" );
  //   if ( (EnsembleID != null) && (EnsembleID.indexOf("${") >= 0) ) {
  //     EnsembleID = TSCommandProcessorUtil.expandParameterValue(processor, this, EnsembleID);
  //   }
  //   // var OutputFile: string = parameters.getValue ( "OutputFile" );
  //   var DateTimeColumn: string = parameters.getValue ( "DateTimeColumn" );
  //   var DateTimeFormatterType0: string = parameters.getValue ( "DateTimeFormatterType" );
  //   if ( (DateTimeFormatterType0 === null) || DateTimeFormatterType0 === "" ) {
  //       DateTimeFormatterType0 = "" + DateTimeFormatterType.C;
  //   }
  //   var dateTimeFormatterType = DateTimeFormatterType.valueOfIgnoreCase(DateTimeFormatterType0);
  //   var DateTimeFormat: string = parameters.getValue ( "DateTimeFormat" );
  //   var ValueColumns: string = parameters.getValue ( "ValueColumns" );
  //   var HeadingSurround: string = parameters.getValue ( "HeadingSurround" );
  //   if ( HeadingSurround === null ) {
  //       HeadingSurround = "";
  //   }
  //   else {
  //       // Swap special strings for internal characters
  //       HeadingSurround = HeadingSurround.replace ( "\\\"", "\"" );
  //   }
  //   var Delimiter: string = parameters.getValue ( "Delimiter" );
  //   if ( (Delimiter == null) || Delimiter === "" ) {
  //       Delimiter = ","; // default
  //   }
  //   else {
  //       // Swap special strings for internal characters
  //       Delimiter = Delimiter.replace ( "\\s", " " );
  //       Delimiter = Delimiter.replace ( "\\t", "\t" );
  //   }
  //   var Precision: string = parameters.getValue ( "Precision" );
  //   var precision = 4; // default
  //   if ( (Precision !== null) && Precision !== "" ) {
  //       precision = parseInt(Precision);
  //   }
  //   var MissingValue: string = parameters.getValue ( "MissingValue" );
  //   if ( (MissingValue != null) && MissingValue === "" ) {
  //       // Set to null to indicate default internal value should be used
  //       MissingValue = null;
  //   }
  //   var HeaderComments: string = parameters.getValue ( "HeaderComments" );
  //   var headerComments: string[] = [];
  //   if ( HeaderComments !== null ) {
  //     if ( (HeaderComments !== null) && (HeaderComments.indexOf("${") >= 0) ) {
  //       HeaderComments = TSCommandProcessorUtil.expandParameterValue(processor, this, HeaderComments);
  //     }
  //     // Expand \\n to actual newlines and \\" to quote
  //     HeaderComments = HeaderComments.replace("\\n", "\n").replace("\\\"", "\"");
  //     headerComments = StringUtil.breakStringList(HeaderComments, "\n", 0);
  //     // Make sure that comments have # at front
  //     var comment: string;
  //     for ( var i = 0; i < headerComments.length; i++ ) {
  //       comment = headerComments[i];
  //       if ( ! comment.startsWith("#") ) {
  //         comment = "# " + comment;
  //         headerComments.set(i,comment);
  //       }
  //     }
  //   }

  //   // Get the time series to process...
  //   var request_params: PropList = new PropList ( "" );
  //   request_params.set ( "TSList", TSList );
  //   request_params.set ( "TSID", TSID );
  //   request_params.set ( "EnsembleID", EnsembleID );
  //   CommandProcessorRequestResultsBean bean = null;
  //   try {
  //     bean = processor.processRequest( "GetTimeSeriesToProcess", request_params);
  //   }
  //   catch (  e ) {
  //         message = "Error requesting GetTimeSeriesToProcess(TSList=\"" + TSList +
  //         "\", TSID=\"" + TSID + "\", EnsembleID=\"" + EnsembleID + "\") from processor.";
  //     console.warn(warning_level, command_tag, ++warning_count), routine, message;
  //     // status.addToLog ( CommandPhaseType.RUN,
  //     //     new CommandLogRecord(CommandStatusType.FAILURE,
  //     //         message, "Report problem to software support." ) );
  //   }
  //   var bean_PropList: PropList = bean.getResultsPropList();
  //   var o_TSList: any = bean_PropList.getContents ( "TSToProcessList" );
  //   if ( o_TSList === null ) {
  //     message = "Null TSToProcessList returned from processor for GetTimeSeriesToProcess(TSList=\"" + TSList +
  //     "\" TSID=\"" + TSID + "\", EnsembleID=\"" + EnsembleID + "\").";
  //     console.warn ( warning_level,
  //     // MessageUtil.formatMessageTag(
  //     // command_tag,++warning_count), routine, message );
  //     // status.addToLog ( CommandPhaseType.RUN,
  //     //     new CommandLogRecord(CommandStatusType.FAILURE,
  //             // message, "Report problem to software support." ) 
  //     );
  //   }
  //   @SuppressWarnings("unchecked")
  //   var tslist: TS[] = o_TSList;
  //   if ( tslist.length === 0 ) {
  //         message = "No time series are available from processor GetTimeSeriesToProcess (TSList=\"" + TSList +
  //         "\" TSID=\"" + TSID + "\", EnsembleID=\"" + EnsembleID + "\").";
  //     console.warn ( warning_level,
  //     // MessageUtil.formatMessageTag(command_tag,++warning_count), routine, message );
  //     // status.addToLog ( CommandPhaseType.RUN,
  //     //     new CommandLogRecord(CommandStatusType.WARNING,
  //     //         message, "Confirm that time series are available (may be OK for partial run)." ) );
  //   }

  //   var OutputStart: string = parameters.getValue ( "OutputStart" );
  //   if ( (OutputStart == null) || OutputStart.length === 0 ) {
  //     OutputStart = "${OutputStart}"; // Default
  //   }
  //   var OutputEnd: string = parameters.getValue ( "OutputEnd" );
  //   if ( (OutputEnd === null) || OutputEnd.length === 0 ) {
  //     OutputEnd = "${OutputEnd}"; // Default
  //   }
  //   var OutputStart_DateTime: DateTime = null;
  //   var OutputEnd_DateTime: DateTime = null;
  //   if ( commandPhase === CommandPhaseType.RUN ) {
  //     try {
  //       OutputStart_DateTime = TSCommandProcessorUtil.getDateTime ( OutputStart, "OutputStart", processor,
  //         status, warning_level, command_tag );
  //     }
  //     catch ( InvalidCommandParameterException e ) {
  //       // Warning will have been added above...
  //       ++warning_count;
  //     }
  //     try {
  //       OutputEnd_DateTime = TSCommandProcessorUtil.getDateTime ( OutputEnd, "OutputEnd", processor,
  //         status, warning_level, command_tag );
  //     }
  //     catch ( e ) {
  //       // Warning will have been added above...
  //       ++warning_count;
  //     }
  //     }

  //     // TODO SAM 2013-10-22 Get the comments to add to the top of the file.
  //   /*
  //     List<String> OutputComments_Vector = null;
  //     try {
  //         Object o = processor.getPropContents ( "OutputComments" );
  //     }
  //     catch ( Exception e ) {
  //         // Not fatal, but of use to developers.
  //         message = "Error requesting OutputComments from processor - not using.";
  //         Message.printDebug(10, routine, message );
  //     }
  //     */
      
  //     // Write the time series file even if no time series are available.  This is useful for
  //     // troubleshooting and testing (in cases where no time series are available.
  //     //if ( (tslist != null) && (tslist.size() > 0) ) {
  //         // var OutputFile_full = OutputFile;
  //         try {
  //             // Convert to an absolute path...
  //             // OutputFile_full = IOUtil.verifyPathForOS(
  //             //     IOUtil.toAbsolutePath(TSCommandProcessorUtil.getWorkingDir(processor),
  //             //         TSCommandProcessorUtil.expandParameterValue(processor,this,OutputFile)));
  //             // Message.printStatus ( 2, routine, "Writing DelimitedFile file \"" + OutputFile_full + "\"" );
  //             var problems: string[] = [];
  //             this.writeTimeSeries ( tslist, DateTimeColumn, dateTimeFormatterType, DateTimeFormat, ValueColumns,
  //                 HeadingSurround, Delimiter, precision, MissingValue, OutputStart_DateTime, OutputEnd_DateTime,
  //                 headerComments,
  //                 problems );
  //             // Save the output file name...
  //             // setOutputFile ( new File(OutputFile_full));
  //         }
  //         catch ( e ) {
  //             message = "Unexpected error writing time series to delimited file \"" + 'test.csv' + "\" (" + e + ")";
  //             console.warn ( warning_level, 
  //         //             MessageUtil.formatMessageTag(command_tag, ++warning_count),routine, message );
  //         //     Message.printWarning ( 3, routine, e );
  //         //     status.addToLog ( CommandPhaseType.RUN,
  //         // new CommandLogRecord(CommandStatusType.FAILURE,
  //         //     message, "Check log file for details." )
  //             );
  //             throw new Error ( message );
  //         }
  //     //}
    
  //   // status.refreshPhaseSeverity(CommandPhaseType.RUN,CommandStatusType.SUCCESS);
  // }

  /**
    Write a time series to the output file.
    @param tslist list of time series to write
    @param dateTimeColumn name of column for date/time
    @param dateTimeFormatterType formatter type for date/times
    @param dateTimeFormat the format to use for date/times, when processed by the date/time formatter
    @param valueColumns name(s) of column(s) for time series values using %L, ${ts:property}, ${property}
    @param headingSurround character to surround column headings
    @param delim delimiter between columns
    @param precision precision for output value (default is from data units, or 4)
    @param missingValue requested missing value to output, or null to output time series missing value
    @param outputStart start for output values
    @param outputEnd End end for output values
    @param headerComments list of strings for file header, should already have '#' at front.
  */
  public writeTimeSeries(tslist: TS[], dateTimeColumn: string,
    dateTimeFormatterType: DateTimeFormatterType, dateTimeFormat: string, valueColumns: string,
    headingSurround: string, delim: string, precision: number, missingValue: string,
    outputStart: DateTime, outputEnd: DateTime, headerComments: string[],
    problems: string[]
  /* processor: CommandProcessor, cs: CommandStatus, commandPhase: CommandPhaseType */): string {

    var message: string;
    var routine = ".writeTimeSeries";
    var finalOutput: string = '';
    // Make sure the time series have the same interval
    try {
      // Open the file...
      // fout = new PrintWriter ( new FileOutputStream ( outputFile ) );
      if ((tslist === null) || (tslist.length === 0)) {
        return;
      }
      // Set up for writing time series data
      if (precision == null) {
        precision = 4;
      }
      var valueFormat = "%." + precision + "f";
      var missingValueString = "";
      // Create a DateTimeFormatter to format the data values
      if (dateTimeFormatterType === null) {
        dateTimeFormatterType = DateTimeFormatterType.C;
      }
      if ((dateTimeFormat !== null) && dateTimeFormat === "") {
        // Set to null to simplify checks below
        dateTimeFormat = null;
      }
      // Loop through the specified period or if not specified the full overlapping period
      if ((outputStart === null) || (outputEnd === null)) {
        var limits: TSLimits = TSUtil.getPeriodFromTS(tslist, TSUtil.MAX_POR);
        if (outputStart === null) {
          outputStart = limits.getDate1();
        }
        if (outputEnd === null) {
          outputEnd = limits.getDate2();
        }
      }
      if (!TSUtil.areIntervalsSame(tslist)) {
        throw new Error("Time series time intervals are not the same.  Cannot write file.");
      }
      var isRegular = true; // All time series are matching regular interval
      // TODO SAM 2013-10-22 For now only support writing irregular data for a single time series
      if (!TimeInterval.isRegularInterval(tslist[0].getDataIntervalBase())) {
        // This will be the case if 1+ time series all have irregular interval
        if (tslist.length > 1) {
          throw new Error("Can only write a single irregular time series. Cannot write file.");
        }
        else {
          // Have one time series so allow it to be written below as irregular
          isRegular = false;
        }
      }
      var intervalBase = -1;
      var intervalMult = -1;
      var missingValueStrings: string[] = [];
      var its = -1;
      for (let ts of tslist) {
        ++its;
        if (ts != null) {
          intervalBase = ts.getDataIntervalBase();
          intervalMult = ts.getDataIntervalMult();
        }
        // Missing value can be output as a string so check
        if ((missingValue === null) || missingValue === "") {
          // Use the time series value
          if (isNaN(ts.getMissing())) {
            missingValueStrings[its] = "NaN";
          }
          else {
            missingValueStrings[its] = StringUtil.formatString(ts.getMissing(), valueFormat);
          }
        }
        else {
          if (missingValue.toUpperCase() === this._Blank.toUpperCase()) {
            missingValueStrings[its] = "";
          }
          else {
            missingValueStrings[its] = missingValue;
          }
        }
      }
      // Output the file header
      // - currently does not output the standard header like DateValue but may add this
      if (headerComments.length > 0) {
        for (let headerComment of headerComments) {
          // finalOutput += headerComment + '\n';
        }
      }
      // Output the column headings
      if (headingSurround === null) {
        headingSurround = "";
      }
      // finalOutput += headingSurround + '\n';
      if ((dateTimeColumn === null) || dateTimeColumn === "") {
        if (intervalBase >= TimeInterval.DAY) {
          dateTimeColumn = "Date";
        }
        else {
          dateTimeColumn = "DateTime";
        }
      }
      finalOutput += dateTimeColumn;
      // finalOutput += headingSurround + '\n';
      if ((valueColumns === null) || valueColumns === "") {
        valueColumns = "%L_%T";
      }
      for (let ts of tslist) {
        // finalOutput += delim + headingSurround + '\n';
        finalOutput += delim;
        if (ts !== null) {
          // var heading = "TEST";
          var heading: string = TSCommandProcessorUtil.expandTimeSeriesMetadataString (null, ts, valueColumns, null, null);
          // Make sure the heading does not include the surround character
          if (headingSurround.length !== 0) {
            heading = heading.replace(headingSurround, "");
          }
          finalOutput += heading + '\n';
          break;
        }
        // finalOutput += headingSurround + '\n';
      }
      // finalOutput += '\n';
      // Loop through date/time corresponding to each row in the output file
      var value: number;
      var valueString: string, dateTimeString = "";
      if (isRegular) {
        // Have regular interval data with matching intervals
        // Iterate using DateTime increment and the request data from time series
        var date = DateTime.copyConstructor(outputStart);
        for (date; date.lessThanOrEqualTo(outputEnd); date.addInterval(intervalBase, intervalMult)) {
          // Output the date/time as per the format
          if (dateTimeFormatterType === DateTimeFormatterType.C) {
            if (dateTimeFormat === null) {
              // Just use the default
              dateTimeString = date.toString();
            }
            else {
              // Format according to the requested
              dateTimeString = TimeUtil.formatDateTime(date, dateTimeFormat);
            }
            if (delim === " ") {
              // The dateTimeString might contain a space between date and time so replace
              dateTimeString.replace(" ", "T");
            }
          }
          finalOutput += dateTimeString;
          // Loop through the time series list and output each value
          its = -1;
          var tsIndex = 0;
          for (let ts of tslist) {
            // Iterate through data in the time series and output each value according to the format.
            ++its;
            var tsdata: TSData = new TSData();
            tsdata = ts.getDataPoint(date, tsdata);
            // First expand the line to replace time series properties
            value = tsdata.getDataValue();
            if (ts.isDataMissing(value)) {
              valueString = missingValueString;
            }
            else {
              valueString = StringUtil.formatString(value, valueFormat);
            }
            finalOutput += delim + valueString;
            if (tsIndex === tslist.length - 1) {
              finalOutput += '\n';
            }
            ++tsIndex;
          }
          // finalOutput += '\n';
        }
        return finalOutput;
      }
      else {
        // Single irregular interval time series
        // IrregularTS ts = (IrregularTS)tslist.get(0);
        // // Find the nearest date
        // var iteratorStart: DateTime = null, iteratorEnd = null;
        // if ( outputStart == null ) {
        //   iteratorStart = new DateTime(ts.getDate1());
        // }
        // else {
        //     TSData tsdata = ts.findNearestNext(outputStart, null, null, true);
        //     if ( tsdata == null ) {
        //       iteratorStart = new DateTime(ts.getDate1());
        //     }
        //     else {
        //       iteratorStart = new DateTime(tsdata.getDate());
        //     }
        // }
        // if ( outputEnd == null ) {
        //   iteratorEnd = new DateTime(ts.getDate2());
        // }
        // else {
        //     TSData tsdata = ts.findNearestNext(outputEnd, null, null, true);
        //     if ( tsdata == null ) {
        //       iteratorEnd = new DateTime(ts.getDate2());
        //     }
        //     else {
        //       iteratorEnd = new DateTime(tsdata.getDate());
        //     }
        // }
        // TSIterator tsi = ts.iterator(iteratorStart, iteratorEnd);
        // TSData tsdata = null;
        // DateTime date;
        // while ( (tsdata = tsi.next()) !== null ) {
        //     // Output the date/time as per the format
        //   date = tsdata.getDate();
        //     if ( dateTimeFormatterType == DateTimeFormatterType.C ) {
        //         if ( dateTimeFormat == null ) {
        //             // Just use the default
        //             dateTimeString = date.toString();
        //         }
        //         else {
        //             // Format according to the requested
        //             dateTimeString = TimeUtil.formatDateTime(date, dateTimeFormat);
        //         }
        //         if ( delim === " " ) {
        //             // The dateTimeString might contain a space between date and time so replace
        //             dateTimeString.replace(" ","T");
        //         }
        //     }
        //     fout.print(dateTimeString);
        //       // First expand the line to replace time series properties
        //       value = tsdata.getDataValue();
        //       if ( ts.isDataMissing(value) ) {
        //           valueString = missingValueString;
        //       }
        //       else {
        //           valueString = StringUtil.formatString(value, valueFormat);
        //       }
        //       fout.print(delim + valueString);
        //     fout.println();
        // }
      }
    }
    catch (e) {
      message = "Unexpected error writing time series to file \"" + 'test.csv' + "\" (" + e + ").";
      console.warn(3, routine, e);
      problems.push(message);
      throw new Error(message);
    }
  }
}