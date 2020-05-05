# owf-app-info-mapper-ng

Open Water Foundation (OWF) general Angular web application for providing access to information via
menus that display maps and other visualizations.

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

This repository contains the necessary files for developing and deploying the OWF "Information Mapper"
application, developed using the [Angular](https://angular.io/) web framework.

The Info Mapper software can be installed as a static website, with specific configuration files and data
resulting in a custom content.  New features made available in the general product are
therefore available to each implementation of the tool.

The following table lists deployed websites and corresponding repositories for generating website content.

| **Website** | **Content Generation Repository** |
| -- | -- |
| [Poudre Basin Information Portal](http://poudre.openwaterfoundation.org/latest/) - **under development** | [owf-app-poudre-dashboard-workflow](https://github.com/OpenWaterFoundation/owf-app-poudre-dashboard-workflow) |
| StateMod Dataset viewer - **under development** | |
| [Colorado Front Range Municipal Water Demand and Agriculture Water Transfer](http://ag-urban.openwaterfoundation.org/co/latest/) - **under development** | [owf-app-ag-urban-workflow](https://github.com/OpenWaterFoundation/owf-app-ag-urban-workflow) | 
## Repository Contents ##

The following folder structure is recommended for development.
Top-level folders should be created as necessary.
The following folder structure clearly separates user files (as per operating system),
development area (`owf-dev`), product (`App-InfoMapper`),
repositories for product (`git-repos`), and specific repositories for the product.
Repository folder names should agree with GitHub repository names.
Scripts in repository folders that process data should detect their starting location
and then locate other folders based on the following convention.

```
C:\Users\user\                                 User's home folder for Windows.
/c/Users/user/                                 User's home folder for Git Bash.
/cygdrive/C/Users/user/                        User's home folder for Cygwin.
/home/user/                                    User's home folder for Linux.
  owf-dev/                                     Work done on Open Water Foundation projects.
    App-InfoMapper/                            InfoMapper product files (name of this folder is not critical).
      ---- below here folder names should match exactly ----
      git-repos/                               Git repositories for the Angular portal web application.
        owf-app-info-mapper-ng/                Angular web application.
```

This repository contains the following:
```
owf-app-info-mapper-ng/
  build-util/                                 Scripts to manage repository, as needed.
  info-mapper/                                Software development files for the Info Mapper.
  .git/                                       Standard Git software folder for repository (DO NOT TOUCH).
  .gitattributes/                             Standard Git configuration file for repository (for portability).
  .gitignore/                                 Standard Git configuration file to ignore dynamic working files.
  README.md                                   This readme file.
```

Workflow repositories that implement the Info Mapper should typically have a folder structure 
similar the the following, where the Info Mapper will be used in a supporting role.
In the future, an installer for Info Mapper will be provided so that a repository clone is not required.

```
C:\Users\user\                                 User's home folder for Windows.
/c/Users/user/                                 User's home folder for Git Bash.
/cygdrive/C/Users/user/                        User's home folder for Cygwin.
/home/user/                                    User's home folder for Linux.
  owf-dev/                                     Work done on Open Water Foundation projects.
    SomeProject/                               Project that uses Info Mapper sofware to implement a website.
      ---- below here folder names should match exactly ----
      git-repos/                               Git repositories for the Angular portal web application.
        owf-app-info-mapper-ng/                Angular web application.
        owf-app-poudre-dashboard-workflow/     Workkflow files to process input for web application.
```

## Getting Started ##

### Prerequisites: ###

Development and deployment of this Angular based web application requires the following tools:

1. Node.js (version 8.x or 10.x) and npm (version 5.5.1 or higher):
   * Check which version of Node.js is installed on your machine by running `node -v`.
   To get Node.js, go to [nodejs.org](nodejs.org). 
   * Check which version of npm is installed on your machine by running `npm -v`.
   To update npm run `npm install npm@latest -g`.
2. Angular CLI (Command Line Interface):
   * Check which version of Angular CLI is installed by running `ng --version`.
   If Angular CLI needs installed run `npm install -g @angular/cli`. 
3. Additional packages:
   * This project requires several additional packages in order to run.
   Navigate to `build-util/` and run the file `install-third-party-packages.sh` to automatically
   install all additional packages needed to run. This should install the following:
     * @angular/devkit/build-angular 
     * bootstrap
     * font-awesome
     * leaflet
     * leaflet-sidevar-v2

### Running the project: ###

Once all prerequisites have been properly installed,
run the site by changing to the `info-mapper` folder and run `ng serve`.
Optionally add the flag `--open` to run the project in a new web browser tab.

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
Any pull requests should be based on current master branch contents.

## Maintainers ##

The Info Mapper is maintained by the Open Water Foundation.

## License ##

The license is being determined. Repositories are private until then.

## Resources ##

* [Angular](https://angular.io/)
