// import { PropList }   from './PropList';
// import { Prop }       from './Prop';
// import { StringUtil } from '../String/StringUtil';
// import { IOUtil }     from './IOUtil';


// /**
// This class manages a list of PropList objects.  It is generally only used for
// applications where several property lists need to be evaluated to determine the
// value of properties.  For example, an application may support a user
// configuration file, a system configuration file, and run-time user settings.
// Each source of properties can be stored in a separate PropList and can be
// managed by PropListManager.  This class has several functions that can handle
// recursive checks of PropLists and can expand configuration contents.
// @see Prop
// @see PropList
// */
// export class PropListManager {

//   public _proplists: PropList[] = [];

//   // List<PropList> _proplists; // List of PropList objects
  
//   // /**
//   // Default constructor.
//   // */
//   // public PropListManager ()
//   // {	initialize ();
//   // }
  
//   // /**
//   // Add an existing PropList to the the list managed by this class.
//   // @param proplist The PropList to add.
//   // @param replace_if_match If the name of the PropList matches one that is already
//   // in the list, replace it (true), or add the new list additionally (false).
//   // */
//   // public void addList ( PropList proplist, boolean replace_if_match )
//   // {	if ( proplist == null ) {
//   //     return;
//   //   }
//   //   if ( !replace_if_match ) {
//   //     // Always add...	
//   //     _proplists.add ( proplist );
//   //   }
//   //   else {
//   //       // Loop through and check names...
//   //     int size = _proplists.size();
//   //     PropList proplist_pt = null;
//   //     for ( int i = 0; i < size; i++ ) {
//   //       proplist_pt = (PropList)_proplists.get(i);
//   //       if ( proplist_pt == null ) {
//   //         continue;
//   //       }
//   //       if ( proplist_pt.getPropListName().equalsIgnoreCase(proplist.getPropListName()) ) {
//   //         _proplists.set(i,proplist);
//   //         return;
//   //       }
//   //     }
//   //     _proplists.add ( proplist );
//   //   }
//   // }
  
//   // /**
//   // Create and add a PropList to the the list managed by this class.
//   // @param listname The name of the list to add.
//   // @param listformat The format of the property list to add.
//   // */
//   // public int addList ( String listname, int listformat )
//   // {	if ( listname == null ) {
//   //     return 1;
//   //   }
//   //   // Allocate a new list...
//   //   PropList list = new PropList ( listname, listformat );
//   //   // Now add it to the list...
//   //   _proplists.add ( list );
//   //   return 0;
//   // }
  
//   // /**
//   // Clean up memory for garbage collection.
//   // */
//   // protected void finalize()
//   // throws Throwable
//   // {	_proplists = null;
//   //   super.finalize();
//   // }
  
//   /**
//   Return the property associated with the key.
//   @return The property associated with the string key.
//   @param key The string key to look up.
//   */
//   public getProp ( key: string ): Prop {
//     // For each list, search until we find the value...
//     var size = this._proplists.length;
//     var proplist: PropList;
//     var found: Prop;
//     for ( var i = 0; i < size; i++ ) {
//       proplist = this._proplists[i];
//       if ( proplist == null ) {
//         continue;
//       }
//       found = proplist.getProp(key);
//       if ( found != null ) {
//         return found;
//       }
//     }
//     return null;
//   }
  
//   // /**
//   // Return the list of PropLists managed by this PropListManager.
//   // */
//   // public List<PropList> getPropLists ()
//   // {	return _proplists;
//   // }
  
//   // /**
//   // Return the string value of the property.
//   // @return The string value of the property (if configuration information, the
//   // value is fully-expanded.
//   // @param key The String key to look up.
//   // */
//   // public String getValue ( String key )
//   // {	// For each list, search until we find the value...
//   //   int size = _proplists.size();
//   //   PropList proplist;
//   //   String found;
//   //   for ( int i = 0; i < size; i++ ) {
//   //     proplist = _proplists.get(i);
//   //     if ( proplist == null ) {
//   //       continue;
//   //     }
//   //     found = proplist.getValue(key);
//   //     if ( found != null ) {
//   //       return found;
//   //     }
//   //   }
//   //   return null;
//   // }
  
//   // // Initialize the object...
  
