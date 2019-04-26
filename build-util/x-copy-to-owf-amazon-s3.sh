#!/bin/sh
#
# Copy the site/* contents to the viz.openwaterfoundation.org website
# - replace all the files on the web with local files
# - must specify Amazon profile as argument to the script

# This script does not work due to a known issue
echo "Script disabled due to bug.  Use the bat file instead."
exit 1

# Supporting functions, alphabetized

# Entry point into the script

# Make sure the Angular version is OK
#checkAngularVersion

# Check the source files for issues
#checkSourceDocs

# Get the folder where this script is located since it may have been run from any folder
scriptFolder=`cd $(dirname "$0") && pwd`
# Change to the folder where the script is since other actions below are relative to that
cd ${scriptFolder}

# Set --dryrun to test before actually doing
dryrun=""
#dryrun="--dryrun"

if [ "$1" == "" ]
	then
	echo ""
	echo "Usage:  $0 AmazonConfigProfile"
	echo ""
	echo "Copy the site files to the Amazon S3 static website folder:  $s3Folder"
	echo ""
	exit 0
fi

awsProfile="$1"

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
# - "period" works locally in "dist" but not when pushed to the cloud
# - "path" 
hrefMode=path
if [ "$hrefMode" = "period" ]; then
	# Results in the following in output:
	# <head>...<base href=".">
	ngBuildHrefOpt="."
	# Copy the folder
	localSyncFolder="../poudre-dashboard-ng/dist/poudre-dashboard-ng"
	s3Folder="s3://viz.openwaterfoundation.org/owf-app-poudre-dashboard"
elif [ "$hrefMode" = "path" ]; then
	ngBuildHrefOpt="/owf-app-poudre-dashboard/"
	# Copy the folder 
	localSyncFolder="../poudre-dashboard-ng/dist/poudre-dashboard-ng"
	s3Folder="s3://viz.openwaterfoundation.org/owf-app-poudre-dashboard"
else
	echo ""
	echo "Unknown hrefMode=$hrefMode"
	exit 1
fi

echo ""
echo "Regenerating Angular dist folder to deploy the website..."
cd ../poudre-dashboard-ng
# The following will result in full C:\... path set in <head>...<base href="C:\..">
#ng build --prod --aot=true --baseHref=${ngBuildHrefOpt} --prod=true --extractCss=true --namedChunks=false --outputHashing=all --sourceMap=false
#cmd /c ng build --prod --aot=true --baseHref=${ngBuildHrefOpt} --prod=true --extractCss=true --namedChunks=false --outputHashing=all --sourceMap=false
#cmd /c start "" /wait /b ng build --prod --aot=true --baseHref=${ngBuildHrefOpt} --prod=true --extractCss=true --namedChunks=false --outputHashing=all --sourceMap=false
# The following does not work because start is a cmd built-in command
#start /wait cmd /c ng build --prod --aot=true --baseHref=${ngBuildHrefOpt} --prod=true --extractCss=true --namedChunks=false --outputHashing=all --sourceMap=false
# Run a batch file
echo "Running ng-build-prod.bat...
cmd /c ../ng-build-prod.bat ${ngBuildrefOpt}
echo "...done running ng-build-prod.bat.
cd ../build-util

# Now sync the local files up to Amazon S3
# - check for known locations of aws script and default to simple "aws" to be found in PATH
awsScript="$HOME/AppData/Local/Programs/Python/Python37/Scripts/aws"
if [ -e "$awsScript" ]; then
	echo "Trying to run found existing aws script:  $awsScript"
else
	echo "Trying to run aws script using PATH"
	awsScript="aws"
fi
if [ -d "$localSyncFolder" ]; then
	echo "Starting aws sync..."
	$awsScript s3 sync ${localSyncFolder} ${s3Folder} ${dryrun} --delete --profile "$awsProfile"
	echo "...done with aws sync."
else
	echo ""
	echo "Folder to sync does not exist:  ${localSyncFolder}"
	exit 1
fi

#$HOME/AppData/Local/Programs/Python/Python37/Scripts/aws s3 sync ../poudre-dashboard-ng/dist/poudre-dashboard-ng s3://viz.openwaterfoundation.org/owf-app-poudre-dashboard --delete --profile "$awsProfile"

exit $?
