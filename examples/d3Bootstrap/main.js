require(["d3", "scatterPlot"], function (d3, ScatterPlot) {
  var container = document.getElementById("container"),
      scatterPlot = ScatterPlot(container);

  // Load the data.
  d3.tsv("../data/iris.tsv", type, function(error, data) {
    scatterPlot.set({
      xAttribute: "sepalLength",
      // TODO add x label
      yAttribute: "sepalWidth",
      yAxisLabel: "Sepal Width",
      data: data
    });
    setInterval(function () {
      scatterPlot.data = data.filter(function(){ return Math.random() < 0.5 });
    }, 1000);
  });

  // Called on each data element from the original table.
  function type(d) {
    // The '+' notation parses the string as a Number.
    d.sepalLength = +d.sepalLength;
    d.sepalWidth = +d.sepalWidth;
    return d;
  }

  // Dynamic resize.
  function computeBox(){
    scatterPlot.box = {
      width: container.clientWidth,
      height: container.clientHeight
    };
  }
  computeBox();
  window.addEventListener("resize", computeBox);
});