//   // private int initialize ( )
//   // {	_proplists = new Vector<PropList>();
//   //   return 0;
//   // }
  
//   // /**
//   // Parse a property string like "Variable=Value" where the value may be an
//   // expression to be expanded.  This function is in this class (rather than
//   // PropList) because it relies on the list of PropLists to expand the value of the property string.
//   // @return An instance of Prop resulting from the property string.
//   // @param prop_string The property string to parse.
//   // */
//   // static Prop parsePropString ( String prop_string )
//   // {	Prop prop = null;
  
//   //   if ( prop_string == null ) {
//   //     return prop;
//   //   }
//   //   if ( prop_string.length() < 1 ) {
//   //     return prop;
//   //   }
  
//   //   List<String> tokens = StringUtil.breakStringList ( prop_string, "=\n",
//   //       StringUtil.DELIM_SKIP_BLANKS | StringUtil.DELIM_ALLOW_STRINGS );
//   //   if ( tokens == null ) {
//   //     return prop;
//   //   }
//   //   int size = tokens.size();
//   //   if ( size < 2 ) {
//   //     // For some reason the above is not returning 2 tokens if the
//   //     // property is like "X=" (set to blank).  Handle here...
//   //     if ( prop_string.endsWith("=") ) {
//   //       tokens = new Vector<String>(2);
//   //       tokens.add (prop_string.substring( 0,(prop_string.length() - 1)));
//   //       tokens.add ( "" );
//   //     }
//   //     else {
//   //         Message.printWarning ( 2, "PropListManager.parsePropString",
//   //       "Need at least two tokens to set a property (\"" + prop_string + "\")" );
//   //       return prop;
//   //     }
//   //   }
  
//   //   // The variable is the first token, the contents is the remaining...
  
//   //   String variable = ((String)tokens.get(0)).trim();
//   //   String contents = "";
//   //   for ( int i = 1; i < size; i++ ) {
//   //     contents = contents + ((String)tokens.get(i)).trim();
//   //   }
//   //   prop = new Prop ( variable, (Object)contents, "" );
//   //   return prop;
//   // }
  
//   // /**
//   // Parse a property string like "Variable=Value" where the value may be an
//   // expression to be expanded.  Use the single property list that is provided.
//   // @return An instance of Prop resulting from the property string.
//   // @param proplist The property list to search for properties.
//   // @param prop_string The property string to parse.
//   // */
//   // static Prop parsePropString ( PropList proplist, String prop_string )
//   // {	Prop prop = null;
  
//   //   // Parse the string...
  
//   //   prop = parsePropString ( prop_string );
  
//   //   if ( prop == null ) {
//   //     return null;
//   //   }
  
//   //   // Now evaluate the contents to get a value...
  
//   //   String value = null;
//   //   if ( proplist != null ) {
//   //     value = resolveContentsValue ( proplist, (String)prop.getContents() );
//   //   }
//   //   else {
//   //       value = (String)prop.getContents();
//   //   }
  
//   //   // Now fill in the Prop and return...
  
//   //   prop.setValue ( value );
//   //   return prop;
//   // }
  
//   // /**
//   // Given a PropListManager and a string representation of the property contents,
//   // expand the contents to the literal property value.
//   // @return The property value as a string.
//   // @param proplist_manager The PropListManager to search for properties.
//   // @param contents the string contents to be expanded.
//   // */
//   // public static String resolveContentsValue ( PropListManager proplist_manager, String contents )
//   // {	return resolveContentsValue ( proplist_manager.getPropLists(), contents );
//   // }
  
//   /**
//   Given a property list and a string representation of the property contents,
//   expand the contents to the literal property value.
//   @return The property value as a string.
//   @param proplist The proplist to search for properties.
//   @param contents The string contents to be expanded.
//   */
//   public static resolveContentsValue ( proplist: PropList, contents: string ): string {
//     // Use a vector with one item to look up the information...
  
//     var v: PropList[] = [];
//     v.push ( proplist );
    
//     var results: string = PropListManager.resolveContentsValueFull ( v, contents );
//     return results;
//   }
  
