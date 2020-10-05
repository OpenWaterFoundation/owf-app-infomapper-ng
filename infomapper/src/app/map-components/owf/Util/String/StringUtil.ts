import { templateSourceUrl } from '@angular/compiler';

export class StringUtil {

  /**
  Indicates that strings should be sorted in ascending order.
  */
  static SORT_ASCENDING = 1;

  /**
  Indicates that strings should be sorted in descending order.
  */
  static SORT_DESCENDING = 2;

  /**
  Token types for parsing routines.
  */
  static TYPE_CHARACTER = 1; 
  static TYPE_DOUBLE = 2;
  static TYPE_FLOAT = 3;
  static TYPE_INTEGER = 4;
  static TYPE_STRING = 5;
  static TYPE_SPACE = 6;

  /**
  For use with breakStringList.  Skip blank fields (adjoining delimiters are merged).
  */
  static DELIM_SKIP_BLANKS = 0x1;
  /**
  For use with breakStringList.  Allow tokens that are surrounded by quotes.  For example, this is
  used when a data field might contain the delimiting character.
  */
  static DELIM_ALLOW_STRINGS = 0x2;
  /**
  For use with breakStringList.  When DELIM_ALLOW_STRINGS is set, include the quotes in the returned string.
  */
  static DELIM_ALLOW_STRINGS_RETAIN_QUOTES = 0x4;

  /**
  For use with padding routines.  Pad/unpad back of string.
  */
  static PAD_BACK = 0x1;
  /**
  For use with padding routines.  Pad/unpad front of string.
  */
  static PAD_FRONT = 0x2;
  /**
  For use with padding routines.  Pad/unpad middle of string.  This is private
  because for middle unpadding we currently only allow the full PAD_FRONT_MIDDLE_BACK option.
  */
  private static PAD_MIDDLE = 0x4;
  /**
  For use with padding routines.  Pad/unpad front and back of string.
  */
  static PAD_FRONT_BACK = StringUtil.PAD_FRONT | StringUtil.PAD_BACK;
  /**
  For use with padding routines.  Pad/unpad front, back, and middle of string.
  */
  static PAD_FRONT_MIDDLE_BACK = StringUtil.PAD_FRONT | StringUtil.PAD_MIDDLE|StringUtil.PAD_BACK;


  /**
  Convert a String to a double.
  @param s String to convert.
  @return A double as converted from the String, or 0.0 if a conversion error.
  */
  public static atod( s: string ): number {
    if ( s == null ) {
      return 0.0;
    }
    var value = 0.0;
    try {
      value = Number(s.trim());
    }
    catch( e ){
      console.error( "Unable to convert \"" + s + "\" to double." );
      value = 0.0;
    }
    return value;
  }

  /**
  Convert a String to an int, similar to C language atoi() function.
  @param s String to convert.
  @return An int as converted from the String or 0 if conversion fails.
  */
  public static atoi( s: string ): number {
    if ( s == null ) {
      return 0;
    }
    var value: number = 0;
    try {
      value = parseInt( s.trim() );
    }
    catch(  e ){
      // Message.printWarning( 50, "StringUtil.atoi", "Unable to convert \"" + s + "\" to int." );
      value = 0;
    }
    return value;
  }

