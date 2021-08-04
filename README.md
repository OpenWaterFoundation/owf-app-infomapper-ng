# owf-app-infomapper-ng

Open Water Foundation (OWF) general Angular web application to display information via configurable
menus that display maps and other visualizations.

* [Introduction](#introduction)
* [Repository Contents](#repository-contents)
* [Getting Started](#getting-started)
* [Deploying the Site to Amazon Web Servers](#deploying-the-site-to-amazon-web-servers)
* [Contributing](#contributing)
* [Maintainers](#maintainers)
* [Contributors](#contributors)
* [License](#license)
* [Resources](#resources)

## Introduction ##

This repository contains files for developing and deploying the OWF InfoMapper
application, developed using the [Angular](https://angular.io/) web framework.

The InfoMapper software can be installed as a static website, with configuration files and data
to create a web application. New features made available in the general product are
therefore available to each implementation of the tool.

The following table lists deployed websites and corresponding repositories.

| **Website** | **Content Generation Repository** |
| -- | -- |
| [Poudre Basin Information](http://poudre.openwaterfoundation.org/latest/) | [owf-infomapper-poudre](https://github.com/OpenWaterFoundation/owf-app-poudre-dashboard-workflow) |
| [StateMod Dataset viewer](http://opencdss.openwaterfoundation.org/datasets/colorado/2015) - **under development** | cdss-app-statemod-web |

## Repository Contents ##

The following folder structure is recommended for development.
Top-level folders should be created as necessary.
The following folder structure clearly separates user files (as per operating system),
development area (`owf-dev`), product (`InfoMapper`),
repositories for product (`git-repos`), and specific repositories for the product.
Repository folder names should agree with GitHub repository names.
Scripts in repository folders that process data should detect their starting location
and then locate other folders using relative paths, based on the following convention.
The InfoMapper folder structure follows the conventions for a single project Angular workspace.
In the future, variations of InfoMapper such as embeddable single map (no application menus) may
be implemented as a separate application, in which case the repository may be converted to a
multi-project workspace.

```
C:\Users\user\                                 User's home folder for Windows.
/c/Users/user/                                 User's home folder for Git Bash.
/cygdrive/C/Users/user/                        User's home folder for Cygwin.
/home/user/                                    User's home folder for Linux.
  owf-dev/                                     Work done on Open Water Foundation projects.
    InfoMapper/                                InfoMapper product files.
      ---- below here folder names should match exactly ----
      git-repos/                               Git repositories for InfoMapper.
        owf-app-infomapper-ng/                 Angular InfoMapper web application.
```

This repository contains the following:
```
owf-app-infomapper-ng/
  build-util/                                 Scripts to manage repository, as needed.
  infomapper/                                 Software development files for the InfoMapper.
  .git/                                       Standard Git software folder for repository (DO NOT TOUCH).
  .gitattributes/                             Standard Git configuration file for repository (for portability).
  .gitignore/                                 Standard Git configuration file to ignore dynamic working files.
  README.md                                   This readme file.
```

Implementations of the InfoMapper should typically have a folder structure 
similar the the following, where the InfoMapper will be used in a supporting role.
In the future, an installer for InfoMapper will be provided so that a repository clone is not required.

```
C:\Users\user\                                 User's home folder for Windows.
/c/Users/user/                                 User's home folder for Git Bash.
/cygdrive/C/Users/user/                        User's home folder for Cygwin.
/home/user/                                    User's home folder for Linux.
  owf-dev/                                     Work done on Open Water Foundation projects.
    SomeProject/                               Project that uses InfoMapper software to implement a website.
      ---- below here folder names should match exactly ----
      git-repos/                               Git repositories for the Angular portal web application.
        owf-app-infomapper-ng/                 Angular web application.
        owf-infomapper-poudre/                 Workflow files to process input for web application.
```

## Getting Started ##

Due to differences in environments, it is recommended that a single development
environment is used. Do not mix the use of Git Bash and Cygwin on the same files
on the same computer because they treat files differently with respect to line
endings and executable permissions, which impacts Git.

### Prerequisites: ###

Development and deployment of this Angular based web application requires the following tools:

1. Node.js (version 10.x or higher)
    * Check which version of Node.js is installed by running `node -v`.
    To initially install Node.js, go to [nodejs.org](nodejs.org).
      > NOTE: Installing Node.js will automatically install npm. Check the version
    with `npm -v` to confirm.
    * Node.js can be updated in a few different ways. Instructions can be found
    at [phoenixmap.com](https://phoenixnap.com/kb/update-node-js-version).
2. npm (version 5.5.1 or higher):
    * Check which version of npm is installed by running `npm -v`.
    * To update npm run `npm install npm@latest -g`.
3. Angular CLI (Command Line Interface):
    * Check which version of Angular CLI is installed by running `ng --version`.
    If Angular CLI needs to be installed, run `npm install -g @angular/cli`.
    * As of version 3.0.0, the InfoMapper uses Angular 11.

### Installing the InfoMapper Software ###

Currently, the InfoMapper is installed by cloning the source repository into the
`git-repos` folder. Change to `git-repos` and execute:

```
Git clone https://github.com/OpenWaterFoundation/owf-app-infomapper-ng.git
```

Run the following To install necessary software dependencies. This will install
the [OWF common Angular library](https://github.com/OpenWaterFoundation/owf-app-dev-ng)
library and required third-party packages.
**May need to link to the common library package README, but for public packages hopefully there are no issues.**

```
cd infomapper
npm install
```

The above command may require several minutes.

Output in my configuration is:

```
> core-js@3.8.3 postinstall C:\Users\sam\cdss-dev\StateMod-Web\git-repos\owf-app-infomapper-ng\infomapper\node_modules\@angular-devkit\build-angular\node_modules\core-js
> node -e "try{require('./postinstall')}catch(e){}"

Thank you for using core-js ( https://github.com/zloirock/core-js ) for polyfilling JavaScript standard library!

The project needs your help! Please consider supporting of core-js on Open Collective or Patreon:
> https://opencollective.com/core-js
> https://www.patreon.com/zloirock

Also, the author of core-js ( https://github.com/zloirock ) is looking for a good job -)


> @angular/cli@11.2.3 postinstall C:\Users\sam\cdss-dev\StateMod-Web\git-repos\owf-app-infomapper-ng\infomapper\node_modules\@angular\cli
> node ./bin/postinstall/script.js

```

### Running the Angular Application: ###

Once all prerequisites have been installed, clone this repository onto the
local machine and change directories into the `infomapper` directory. Use the command
`npm install` to have npm download all necessary packages and dependencies
used by the InfoMapper.

The Angular application can be run locally in the typical way,
assuming that implementation files have been copied to the `src/assets` folder.

```
cd infomapper
ng serve                            (will not open a web browser tab)
ng serve --open                     (will open a web browser tab)
```

The above may be slow the first time as code is compiled.
After initial startup, changes to files will automatically result in a reload.
View the website using the following URL:

```
http://localhost:4200
```

The default configuration will result in a website that appears as follows:

[infomapper-default.png](doc/infomapper-default.png)

The default configuration and basic test data are distributed with InfoMapper in the `src/assets/app-default` folder
and are typically removed from the distribution when deploying a full implementation.

## Using InfoMapper with an Implementation Repository

InfoMapper can be used to implement an integrated website containing maps and other information.
Currently, this is accomplished by creating a product folder, for example `InfoMapper-MyRiver`,
and working with repositories for the software and implementation files.
Using a repository for implementation files allows important work to be saved and tracked.
In the future, a self-extracting executable to install InfoMapper may be provided.
An example folder structure for a project at the Open Water Foundation is shown below.
Note that the "product" folder in this case is "InfoMapper-MyRiver",
whereas the "product" for InfoMapper software development is "InfoMapper".

```
C:\Users\user\                    User's home folder for Windows.
/C/Users/user/                    User's home folder for Git bash, corresponding to Windows user files.
/cygdrive/C/Users/user/           User's home folder for Cygdrive, corresponding to Windows user files.
  owf-dev/                        OWF (or any organization) development files.
    InfoMapper-MyRiver/           InfoMapper files for "MyRiver" website.
      git-repos/                  Folder for Git repositories.
=============== above this line is a recommendation ======================================
        owf-app-infomapper-ng/    InfoMapper software repository.
        owf-infomapper-myriver/   InfoMapper implementation files.
```

See the links above for example implementations of InfoMapper for examples of implementation
repository file structures.
Implementation generally involves copying files from the implementation folder into the
`src/assets` InfoMapper folder, at which point the Angular application is able to use implementation files.
Once the Angular application is started (see [Running the Angular Application](#running-the-angular-application) section).

To use InfoMapper with an implementation, first check that the software is up to date
by following instructions in [Getting Started](#getting-started).

## Deploying the Site to Amazon Web Servers ##

The site can be built in a `dist` folder for local testing by using
the command

`ng build --prod --aot=true --baseHref=. --prod=true --extractCss=true --namedChunks=false --outputHashing=all --sourceMap=false`

The content of the `dist` folder can imitate a production build of the
InfoMapper. To run the InfoMapper in its distributable form, navigate to
the `build-util` folder and run the `run-http-server-8000.sh` file. In a
web browser, type in `http://localhost:8000/`, then click on
**dist/ > infomapper** to run the InfoMapper.

Once checked locally, deploy to the Amazon S3 site by
running the following in the `build-util` folder using a Windows command shell:

```
copy-to-owf-amazon-s3.bat
```

For example, see the deployment script for the Poudre Basin Information
InfoMapper implementation.
[Poudre Basin Information](http://poudre.openwaterfoundation.org/latest/#/content-page/home)

The above can be run if Amazon Web Services credentials are provided.
A batch file is used to overcome known issues running in Git Bash.

## Contributing ##

Contributions can be made via normal Git/GitHub protocols:

1. Those with commit permissions can make changes to the repository.
2. Use GitHub Issues to suggest changes (preferred for small changes).
3. Fork the repository and use pull requests.
Any pull requests should be based on current master branch contents.

## Maintainers ##

The InfoMapper is maintained by the Open Water Foundation.

## License ##

The InfoMapper is licensed under the GPL v3+ license. See the [GPL v3 license](LICENSE.md).

## Resources ##

* [Angular](https://angular.io/)
