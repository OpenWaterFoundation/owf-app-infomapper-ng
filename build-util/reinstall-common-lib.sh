#!/bin/bash
(set -o igncr) 2>/dev/null && set -o igncr; # This comment is required.
# The above line ensures that the script can be run on Cygwin/Linux even with Windows CRNL.

# This script can be run after the InfoMapper and/or the Common package code has
# been pushed to GitHub, and testing needs to take place. It performs the following
# steps:
#
# 1. Runs the ./create-common-package.sh script from the AppDev build-util/ folder.
#    This script runs
#      `ng build @OpenWaterFoundation/common --configuration production`
#    on the package, followed by
#      `npm pack`
#    to create a production zipped tar file.
# 2. Looks for the created tar file and npm installs it into the InfoMapper.
#
# The `ng build @OpenWaterFoundation/common --watch` command can then be used in
# the AppDev ng-workspace/ folder, and the `ng serve --open` command can be used
# in the InfoMapper infomapper/ folder for testing.

# Get the folder where this script is located since it may have been run from any folder.
scriptFolder=$(cd "$(dirname "$0")" && pwd)
# repoFolder is owf-app-infomapper-ng/.
repoFolder=$(dirname "${scriptFolder}")
# mainFolder is infomapper/.
mainFolder="${repoFolder}/infomapper"

# Build the Common package production files and use npm to pack them into a
# zipped tar file.
echo "))> Navigating to the AppDev build-util/ folder and creating the Common library production files."
echo ""
(cd "${scriptFolder}"/../../../../AngularDev/git-repos/owf-app-dev-ng/build-util && ./create-common-package.sh)
# The path to the common library's dist/ folder.
# commonDistFolder=$(cd "${scriptFolder}"/../../../../AngularDev/git-repos/owf-app-dev-ng/ng-workspace/dist/OpenWaterFoundation/common && pwd)
echo ""
echo "))> Done."

echo "))> Installing the Common package into the InfoMapper."
echo ""
# Since a relative path to the tarball is needed by npm, and we have just changed
# directories into the infomapper main folder, that path just needs to be given as
# the argument in the npm install command.
(cd "${mainFolder}" && npm install "../../../../AngularDev/git-repos/owf-app-dev-ng/ng-workspace/dist/OpenWaterFoundation/common/" --force)
echo ""
echo "))> Done. The InfoMapper & Common library can now run their respective ng commands."

exit 0