  static breakStringList( string: string, delim, flag ) { 
    // let routine = "StringUtil.breakStringList";
    let list = [];
    
    if ( string == null ) {
      return list;
    }
    if ( string.length == 0 ) {
      return list;
    }
    //if ( Message.isDebugOn ) {
    //	Message.printDebug ( 50, routine,
    //	Message.printStatus ( 1, routine,
    //	"SAMX Breaking \"" + string + "\" using \"" + delim + "\"" );
    //}
    let	length_string = string.length;    
    let	instring = false;
    let retainQuotes = false;
    let	istring = 0;
    let cstring: string = '';
    let quote = '\"';
    let tempstr: string = '';
    let allow_strings = false, skip_blanks = false;
    if ( (flag & this.DELIM_ALLOW_STRINGS) != 0 ) {
      allow_strings = true;
    }
    if ( (flag & this.DELIM_SKIP_BLANKS) != 0 ) {
      skip_blanks = true;
    }
      if ( allow_strings && ((flag & this.DELIM_ALLOW_STRINGS_RETAIN_QUOTES) != 0) ) {
          retainQuotes = true;
      }
    // Loop through the characters in the string.  If in the main loop or
    // the inner "while" the end of the string is reached, the last
    // characters will be added to the last string that is broken out...
    let at_start = true;	// If only delimiters are at the front this will be true.
    for ( istring = 0; istring < length_string; ) {
      cstring = string.charAt(istring);
      // Start the next string in the list.  Move characters to the
      // temp string until a delimiter is found.  If inside a string
      // then go until a closing delimiter is found.
      instring = false;
      tempstr = '';
      while ( istring < length_string ) {
        // Process a sub-string between delimiters...
        cstring = string.charAt ( istring );
        // Check for escaped special characters...
        if ( (cstring == '\\') && (istring < (length_string - 1)) &&
            (string.charAt(istring + 1) == '\"') ) {
            // Add the backslash and the next character - currently only handle single characters            
            tempstr += cstring;
            // Now increment to the next character...
            ++istring;
            cstring = string.charAt ( istring );
            tempstr += cstring;
            ++istring;
            continue;
        }
        //Message.printStatus ( 2, routine, "SAMX Processing character " + cstring );
        if ( allow_strings ) {
          // Allowing quoted strings so do check for the start and end of quotes...
          if ( !instring && ((cstring == '"')||(cstring == '\'')) ){
            // The start of a quoted string...
            instring = true;
            at_start = false;
            quote = cstring;
            if ( retainQuotes ) {
              tempstr += cstring;
            }
            // Skip over the quote since we don't want to /store or process again...
            ++istring;
            // cstring set at top of while...
            //Message.printStatus ( 1, routine, "SAMX start of quoted string " + cstring );
            continue;
          }
          // Check for the end of the quote...
          else if ( instring && (cstring == quote) ) {
            // In a quoted string and have found the closing quote.  Need to skip over it.
            // However, could still be in the string and be escaped, so check for that
            // by looking for another string. Any internal escaped quotes will be a pair "" or ''
            // so look ahead one and if a pair, treat as characters to be retained.
            // This is usually only going to be encountered when reading CSV files, etc.
                      if ( (istring < (length_string - 1)) && (string.charAt(istring + 1) == quote) ) {
                        // Found a pair of the quote character so absorb both and keep looking for ending quote for the token
                        tempstr += cstring; // First quote retained because it is literal
                        //Message.printStatus(2,routine,"found ending quote candidate at istring=" + istring + " adding as first in double quote");
                        ++istring;
                        if ( retainQuotes ) {
                          // Want to retain all the quotes
                          tempstr += cstring; // Second quote
                            //Message.printStatus(2,routine,"Retaining 2nd quote of double quote at istring=" + istring );
                        }
                        ++istring;
                        // instring still true
                        continue;
                      }
                      // Else... process as if not an escaped string but an end of quoted string
                      if ( retainQuotes ) {
                        tempstr += cstring;
                      }
            instring = false;
            //Message.printStatus ( 1, routine, "SAMX end of quoted string" + cstring );
            ++istring;
            if ( istring < length_string ) {
              cstring = string.charAt(istring);
              // If the current string is now another quote, just continue so it can be processed
              // again as the start of another string (but don't by default add the quote character)...
              if ( (cstring == '\'') || (cstring == '"') ) {
                            if ( retainQuotes ) {
                              tempstr += cstring;
                            }
                continue;
              }
            }
            else {
              // The quote was the last character in the original string.  Break out so the
              // last string can be added...
              break;
            }
            // If here, the closing quote has been skipped but don't want to break here
            // in case the final quote isn't the last character in the sub-string
            // (e.g, might be ""xxx).
          }
        }
        // Now check for a delimiter to break the string...
        if ( delim.indexOf(cstring) != -1 ) {


          // Have a delimiter character that could be in a string or not...
          if ( !instring ) {
            // Not in a string so OK to break...
            //Message.printStatus ( 1, routine, "SAMX have delimiter outside string" + cstring );
            break;
          }
        }
        else {
          // Else, treat as a character that needs to be part of the token and add below...
          at_start = false;
        }
        // It is OK to add the character...
        tempstr += cstring;
        // Now increment to the next character...
        ++istring;
        // Go to the top of the "while" and evaluate the current character that was just set.
        // cstring is set at top of while...
      }
      // Now have a sub-string and the last character read is a
      // delimiter character (or at the end of the original string).
      //
      // See if we are at the end of the string...
      // if ( instring ) {
      //   if ( Message.isDebugOn ) {
      //     Message.printWarning ( 10, routine, "Quoted string \"" + tempstr + "\" is not closed" );
      //   }
      //   // No further action is required...
      // }
      // Check for and skip any additional delimiters that may be present in a sequence...
      if ( skip_blanks ) {
        while ( (istring < length_string) && (delim.indexOf(cstring) != -1) ) {
          //Message.printStatus ( 1, routine, "SAMX skipping delimiter" + cstring );
          ++istring;
          if ( istring < length_string ) {
            cstring = string.charAt ( istring );
          }
        }
        if ( at_start ) {
          // Just want to skip the initial delimiters without adding a string to the returned list...
          at_start = false;
          continue;
        }
        // After this the current character will be that which needs to be evaluated.  "cstring" is reset
        // at the top of the main "for" loop but it needs to be assigned here also because of the check
        // in the above while loop
      }
      else {
        // Not skipping multiple delimiters so advance over the character that triggered the break in
        // the main while loop...
        ++istring;
        // cstring will be assigned in the main "for" loop
      }
      // Now add the string token to the list... 
      list.push (tempstr);
      //if ( Message.isDebugOn ) {
        //Message.printDebug ( 50, routine,
        //Message.printStatus ( 1, routine,
        //"SAMX Broke out list[" + (list.length - 1) + "]=\"" + tempstr + "\"" );
      //}
    }
    return list;
  }