//   // ----------------------------------------------------------------------------
//   // PropListManager.resolveContentsValue - resolve the value of a variable's
//   //					contents
//   // ----------------------------------------------------------------------------
//   // Copyright:	See the COPYRIGHT file.
//   // ----------------------------------------------------------------------------
//   // Notes:	(1)	This routine expects a string that contains the contents
//   //			of a property variable, e.g., the right string
//   //			from the following property definition:
//   //
//   //				myvariable = value
//   //
//   //		(2)	This code originally came from HMResolveConfigVariable.
//   //			However, in this code the property lists have already
//   //			been read into memory and can be searched without
//   //			much I/O processing.
//   //			This routine does not hard-code the name of the
//   //			configuration file - it uses the files that are passed
//   //			in and assumes that they are in the correct order to be
//   //			searched (highest precedence first).
//   //		(3)	This routine resolves the value for a variable by
//   //			looking for its definition in the vector of PropLists
//   //			that are passed in, returning the first one found.
//   //		(4)	If "variable" cannot be resolved, "value" is set to an
//   //			empty string.
//   //		(5)	Need to get the comment value filled.  THIS DOES NOT
//   //			CURRENTLY WORK.
//   //		(6)	Values can be nested once:  $($(inside)_outside).
//   //		(7)	Variables can be arrays.  For example:
//   //
//   //				myvariable[0] = value
//   //				myvariable[1] = value
//   //
//   //			Then, if called with "myvariable[0]", the first instance
//   //			is retrieved, etc.  This is useful where we want to
//   //			repeat the same information in a configuration file
//   //			but still use this routine to parse.
//   //		(8)	Lines can be continued by making sure that \ is the
//   //			last character on a line.
//   // ----------------------------------------------------------------------------
//   // History:
//   //
//   // 10 Feb 96	Steven A. Malers, RTi	Add "comment" parameter to argument
//   //					list.
//   // 03 Sep 96	SAM, RTi		Split code out of the HMUtil.c file
//   //					and make more stand-alone.
//   // 07 Oct 96	SAM, RTi		Include <string.h> and <ctype.h> to
//   //					prototype functions.  Remove unused
//   //					variables.
//   // 18 Mar 1997	SAM, RTi		Check information set by HMSetDef first
//   //					before going to environment and files.
//   // 17 Apr 1997	SAM, RTi		Add ability to nest definitions, e.g.,
//   //					$($(inside)_outside)
//   // 19 May 1997	SAM, RTi		Add ability to handle arrays of
//   //					variables.
//   // 28 Jul 1997	SAM, RTi		Add ability to handle \-terminated line
//   //					continuation.
//   // 03 Feb 1998	SAM, RTi		Previous history is for
//   //					HMResolveConfigVariable.  On this date
//   //					port the code to Java.  Will probably
//   //					need some cleanup over time.
//   // ----------------------------------------------------------------------------
//   // Variable	I/O	Description
//   //
//   // cchar	L	Character indicating start of a comment (blank lines
//   //			are also treated as comments).
//   // comment	L	Comment string associated with the variable.
//   // datapt	L	Pointer to HMDataDefine global data.
//   // dchar	L	Delimiter character used to separate variable and
//   //			value (not counting white space).
//   // dfp		L	Pointer to file.
//   // file_type	I	Type of config file.
//   // found_count	L	Indicates how many occurances of the variable have been
//   //			found (used for array variables).
//   // i		L	Position holder within record of configuration file.
//   // iend		L	Limit for "i".
//   // ilist	L	Loop counter for PropLists.
//   // quote1	L	Quote character for strings with whitespace.
//   // quote2	L	2nd valid quote character.
//   // rfr_close	L	String to close reference to defined variable.
//   // rfr_close_len L	Length of "rfr_close".
//   // rfr_open	L	String to open reference to defined variable.
//   // rfr_open_len	L	Length of "rfr_open".
//   // rfr_val	L	Value of a variable that is referred back to.
//   // rfr_val_nest	L	Nested reference variable value.
//   // rfr_var	L	Variable that is referred back to.
//   // ref_var_nest	L	Nested reference variable.
//   // token	L	Token variable to look up, after breaking out array
//   //			index.
//   // token0	I	Token variable to look up, before breaking out array
//   //			index.
//   // value	O	Falue of "variable".
//   // variable	O	Variable that is being looked up.
//   // ----------------------------------------------------------------------------
  
