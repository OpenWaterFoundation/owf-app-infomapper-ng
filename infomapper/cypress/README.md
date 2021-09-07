# InfoMapper Testing #

The following lists explicitly describe what kind of test is being performed for
each spec file. The goal is to keep the testing as DRY as possible, aka don't
repeat yourself. Trivial tests such as connection to the server will still be done for
each test.

## TODO ##

Any major tests that have yet to be implemented and are broad enough to be added
will be shown here.

* Confirm zoom to address works.
* Confirm zoom to feature works.
* Confirm clear selection works.
* Confirm `Find from address` radio button works.
* Gracefully handle bad address search.
* 

## content-page.spec.js ##

Confirms:

* connection to server.
* correct Home page URL after routing.
* MainMenu Content Page display on click. Repeated from `nav.spec.js`.
* correct Content page URL after routing.
* correct HTML and attribute creation from markdown to HTML element.
* **Can possibly add a data-cy attribute to the showdown container for Content Pages**

## line-geometry-map-spec.js ##

Confirms:

* connection to server.
* correct Home page URL after routing.
* SubMenu Map display on click. Repeated from `nav.spec.js`.
* correct Map page URL after routing.
* GeoMap info circle Doc Dialog display on click.
* correct HTML and attribute creation from markdown to HTML element in the GeoMap
Doc Dialog.
* GeoMap Doc Dialog is closed after upper close button is clicked.
* geoLayerViewGroup kebab click opens kebab menu.
* geoLayerViewGroup Information kebab button displays Doc Dialog on click.
* correct HTML and attribute creation from markdown to HTML element in the geoLayerViewGroup
Doc Dialog.
* geoLayerViewGroup Doc Dialog is closed after upper close button is clicked.
* geoLayerView kebab click opens kebab menu.
* geoLayerView Information kebab button displays Doc Dialog on click.
* geoLayerView Doc Dialog is closed after upper close button is clicked.
* both the geoLayerViewGroup and backgroundViewGroup collapsible div tags open and
close correctly.

## nav.spec.js ##

Confirms:

* connection to server.
* correct Home page URL after routing.
* MainMenu Map display on click.
* correct Map page URL after routing.
* MainMenu Home Content Page display on click.
* correct Home Content Page URL after routing.
* SubMenu dropdown div exists on mouseover.
* SubMenu Map display on click for all maps given in the `app-config.json` file.
* correct Map page URL after routing.
* SubMenu Content Page display on click.
* correct Content Page URL after routing.
* SubMenu dropdown div does not exist on mouseout.
* MainMenu Home Content Page display on click.
* correct Home Page URL after routing.

## polygon-geometry-map.spec.js ##

Confirms:

* connection to server.
* correct Home page URL after routing.
* SubMenu Map display on click. Repeated from `nav.spec.js`.
* correct Map page URL after routing.
* geoLayerView kebab click opens kebab menu.
* geoLayerView Data Table kebab button displays Data Table Dialog on click.
* Data Table default radio choice `Search layer data` is chosen.
* Data Table input field for `Search layer data`
  * filters rows for a successful query and enables the correct Data Table kebab
  menu options.
  * returns the correct row on an unsuccessful query and disables all Data Table
  kebab menu options.
* Date Table Dialog is closed after lower close button is clicked.
* `Find from address` radio option exists and can be clicked on layers with vector polygons.
* `Find from address` radio option has been clicked.
* `Find from address` filters rows for a successful query and enables the correct Data
Table kebab menu options.
* Leaflet upper right base layer control mouseover displays all base layer radio options.
* clicking a base layer control radio option switches to the correct background map.
* mousing out of the base layer control closes the radio option area.
* Map Properties Dialog is opened from layer kebab menu.
* the content of the Properties Dialog is correct and visible.
* the Properties Dialog closes on lower close button click.
* a click of the Clear Selection layer kebab option for a different layer does nothing.
* the sidebar Information button shows the correct information on click.
* The sidebar Home button shows the map geoLayerViewGroups on click.

describe('AppConfigService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AppConfigService]
    });
  });

  it('should be created', inject([AppConfigService], (service: AppConfigService) => {
    expect(service).toBeTruthy();
  }));
});