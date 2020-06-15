
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

}