//   /**
//   Given a vector of property lists and a string representation of the property
//   contents, expand the contents to the literal property value.
//   @return The property value as a string.
//   @param proplists The list of property lists to search for properties.
//   @param contents The string contents to be expanded.
//   */
//   public static resolveContentsValueFull ( proplists: PropList[], contents: string ): string {
//     var cchar: string, hard_quote: string, soft_quote: string, syscall_quote: string;
//     var rfr_close: string, rfr_open: string, rfr_val: string, rfr_val_nest: string, routine = "PropListManager.resolveContentsValue";
//     var rfr_var = '', rfr_var_nest = '';
//     var dl = 100, i: number, iend: number, ilist: number, rfr_open_len: number;
//     var in_soft_quote = false;
  
//     // if ( Message.isDebugOn ) {
//     //   Message.printDebug ( dl, routine, "Trying to find value for contents \"" + contents + "\"" );
//     // }
  
//     // Initialize variables...
  
//     var value	= '';
  
//     // Because of a technical issue, we need to assume here that we are inside soft quotes...
  
//     in_soft_quote = true;
  
//     // When we call this routine, we are passed the contents of a
//     // property string and we are trying to expand that string here.  To
//     // do so, we may need to recursively call code to search the property
//     // lists again.  At this point, we don't know the variable name or
//     // care whether it is an array or a single variable.
  
//     if ( proplists === null ) {
//       console.warn ( 2, routine, "PropList vector is NULL" );
//       return null;
//     }
  
//     // First check the IOUtil properties...
  
//     var ioval: string = IOUtil.getPropValue ( contents );
//     if ( ioval != null ) {
//       return ioval;
//     }
    
//     // Use the old "file" notation for now until the code is working, then clean up...
//     var size = proplists.length;
//     var proplist: PropList = null;
//     var literal_quotes = true;
//     for ( var ilist = 0; ilist < size; ++ilist ) {
//       // Get the PropList based on the vector position...
//       proplist = proplists[ilist];
//       if ( proplist == null ) {
//         continue;
//       }
//       // if ( Message.isDebugOn ) {
//       //   Message.printDebug ( dl, routine, "Checking list \"" + proplist.toString() + "\"" );
//       // }
  
//       // Set some parsing information based on the prop list...
  
//       literal_quotes = proplist.getLiteralQuotes();
  
//       if ( proplist.getPersistentFormat() == PropList.FORMAT_NWSRFS ){
//         rfr_close = ")";
//         rfr_open = "$(";
//         cchar = '#';
//         hard_quote = '\'';
//         soft_quote = '\"';
//         syscall_quote = '`';
//       }
//       else if ( proplist.getPersistentFormat() == PropList.FORMAT_PROPERTIES ) {
//         // Assume PropList.FORMAT_PROPERTIES
//         rfr_close = "}";
//         rfr_open = "${";
//         cchar = '#';
//         hard_quote = '\'';
//         soft_quote = '\"';
//         syscall_quote = '`';
//       }
//       else {
//           // Assume PropList.FORMAT_MAKEFILE
//         rfr_close = ")";
//         rfr_open = "$(";
//         cchar = '#';
//         hard_quote = '\'';
//         soft_quote = '\"';
//         syscall_quote = '`';
//       }
//       rfr_open_len = rfr_open.length;
  
//       // if ( Message.isDebugOn ) {
//       //   Message.printDebug ( dl, routine, "Nested definitions are surrounded by " + rfr_open + rfr_close );
//       // }
  
