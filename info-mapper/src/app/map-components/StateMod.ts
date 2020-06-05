import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StateMod {

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
  readTimeSeries(tsident_string, filename, date1, date2, units, read_data) {
    let ts: TS = null;
    let routine = "StateMod_TS.readTimeSeries";

    if (filename == null) {
      console.error("Requesting StateMod file with null filename.");
    }
    let input_name: string = filename;
  //   let full_fname: string = IOUtil.getPathUsingWorkingDir(filename);
  //   if (!IOUtil.fileReadable(full_fname)) {
  //     Message.printWarning(2, routine, "Unable to determine file for \"" + filename + "\"");
  //     return ts;
  //   }
  //   BufferedReader in = null;
  //   int data_interval = TimeInterval.MONTH;
  //   try {
  //     data_interval = getFileDataInterval(full_fname);
  //     in = new BufferedReader(new InputStreamReader(IOUtil.getInputStream(full_fname)));
  //   }
  //   catch (e) {
  //     Message.printWarning(2, routine, "Unable to open file \"" + full_fname + "\"");
  //     return ts;
  //   }
  //   // Determine the interval of the file and create a time series that matches...
  //   ts = TSUtil.newTimeSeries(tsident_string, true);
  //   if (ts == null) {
  //     Message.printWarning(2, routine, "Unable to create time series for \"" + tsident_string + "\"");
  //     return ts;
  //   }
  //   ts.setIdentifier(tsident_string);
  //   // The specific time series is modified...
  //   // TODO SAM 2007-03-01 Evaluate logic
  //   List < TS > tslist = readTimeSeriesList(ts, in, full_fname, data_interval, date1, date2, units, read_data);
  //   // Get out the first time series because sometimes a new one is created, for example with XOP
  //   if ((tslist != null) && tslist.size() > 0) {
  //     ts = tslist.get(0);
  //   }
  //   ts.getIdentifier().setInputType("StateMod");
  //   ts.setInputName(full_fname);
  //   // Already in the low-level code
  //   //ts.addToGenesis ( "Read time series from \"" + full_fname + "\"" );
  //   ts.getIdentifier().setInputName(input_name);
  //   in.close();
  //   return ts;
  }
}

class TS {


}
