// The main program that runs the line chart.
// This program creates a new line chart, loads a
// configuration file for it, and loads data into it.
// Then it periodically updates various aspects of the chart
// with random values, to illustrate that the chart
// is dynamic and reacts to changes in its model.
//
// Curran Kelleher 4/17/2014
require(['d3', 'lineChart'], function (d3, LineChart) {
  var div = document.getElementById('lineChartContainer'),
      lineChart = LineChart(div);

  d3.json('configuration.json', function (config) {
    lineChart.set(config);
  });

  d3.tsv('data.tsv', (function () {
    var parseDate = d3.time.format("%d-%b-%y").parse;
    return function (d) {
      d.date = parseDate(d.date);
      d.close = +d.close;
      return d;
    };
  }()), function(error, data) {

    // Set size once to initialize
    setSizeFromDiv();

    // Set size on resize
    window.addEventListener('resize', setSizeFromDiv);

    // Set the data
    lineChart.data = data;

    // Reset data each second
    setInterval(function () {

      // Include each element with a 10% chance.
      var randomSample = data.filter(function(d){
        return Math.random() < 0.1;
      });

      lineChart.data = randomSample;
    }, 1000);

    // Randomly change the margin every 1.7 seconds.
    function random(){ return Math.random() * 100; }
    setInterval(function () {
      lineChart.margin = {
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
      lineChart.yLabel = randomString();
    }, 600);
  });

  function setSizeFromDiv(){
    lineChart.size = {
      width: div.clientWidth,
      height: div.clientHeight
    };
  }
});
