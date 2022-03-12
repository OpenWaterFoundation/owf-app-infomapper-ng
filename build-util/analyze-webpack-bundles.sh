#!/bin/bash
(set -o igncr) 2>/dev/null && set -o igncr; # This comment is required.
# The above line ensures that the script can be run on Cygwin/Linux even with Windows CRNL.

# This script performs the following steps:
#
# 1. Builds the InfoMapper with the --stats-json option to create a stats.json file.
# This describes the created bundles or the application (not in a human readable
# format).
# 2. Runs the webpack-bundle-analyzer server on the stats.json file,
# and opens up a browser tab at localhost:8888. 
# NOTE: Once the server is started, the terminal will say something similar to
# "Use Ctrl+C to stop the server". This will NOT work, the server will keep
# listening to port 8888, and further attempts to rebuild and start another
# server will fail. Using the command npx kill-port 8888 will kill the process
# using the port, and will resolve the issue.
#
# TODO: jpkeahey 2022-03-02 - Add a --no-build option?

# Get the folder where this script is located since it may have been run from any folder.
scriptFolder=$(cd "$(dirname "$0")" && pwd)
# repoFolder is owf-app-infomapper-ng/.
repoFolder=$(dirname "${scriptFolder}")
# mainFolder is infomapper/.
mainFolder="${repoFolder}/infomapper"

echo "))> Navigating to the InfoMapper main infomapper/ directory."
cd "${mainFolder}" || exit 1
echo "))> Building the InfoMapper using the --stats-json flag."
npm run build:stats
echo ""
echo "))> Done."

echo "))> Navigating to the InfoMapper dist/infomapper/ directory."
cd "${mainFolder}"/dist/infomapper || exit 1
echo "))> Running the Webpack Bundle Analyzer with the created stats.json."
npx webpack-bundle-analyzer stats.json

# Run the ng build --stats-json command.
# npm run build:stats

