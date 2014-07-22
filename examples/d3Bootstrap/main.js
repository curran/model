require(["d3", "scatterPlot", "listGroup"], function (d3, ScatterPlot, ListGroup) {
  var scatterPlotContainer = document.getElementById("scatterPlotContainer"),
      scatterPlot = ScatterPlot(scatterPlotContainer),
      xListGroup = ListGroup(document.getElementById("xListGroupContainer")),
      yListGroup = ListGroup(document.getElementById("yListGroupContainer"));

  // Load the data.
  d3.tsv("../data/iris.tsv", type, function(error, data) {
    var attributes = Object.keys(data[0]).filter(function (d) {
      return d !== "species";
    });

    xListGroup.set({
      data: attributes,
      selectedItem: "sepalLength"
    });

    yListGroup.set({
      data: attributes,
      selectedItem: "sepalWidth"
    });

    xListGroup.when("selectedItem", function (selectedItem) {
      scatterPlot.xAttribute = selectedItem;
    });

    yListGroup.when("selectedItem", function (selectedItem) {
      scatterPlot.yAttribute = selectedItem;
    });

    scatterPlot.data = data;
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
      width: scatterPlotContainer.clientWidth,
      height: scatterPlotContainer.clientHeight
    };
  }
  computeBox();
  window.addEventListener("resize", computeBox);
});
