# build-util

This folder contains useful scripts to help with development and build processes.

| **Script/File**&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | **Description** |
| ---- | ---- |
| `clean-dist-for-deployment.sh` | Cleans the 'dist/' folder files for deployment. |
| `copy-to-owf-amazon-s3.bash` | Script to deploy InfoMapper default application to cloud, for testing purposes. InfoMapper implementations are typically deployed using a similar script in the implementation files. |
| `git-check-prod.sh` | Check InfoMapper repositories for whether to push, pull, commit, etc. |
| `git-clone-all-prod.sh` | Clone all InfoMapper repositories to local files, used when setting up a new development environment. |
| `git-tag-all-prod.sh` | Tag all related InfoMapper repositories with the same tag name and commit message. |
| `git-util/` | Git utility scripts called by the above `git-*` scripts. |
| `ng-serve.sh` |  |
| `npm-install-owf-common.sh` | Installs the owf-common library tarball in the InfoMapper `node_modules` to be consumed. |
| `product-repo-list.txt` | List of repositories that comprise the InfoMapper core product, used by the `git-*` utility scripts. |
| `run-http-server-8000.sh` | Run the application using Python web server.  **This script needs to be removed or replace with a version that runs the local `dist` deployment.** |

