#!/bin/sh
(set -o igncr) 2>/dev/null && set -o igncr; # this comment is required
# The above line ensures that the script can be run on Cygwin/Linux even with Windows CRNL
#
# Run 'ng serve' in the proper folder if the environment is properly configured.
# The following checks are done to ensure that the environment is properly configured,
# which helps ensure that the deployed application software is properly configured.
#
#   1. Check that Angular version required for InfoMapper is available.
#   2. Check for required third-party software, such as private npm packages.
#   3. Handle typical errors.

# Check whether the Angular version satisfies requirements.
# - For example, if the application requires Angular 11 and
#   installed version is 10, print a message about how to update.
checkAngularVersion() {
  # The following is an empty statement - otherwise an error results.
  # - remove when some commands are implemented
  :
}

# Check whether component dependencies are installed.
# - Most dependencies are handled with 'npm install'.
# - For example GapMinder npm local packages.
checkComponentDependencies() {
  # The following is an empty statement - otherwise an error results.
  # - remove when some commands are implemented
  :
}

# Handle 'ng serve' errors.
# Not sure what needs to be done but can evaluate over time.
handleNgServeErrors() {
  # The following is an empty statement - otherwise an error results.
  # - remove when some commands are implemented
  :
}

# Get the folder where this script is located since it may have been run from any folder.
scriptFolder=$(cd "$(dirname "$0")" && pwd)
repoFolder=$(dirname "${scriptFolder}")
infoMapperMainFolder="${repoFolder}/infomapper"

# Check the Angular version
checkAngularVersion

# Check for required components
checkComponentDependencies

# Run 'ng serve'
echo "Changing to folder: ${infoMapperMainFolder}"
cd "${infoMapperMainFolder}" || exit
echo "Running 'ng serve'."
echo "Changes in application assets will be detected and web page automatically reloaded."
echo "If necessary, kill the server and restart."
echo "The server may take a while to start."
echo "Use Ctrl-c to kill the local http server."
ng serve
ngStatus=$?

if [ ${ngStatus} -ne 0 ]; then
  handleNgServeErrors
fi

exit 0
