require(["d3", "barChart"], function (d3, BarChart) {
  var container = document.getElementById("container"),
      barChart = BarChart(container),
      tsvPath = "../data/letterByFrequency.tsv";

  barChart.set({
    xAttribute: "letter",
    yAttribute: "frequency",
    yAxisLabel: "Frequency",
    yAxisTickFormat: "%"
  });

  d3.tsv(tsvPath, type, function(error, data) {
    barChart.data = data;

    // Periodically set random data
    // to demonstrate that the bars respond to data.
    setInterval(function () {
      barChart.data = data.filter(function(){ return Math.random() < 0.5 });
    }, 1000);

    // Periodically update the label
    // to show it is dynamic.
    setInterval(function () {
      var i = Math.floor(Math.random() * 3);
      barChart.yAxisLabel = ["A", "B", "C"][i];
    }, 1500);
  });

  // Runs for each row of the input data
  // See https://github.com/mbostock/d3/wiki/CSV#csv
  function type(d) {

    // Parse strings to Numbers for the frequency attribute.
    d.frequency = +d.frequency;
    return d;
  }

  // Set the bar chart size
  // based on the size of its container,
  function computeBox(){
    barChart.box = {
      width: container.clientWidth,
      height: container.clientHeight
    };
  }

  // once to initialize `model.box`, and
  computeBox();

  // whenever the browser window resizes in the future.
  window.addEventListener("resize", computeBox);
});