//       // Determine the associated value.  This is done by evaluating
//       // string tokens and concatenating them to the "value".
//       //
//       i = 0;
//       iend = contents.length - 1;
//       var c: string;
//       while ( i <= iend ) {
//         // Determine contents of resource until:
//         //
//         // 1. Comment is found.
//         // 2. End of line is reached.
//         c = contents.charAt(i);
//         if ( (c == cchar) && !in_soft_quote) {
//           break;
//         }
//         // Hard quote.  Read until the closing quote...
//         if ( !literal_quotes && (c == hard_quote) ) {
//           // Skip quote and then add characters to resource...
//           // if ( Message.isDebugOn ) {
//           //   Message.printDebug ( dl, routine, "Detected start of hard quote: " + c );
//           // }
//           i++;
//           if ( i > iend ) {
//             break;
//           }
//           c = contents.charAt(i);
//           /* Need to find an isprint equivalent to test here... */
//           while ( c != hard_quote ) {
//             value += c ;
//             i++;
//             if ( i > iend ) {
//               break;
//             }
//             c = contents.charAt(i);
//           }
//           // Skip over trailing quote...
//           i++;
//           if ( i > iend ) {
//             break;
//           }
//           c = contents.charAt(i);
//           continue;
//         }
//         if ( c == syscall_quote ) {
//           // Skip quote and then form and execute a system call...
//           // if ( Message.isDebugOn ) {
//           //   Message.printDebug ( dl, routine, "Detected start of system call: " + c );
//           // }
//           i++;
//           if ( i > iend ) {
//             break;
//           }
//           c = contents.charAt(i);
//           var syscall = '';
//           while ( c != syscall_quote ) {
//             syscall += c ;
//             i++;
//             if ( i > iend ) {
//               break;
//             }
//             c = contents.charAt(i);
//           }
//           // Now make the system call and append...
//           // if ( Message.isDebugOn ) {
//           //   Message.printDebug ( dl, routine, "Making system call \"" + syscall + "\"" );
//           // }
//           var sysout: string[] = null;
//           try {
//             // Run using the full command since we don't know for sure how to tokenize,
//             // but the version that takes a command array is safer...
//             var pm: ProcessManager = new ProcessManager ( syscall.toString() );
//             pm.saveOutput ( true );
//             pm.run();
//             sysout = pm.getOutputList();
//             if ( pm.getExitStatus() !== 0 ) {
//               // Return null so calling code does not assume all is well
//               console.warn ( 2, routine, "Error running \"" + syscall.toString() );
//               pm = null;
//               return null;
//             }
//             pm = null;
//           }
//           catch ( e ) {
//             // Unable to run so return null so calling code does not assume all is well
//             console.warn ( 2, routine, "Error running \"" + syscall.toString() );
//             return null;
//           }
//           // Assume one line of output is all that should be passed...
//           var syscall_results = "";
//           if ( (sysout !== null) && (sysout.length > 0) ) {
//             syscall_results = sysout[0];
//           }
//           value += syscall_results;
//           sysout = null;
//           syscall_results = null;
//           // Now positioned on matching syscall_quote
//           // Skip over trailing quote...
//           i++;
//           if ( i > iend ) {
//             break;
//           }
//           c = contents.charAt(i);
//           continue;
//         }
//         // Soft quote...
//         else if ( !literal_quotes && (c == soft_quote) ) {
//           // This mainly just tells the rest of the code
//           // to allow spaces, etc., in the string.  It
//           // really has little effect other than limiting
//           // the processing of comments, etc.
//           // Skip over quote...
//           i++;
//           if ( i > iend ) {
//             break;
//           }
//           c = contents.charAt(i);
//           in_soft_quote = true;
//           continue;
//         }
//         // Now look for any embedded references
//         // to other variables...
//         if (  (contents.length - i) >= rfr_open_len ) {
//           if ( contents.substring(i,(i+rfr_open_len)) === rfr_open ) {
//           // if ( Message.isDebugOn ) {
//           //   Message.printDebug ( dl, routine, "Detected variable reference" );
//           // }
//           i += rfr_open_len;
//           if ( i > iend ) {
//             break;
//           }
//           c = contents.charAt(i);
//           // Now, if the next characters are the open characters we
//           // need to recurse on a nested definition...
//           if ( contents.substring(i, i+rfr_open_len) === rfr_open  ) {
//             // if ( Message.isDebugOn ) {
//             //   Message.printDebug ( dl, routine, "Detected nesting" );
//             // }
//             i += rfr_open_len;
//             if ( i > iend ) {
//               break;
//             }
//             c = contents.charAt(i);
//             while ( (i <= iend) && (c != rfr_close.charAt(0)) ) {
//               rfr_var_nest += c;
//               i++;
//               if ( i > iend ) {
//                 break;
//               }
//               c = contents.charAt(i);
//             }
//             i++;  /*skip closing character*/
//             if ( i > iend ) {
//               break;
//             }
//             c = contents.charAt(i);
//             // Now we call the routine that looks
//             // up a value given the variable name.
//             rfr_val_nest = this.resolvePropValueFull( proplists, rfr_var_nest.toString());
//             if ( rfr_val_nest == null ) {
//               // Just use a blank string...
//               rfr_val_nest = "";
//             }
//             // if ( Message.isDebugOn ) {
//             //   Message.printDebug ( dl, routine,
//             //   "Nested value for \"" + rfr_var_nest + "\" is \"" + rfr_val_nest + "\"" );
//             // }
//             // Now concatenate this to the variable that we really want to look up...
//             rfr_var += rfr_val_nest ;
//           }
//           // Now continue forming the recursive reference...
//           while ( (i <= iend) && (c != rfr_close.charAt(0)) ) {
//             rfr_var += c;
//             i++;
//             if ( i > iend ) {
//               break;
//             }
//             c = contents.charAt(i);
//           }
//           i++;  /*skip closing character*/
//           if ( i > iend ) {
//             break;
//           }
//           c = contents.charAt(i);
//           // if ( Message.isDebugOn ) {
//           //   Message.printDebug ( dl, routine, "Recursive call to resolve \"" + rfr_var + "\"" );
//           // }
//           rfr_val = this.resolvePropValueFull ( proplists, rfr_var.toString() );
//           if ( rfr_val == null ) {
//             // Set to a blank string...
//             rfr_val = "";
//           }
//           // if ( Message.isDebugOn ) {
//           //   Message.printDebug ( dl, routine,
//           //       "Recursive value for \"" + rfr_var + "\" - \"" + rfr_val + "\"" );
//           // }
//           value += rfr_val;
//           continue;
//         }
//         }
//         // All other characters...
//         // Add character to resource...
//         value += c;
//         i++;
//         if ( i > iend ) {
//           break;
//         }
//         c = contents.charAt(i);
//       }
//       if ( value.length > 0 ) {
//         // We have found a value...
//         //
//         // Need to cut off trailing white space...
//         var value_string: string = value.toString().trim();
//         // if ( Message.isDebugOn ) {
//         //   Message.printDebug ( dl, routine,
//         //   "\"" + contents + "\": contents \" = \"" + value_string + "\"" );
//         // }
//         return value_string;
//       }
//     }
//     if( value.length < 1 ) {
//       // Unable to expand the value...
//       return value.toString();
//     }
//     else {
//         // Need to cut off trailing white space...
//       var value_string: string = value.toString().trim();
//       // if ( Message.isDebugOn ) {
//       //   Message.printDebug ( dl, routine, "\"" + proplists.toString() + "\": contents \"" +
//       //   contents + "\" = \"" + value_string + "\"" );
//       // }
//       return value_string;
//     }
//   }
  
