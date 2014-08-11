// The main program that assembles the linked views.
//
// Curran Kelleher 4/17/2014
require(['d3', 'scatterPlot', 'barChart'], function (d3, ScatterPlot, BarChart) {

  // Grab the container div from the DOM.
  var div = document.getElementById('container'),

      // Add both visualizations to the same div.
      // Each will create its own SVG element.
      scatterPlot = ScatterPlot(div),
      barChart = BarChart(div);

  // Configure the scatter plot to use the iris data.
  scatterPlot.set({
    xField: 'sepalWidth',
    yField: 'sepalLength',
    xLabel: 'Sepal Width (cm)',
    yLabel: 'Sepal Length (cm)',
    margin: { 'top': 20, 'right': 20, 'bottom': 30, 'left': 40 }
  });

  // Configure the bar chart to use the aggregated iris data.
   barChart.set({
    xAttribute: 'species',
    yAttribute: 'count',
    yAxisLabel: 'number of irises',
    margin: { 'top': 20, 'right': 20, 'bottom': 30, 'left': 40 }
  });

  // Compute the aggregated iris data in response to brushing
  // in the scatter plot, and pass it into the bar chart.
  scatterPlot.when('selectedData', function (scatterData) {
    var speciesCounts = {};

    // Aggregate scatter plot data by counting 
    // the number of irises for each species.
    scatterData.forEach(function (d) {
      if(!speciesCounts[d.species]){
        speciesCounts[d.species] = 0;
      }
      speciesCounts[d.species]++;
    });

    // Flatten the object containing species counts into an array.
    // Update the bar chart with the aggregated data.
    barChart.data = Object.keys(speciesCounts).map(function (species) {
      return {
        species: species,
        count: speciesCounts[species]
      };
    });
  });

  // Load the iris data.
  d3.tsv('data.tsv', function (d) {
    d.sepalLength = +d.sepalLength;
    d.sepalWidth = +d.sepalWidth;
    return d;
  }, function(error, data) {

    // Set sizes once to initialize.
    setSizes();

    // Set sizes when the user resizes the browser.
    window.addEventListener('resize', setSizes);

    // Set the data.
    scatterPlot.data = data;
  });

  // Sets the `box` property on each visualization
  // to arrange them within the container div.
  function setSizes(){
  
    // Put the scatter plot on the left.
    scatterPlot.box = {
      x: 0,
      y: 0,
      width: div.clientWidth / 2,
      height: div.clientHeight
    };

    // Put the bar chart on the right.
    barChart.box = {
      x: div.clientWidth / 2,
      y: 0,
      width: div.clientWidth / 2,
      height: div.clientHeight
    };
  }
});
