/**
Date/time formatter types, to allow the DateTime object to be formatted with different format strings.
*/
export enum DateTimeFormatterType {
/**
C-style formats (see http://linux.die.net/man/3/strftime).
*/
C,
/**
ISO-8601 formats (see http://dotat.at/tmp/ISO_8601-2004_E.pdf).
*/
ISO,
/**
Microsoft style formats (see http://msdn.microsoft.com/en-us/library/az4se3k1.aspx).
TODO SAM 2012-04-10 Is this compatible with Excel?
*/
MS

}

// export namespace DateTimeFormatterType {

//   const displayName: string = '';
//   const displayNameVerbose: string;

//   /**
//   Return the short display name for the type.  This is the same as the value.
//   @return the display name.
//   */
//   @Override
//   export function toString(): string {
//       return displayName;
//   }

//   /**
//   Return the verbose display name for the type.
//   @return the verbose display name for the type.
//   */
//   export function toStringVerbose(): string {
//       return displayNameVerbose;
//   }
  
//   /**
//   Return the enumeration value given a string name (case-independent).
//   @param name the date/time format string to match, as either the short or verbose display name, or the
//   concatenated version "displayName - displayNameVerbose".  
//   @return the enumeration value given a string name (case-independent).
//   @exception IllegalArgumentException if the name does not match a valid date/time formatter type.
//   */
//   export function valueOfIgnoreCase (name: string): DateTimeFormatterType {
//     if ( name == null ) {
//           return null;
//       }
//       var values: DateTimeFormatterType[] = values();
//       for ( var t of values ) {
//           if ( name.toUpperCase() === t.toString().toUpperCase() || name.toUpperCase() === t.toStringVerbose().toUpperCase() ||
//               name.equalsIgnoreCase(t.toString() + " - " + t.toStringVerbose() )) {
//               return t;
//           }
//       }
//       throw new IllegalArgumentException ( "The following does not match a valid date/time formatter type: \"" + name + "\"");
//   }

// }