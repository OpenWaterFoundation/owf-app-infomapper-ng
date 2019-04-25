# owf-app-poudre-dashboard-ng
Open Water Foundation web application for Poudre Basin information dashboard,
using Angular

* [Introduction](#introduction)
* [Repository Contents](#repository_contents)
* [Getting Started](#getting-started)
* [Contributing](#contributing)
* [Maintainers](#maintainers)
* [Contributors](#contributors)
* [License](#license)
* [Resources](#resources)

## Introduction ##
This repository contains the necessary files for developing and deploying a Poudre River Dashboard,
developed using the [Angular](https://angular.io/) web framework. This site is under development by
[Open Water Foundation](http://openwaterfoundation.org/).

This web dashboard is intended to be a web-based Poudre Basin Information Platform that will provide
access to cross-jurisdictional datasets for the Poudre Basin, integrating datasets from various entities
in the basin and providing links to datasets.

This site will contain different spatial visualizaions, for example maps developed using leaflet with
various layers to help better understand data collected as it relates to the Poudre Basin.

See also:
* [owf-app-poudre-dashboard-workflow](https://github.com/OpenWaterFoundation/owf-app-poudre-dashboard-workflow)

## Repository Contents ##
The following folder structure is recommended for development.
Top-level folders should be created as necessary.
The following folder structure clearly separates user files (as per operating system),
development area (`owf-dev`), product (`App-Poudre-Portal`), repositories for product (`git-repos`),
and specific repositories for the product.
Repository folder names should agree with GitHub repository names.
Scripts in repository folders that process data should detect their starting location
and then locate other folders based on the following convention.

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

To deploy this site first ensure Node.js is installed.
Angular requires Node.js version 8.x or 10.x.
* To check your version, run `node -v` in a terminal/console window.
* To get Node.js, go to [nodejs.org](nodejs.org).

Also make sure that npm is installed with version 5.5.1 or higher:  
` npm -v `

After Node.js and npm have been properly installed, download @angular/cli:  
`npm install -g @angular/cli`

To deploy the site cd into `owf-app-poudre-dashboard-ng/poudre-dashboard-ng`  
and run `ng serve --open`.

If this creates the following error:  
```
Could not find module "@angular-devkit/build-angular" from "/home/jurentie/owf-repos/owf-app-poudre-dashboard-ng/poudre-dashboard-ng".
Error: Could not find module "@angular-devkit/build-angular" from "/home/jurentie/owf-repos/owf-app-poudre-dashboard-ng/poudre-dashboard-ng".
    at Object.resolve (/usr/local/lib/node_modules/@angular/cli/node_modules/@angular-devkit/core/node/resolve.js:141:11)
    at Observable.rxjs_1.Observable [as _subscribe] (/usr/local/lib/node_modules/@angular/cli/node_modules/@angular-devkit/architect/src/architect-legacy.js:153:40)
    at Observable._trySubscribe (/usr/local/lib/node_modules/@angular/cli/node_modules/rxjs/internal/Observable.js:44:25)
    at Observable.subscribe (/usr/local/lib/node_modules/@angular/cli/node_modules/rxjs/internal/Observable.js:30:22)
    at /usr/local/lib/node_modules/@angular/cli/node_modules/rxjs/internal/Observable.js:99:19
    at new Promise (<anonymous>)
    at Observable.toPromise (/usr/local/lib/node_modules/@angular/cli/node_modules/rxjs/internal/Observable.js:97:16)
    at ServeCommand.initialize (/usr/local/lib/node_modules/@angular/cli/models/architect-command.js:67:96)
    at <anonymous>
    at process._tickCallback (internal/process/next_tick.js:188:7)
    at Function.Module.runMain (module.js:678:11)
    at startup (bootstrap_node.js:187:16)
    at bootstrap_node.js:608:3
```

Try running:  
`npm install --save-dev @angular-devkit/build-angular`

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
