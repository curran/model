// An adaptation of the [D3 line chart example](http://bl.ocks.org/mbostock/3883245)
// that uses `model.js`. This version, unlike the original example,
// is model driven and reactive. When a part of the model updates,
// only the parts of the visualization that depend on those parts
// of the model are updated. There are no redundant calls to visualization
// update code when multiple properties are changed simultaneously.
//
// Define the line chart AMD module using the
// `define()` function provided by Require.js.
define(['d3', 'model'], function (d3, Model) {
  return function (div){
    var x = d3.time.scale(),
        y = d3.scale.linear(),
        xAxis = d3.svg.axis().scale(x).orient('bottom'),
        yAxis = d3.svg.axis().scale(y).orient('left'),
        line = d3.svg.line(),
        svg = d3.select(div).append('svg').style('position', 'absolute'),
        g = svg.append('g'),
        xAxisG = g.append('g').attr('class', 'x axis'),
        yAxisG = g.append('g').attr('class', 'y axis'),
        yAxisLabel = yAxisG.append('text')
          .attr('transform', 'rotate(-90)')
          .attr('y', 6)
          .attr('dy', '.71em')
          .style('text-anchor', 'end'),
        model = Model();

    model.when('yLabel', yAxisLabel.text, yAxisLabel);

    model.when('margin', function (margin) {
      g.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    });

    model.when('box', function (box) {
      svg.attr('width', box.width)
         .attr('height', box.height);
      svg.style('left', box.x + 'px')
        .style('top', box.y + 'px');
    });

    model.when(['box', 'margin'], function (box, margin) {
      model.set('width', box.width - margin.left - margin.right);
      model.set('height', box.height - margin.top - margin.bottom);
    });

    model.when('height', function (height) {
      xAxisG.attr('transform', 'translate(0,' + height + ')');
    });

    model.when(['width', 'height', 'data', 'xField', 'yField', 'idField'], 
        function (width, height, data, xField, yField, idField) {
      var lineData = (function () {
            var entriesById = {};
            data.forEach(function (d) {
              var id = d[idField],
                  entries = entriesById[id] || (entriesById[id] = []);
              entries.push(d);
            });
            return Object.keys(entriesById).map(function (id) {
              return {
                name: id,
                values: entriesById[id]
              };
            });
          }()),
          paths;

      x.domain(d3.extent(data, function(d) { return d[xField]; }));
      y.domain(d3.extent(data, function(d) { return d[yField]; }));

      x.range([0, width]);
      y.range([height, 0]);

      xAxisG.call(xAxis);
      yAxisG.call(yAxis);

      line
        .x(function(d) { return x(d[xField]); })
        .y(function(d) { return y(d[yField]); });

      paths = g.selectAll('.line').data(lineData);
      paths.enter().append('path').attr('class', 'line');
      paths.attr('d', function(d) { return line(d.values); });
    });
    return model;
  }
});