  /**
  Parse a fixed string.
  @return A list of objects that are read from the string according to the
  specified format.  Integers are returned as Integers, doubles as Doubles, etc.
  Blank TYPE_SPACE fields are not returned.
  @param string String to parse.
  @param format Format of string (see overloaded method for explanation).
  @param results If specified and not null, the list will be used to save the
  results.  This allows a single list to be reused in repetitive reads.
  The list is cleared before reading.
  */
  public static fixedReadTwo ( string: string, format: string ) {
    // First loop through the format string and count the number of valid format specifier characters...
    var format_length: number = 0;
    if ( format != null ) {
      format_length = format.length
    }
    var field_count: number = 0;
    var cformat: string;
    for ( let i = 0; i < format_length; i++ ) {
      cformat = string.charAt(i);
      if ( (cformat == 'a') || (cformat == 'A') ||
        (cformat == 'c') || (cformat == 'C') ||
        (cformat == 'd') || (cformat == 'D') ||
        (cformat == 'f') || (cformat == 'F') ||
        (cformat == 'i') || (cformat == 'I') ||
        (cformat == 's') || (cformat == 'S') ||
        (cformat == 'x') || (cformat == 'X') ) {
        ++field_count;
      }
    }
    // Now set the array sizes for formats...
    var field_types: number[] = [];
    var field_widths: number[] = [];
    field_count = 0;	// Reset for detailed loop...
    var width_string: string;
    for ( let iformat = 0; iformat < format_length; iformat++ ) {
      width_string = '';
      // Get a format character...
      cformat = format.charAt ( iformat );
      //System.out.println ( "Format character is: " + cformat );
      if ( (cformat == 'c') || (cformat == 'C') ) {
        field_types[field_count] = StringUtil.TYPE_CHARACTER;
        field_widths[field_count] = 1;
        continue;
      }
      else if ( (cformat == 'd') || (cformat == 'D') ) {
        field_types[field_count] = StringUtil.TYPE_DOUBLE;
      }
      else if ( (cformat == 'f') || (cformat == 'F') ) {
        field_types[field_count] = StringUtil.TYPE_FLOAT;
      }
      else if ( (cformat == 'i') || (cformat == 'I') ) {
        field_types[field_count] = StringUtil.TYPE_INTEGER;
      }
      else if ( (cformat == 'a') || (cformat == 'A') ||
        (cformat == 's') || (cformat == 'S') ) {
        field_types[field_count] = StringUtil.TYPE_STRING;
      }
      else if ( (cformat == 'x') || (cformat == 'X') ) {
        field_types[field_count] = StringUtil.TYPE_SPACE;
      }
      else {
        // Problem!!!
        continue;
      }
      // Determine the field width...
      ++iformat;
      while ( iformat < format_length ) {
        cformat = format.charAt ( iformat );
        if ( !Number.isInteger(parseFloat(cformat)) ) {
          // Went into the next field...
          --iformat;
          break;
        }
        width_string += cformat;
        ++iformat;
      }
      field_widths[field_count] = StringUtil.atoi ( width_string.toString() );
      ++field_count;
    }
    width_string = null;
    var v = this.fixedReadFour ( string, field_types, field_widths, null );
    return v;
  }

  /**
  Parse a fixed-format string (e.g., a FORTRAN data file).
  Requesting more fields than there are data results in default (zero
  or blank) data being returned.</b>
  This method can be used to read integers and floating point numbers from a
  string containing fixed-format information.
  @return A List of objects that are read from the string according to the
  specified format.  Integers are returned as Integers, doubles as Doubles, etc.
  Blank TYPE_SPACE fields are not returned.
  @param string String to parse.
  @param field_types Field types to use for parsing 
  @param field_widths Array of fields widths.
  @param results If specified and not null, the list will be used to save the
  results.  This allows a single list to be reused in repetitive reads.
  The list is cleared before reading.
  */
  public static fixedReadFour ( string: string, field_types: number[], field_widths: number[], results: any[] ): any[] {
    var	dtype: number = 0,	// Indicates type of variable (from "format").
      isize: number,		// Number of characters in a data value
          // (as integer).
      j: number,		// Index for characters in a field.
      nread: number = 0;	// Number of values read from file.
    var	eflag: boolean = false;	// Indicates that the end of the line has been
          // reached before all of the format has been
          // evaluated.

    var size: number = field_types.length;
    var string_length: number = string.length;
    var tokens: any[] = null;
    if ( results != null ) {
      tokens = results;
      tokens.length = 0;
    }
    else {
      tokens = new Array<any>(size);
    }

    var var1: string;
    var istring: number = 0;	// Position in string to parse.
    for ( var i = 0; i < size; i++ ) {
      dtype = field_types[i];
      // Read the variable...
      var1 = '';
      if ( eflag ) {
        // End of the line has been reached before the processing has finished...
      }
      else {
        //System.out.println ( "Variable size=" + size);
        isize = field_widths[i];
        for ( j = 0; j < isize; j++, istring++ ) {
          if ( istring >= string_length ) {
            // End of the string.  Process the rest of the variables so that they are
            // given a value of zero...
            eflag = true;
            break;
          }
          else {
            var1 += string.charAt(istring);
          }
        }
      }
      // 1. Convert the variable that was read as a character
      //    string to the proper representation.  Apparently
      //    most atomic objects can be instantiated from a
      //    String but not a StringBuffer.
      // 2. Add to the list.
      //Message.printStatus ( 2, "", "String to convert to object is \"" + var + "\"" );
      if ( dtype == StringUtil.TYPE_CHARACTER ) {
        tokens.push ( var1.charAt(0) );
      }
      else if ( dtype == StringUtil.TYPE_DOUBLE ) {
        var sdouble: string = var1.toString().trim();
        if ( sdouble.length == 0 ) {
          tokens.push ( Number("0.0") );
        }
        else {
          tokens.push ( Number( sdouble ) );
        }
      }
      else if ( dtype == StringUtil.TYPE_FLOAT ) {
        var sfloat: string = var1.trim();
        if ( sfloat.length == 0 ) {
          tokens.push ( Number("0.0") );
        }
        else {
          tokens.push ( Number ( sfloat ) );
        }
      }
      else if ( dtype == StringUtil.TYPE_INTEGER ) {
        var sinteger: string = var1.trim();
        if ( sinteger.length == 0 ) {
          tokens.push ( Number ( "0" ) );
        }
        else {
          // check for "+"
          if ( sinteger.startsWith("+")) {
            sinteger = sinteger.substring(1);
          }
          tokens.push ( Number ( sinteger ) );
        }
      }
      else if ( dtype == StringUtil.TYPE_STRING ) {
        tokens.push ( var1 );
      }
      ++nread;
      if ( nread < 0 ) {
        // TODO smalers 2019-05-28 figure out what to do with nread
      }
    }
    return tokens;
  }

