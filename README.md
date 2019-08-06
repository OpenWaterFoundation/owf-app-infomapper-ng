# owf-app-poudre-dashboard-ng

Open Water Foundation web application for the Poudre Basin Information portal, using Angular. See the [deployed site](http://viz.openwaterfoundation.org/owf-app-poudre-dashboard/), which is currently not an advertised public URL, although public if the URL is provided.

* [Introduction](#introduction)
* [Repository Contents](#repository_contents)
* [Getting Started](#getting-started)
* [Deploying the Site to Amazon Web Servers](#deploying-the-site-to-amazon-web-servers)
* [Contributing](#contributing)
* [Maintainers](#maintainers)
* [Contributors](#contributors)
* [License](#license)
* [Resources](#resources)

## Introduction ##

This repository contains the necessary files for developing and deploying the Poudre River Dashboard,
developed using the [Angular](https://angular.io/) web framework. This site is under development by [Open Water Foundation](http://openwaterfoundation.org/).

The term "dashboard" is used generically. This application is intended to be a web-based Poudre Basin Information Portal that will provide access to cross-jurisdictional datasets for the Poudre Basin, integrating datasets from various entities in the basin and providing links to datasets.

This site will contain different spatial visualizations, for example maps developed using [Leaflet](http://leaflet.org/) with various layers to help better understand water issues in the Poudre Basin.

See also:
* [owf-app-poudre-dashboard-workflow](https://github.com/OpenWaterFoundation/owf-app-poudre-dashboard-workflow) - repository containing workflows to create maps for the portal, using QGIS and GeoProcessor

## Repository Contents ##

The following folder structure is recommended for development. Top-level folders should be created as necessary. The following folder structure clearly separates user files (as per operating system), development area (`owf-dev`), product (`App-Poudre-Portal`), repositories for product (`git-repos`), and specific repositories for the product. Repository folder names should agree with GitHub repository names. Scripts in repository folders that process data should detect their starting location and then locate other folders based on the following convention.

```
C:\Users\user\                                 User's home folder for Windows.
/c/Users/user/                                 User's home folder for Git Bash.
/cygdrive/C/Users/user/                        User's home folder for Cygwin.
/home/user/                                    User's home folder for Linux.
  owf-dev/                                     Work done on Open Water Foundation projects.
    App-Poudre-Portal/                         Poudre Basin Information Portal product, using Angular
                                               (name of this folder is not critical).
      ---- below here folder names should match exactly ----
      git-repos/                               Git repositories for the Angular portal web application.
        owf-app-poudre-dashboard-ng/           Angular web application.
        owf-app-poudre-dashboard-workflow/     Workkflow files to process input for web application.
```

This repository contains the following:
```
owf-app-poudre-dashboard-ng
   build-util/                                 Scripts to manage repository, as needed.
   poudre-dashboard-ng/                        Project files for deploying the Poudre Basin Dashboard
   .git/                                       Standard Git software folder for repository (DO NOT TOUCH).
   .gitattributes/                             Standard Git configuration file for repository (for portability).
   .gitignore/                                 Standard Git configuration file to ignore dynamic working files.
   README.md                                   This readme file
```

## Getting Started ##

#### Prerequisites: ####

Development and deployment of this Angular based web application requires the following tools:

1. Node.js (version 8.x or 10.x) and npm (version 5.5.1 or higher):
   * Check which version of Node.js is installed on your machine by running `node -v`. To get Node.js, go to [nodejs.org](nodejs.org). 
   * Check which version of npm is installed on your machine by running `npm -v`. To update npm run `npm install npm@latest -g`.
2. Angular CLI (Command Line Interface):
   * Check which version of Angular CLI is installed by running `ng --version`. If Angular CLI needs installed run `npm install -g @angular/cli`. 
3. Additional packages:
   * This project requires several additional packages in order to run. Navigate to `build-util/` and run the file `install-third-party-packages.sh` to automatically install all additional packages needed to run. This should install the following:
     * @angular/devkit/build-angular 
     * bootstrap
     * font-awesome
     * leaflet
     * leaflet-sidevar-v2

#### Running the project: ####

Once all prerequisites have been properly installed, run the site by navigating into `owf-app-poudre-dashboard-ng/poudre-dashboard-ng` and run `ng serve`. Optionally add the flag `--open` to run the project in a new tab.

## Deploying the Site to Amazon Web Servers ##

The site can be built in the local `dist` folder for testing.
Once checked locally, deploy to the Amazon S3 site by
running the following in the `build-util` folder using a Windows command shell:

```
copy-to-owf-amazon-s3.bat
```

The above can be run if Amazon Web Services credentials are provided.
A batch file is used to overcome known issues running in Git Bash.

## Contributing ##

Contributions can be made via normal Git/GitHub protocols:

1. Those with commit permissions can make changes to the repository.
2. Use GitHub Issues to suggest changes (preferred for small changes).
3. Fork the repository and use pull requests.

## Maintainers ##

* Justin Rentie, Open Water Foundation ([@jurentie](https://github.com/jurentie))
* Steve Malers, Open Water Foundation ([@Smalers](https://github.com/smalers))
* Mason Force, Open Water Foundation([@masforce](https://github.com/masforce))

## Contributors ##

* None yet, other than OWF staff.

## License ##

The license is being determined. Repositories are private until then.

## Resources ##

* [Angular](https://angular.io/)
