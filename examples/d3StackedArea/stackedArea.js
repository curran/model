// An adaptation of the [D3 scatter plot example](http://bl.ocks.org/mbostock/3887118)
// that uses `model.js`. This version, unlike the original example,
// is model driven and reactive. When a part of the model updates,
// only the parts of the visualization that depend on those parts
// of the model are updated. There are no redundant calls to visualization
// update code when multiple properties are changed simultaneously.
//
// Define the AMD module using the `define()` function
// provided by Require.js.

define(['d3', 'model'], function (d3, Model) {
  return function (div){

  var formatPercent = d3.format(".0%"),
      color = d3.scale.category20(),
      x = d3.time.scale(),
      y = d3.scale.linear(),
      xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom"), 
      yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat(formatPercent),
      area = d3.svg.area()
        .x(function(d) { return x(d.date); })
        .y0(function(d) { return y(d.y0); })
        .y1(function(d) { return y(d.y0 + d.y); }), 
      stack = d3.layout.stack()
        .values(function(d) { return d.values; }), 
      svg = d3.select(div).append("svg"),
      g = svg.append("g"),
      xAxisG =  g.append("g")
          .attr("class", "x axis"), 
      yAxisG =  g.append("g")
          .attr("class", "y axis"), 

      model = Model();

  model.when(['margin'], function (margin) {
    g.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  });

  model.when(['size'], function (size) {
    svg.attr("width", size.width)
       .attr("height", size.height);
  });

  model.when(['size', 'margin'], function (size, margin) {
    model.set('width', size.width - margin.left - margin.right);
    model.set('height', size.height - margin.top - margin.bottom);
  });

  model.when(['height'], function (height) {
    console.log("updating X axis transform");
    xAxisG.attr("transform", "translate(0," + height + ")");
  });

  model.when(['width', 'height', 'data'], function (width, height, data) {
      var browser;

      console.log('Updating visualization');

      color.domain(d3.keys(data[0]).filter(function(key) { return key !== "date"; }));

      var browsers = stack(color.domain().map(function(name) {
        return {
          name: name,
          values: data.map(function(d) {
            return {date: d.date, y: d[name] / 100};
          })
        };
      }));

      x.domain(d3.extent(data, function(d) { return d.date; }));
      x.range([0, width]), 
      y.range([height, 0]),

      xAxisG
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

      yAxisG.call(yAxis);

      browser = svg.selectAll(".browser").data(browsers);

      browser.enter().append("g").attr("class", "browser");

      browser.append("path")
          .attr("class", "area")
          .attr("d", function(d) { return area(d.values); })
          .style("fill", function(d) { return color(d.name); });

      browser.append("text")
          .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
          .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.y0 + d.value.y / 2) + ")"; })
          .attr("x", -6)
          .attr("dy", ".35em")
          .text(function(d) { return d.name; });

      browser.exit().remove();
    });
    return model;
  }
});

