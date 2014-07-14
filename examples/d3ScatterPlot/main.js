// The main program that runs the scatter plot.
// This program creates a new visualization, loads a
// configuration file for it, and loads data into it.
// Then it periodically updates various aspects of the chart
// with random values, to illustrate that the chart
// is dynamic and reacts to changes in its model.
//
// Curran Kelleher 4/17/2014
require(['d3', 'scatterPlot'], function (d3, ScatterPlot) {
  var div = document.getElementById('scatterPlotContainer'),
      scatterPlot = ScatterPlot(div);

  d3.json('configuration.json', function (config) {
    scatterPlot.set(config);
  });

  d3.tsv('data.tsv', function (d) {
    d.sepalLength = +d.sepalLength;
    d.sepalWidth = +d.sepalWidth;
    return d;
  }, function(error, data) {

    // Set size once to initialize
    setSizeFromDiv();

    // Set size on resize
    window.addEventListener('resize', setSizeFromDiv);

    // Set the data
    scatterPlot.data = data;

    // Reset data each second
    setInterval(function () {

      // Include each element with a 10% chance.
      var randomSample = data.filter(function(d){
        return Math.random() < 0.1;
      });

      scatterPlot.data = randomSample;
    }, 1000);

    // Randomly change the margin every 1.7 seconds.
    function random(){ return Math.random() * 100; }
    setInterval(function () {
      scatterPlot.margin = {
        top: random(),
        right: random(),
        bottom: random(),
        left: random()
      };
    }, 1700);

    // Change the Y axis label every 600 ms.
    function randomString() {
      var possibilities = ['Frequency', 'Population', 'Alpha', 'Beta'],
          i = Math.round(Math.random() * possibilities.length);
      return possibilities[i];
    }
    setInterval(function () {
      scatterPlot.yLabel = randomString();
    }, 600);
  });

  function setSizeFromDiv(){
    scatterPlot.size = {
      width: div.clientWidth,
      height: div.clientHeight
    };
  }
});
