# App Config Default #

This `app-default/` folder contains 3 major types of files and folders.

1. A static home for default images and other assets used throughout the InfoMapper. (e.g. `img/OWF-Logo-Favicon-32x32.png`, `default-marker-25x41.png`)
2. The developer testing environment files and folders for actively updating the InfoMapper incrementally. (e.g. `data-maps/`, `data-ts`)
3. The minimal configuration default for deployment to the web, using the fewest amount of files for basic InfoMapper display (e.g. `app-config-minimal.json`,
`content-pages/home.md`)

## App Config Contents ##

The following files are located within the `app-default/` folder.

```
app-default/                        Default InfoMapper app folder for Content Pages, Images, and Map Config files.
  content-pages/                    Holds all Content Pages for the InfoMapper.
    home.md                         Required main landing page.
    about-the-project.md            A simple Content Page with Information about the InfoMapper.
  data-maps/                        Folder for holding all MainMenu folders.
  img/                              Folder for all images used in the InfoMapper default app.
  app-config-minimal.json           A minimal app-config file for distribution to Amazon Web Services.
  app-config.json                   The app config file for the default InfoMapper and for testing.
  README.md                         This README file.
```