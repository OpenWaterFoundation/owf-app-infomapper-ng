import { PropList } from './PropList';

/**
This class can be used as a parent class for other commands.  It contains data
members and access methods that commonly are used and do not need to be implemented in specific command classes.
Note that the derived class should implement the Command interface methods - its
implementation here will be insufficient for most needs (e.g., editing).
*/
export class AbstractCommand {

  /**
  The full command string for the command, as specified during initialization.
  This is initialized to blank.
  */
  private __commandString = "";

  /**
  The command name only, as taken from the command string.
  This is initialized to blank;
  */
  private __commandName = "";

  /**
  The command processor, which will run the command and be associated with the command GUI.
  */
  // private __processor: CommandProcessor = null;

  /**
  Array of CommandProcessorEventListeners.
  */
  // private CommandProcessorEventListener [] __CommandProcessorEventListener_array = null;

  /**
  Array of CommandProgressListeners.
  */
  // private CommandProgressListener [] __CommandProgressListener_array = null;

  /**
  The command parameters, determined from processing the command string.
  This is initialized to an empty PropList and should be set when initializing the command.
  */
  private __parameters: PropList = new PropList ( "" );

  /**
  The status for the command.
  */
  // private CommandStatus __status = new CommandStatus();

  /**
  Whether or not the command is a plugin.
  */
  // private boolean __isPlugin = false;

  // TODO SAM 2016-03-23 Evaluate whether command profile should be null and only instantiated baesd
  // on a processor property, in order to save memory.
  /**
  The runtime profile for the command.  Although designed to have a profile for each command phase,
  focus on the run phase for now.
  */
  // private CommandProfile __profile = new CommandProfile();

  /**
  Default constructor for a command.
  */
  constructor () { }


  /**
  Return the parameters being used by the command.  The Prop.getHowSet() method
  can be used to determine whether a property was defined in the original command
  string (Prop.SET_FROM_PERSISTENT) or is defaulted internally
  (Prop.SET_AS_RUNTIME_DEFAULT).
  TODO SAM 2005-04-29 Does this need a boolean parameter to allow dialogs to
  see only the parameters in the command, so that defaults are not explicitly displayed?
  @return the parameters being used by the command.  A non-null list is guaranteed.
  */
  public getCommandParameters (): PropList {
    return this.__parameters;
  }

  // /**
  // Return the command processor that is managing the command.
  // @return the CommandProcessor used to process the command.
  // */
  // public getCommandProcessor (): CommandProcessor {
  //   return this.__processor;
  // }

  /**
  Set the command name, as taken from the command string.
  @param command_name The command name.
  */
  public setCommandName ( command_name: string ): void {
    this.__commandName = command_name;
  }


}