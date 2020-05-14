# Create the geoMapProject, the geoMap, and add it to the project.
CreateGeoMapProject(NewGeoMapProjectID="line-maps-project",ProjectType="Dashboard",Name="Line Geometry Maps",Description="A geoMapProject using the GeoProcessor for displaying line maps",Properties="author:'Open Water Foundation',specificationFlavor:'',specificationVersion:'1.0.0'")
CreateGeoMap(NewGeoMapID="GeoMap1",Name="GeoMap1",Description="A geoMap containing metadata for line maps and background maps.",CRS="EPSG:4326",Properties="center:'[40, -105.385]',extentInitial:8,extentMinimum:7,extentMaximum:15")
AddGeoMapToGeoMapProject(GeoMapProjectID="line-maps-project",GeoMapID="GeoMap1")

# Read all layers. First, from a geoJSON file, then from a map service for the 4 background layers
ReadGeoLayerFromGeoJSON(InputFile="../map-layers/swrf-district03.geojson",GeoLayerID="swrf-line-layer",Name="swrf Line Layer",Description="The Source Water Framework was developed by the Colorado Division of Water Resources and derived from the National Hydrography Dataset (NHD). The SWRF represents most streams in Colorado, particular those with water rights or other important features.",Properties="isBackground: false")
ReadRasterGeoLayerFromTileMapService(InputUrl="https://api.mapbox.com/styles/v1/masforce/cjs108qje09ld1fo68vh7t1he/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoibWFzZm9yY2UiLCJhIjoiY2pzMTA0bmR5MXAwdDN5bnIwOHN4djBncCJ9.ZH4CfPR8Q41H7zSpff803g",GeoLayerID="Topographic",Description="The default background map.",Properties="attribution: 'Here is the attribution',isBackground: true")
ReadRasterGeoLayerFromTileMapService(InputUrl="https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1Ijoia3Jpc3RpbnN3YWltIiwiYSI6ImNpc3Rjcnl3bDAzYWMycHBlM2phbDJuMHoifQ.vrDCYwkTZsrA_0FffnzvBw",GeoLayerID="Satellite",Name="Satellite",Description="The satellite background map option",Properties="attribution: 'Here is the attribution',isBackground: true")
ReadRasterGeoLayerFromTileMapService(InputUrl="https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoia3Jpc3RpbnN3YWltIiwiYSI6ImNpc3Rjcnl3bDAzYWMycHBlM2phbDJuMHoifQ.vrDCYwkTZsrA_0FffnzvBw",GeoLayerID="Streets",Name="Streets",Description="The streets background map",Properties="attribution: 'Here is the attribution',isBackground: true")
ReadRasterGeoLayerFromTileMapService(InputUrl="https://api.mapbox.com/v4/mapbox.streets-satellite/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoia3Jpc3RpbnN3YWltIiwiYSI6ImNpc3Rjcnl3bDAzYWMycHBlM2phbDJuMHoifQ.vrDCYwkTZsrA_0FffnzvBw",GeoLayerID="Streets&Satellite",Name="Streets & Satellite",Description="The Streets and Satellite background Map",Properties="attribution: 'Here is the attribution',isBackground: true")

# Create a geoLayerViewGroup for the layer maps to display and add the layerView and symbol data to it.
AddGeoLayerViewGroupToGeoMap(GeoMapID="GeoMap1",GeoLayerViewGroupID="line-map-view-group",Name="Line Map View Group",Description="The View Group for the line maps in the GeoMap1 Geo Map",Properties="isBackground: false, selectedInitial: true")
AddGeoLayerViewToGeoMap(GeoLayerID="swrf-line-layer",GeoMapID="GeoMap1",GeoLayerViewGroupID="line-map-view-group",GeoLayerViewID="swrf-layer-view",Name="Line Layer View 1",Description="The first line geo layer view in the line-map-view-group",Properties="refreshInterval: ''")
SetGeoLayerViewSingleSymbol(GeoMapID="GeoMap1",GeoLayerViewGroupID="line-map-view-group",GeoLayerViewID="swrf-layer-view",Name="Blue Water Line",Description="The symbol metadata for the swrf geojson file.",Properties="classification:singleSymbol,color:blue,fillOpacity: 1.0,opacity:1.0,symbolSize:'',sizeUnits:pixels,weight:1.5")

# Create a geoLayerViewGroup for the base maps and add the layerView for each
AddGeoLayerViewGroupToGeoMap(GeoMapID="GeoMap1",GeoLayerViewGroupID="backgroundGroup",Name="Layer View Group for background maps.",Description="The view group containing all background maps for GeoMap1",Properties="isBackground: true, selectedInitial: true")
AddGeoLayerViewToGeoMap(GeoLayerID="Topographic",GeoMapID="GeoMap1",GeoLayerViewGroupID="backgroundGroup",GeoLayerViewID="backgroundView",Name="Topographic",Description="The default topographic Map",Properties="selectedInitial: true")
AddGeoLayerViewToGeoMap(GeoLayerID="Satellite",GeoMapID="GeoMap1",GeoLayerViewGroupID="backgroundGroup",GeoLayerViewID="backgroundSatelliteView",Name="Satellite",Description="The background Satellite Map",Properties="selectedInital: false")
AddGeoLayerViewToGeoMap(GeoLayerID="Streets",GeoMapID="GeoMap1",GeoLayerViewGroupID="backgroundGroup",GeoLayerViewID="backgroundStreetsView",Name="Streets",Description="The background Streets Map",Properties="selectedInitial: false")
AddGeoLayerViewToGeoMap(GeoLayerID="Streets&Satellite",GeoMapID="GeoMap1",GeoLayerViewGroupID="backgroundGroup",GeoLayerViewID="backgroundStreets&SatelliteView",Name="Streets & Satellite",Description="The background Streets and Satellite Map",Properties="selectedInitial: false")

# Write the configuration to a file as JSON
WriteGeoMapProjectToJSON(GeoMapProjectID="line-maps-project",OutputFile="test.json")
