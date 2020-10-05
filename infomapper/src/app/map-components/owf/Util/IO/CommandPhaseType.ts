


/**
This class provides an enumeration of possible command phase values.
An enum could be used when Java 1.5 is utilized.    
*/
export class CommandPhaseType {
	
	/**
	When used with Command processing,
	INITIALIZATION indicates that the command is being initialized, including
	construction and validation of parameters.
	*/ 
	public static INITIALIZATION = new CommandPhaseType(0, "INITIALIZATION");
	
	/**
	 * DISCOVERY is the phase where a command is partially run, in order to provide data to dependent commands.
	 */
	public static DISCOVERY = new CommandPhaseType(1, "DISCOVERY");
	
	/**
	 * RUN indicates the phase where the command is being run.
	 */
	public static RUN = new CommandPhaseType(2, "RUN");
	
	//private int __type;
	/**
	 * @uml.property  name="__typename"
	 */
	private __typename: string;
	
	private constructor ( type: number, typename: string ){
		//__type = type;
		this.__typename = typename;
	}
	
	/**
	 * Return a String representation of the command processing phase.
	 */
	public toString (): string {
		return this.__typename;
	}
}