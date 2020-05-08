# Content Page Component #

This component creates a "content page" using a markdown file. The terminology "content page" refers to a simple static web page that may contain text, images, links, etc. but is separate from the map pages.

```
├── content-page/
|   ├── content-page.component.css .................. Stylesheet for home component.
|   ├── content-page.component.html ................. HTML template for home component.
|   ├── content-page.component.ts ................... Typescript file for home component.
|   ├── content-page.component.spec.ts .............. Testing file for home component.
|   ├── README.md ................................... This file.
```

![content-page](../../../../doc/images/content-page.png)

This component utilizes the javascript library [ShowdownJs](<https://github.com/showdownjs/showdown>) which converts markdown to HTML. This allows developers to add a markdown file in the assets/ folder with the contents of the content page and the application will convert that markdown to an HTML page. 

For example, the above is created using:

```markdown
# The Poudre Basin Information Portal Project #
The [Open Water Foundation (OWF)](openwaterfoundation.org) is a nonprofit social enterprise that develops open source software and open data solutions to make better decisions about water.

The Poudre Basin Information Portal project provides access to cross-jurisdictional datasets and visualizations for the Poudre Basin, integrating datasets from various entities in the basin and providing links to additional datasets and resources. The information is intended to provide context for historical, current, and future conditions so that residents and decision-makers in the basin can better understand the sometimes complex relationships between water-related topics.

**This website is under development. It is intended to support the [Poudre Runs Through It](https://watercenter.colostate.edu/prti/) members, major water users in the basin, and the public.**
```