  /**
  Format a double as a string.
  @return Formatted string.
  @param d A double to format.
  @param format Format to use.
  */
  public static formatString ( num: number, format: string ): string {
    var v: number[] = [];
    v.push ( num );
    return this.formatStringFinal ( v, format );
  }

  // Format a string like the C sprintf
  //
  // Notes:	(1)	We accept any of the formats:
  //
  //			%%		- literal percent
  //			%c		- single character
  //			%s %8.8s %-8s	- String
  //			%d %4d		- Integer
  //			%8.2f %#8.2f	- Float
  //			%8.2F %#8.2F	- Double
  //
  /**
  Format a string like the C sprintf function.
  @return The formatted string.
  @param v The list of objects to format.  Floating point numbers must be Double, etc. because
  the toString function is called for each object (actually, a number can be
  passed in as a String since toString will work in that case too).
  @param format The format to use for formatting, containing normal characters
  and the following formatting strings:
  <p>
  <table width=100% cellpadding=10 cellspacing=0 border=2>
  <tr>
  <td><b>Data Type</b></td>	<td><b>Format</b></td>	<td><b>Example</b></td>
  </tr
  <tr>
  <td><b>Literal %</b></td>
  <td>%%</td>
  <td>%%5</td>
  </tr>
  <tr>
  <td><b>Single character</b></td>
  <td>%c</td>
  <td>%c</td>
  </tr>
  <tr>
  <td><b>String</b></td>
  <td>%s</td>
  <td>%s, %-20.20s</td>
  </tr>
  <tr>
  <td><b>Integer</b></td>
  <td>%d</td>
  <td>%4d, %04d</td>
  </tr>
  <tr>
  <td><b>Float, Double</b></td>
  <td>%f, %F</td>
  <td>%8.2f, %#8.2f</td>
  </tr>
  </table>
  <p>
  The format can be preceded by a - (e.g., %-8.2f, %-s) to left-justify the
  formatted string.  The default is to left-justify strings and right-justify
  numbers.  Numeric formats, if preceded by a 0 will result in the format being
  padded by zeros (e.g., %04d will pad an integer with zeros up to 4 digits).
  To force strings to be a certain width use a format like %20.20s.  To force
  floating point numbers to always use a decimal point use the #.
  Additional capabilities may be added later.
  */
  public static formatStringFinal ( v: any[], format: string ): string {
    var buffer = '';
    var dl = 75;

    if ( v === null ) {
      return buffer.toString();
    }
    if ( format === null ) {
      return buffer.toString();
    }

    // Now loop through the format and as format specifiers are encountered
    // put them in the formatted string...

    var	diff: number;
    var	i: number;
    var	iend: number;
    var	iformat: number;
    var	iprecision: number;
    var	iwidth: number;
    var	j = 0;
    var	length_format = format.length;
    var	length_temp: number;
    var	offset = 0;	// offset in string or array
    var	precision = 0; 	// precision as vareger
    var	sign: number;
    var	width = 0;
    var	vindex = 0;
    var cformat: string;
    var cvalue: string;
    var sprecision: string[] = new Array(20); // should be enough
    var swidth: string[] = new Array(20);
    var	dot_found: boolean, first: boolean, left_shift: boolean, pound_format: boolean, zero_format: boolean;
    var	vsizem1 = v.length - 1;

    for ( iformat = 0; iformat < length_format; iformat++ ) {
      cformat = format.charAt ( iformat );
      // if ( Message.isDebugOn ) {
      //   Message.printDebug ( dl, "StringUtil.formatString",
      //   "Format character :\"" + cformat + "\", vindex = " + vindex );
      // }
      if ( cformat === '%' ) {
        // The start of a format field.  Get the rest so that we can process.  First advance one...
        dot_found = false;
        left_shift = false;
        pound_format = false;
        zero_format = false;
        iprecision = 0;
        iwidth = 0;
        ++iformat;
        if ( iformat >= length_format ) {
          // End of format...
          break;
        }
        // On the character after the %
        first = true;
        for ( ; iformat < length_format; iformat++ ) {
          cformat = format.charAt ( iformat );
          // if ( Message.isDebugOn ) {
          //   Message.printDebug ( dl, "StringUtil.formatString",
          //   "Format character :\"" + cformat + "\" vindex =" + vindex );
          // }
          if ( first ) {
            // First character after the %...
            // Need to update so that some of the following can be combined.
            if ( cformat === '%' ) {
              // Literal percent...
              buffer += '%';
              first = false;
              break;
            }
            else if ( cformat === 'c' ) {
              // Append a Character from the list...
              buffer += (	v[vindex].toString());
              // if ( Message.isDebugOn ) {
              //   Message.printDebug ( dl, "StringUtil.formatString",
              //   "Processed list[" + vindex + "], a char" );
              // }
              ++vindex;
              first = false;
              break;
            }
            else if ( cformat === '-' ) {
              // Left shift...
              left_shift = true;
              continue;
            }
            else if ( cformat === '#' ) {
              // Special format...
              pound_format = true;
              continue;
            }
            else if ( cformat === '0' ) {
              // Leading zeros...
              zero_format = true;
              continue;
            }
            else {
              // Not a recognized formatting character so we will just go
              // to the next checks outside this loop...
              first = false;
            }
          }
          // Else retrieving characters until an ending "s", "i", "d", or "f" is encountered.
          if ( (cformat >= '0' && cformat <= '9') || (cformat === '.') ) {
            if ( cformat === '.' ) {
              dot_found = true;
              continue;
            }
            if ( dot_found ) {
              // part of the precision...
              sprecision[iprecision] = cformat;
              ++iprecision;
            }
            else {
              // part of the width...
              swidth[iwidth] = cformat;
              ++iwidth;
            }
            continue;
          }
          if ( (cformat !== 'd') && (cformat !== 'f') && (cformat !== 'F') && (cformat !== 's') ) {
            console.warn ( 3, "StringUtil.formatString", "Invalid format string character (" + cformat + ") in format (" + format + ").");
            break;
          }
          // If here, have a valid format string and need to process...

          // First get the width and precision on the format...

          // Get the desired output width and precision (already initialize to zeros above)...

          if ( iwidth > 0 ) {
            width = parseInt (swidth.join('').substring(0, iwidth));
          }

          if ( iprecision > 0 ) {
            precision = parseInt (sprecision.join('').substring(0, iprecision));
          }

          // Check to see if the number of formats is greater than the input list.  If so, this
          // is likely a programming error so print a warning so the developer can fix.

          if ( vindex > vsizem1 ) {
            console.warn ( 3, "StringUtil.formatString",
            "The number of format strings \"" + format + "\" is > the number of data.  Check code." );
            return buffer.toString();
          }

          // Now format for the different data types...

          if ( cformat === 'd' ) {
              // Integer.  If NULL or an empty string, just add a blank string of the desired width...
            if ( v[vindex] === null ) {
              // if ( Message.isDebugOn ) {
              //   Message.printDebug ( dl, "StringUtil.formatString", "NULL integer" );
              // }
              // NULL string.  Set it to be spaces for the width requested.
              for ( i = 0; i < width; i++ ){
                buffer += ' ';
              }
              ++vindex;
              break;
            }
            var temp: string = v[vindex].toString();
            if ( temp.length === 0 ) {
              // if ( Message.isDebugOn ) {
              //   Message.printDebug ( dl, "StringUtil.formatString", "Zero length string for integer" );
              // }
              // Empty string.  Set it to be spaces for the width requested.
              for ( i = 0; i < width; i++ ){
                buffer += ' ';
              }
              ++vindex;
              break;
            }
            // if ( Message.isDebugOn ) {
            //   Message.printDebug ( dl, "StringUtil.formatString",
            //   "Processing list[" + vindex + "], an integer \"" + temp + "\"" );
            // }
            ++vindex;
            cvalue = temp.charAt ( 0 );
            if ( cvalue == '-' ) {
              sign = 1;
            }
            else {
                sign = 0;
            }
            // String will be left-justified so we need to see if we need to shift
            // right.  Allow overflow.  "temp" already has the sign in it.
            length_temp = temp.length;
            diff =	width - length_temp;
            if ( diff > 0 ){
              if ( left_shift ) {
                if ( zero_format ) {
                  // Need to add zeros in the front...
                  if ( sign == 1 ) {
                    offset = 1;
                  }
                  else {
                    offset = 0;
                  }
                  for ( j = 0; j < diff; j++) {
                    temp = temp.slice(0, offset) + '0' + temp.slice(offset);
                    // temp.insert(offset, '0');
                  }
                }
                else {
                  // Add spaces at the end...
                  for ( j = 0; j < diff; j++){
                    temp = temp.slice(0, length_temp) + ' ' + temp.slice(length_temp);
                    // temp.insert( length_temp,' ');
                  }
                }
              }
              else {
                // Add spaces at the beginning...
                if ( sign == 1 ) {
                  offset = 1;
                }
                else {
                  offset = 0;
                }
                if ( zero_format ) {
                  // Add zeros...
                  for ( j = 0; j < diff; j++) {
                    temp = temp.slice(0, offset) + '0' + temp.slice(offset);
                    // temp.insert(offset,'0');
                  }
                }
                else {
                  for ( j = 0; j < diff; j++) {
                    temp = ' ' + temp;
                    // temp.insert(0, ' ');
                  }
                }
              }
            }
            buffer += temp;
          }
          else if	( (cformat === 'f') || (cformat === 'F')){
            // Float.  First, get the whole number as a string...
            // If NULL, just add a blank string of the desired width...
            if ( v[vindex] === null ) {
              // if ( Message.isDebugOn ) {
              //   Message.printDebug ( dl, "StringUtil.formatString", "NULL float" );
              // }
              // NULL string.  Set it to be spaces for the width requested.
              for ( i = 0; i < width; i++ ){
                buffer += ' ';
              }
              ++vindex;
              break;
            }
            var temp = '';
            var whole_number_string: string;
            var remainder_string: string;
            var number_as_string = "";
            var	point_pos: number;
            if ( cformat == 'f' ) {
              number_as_string = v[vindex].toString();
            }
            else if ( cformat == 'F' ) {
              number_as_string = v[vindex].toString();
            }
            if ( number_as_string.length === 0 ) {
              // if ( Message.isDebugOn ) {
              //   Message.printDebug ( dl, "StringUtil.formatString", "Zero length string for float" );
              // }
              // Empty string.  Set it to be spaces for the width requested.
              for ( i = 0; i < width; i++ ){
                buffer += ' ';
              }
              ++vindex;
              break;
            }
            else if ( number_as_string === "NaN" ) {
                // Pad with spaces and justify according to the formatting.
                if ( left_shift ) {
                    buffer += "NaN";
                          for ( i = 0; i < (width - 3); i++ ){
                                buffer += ' ';
                            }
                }
                else {
                              for ( i = 0; i < (width - 3); i++ ){
                                  buffer += ' ';
                              } 
                              buffer += "NaN";
                }
                      ++vindex;
                break;
            }
            // Need to check here as to whether the number is less than 10^-3 or greater
            // than 10^7, in which case the string comes back in exponential notation
            // and fouls up the rest of the process...
            var E_pos: number = number_as_string.indexOf('E');
            if ( E_pos >= 0 ) {
              // Scientific notation.  Get the parts to the number and then
              // put back together.  According to the documentation, the
              // format is -X.YYYE-ZZZ where the first sign is optional, the first digit (X)
              // is mandatory (and non-zero), the YYYY are variable length, the sign after the E is
              // mandatory, and the exponent is variable length.  The sign after the E appears to be optional.
              // if ( Message.isDebugOn ) {
              //   Message.printDebug(dl, "StringUtil.formatString",
              //   "Detected scientific notation for Double: " + number_as_string );
              // }
              var expanded_string = '';
              var sign_offset = 0;
              if ( number_as_string.charAt(0) == '-' ) {
                expanded_string += "-";
                sign_offset = 1;
              }
              // Position of dot in float...
              var dot_pos: number = number_as_string.indexOf('.');
              // Sign of the exponent...
              var E_sign: string = number_as_string.charAt( E_pos+1);
              // Exponent as an integer...
              var exponent = 0;
              if ( (E_sign == '-') || (E_sign == '+') ) {
                exponent = this.atoi( number_as_string.substring( E_pos + 2) );
              }
              else {
                // No sign on exponent.
                exponent = this.atoi( number_as_string.substring( E_pos + 1) );
              }
              // Left side of number...
              var left: string = number_as_string.substring(sign_offset, dot_pos);
              // Right side of number...
              var right: string = number_as_string.substring( (dot_pos + 1), E_pos );
              // Add to the buffer on the left side of the number...
              if ( E_sign == '-' ) {
                // Add zeros on the left...
                var dot_shift =	exponent - 1;
                expanded_string += ".";
                for ( var ishift = 0; ishift < dot_shift; ishift++ ) {
                  expanded_string += "0";
                }
                expanded_string += left;
                expanded_string += right;
              }
              else {
                // Shift the decimal to the right...
                expanded_string += left;
                // Now transfer as many digits as available.
                var len_right = right.length;
                for ( var ishift = 0; ishift < exponent; ishift++ ) {
                  if ( ishift <= (len_right - 1) ) {
                    expanded_string += right.charAt(ishift);
                  }
                  else {
                    expanded_string += "0";
                  }
                }
                expanded_string += ".";
                // If we did not shift through all the original right-side digits, add them now...
                if ( exponent < len_right ) {
                  expanded_string += right.substring( exponent );
                }
              }
              // Now reset the string...
              number_as_string = expanded_string.toString();
              // if ( Message.isDebugOn ) {
              //   Message.printDebug(dl, "StringUtil.formatString",
              //   "Expanded number: \"" + number_as_string + "\"" );
              // }
            }
            // if ( Message.isDebugOn ) {
            //   Message.printDebug ( dl, "StringUtil.formatString",
            //   "Processing list[" + vindex + "], a float or double \"" + number_as_string + "\"" );
            // }
            ++vindex;
            // Figure out if negative...
            if ( number_as_string.charAt(0) == '-'){
              sign = 1;
            }
            else {
              sign = 0;
            }
            // Find the position of the decimal point...
            point_pos = number_as_string.indexOf ( '.' );
            if ( point_pos == -1 ) {
              // No decimal point.
              whole_number_string = number_as_string;
              remainder_string = "";
            }
            else {
              // has decimal point
              whole_number_string = number_as_string.substring(0,point_pos);
              remainder_string = number_as_string.substring(point_pos + 1);
            }
            // Round the number so that the number of precision digits exactly matches what we want...
            if ( precision < remainder_string.length ) {
              number_as_string = StringUtil.round( number_as_string, precision );
              // We may need to recompute the parts of the string.  Just do it for now...
              // Figure out if negative...
              if ( number_as_string.charAt(0) == '-'){
                sign = 1;
              }
              else {
                sign = 0;
              }
              // Find the position of the decimal point...
              point_pos = number_as_string.indexOf ( '.' );
              if ( point_pos == -1 ) {
                // No decimal point.
                whole_number_string = number_as_string;
                remainder_string = "";
              }
              else {
                // has decimal point
                whole_number_string = number_as_string.substring(0,point_pos);
                remainder_string = number_as_string.substring(point_pos + 1);
              }
            }
            // Now start at the back of the string and start adding parts...
            if ( precision > 0 ) {
              var iprec: number;
              // First fill with zeros for the precision amount...
              for ( iprec = 0; iprec < precision; iprec++ ) {
                temp = '0' + temp;
                // temp.insert ( 0, '0' );
              }
              // Now overwrite with the actual numbers...
              iend = remainder_string.length;
              if ( iend > precision ) {
                iend = precision;
              }
              for ( iprec = 0; iprec < iend; iprec++ ) {
                temp = temp.slice(0, iprec) + remainder_string.charAt(iprec) + temp.slice(iprec);
                // temp.setCharAt ( iprec, remainder_string.charAt(iprec) );
              }
              // Round off the last one if there is truncation.  Deal with this later...
              if ( precision < remainder_string.length ) {
                // TODO - old comment: working on doing the round above...
              }
              // Now add the decimal point...
              // temp.insert ( 0, '.' );
              temp = '.' + temp;
            }
            else if ( (precision == 0) && pound_format ) {
              // Always add a decimal point...
              // temp.insert ( 0, '.' );
              temp = '.' + temp;
            }
            // Now add the whole number.  If it overflows, that is OK.  If it is
            // less than the width we will deal with it in the next step.
            temp = whole_number_string + temp;
            // temp.insert ( 0, whole_number_string );
            // If the number that we have now is less than the desired width, we need
            // to add spaces.  Depending on the sign in the format, we add them at the left or right.
            if ( temp.length < width ) {
              var ishift: number;
              iend = width - temp.length;
              if ( left_shift ) {
                // Add at the end...
                for ( ishift = 0; ishift < iend; ishift++ ) {
                  temp += ' ';
                  // temp.insert ( temp.length, ' ' );
                }
              }
              else {
                // Add at the end..
                for ( ishift = 0; ishift < iend; ishift++ ) {
                  if ( zero_format ) {
                    // Format was similar to "%05.1f"
                    temp = '0' + temp;
                    // temp.insert ( 0, '0' );
                  }
                  else {
                    temp = ' ' + temp;
                    // temp.insert ( 0, ' ' );
                  }
                }
              }
            }
          
            // Append to our main string...
            buffer += temp;
          }
          else if ( cformat == 's' ) {
            // First set the string the requested size, which is the precision.  If the
            // precision is zero, do the whole thing.  String will be left-justified so we
            // need to see if we need to shift right.  Allow overflow...
            // If NULL, just add a blank string of the desired width...
            if ( v[vindex] === null ) {
              // if ( Message.isDebugOn ) {
              //   Message.printDebug ( dl, "StringUtil.formatString", "NULL string");
              // }
              // NULL string.  Set it to be spaces for the width requested.
              for ( i = 0; i < precision; i++ ) {
                buffer += ' ';
              }
              ++vindex;
              break;
            }
            var temp: string = v[vindex].toString();
            if ( temp.length === 0 ) {
              // if ( Message.isDebugOn ) {
              //   Message.printDebug ( dl, "StringUtil.formatString", "Zero length string" );
              // }
              // Empty string.  Set it to be spaces for the width requested.
              for ( i = 0; i < width; i++ ){
                buffer += ' ' ;
              }
              ++vindex;
              break;
            }
            // if ( Message.isDebugOn ) {
            //   Message.printDebug ( dl, "StringUtil.formatString",
            //   "Processing list[" + vindex + "], a string \"" + temp + "\"" );
            // }
            ++vindex;
            if ( iprecision > 0 ) {
              // Now figure out whether we need to right-justify...
              diff = precision - temp.length;
              if ( !left_shift ) {
                // Right justify...
                if ( diff > 0 ) {
                  for ( j = 0; j < diff; j++) {
                    temp = ' ' + temp;
                    // temp.insert(0, ' ');
                  }
                }
              }
              else {
                // Left justify.  Set the buffer to the precision...
                temp = temp.substring(0, precision);
                // temp.setLength ( precision );
                // Now fill the end with spaces instead of NULLs...
                for ( j = (precision - diff); j < precision; j++ ){
                  temp = temp.slice(0, j) + ' ' + temp.slice(j);
                  // temp.setCharAt( j, ' ');
                }
              }
              // If our string length is longer than the string, append a substring...
              if ( temp.length > precision ) {
                buffer += temp.toString().substring(0,precision);
              }
              else {
                // Do the whole string...
                buffer += temp.toString();
              }
            }
            else {
              // Write the whole string...
              if ( temp != null ) {
                buffer += temp ;
              }
            }
          }
          // End of a format string.  Break out and look for the next one...
          break;
        }
      }
      else {
        // A normal character so just add to the buffer...
        buffer += cformat ;
      }
    }

    return buffer.toString ();
  }