//   /**
//   Return the string value for a property, given the property key, using the
//   single specified property list.
//   @return The string property value.
//   @param list The single property list to check.
//   @param key The string key to look up>
//   */
//   public static resolvePropValue ( list: PropList, key: string ): string
//   {	// Create a vector and call the routine that accepts the vector...
  
//     var v: PropList[] = [];
//     v.push ( list );
//     var result: string = this.resolvePropValueFull ( v, key );
//     return result;
//   }
  
//   // ----------------------------------------------------------------------------
//   // PropListManager.resolvePropValue -	given a vector of PropLists and a key
//   //					string, return the value
//   // ----------------------------------------------------------------------------
//   // Notes:	(1)	The key string can be a variable name (e.g., "MYVAR" )
//   //			or it can be an array (e.g., "MYVAR[0]").  This routine
//   //			loops through the property lists to find the key and
//   //			then resolves its contents.
//   // ----------------------------------------------------------------------------
//   // History:
//   //
//   // 03 Feb 1998	Steven A. Malers	Initial version.  The original
//   //					HMResolveConfigVariable routine has
//   //					been split into several routines.  This
//   //					code now searches properties in
//   //					memory rather than reading from files
//   //					and consequently it is faster and
//   //					easier to manage the lookups.
//   // ----------------------------------------------------------------------------
//   /**
//   Return the string value for a property, given the property key, using the
//   specified vector of property lists.
//   @return The string property value.
//   @param list The list of property lists to check.
//   @param key The string key to look up>
//   */
//   public static resolvePropValueFull ( list: PropList[], key: string ): string {
//     var	array_index = 0, dl = 100;
  
