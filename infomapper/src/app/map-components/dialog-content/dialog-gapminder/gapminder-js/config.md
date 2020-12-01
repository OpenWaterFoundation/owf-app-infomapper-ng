# Gapminder Layout and Configuration 

\1. Create and initialize Globals object to store all variables and avoid global variables

2. Add/Configure basic DOM element for the Gapminder Visualization and it's tools:

  Main Title/Subtitle

  -Chart div/Svg canvas inside that chart div

  -Legend div

  -List div

  -Year Slider

  -Datatable and Annotations

  -Tooltip

\3. Parse CSV Data into Json Object

\4. Call gapminder() function and complete configuring DOM elements:

  -xScale/xAxis/xaxis

  -yScale/yAxis/yaxis

  -Add data to legend

  -Add providers to dropdown menu

  -Paths for data tracers

  -The dots themselves

\5. Functions used throughout:

  -Various accessors that specify the four demensions of data to visualize

​    x()

​    y()

​    radius()

​    color()

​    key()

​    date()

  -Functions used to convert data from csv format to json object

​    makeJsonObj()

​    createNewObject()

​    checkData()

​    updateJsonObj()

​    initializeDeminsions()

​    updatePath()

  -Callback functions for dots

​    mousedown()

​    mouseover()

​    mouseout()

  -Other Callback Functions for various elements brushed()

​    draggedYear()

​    legendButton()

​    selectAllButton()

​    tracerButton()

​    annotationsButton()

​    mouseoverAnnotation()

​    playButton()

​    pauseButton()

​    replayButton()

​    replay()

​    backButton()

​    forwardButton()

​    select2 callback functions

  -Functions for Running the animation from the visualization

​    playAnimation()

​    setSpeed()

​    stopAnimation()

​    position()

​    order()

​    tweenYear()

​    displayYear()

​    interpolatePath()

​    interpolateData()

​    interpolateValues()

  -Helper Functions used throughout this javascript file

​    dateArray()

​    parsePrecisionInt()

​    parsePrecisionUnits()

​    checkLogMin()

​    logTicks()

​    getMaxYTicks()

​    getMaxXTicks()

​    getGroupingNames()

​    specificPathData()

​    retrieveAnnotations()

​    retreiveByShape()

​    nest()

​    getIndividualDots()

​    minRadius()

​    getTimeInterpolate()

​    getTime()

​    getAnnotations()

​    getClosest()

​    timeDiff()

​    incrementDate()

​    decrementDate()

  -Helper Functions that minipulate strings for d3.select() purposes

​    .classSelector

​    checkForSymbol()

​    .id

​    .idSelector

  -Helper functions that move elements forward or back in the svg canvas

​    .moveToFront

​    .moveToBack

  -Resizes the whole visualization

​    resize()

