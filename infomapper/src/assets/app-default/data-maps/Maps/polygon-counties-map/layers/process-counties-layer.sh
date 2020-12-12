#!/bin/sh
#
# Convert county uppercase county name to mixed case
# - temporary fix to deal with case mismatch in time series and layer

cat new_colorado_counties.geojson | \
sed 's/"ADAMS"/"Adams"/g' | \
sed 's/"ALAMOSA"/"Alamosa"/g' | \
sed 's/"ARAPAHOE"/"Arapahoe"/g' | \
sed 's/"ARCHULETA"/"Archuleta"/g' | \
sed 's/"BACA"/"Baca"/g' | \
sed 's/"BENT"/"Bent"/g' | \
sed 's/"BOULDER"/"Boulder"/g' | \
sed 's/"BROOMFIELD"/"Broomfield"/g' | \
sed 's/"CHAFFEE"/"Chaffee"/g' | \
sed 's/"CHEYENNE"/"Cheyenne"/g' | \
sed 's/"CLEAR CREEK"/"Clear Creek"/g' | \
sed 's/"CONEJOS"/"Conejos"/g' | \
sed 's/"COSTILLA"/"Costilla"/g' | \
sed 's/"CROWLEY"/"Crowley"/g' | \
sed 's/"CUSTER"/"Custer"/g' | \
sed 's/"DELTA"/"Delta"/g' | \
sed 's/"DENVER"/"Denver"/g' | \
sed 's/"DOLORES"/"Dolores"/g' | \
sed 's/"DOUGLAS"/"Douglas"/g' | \
sed 's/"EAGLE"/"Eagle"/g' | \
sed 's/"EL PASO"/"El Paso"/g' | \
sed 's/"ELBERT"/"Elbert"/g' | \
sed 's/"FREMONT"/"Fremont"/g' | \
sed 's/"GARFIELD"/"Garfield"/g' | \
sed 's/"GILPIN"/"Gilpin"/g' | \
sed 's/"GRAND"/"Grand"/g' | \
sed 's/"GUNNISON"/"Gunnison"/g' | \
sed 's/"HINSDALE"/"Hinsdale"/g' | \
sed 's/"HUERFANO"/"Huerfano"/g' | \
sed 's/"JACKSON"/"Jackson"/g' | \
sed 's/"JEFFERSON"/"Jefferson"/g' | \
sed 's/"KIOWA"/"Kiowa"/g' | \
sed 's/"KIT CARSON"/"Kit Carson"/g' | \
sed 's/"LA PLATA"/"La Plata"/g' | \
sed 's/"LAKE"/"Lake"/g' | \
sed 's/"LARIMER"/"Larimer"/g' | \
sed 's/"LAS ANIMAS"/"Las Animas"/g' | \
sed 's/"LINCOLN"/"Lincoln"/g' | \
sed 's/"LOGAN"/"Logan"/g' | \
sed 's/"MESA"/"Mesa"/g' | \
sed 's/"MINERAL"/"Mineral"/g' | \
sed 's/"MOFFAT"/"Moffat"/g' | \
sed 's/"MONTEZUMA"/"Montezuma"/g' | \
sed 's/"MONTROSE"/"Montrose"/g' | \
sed 's/"MORGAN"/"Morgan"/g' | \
sed 's/"OTERO"/"Otero"/g' | \
sed 's/"OURAY"/"Ouray"/g' | \
sed 's/"PARK"/"Park"/g' | \
sed 's/"PHILLIP"/"Phillips"/g' | \
sed 's/"PITKIN"/"Pitkin"/g' | \
sed 's/"PROWERS"/"Prowers"/g' | \
sed 's/"PUEBLO"/"Pueblo"/g' | \
sed 's/"RIO BLANCO"/"Rio Blanco"/g' | \
sed 's/"RIO GRANDE"/"Rio Grande"/g' | \
sed 's/"ROUTT"/"Routt"/g' | \
sed 's/"SAGUACHE"/"Saguache"/g' | \
sed 's/"SAN JUAN"/"San Juan"/g' | \
sed 's/"SAN MIGUEL"/"San Miguel"/g' | \
sed 's/"SEDGWICK"/"Sedgwick"/g' | \
sed 's/"SUMMIT"/"Summit"/g' | \
sed 's/"TELLER"/"Teller"/g' | \
sed 's/"WASHINGTON"/"Washington"/g' | \
sed 's/"WELD"/"Weld"/g' | \
sed 's/"YUMA"/"Yuma"/g' > new_colorado_counties.geojson
