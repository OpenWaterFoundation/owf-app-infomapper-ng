#!/bin/sh
#
# Copy the staged website to the poudre.openwaterfoundation.org website
# - replace all the files on the web with local files
# - must specify Amazon profile as argument to the script
# - the script gets determines the version from the code and optionally uploads to "latest" version
# - tested with Git Bash

# Supporting functions, alphabetized

# Check to make sure the Angular version is as expected
# - TODO smalers 2020-04-20 Need to implement
checkAngularVersion() {
  logWarning "Checking Angular version is not implemented.  Continuing."
}

# Check input
# - make sure that the Amazon profile was specified
# - call this before doing the upload but don't need before then
checkInput() {
  if [ -z "$awsProfile" ]; then
    logError ""
    logError "Amazon profile to use for upload was not specified with --aws-profile option.  Exiting."
    printUsage
    exit 1
  fi
}

# Determine the operating system that is running the script
# - mainly care whether Cygwin or MINGW (Git Bash)
checkOperatingSystem()
{
  if [ ! -z "${operatingSystem}" ]; then
    # Have already checked operating system so return
    return
  fi
  operatingSystem="unknown"
  os=$(uname | tr [a-z] [A-Z])
  case "${os}" in
    CYGWIN*)
      operatingSystem="cygwin"
      ;;
    LINUX*)
      operatingSystem="linux"
      ;;
    MINGW*)
      operatingSystem="mingw"
      ;;
  esac
}

# Echo to stderr
# - if necessary, quote the string to be printed
# - this function is called to print various message types
echoStderr() {
  echo "$@" 1>&2
}

# Get the Poudre Information Portal version
# - TODO smalers 2020-04-20 need to figure out what code has the version
getVersion() {
  version="1.0.0"
}

# Print a DEBUG message, currently prints to stderr.
logDebug() {
   echoStderr "[DEBUG] $@"
}

# Print an ERROR message, currently prints to stderr.
logError() {
   echoStderr "[ERROR] $@"
}

# Print an INFO message, currently prints to stderr.
logInfo() {
   echoStderr "[INFO] $@"
}

# Print an WARNING message, currently prints to stderr.
logWarning() {
   echoStderr "[WARNING] $@"
}

# Parse the command parameters
# - use the getopt command line program so long options can be handled
parseCommandLine() {
  # Single character options
  optstring="hv"
  # Long options
  optstringLong="aws-profile::,dryrun,help,noupload,version"
  # Parse the options using getopt command
  GETOPT_OUT=$(getopt --options $optstring --longoptions $optstringLong -- "$@")
  exitCode=$?
  if [ $exitCode -ne 0 ]; then
    # Error parsing the parameters such as unrecognized parameter
    echoStderr ""
    printUsage
    exit 1
  fi
  # The following constructs the command by concatenating arguments
  eval set -- "$GETOPT_OUT"
  # Loop over the options
  while true; do
    #logDebug "Command line option is ${opt}"
    case "$1" in
      --aws-profile) # --aws-profile=profile  Specify the AWS profile (use default)
        case "$2" in
          "") # Nothing specified so error
            logError "--aws-profile=profile is missing profile name"
            exit 1
            ;;
          *) # profile has been specified
            awsProfile=$2
            shift 2
            ;;
        esac
        ;;
      --dryrun) # --dryrun  Indicate to AWS commands to do a dryrun but not actually upload.
        logInfo "--dryrun detected - will not change files on S3"
        dryrun="--dryrun"
        shift 1
        ;;
      -h|--help) # -h or --help  Print the program usage
        printUsage
        exit 0
        ;;
      --noupload) # --noupload  Indicate to create staging area dist but not upload
        logInfo "--noupload detected - will create dist but not upload"
        doUpload="no"
        shift 1
        ;;
      -v|--version) # -v or --version  Print the program version
        printVersion
        exit 0
        ;;
      --) # No more arguments
        shift
        break
        ;;
      *) # Unknown option
        logError "" 
        logError "Invalid option $1." >&2
        printUsage
        exit 1
        ;;
    esac
  done
}

# Print the program usage to stderr.
# - calling code must exit with appropriate code
printUsage() {
  echoStderr ""
  echoStderr "Usage:  $programName --aws-profile=profile"
  echoStderr ""
  echoStderr "Copy the Poudre Information Portal application files to the Amazon S3 static website folder(s):"
  echoStderr ""
  echoStderr "               ${s3FolderVersionUrl}"
  echoStderr "  optionally:  ${s3FolderLatestUrl}"
  echoStderr ""
  echoStderr "--aws-profile=profile   Specify the Amazon profile to use for AWS credentials."
  echoStderr "--dryrun                Do a dryrun but don't actually upload anything."
  echoStderr "--noupload              Create the staging area distribution but don't upload."
  echoStderr "-h or --help            Print the usage."
  echoStderr "-v or --version         Print the version and copyright/license notice."
  echoStderr ""
}

