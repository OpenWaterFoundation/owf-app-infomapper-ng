# Data Preparation

This data-prep directory contains the GeoProcessor command files that create
each map configuration file used in the info-mapper application. 

## Relationship of Application Menus and Maps to Processing Folders

The web application provides menus, which display context-specific maps, as
follows:

| **Menu** | **Submenu** | **Map File** | **Description** | **Process Folder** |
| -- | -- | -- | -- | -- |
| ***Basin Entities*** | | | | |
| | ***Agricultural Ditches*** | | | |
| | ***Environmental Entities*** | | | |
| | ***Municipalities*** | | | |
| | ***Water Providers*** | | | |
| ***Current Conditions*** | | | | |
| | ***Boating*** | | | |
| | ***Drought*** | | | |
| | ***Evapotranspiration*** | | | |
| | ***Fishing*** | | | |
| | ***Reservoirs (Storage)*** | | | |
| | ***Snowpack (SNODAS)*** | | | |
| | ***Soil Moisture*** | | | |
| | ***Streamflow*** | | | |
| | ***Wind*** | | | |
| | ***Wildfire Burn Areas*** | | | |
| ***Seasonal Outlook*** | | | | |
| | ***Diversions*** | | | |
| | ***Drought*** | | | |
| | ***Reservoirs (Storage)*** | | | |
| | ***Snow*** | | | |
| ***Historical Data*** | | | | |
| | ***Diversions*** | | | |
| | ***Boating*** | | | |
| | ***Municipal Population*** | | | |
| | ***Municipal Water Demand*** | | | |
| | ***Streamflow*** | | | |
| | ***Snow*** | | | |
| ***Future Planning*** | | | | |
| | ***Agricultural Land Transfer*** | | | |
| | ***Climate Change*** | | | |
| | ***Municipal Growth*** | | | |
| | ***Open Space*** | | | |
| | ***Stormwater/Floodplain Plans*** | | | |
| | ***Watershed Plans*** | | | |
| ***Maps*** | | | |
| | ***Line Geometry Maps*** | line-geometry-maps.json | An in-development test map that displays line maps and its given background maps. | dev-maps/ |
| | ***Polygon Geometry Maps*** | polygon-geometry-maps.json | An in-development test map that will display different line maps and its given background maps. | dev-maps/ |
| | ***Point Geometry Maps*** | point-geometry-maps.json | An in-development test map that will display different point maps using either a default marker or circle, and its given background maps. | dev-maps/ |
| | ***Point Shape Maps*** | point-shape-maps.json | An in-development test map that will display different point maps using different shapes (triangle, square, etc.), and its given background maps. | dev-maps/ |