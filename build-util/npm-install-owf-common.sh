#!/bin/bash
(set -o igncr) 2>/dev/null && set -o igncr; # this comment is required
# The above line ensures that the script can be run on Cygwin/Linux even with Windows CRNL

# Get the folder where this script is located since it may have been run from any folder.
scriptFolder=$(cd "$(dirname "$0")" && pwd)
# repoFolder is owf-app-infomapper-ng.
repoFolder=$(dirname "${scriptFolder}")
# mainFolder is infomapper.
mainFolder="${repoFolder}/infomapper"
# Change to the infomapper/ directory and uninstall the current @owf/common version
(cd "${mainFolder}" && npm uninstall @openwaterfoundation/common)
# The path to the common library's dist/ folder.
commonDistFolder=$(cd "${scriptFolder}"/../../../../AngularDev/git-repos/owf-app-dev-ng/ng-workspace/dist/OpenWaterFoundation/common && pwd)

# This can be updated and made more robust in the future, but for now assumes that one .tgz file will exist in the owf-common
# library, since that's what is created by npm pack. The name of the file
for file in "${commonDistFolder}"/*.tgz; do
  if [[ ${file} == *.tgz ]]; then
    commonTarball=$(basename "${file}")
  fi
done

# Since a relative path to the tarball is needed by npm, and we have just changed directories into the infomapper main folder,
# that path just needs to be given as the argument in the npm install command.
(cd "${mainFolder}" && npm install "../../../../AngularDev/git-repos/owf-app-dev-ng/ng-workspace/dist/OpenWaterFoundation/common/${commonTarball}")

exit 0