# Print the script version and copyright/license notices to stderr.
# - calling code must exit with appropriate code
printVersion() {
  echoStderr ""
  echoStderr "${programName} version ${programVersion} ${programVersionDate}"
  echoStderr ""
  echoStderr "Poudre Information Portal"
  echoStderr "Copyright 2017-2020 Open Water Foundation."
  echoStderr ""
  echoStderr "License GPLv3+:  GNU GPL version 3 or later"
  echoStderr ""
  echoStderr "There is ABSOLUTELY NO WARRANTY; for details see the"
  echoStderr "'Disclaimer of Warranty' section of the GPLv3 license in the LICENSE file."
  echoStderr "This is free software: you are free to change and redistribute it"
  echoStderr "under the conditions of the GPLv3 license in the LICENSE file."
  echoStderr ""
}

# Sync the Angular application files to S3
# - figures out the location of the 'aws' script for Cygwin and MinGW (Git Bash)
syncFiles() {
  local s3FolderUrl

  s3FolderUrl=$1

  if [ "$operatingSystem" = "cygwin" -o "$operatingSystem" = "linux" ]; then
    # aws is in a standard location such as /usr/bin/aws
    aws s3 sync ${distAppFolder} ${s3FolderUrl} ${dryrun} --delete --profile "$awsProfile"
    errorCode=$?
    if [ $errorCode -ne 0 ]; then
      logError "Error code $errorCode from 'aws' command.  Exiting."
      exit 1
    fi
  elif [ "$operatingSystem" = "mingw" ]; then
    # For Windows Python 3.7, aws may be installed in Windows %USERPROFILE%\AppData\Local\Programs\Python\Python37\scripts
    # - use Linux-like path to avoid backslash issues
    # - TODO smalers 2019-01-04 could try to find if the script is in the PATH
    # - TODO smalers 2019-01-04 could try to find where py thinks Python is installed but not sure how
    awsScript="$HOME/AppData/Local/Programs/Python/Python37/scripts/aws"
    if [ -f "${awsScript}" ]; then
      ${awsScript} s3 sync ${distAppFolder} ${s3FolderUrl} ${dryrun} --delete --profile "$awsProfile"
      errorCode=$?
      if [ $errorCode -ne 0 ]; then
        logError "Error code $errorCode from 'aws' command.  Exiting."
        exit 1
      fi
    else
      logError ""
      logError "Can't find 'aws' script"
      exit 1
    fi
  else
    logError ""
    logError "Don't know how to run on operating system ${operatingSystem}"
    exit 1
  fi
}

# Entry point into the script

# Check the operating system
checkOperatingSystem

# Make sure the Angular version is OK
checkAngularVersion

# Get the folder where this script is located since it may have been run from any folder
scriptFolder=$(cd $(dirname "$0") && pwd)
# mainFolder is poudre-dashboard-ng
repoFolder=$(dirname $scriptFolder)
mainFolder="$repoFolder/poudre-dashboard-ng"
distFolder="${mainFolder}/dist"
# TODO smalers 2020-04-20 is the app folder redundant?
# - it is not copied to S3
distAppFolder="${distFolder}/poudre-dashboard-ng"
programName=$(basename $0)
programVersion="1.0.0"
programVersionDate="2020-04-21"
logInfo "Script folder:     ${scriptFolder}"
logInfo "Repository folder: ${repoFolder}"
logInfo "Main folder:       ${mainFolder}"
logInfo "dist folder:       ${distFolder}"
logInfo "dist/app folder:   ${distAppFolder}"
logInfo "Program name:      ${programName}"

# S3 folder for upload
# - put before parseCommandLine so can be used in print usage, etc.
# - TODO smalers 2020-04-20 does this need an app folder at end like "/owf-app-poudre-dashboard"?
getVersion
logInfo "Application version:  ${version}"
s3FolderVersionUrl="s3://poudre.openwaterfoundation.org/${version}"
s3FolderLatestUrl="s3://poudre.openwaterfoundation.org/latest"

# Parse the command line.
# Specify AWS profile with --aws-profile
awsProfile=""
# Default is not to do 'aws' dry run
# - override with --dryrun
dryrun=""
# Default is to create dist and do upload
doUpload="yes"
parseCommandLine "$@"

# First build the site so that the "dist" folder contains current content.
#
# - see:  https://medium.com/@tomastrajan/6-best-practices-pro-tips-for-angular-cli-better-developer-experience-7b328bc9db81
# - Put on the command line rather than in project configuration file
# - enable ahead of time compilation:  --aot
# - extract all css into separate style-sheet file:  --extractCss true
# - disable using human readable names for chunk and use numbers instead:  --namedChunks false
# - force cache-busting for new releases:  --output-hasshing all
# - disable generation of source maps:  --sourcemaps false
#
# See options:  https://angular.io/cli/build