  /**
  Return a token in a string or null if no token.  This method calls
  breakStringList() and returns the requested token or null if out of range.
  @param string The string to break.
  @param delim A String containing characters to treat as delimiters.
  @param flag Bitmask indicating how to break the string.  Specify
  DELIM_SKIP_BLANKS to skip blank fields and
  DELIM_ALLOW_STRINGS to allow quoted strings (which may contain delimiters).
  @param token Token to return (starting with 0).
  @return the requested token or null.
  */
  public static getToken ( string: string, delim: string, flag: number, token: number ): string {
    if ( token < 0 ) {
      return null;
    }
    var v: string[] = StringUtil.breakStringList ( string, delim, flag );
    if ( v == null ) {
      return null;
    }
    if ( v.length < (token + 1) ) {
      return null;
    }
    return v[token];
  }

  /**
  Determine whether a string exists in another string, ignoring case.
  @param full Full string to check.
  @param substring Substring to find in "full".
  @param fromIndex The index where the search should begin.
  @return position of substring or -1 if not found.
  */
  public static indexOfIgnoreCase ( full: string, substring: string, fromIndex: number ): number {
    // Convert both strings to uppercase and then do the comparison.
    var full_up: string = full.toUpperCase();
    var substring_up: string = substring.toUpperCase();
    var pos: number = full_up.indexOf ( substring_up, fromIndex );
    return pos;
  }

