// import { Prop } from './Prop';
// import { PropListManager } from './PropsListManager';



// export abstract class IOUtil {

//   // Global data...

// // TODO SAM 2009-05-06 Evaluate whether needed
// /**
// Flags use to indicate the vendor
// */
// public static SUN = 1;
// public static MICROSOFT = 2;
// public static UNKNOWN = 3;

// /**
// String to use to indicate a file header revision line.
// @see #getFileHeader
// */
// protected static HEADER_REVISION_STRING = "HeaderRevision";
// /**
// String used to indicate comments in files (unless otherwise indicated).
// */
// protected static UNIVERSAL_COMMENT_STRING = "#";

// /**
// Command-line arguments, guaranteed to be non-null but may be empty.
// */
// private static _argv: string[] = [];
// /**
// Applet, null if not an applet.
// */
// // private Applet _applet = null;
// /**
// Applet context.  Call setAppletContext() from init() of an application that uses this class.
// */
// // private AppletContext _applet_context = null;
// /**
// Document base for the applet.
// */
// // private static URL _document_base = null;
// /**
// Program command file.
// TODO SAM (2009-05-06) Evaluate phasing out since command file is managed with processor, not program.
// */
// private static _command_file ="";
// /**
// Program command list.
// TODO SAM (2009-05-06) Evaluate phasing out since command file is managed with processor, not program.
// */
// private static _command_list: string[] = null;
// /**
// Host (computer) running the program.
// */
// private static _host = "";
// /**
// Program name, as it should appear in title bars, Help About, etc.
// */
// private static _progname = "";
// /**
// Program version, typically "XX.XX.XX" or "XX.XX.XX beta".
// */
// private static _progver = "";
// /**
// Program user.
// */
// private static _user = "";
// /**
// Indicates whether a test run (not used much anymore) - can be used for experimental features that are buried
// in the code base.
// */
// private static _testing = false;
// /**
// Program working directory, which is virtual and used to create absolute paths to files.  This is needed
// because the application cannot change the current working directory due to security checks.
// */
// private static _working_dir = "";
// /**
// Indicates whether global data are initialized.
// */
// private static _initialized = false;
// /**
// Indicate whether the program is running as an applet.
// */
// private static _is_applet = false;
// /**
// Indicates whether the program is running in batch (non-interactive) or interactive GUI/shell.
// */
// private static _is_batch = false;
// /**
// A property list manager that can be used globally in the application.
// */
// private static _prop_list_manager: PropListManager = null;
// /**
// TODO SAM 2009-05-06 Seems to be redundant with _is_applet.
// */
// private static __runningApplet = false;
// /**
// Home directory for the application, typically the installation location (e.g., C:\Program Files\Company\AppName).
// */
// private static __homeDir: string = null;


//   /**
//   Return global PropList property.
//   @return The property in the global property list manager corresponding to the given key.
//   <b>This routine is being reworked to be consistent with the Prop* classes.</b>
//   @param key String key to look up a property.
//   @see Prop
//   @see PropList
//   @see PropListManager
//   */
//   public static getProp ( key: string ): Prop {
//     if ( !this._initialized ) {
//       this.initialize ();
//     }
//     return this._prop_list_manager.getProp ( key );
//   }

//   /**
//   Return property value as a String.
//   @return The value of a property in the global property list manager corresponding to the given key.
//   @param key String key to look up a property.
//   @see Prop
//   @see PropList
//   @see PropListManager
//   */
//   public static getPropValue ( key: string ): string {
//     if ( !this._initialized ) {
//       this.initialize ();
//     }
//     try {
//         var prop: Prop = this.getProp ( key );
//       if ( prop === null ) {
//         return null;
//       }
//       return prop.getValueNone();
//     }
//     catch (e ) {
//       // Probably a security exception...
//       return null;
//     }
//   }

//   /**
//   Initialize the global data.  setApplet() should be called first in an applet
//   to allow some of the if statements below to be executed properly.
//   */
//   private static initialize (): void {
//     var routine = "IOUtil.initialize";
//     var dl = 1;

//     // if ( Message.isDebugOn ) {
//     //   Message.printDebug ( dl, routine, "Initializing IOUtil..." );
//     // }
//     try {
//         // Put this in just in case we have security problems...
//       if ( this._is_applet ) {
//         // if ( Message.isDebugOn ) {
//         //   Message.printDebug ( dl, routine, "An applet!");
//         // }
//         this._command_file = "";
//         this._command_list = null;
//         // TODO (JTS - 2005-06-06) should do some testing to see what the effects are
//         // of doing a host set like in the non-applet code below.  Possibilities I foresee:
//         // 1) applets lack the permission to get the hostname
//         // 2) applets return the name of the computer the user is physically working on.
//         // 3) applets return the name of the server on which the applet code actually resides.
//         // I have no way of knowing right now which one would
//         // be the case, and moreover, no time to test this.
//         this._host = "web server/client/URL unknown";
//         this._progname = "program name unknown";
//         this._progver = "version unknown";
//         this._user = "user unknown (applet)";
//         this._working_dir = "dir unknown (applet)";
//         this.__homeDir = "dir unknown (applet)";
//       }
//       else {
//           // A stand-alone application...
//         // if ( Message.isDebugOn ) {
//         //   Message.printDebug ( dl, routine, "Not an applet!" );
//         // }
//         this._command_file = "";
//         this._command_list = null;
//         this._host = InetAddress.getLocalHost().getHostName();
//         this._progname = "program name unknown";
//         this._progver = "version unknown";
//         this._user = System.getProperty("user.name");
//         this._working_dir = System.getProperty ("user.dir");
//         this.__homeDir = System.getProperty ("user.dir");
//       }
//     } catch ( e ) {
//       // Don't do anything.  Just print a warning...
//       console.warn ( 3, routine, "Caught an exception initializing IOUtil (" + e + ").  Continuing." );
//     }

//     // Initialize the applet context...

//     this._applet_context = null;

//     // Initialize the property list manager to contain an unnamed list...

//     this._prop_list_manager = new PropListManager ();
//     this._prop_list_manager.addList ( new PropList("", PropList.FORMAT_PROPERTIES), true );

//     // Set the flag to know that the class has been initialized...

//     this._initialized = true;
//   }

// }