# Ways to handle the href path
# - TODO smalers 2020-04-20 can add this to command line parameters if necessary
# - "period" works locally in "dist" but not when pushed to the cloud
# - "path" 
hrefMode="period"
if [ "$hrefMode" = "period" ]; then
  # Results in the following in output:
  # <head>...<base href=".">
  ngBuildHrefOpt="."
  # Copy the folder
  #localSyncFolder="../poudre-dashboard-ng/dist/poudre-dashboard-ng"
  #s3Folder="s3://viz.openwaterfoundation.org/owf-app-poudre-dashboard"
elif [ "$hrefMode" = "path" ]; then
  ngBuildHrefOpt="/owf-app-poudre-dashboard/"
  # Copy the folder 
  #localSyncFolder="../poudre-dashboard-ng/dist/poudre-dashboard-ng"
  #s3Folder="s3://viz.openwaterfoundation.org/owf-app-poudre-dashboard"
else
  logError ""
  logError "Unknown hrefMode=$hrefMode"
  exit 1
fi

logInfo ""
logInfo "Regenerating Angular dist folder to deploy the website..."
logInfo "Changing to:  ${mainFolder}"
cd ${mainFolder}
# TODO smalers 2020-04-20 start of old commented out code...
# The following will result in full C:\... path set in <head>...<base href="C:\..">
#ng build --prod --aot=true --baseHref=${ngBuildHrefOpt} --prod=true --extractCss=true --namedChunks=false --outputHashing=all --sourceMap=false
#cmd /c ng build --prod --aot=true --baseHref=${ngBuildHrefOpt} --prod=true --extractCss=true --namedChunks=false --outputHashing=all --sourceMap=false
#cmd /c start "" /wait /b ng build --prod --aot=true --baseHref=${ngBuildHrefOpt} --prod=true --extractCss=true --namedChunks=false --outputHashing=all --sourceMap=false
# The following does not work because start is a cmd built-in command
#start /wait cmd /c ng build --prod --aot=true --baseHref=${ngBuildHrefOpt} --prod=true --extractCss=true --namedChunks=false --outputHashing=all --sourceMap=false
# TODO smalers 2020-04-20 ...end of old commented out code

# Run the ng build
# - use the command line from 'copy-to-owf-amazon-s3.bat', which was used more recently
# - this should be found in the Windows PATH, for example C:\Users\user\AppData\Roaming\npm\ng
logInfo "Start running 'ng build...' ..."
ng build --prod --aot=true --baseHref=${ngBuildHrefOpt} --prod=true --extractCss=true --namedChunks=false --outputHashing=all --sourceMap=false
logInfo "...done running 'ng build...'"

# Run a batch file
# -TODO smalers 2020-04-20 this used to be run but must be out of date since script not found
#logInfo "Running ng-build-prod.bat...
#cmd /c ../ng-build-prod.bat ${ngBuildrefOpt}
#logInfo "...done running ng-build-prod.bat.
logInfo "Changing to:  ${scriptFolder}"
cd ${scriptFolder}

if [ ! -d "$distAppFolder" ]; then
  logError ""
  logError "dist/app to sync to S3 does not exist:  ${distAppFolder}"
  exit 1
fi

# Check input:
# - check that Amazon profile was specified
checkInput

# First upload to the version folder
echo "Uploading Angular ${version} version"
echo "  from: ${distAppFolder}"
echo "    to: ${s3FolderVersionUrl}"
read -p "Continue [Y/n]? " answer
if [ -z "${answer}" -o "${answer}" = "y" -o "${answer}" = "Y" ]; then
  logInfo "Starting aws sync of ${version} copy..."
  syncFiles ${s3FolderVersionUrl}
  logInfo "...done with aws sync of ${version} copy."
fi

# Next upload to the 'latest' folder
# - TODO smalers 2020-04-20 evaluate whether to prevent 'dev' versions to be updated to 'latest'
echo "Uploading Angular 'latest' version"
echo "  from: ${distAppFolder}"
echo "    to: ${s3FolderLatestUrl}"
read -p "Continue [Y/n]? " answer
if [ -z "${answer}" -o "${answer}" = "y" -o "${answer}" = "Y" ]; then
  logInfo "Starting aws sync of 'latest' copy..."
  syncFiles ${s3FolderLatestUrl}
  logInfo "...done with aws sync of 'latest' copy."
fi

# TODO smalers 2020-04-20 need to suggest how to run
# - maybe a one-line Python http server command?
logInfo "Run the application folder: ${distAppFolder}"

# TODO smalers 2020-04-20 delete the following once above tests out
#$HOME/AppData/Local/Programs/Python/Python37/Scripts/aws s3 sync ../poudre-dashboard-ng/dist/poudre-dashboard-ng s3://viz.openwaterfoundation.org/owf-app-poudre-dashboard --delete --profile "$awsProfile"

# If here, was successful
exit 0
