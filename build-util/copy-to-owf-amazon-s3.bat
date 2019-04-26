@echo off
rem
rem Copy the site/* contents to the viz.openwaterfoundation.org website
rem - replace all the files on the web with local files
rem - must specify Amazon profile as argument to the script

rem Get the folder where this script is located since it may have been run from any folder
set scriptFolder=%~dp0

set ngBuildHrefOpt=\owf-app-poudre-dashboard\
set deployUrl=%ngBuildHrefOpt%
set localSyncFolder=..\poudre-dashboard-ng\dist\poudre-dashboard-ng
set s3Folder=s3://viz.openwaterfoundation.org/owf-app-poudre-dashboard

if "%1" == "" (
	echo.
	echo Usage:  %0% AmazonConfigProfile
	echo.
	echo Copy the site files to the Amazon S3 static website folder:  %s3Folder%
	echo.
	exit /b 0
)

set awsProfile=%1

rem First build the site so that the "dist" folder contains current content.
rem
rem - see:  https://medium.com/@tomastrajan/6-best-practices-pro-tips-for-angular-cli-better-developer-experience-7b328bc9db81
rem - Put on the command line rather than in project configuration file
rem - enable ahead of time compilation:  --aot
rem - extract all css into separate style-sheet file:  --extractCss true
rem - disable using human readable names for chunk and use numbers instead:  --namedChunks false
rem - force cache-busting for new releases:  --output-hasshing all
rem - disable generation of source maps:  --sourcemaps false
rem
rem See options:  https://angular.io/cli/build

echo. 
echo Regenerating Angular dist folder to deploy the website...
cd ..\poudre-dashboard-ng
rem The following will result in full C:\... path set in <head>...<base href="C:\..">
call ng build --prod --aot=true --baseHref=%ngBuildHrefOpt% --prod=true --extractCss=true --namedChunks=false --outputHashing=all --sourceMap=false
cd ..\build-util

rem Now sync the local files up to Amazon S3
rem - check for known locations of aws script and default to simple "aws" to be found in PATH
set awsScript=%USERPROFILE%\AppData\Local\Programs\Python\Python37\Scripts\aws
echo Starting aws sync...
if not exist %awsScript% goto noFolder
%awsScript% s3 sync %localSyncFolder% %s3Folder% --delete --profile %awsProfile%
echo ...done with aws sync.

:noFolder
echo No source folder: %localSyncFolder%
exit /b 1

:scriptEnd
exit /b 0