  /**
  Determine whether a string is a double precision value.
  @return true if the string can be converted to a double.
  @param s String to convert.
  */
  public static isDouble( s: string ): boolean {
    if ( s == null ) {
          return false;
      }
      try {
          new Number( s.trim() );
      return true;
    }
    catch( e ){
      return false;
    }
  }

  /**
  Determine whether a string can be converted to an integer.
  @return true if the string can be converted to a integer.
  @param s String to convert.
  */
  public static isInteger( s: string ): boolean {
    if ( s == null ) {
          return false;
      }
      try {
          parseInt( s.trim() );
      return true;
    }
    catch( e ){
      return false;
    }
  }

  /**
  Remove a character from a string.
  @return String that has the character removed.
  @param s String to remove character from.
  @param r String to remove.
  */
  public static remove ( s: string, r: string ): string {
    if ( (s == null) || (r == null) ) {
      return s;
    }
    var buffer = '';
    var size = s.length;
    var r_length = r.length;
    for ( let i = 0; i < size; i++ ) {
      if ( s.indexOf(r,i) == i ) {
        // Skip next few characters...
        i += (r_length - 1);
      }
      else {
          buffer += s.charAt(i);
      }
    }
    return buffer.toString();	
  }

  /**
  Given a string representation of a floating point number, round to the
  desired precision.  Currently this operates on a string (and not a double)
  because the method is called from the formatString() method that operates on strings.
  @return String representation of the rounded floating point number.
  @param string String containing a floating point number.
  @param precision Number of digits after the decimal point to round the number.
  */
  public static round ( string: string, precision: number ): string {
    var new_string: string;

    // First break the string into its integer and remainder parts...
    var dot_pos: number = string.indexOf ( '.' );
    if ( dot_pos < 0 ) {
      // No decimal.
      return string;
    }
    // If we get to here there is a decimal.  Figure out the size of the integer and the remainder...
    var integer_length: number = dot_pos;
    var remainder_length: number = string.length - integer_length - 1;
    if ( remainder_length === precision ) {
      // Then our precision matches the remainder length and we can return the original string...
      return string;
    }
    else if ( remainder_length < precision ) {
      // If the remainder length is less than the precision, then we
      // can just add zeros on the end of the original string until we get to the precision length...
    }
    // If we get to here we need to do the more complicated roundoff 
    // stuff.  First check if the precision is zero.  If so, round off the main number and return...
    if ( precision === 0 ) {
      var ltemp: number = Math.round ( parseInt(string) );
      return ( ltemp.toString() );
    }
    // If we get to here, we have more than a zero precision and need to
    // jump through some hoops.  First, create a new string that has the remainder...
    var remainder_string = string.substring(dot_pos + 1);
    // Next insert a decimal point after the precision digits.
    remainder_string = remainder_string.slice(0, precision) + '.' + remainder_string.slice(precision);
    // remainder_string.insert(precision,'.');
    // Now convert the string to a Double...
    var dtemp = parseInt(remainder_string);
    // Now round...
    var ltemp: number = Math.round ( dtemp );
    // Now convert back to a string...
    var rounded_remainder: string = ltemp.toString();
    var integer_string: string = string.substring(0,integer_length);
    if ( rounded_remainder.length < precision ) {
      // The number we were working with had leading zeros and we
      // lost that during the round.  Insert zeros again...
      var buf: string = rounded_remainder;
      var number_to_add: number = precision - rounded_remainder.length;
      for ( var i = 0; i < number_to_add; i++ ) {
        // buf.insert(0,'0');
        buf = '0' + buf;
      }
      new_string = integer_string + "." + buf.toString();
      return new_string;
    }
    else if ( rounded_remainder.length > precision ) {
      // We have, during rounding, had to carry over into the next
      // larger ten's spot (for example, 99.6 has been rounded to
      // 100.  Therefore, we need to use all but the first digit of
      // the rounded remainder and we need to increment our original number (or decrement if negative!).
      var first_char: string = string.charAt(0);
      var new_long: number = parseInt(integer_string);
      if ( first_char === '-' ) {
        // Negative...
        --new_long;
      }
      else {
        // Positive...
        ++new_long;
      }
      new_string = new_long + "." + rounded_remainder.substring(1);
      return new_string;
    }
    // Now put together the string again...
    new_string = integer_string + "." + ltemp;

  /*
    if ( Message.isDebugOn ) {
      Message.printDebug ( 20, routine, "Original: " + string +
      " new: " + new_string );
    }
  */
    return new_string;
  }

}