//     // Make sure that we have non-null data...
  
//     if ( list === null ) {
//       return null;
//     }
  
//     if ( key === null ) {
//       return null;
//     }
  
//     // First check the IOUtil properties...
  
//     var ioval: string = IOUtil.getPropValue ( key );
//     if ( ioval !== null ) {
//       return ioval;
//     }
  
//     // See if we are looking up a normal variable or an array item...
  
//     // if ( Message.isDebugOn ) {
//     //   Message.printDebug ( dl, "PropListManager.resolvePropValue",
//     //   "Looking up \"" + key + "\" in vector of PropList" );
//     // }
  
//     var strings: string[] = StringUtil.breakStringList ( key, "[]", StringUtil.DELIM_SKIP_BLANKS );
//     var	nstrings: number = strings.length;
//     if ( nstrings >= 2 ) {
//       // We have an array.  Break out the variable name and the
//       // array position (zero-referenced)...
//       array_index = StringUtil.atoi ( strings[1]);
//       // if ( Message.isDebugOn ) {
//       //   Message.printDebug ( dl, "PropListManager.resolvePropValue", "Array index is " + array_index );
//       // }
//     }
//     strings = null;
  
//     // Loop through the vector searching each PropList in order...
  
//     var found_count = 0, vsize = list.length;
//     var proplist: PropList = null;
//     var prop: Prop = null;
//     for ( var i = 0; i < vsize; i++ ) {
//       // First get the list...
//       proplist = list[i];
//       if ( proplist === null ) {
//         continue;
//       }
//       // Now loop through the items in the list...
//       var psize = proplist.size();
//       for ( var j = 0; j < psize; j++ ) {
//         prop = proplist.propAt(j);
//         if ( prop.getKey().toUpperCase() === key.toUpperCase() ) {
//           // We have a match.
//           ++found_count;
//           if ( (found_count - 1) == array_index ) {
//             // This is the one that we want to return...
//             var result: string = prop.getValueNone();
//             return result;
//           }
//         }
//       }
//     }
//     return null;
//   }
  
//   // /**
//   // Given a string like X=Y, resolve the value of the property.  Not implemented.
//   // */
//   // public static Object resolvePropString ( PropList list, String string )
//   // {	return null;
//   // }
  
//   // /**
//   // Given a string like X=Y, resolve the value of the property.  Not implemented.
//   // */
//   // public static Object resolvePropVariable ( PropList list, String string )
//   // {	return null;
//   // }
  
//   // // Set routines...
  
//   // // Need to figure out which list is used for the default?  Should use the one
//   // // in memory.  For now, require that the list name be specified when setting.
//   // // Probably can try to reset in a list if found but still need to determine the
//   // // list if adding.
//   // /*
//   // public int setValue ( String key, Object value )
//   // {
//   //   if ( value != null ) {
//   //     _value = value;
//   //   }
//   //   return 0;
//   // }
//   // */
  
//   // /**
//   // Set the value of a property by searching the property lists
//   // @param listname The property list name to set the value in.
//   // @param key The string key of the property to set.
//   // @param contents The string value to set for the property.
//   // */
//   // public int setValue ( String listname, String key, Object contents )
//   // {	if ( contents == null ) {
//   //     return 1;
//   //   }
//   //   // For each list, search until we find the value and then reset it...
//   //   int size = _proplists.size();
//   //   PropList proplist;
//   //   for ( int i = 0; i < size; i++ ) {
//   //     proplist = (PropList)_proplists.get(i);
//   //     if ( proplist == null ) {
//   //       continue;
//   //     }
//   //     if ( proplist.getPropListName().equals(listname) ) {
//   //       // We have our list.  Set the value by calling that list's routine...
//   //       proplist.setUsingObject ( key, contents );
//   //       return 0;
//   //     }
//   //   }
//   //   // Cannot find list...
//   //   return 1;
//   // }
  
// }