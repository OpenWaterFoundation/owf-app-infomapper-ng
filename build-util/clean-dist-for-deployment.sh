#!/bin/sh
(set -o igncr) 2>/dev/null && set -o igncr; # this comment is required
# The above line ensures that the script can be run on Cygwin/Linux even with Windows CRNL
#
# Clean the 'dist/' folder files for deployment.
# This script is called, for example, by Poudre Basin Information 'build-util/copy-to-owf-amazon-s3.sh' script
# in order to ensure that the 'dist/' folder contains the bare minimum files needed for deployment.
# Any InfoMapper implementation should call this script after 'ng build' as part of the deployment process.
#
# This script does the following:
#   1. Remove unneeded 'src/assets/' files.
#   2. Ensure that the 'src/assets/app-default/app-config.json' file is minimum for "Something is wrong" use case.

# Remove 'dist/' folder files with verbose option so can see what is deleted.
# If an error is detected (due to permissions or other issue), exit 1 so calling code can handle.
# An error is unlikely in most situations and should be dealt with.
cleanDist() {
  echo "Removing ${infoMapperDistFolder} files..."
  rm -v "${infoMapperDistAssetsFolder}/app-default/content-pages/about-the-project.md"
  if [ $? -ne 0 ]; then
    echo "Error removing files.  Exiting."
    exit 1
  fi
  rm -rv "${infoMapperDistAssetsFolder}/app-default/data-maps"
  if [ $? -ne 0 ]; then
    echo "Error removing files.  Exiting."
    exit 1
  fi
  rm -rv "${infoMapperDistAssetsFolder}/app-default/data-ts"
  if [ $? -ne 0 ]; then
    echo "Error removing files.  Exiting."
    exit 1
  fi
}

# Get the folder where this script is located since it may have been run from any folder
scriptFolder=$(cd $(dirname "$0") && pwd)
repoFolder=$(dirname ${scriptFolder})
infoMapperMainFolder="${repoFolder}/infomapper"
infoMapperDistFolder="${infoMapperMainFolder}/dist"
infoMapperDistAssetsFolder="${infoMapperDistFolder}/infomapper/assets"

# Clean up the distribution files
cleanDist

# Exit with success so calling script can handle
exit 0
