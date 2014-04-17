// An adaptation of the [D3 scatter plot example](http://bl.ocks.org/mbostock/3887118)
// that uses `model.js`. This version, unlike the original example,
// is model driven and reactive. When a part of the model updates,
// only the parts of the visualization that depend on those parts
// of the model are updated. There are no redundant calls to visualization
// update code when multiple properties are changed simultaneously.
//
// Draws from this brushing example for interaction:
// http://bl.ocks.org/mbostock/4343214
//
// See also docs on quadtree:
// https://github.com/mbostock/d3/wiki/Quadtree-Geom
//
// Define the AMD module using the `define()` function
// provided by Require.js.
define(['d3', 'model'], function (d3, Model) {
  return function (div){
    var x = d3.scale.linear(),
        y = d3.scale.linear(),
        xAxis = d3.svg.axis().scale(x).orient('bottom'),
        yAxis = d3.svg.axis().scale(y).orient('left'),

        // Use absolute positioning so that CSS can be used
        // to position the div according to the model.
        svg = d3.select(div).append('svg').style('position', 'absolute'),
        g = svg.append('g'),
        xAxisG = g.append('g').attr('class', 'x axis'),
        yAxisG = g.append('g').attr('class', 'y axis'),
        xAxisLabel = yAxisG.append('text')
          .attr('class', 'label')
          .attr('y', -6)
          .style('text-anchor', 'end'),
        yAxisLabel = yAxisG.append('text')
          .attr('class', 'label')
          .attr('transform', 'rotate(-90)')
          .attr('y', 6)
          .attr('dy', '.71em')
          .style('text-anchor', 'end'),
        brushG = g.append('g')
          .attr('class', 'brush'),
        brush = d3.svg.brush()
          .on('brush', brushed),
        dots,
        quadtree,
        model = Model();

    model.when('xLabel', xAxisLabel.text, yAxisLabel);
    model.when('yLabel', yAxisLabel.text, yAxisLabel);


    model.when('margin', function (margin) {
      g.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    });

    model.when('box', function (box) {
      svg.attr('width', box.width)
         .attr('height', box.height);

      // Set the CSS `left` and `top` properties
      // to move the SVG element to `(box.x, box.y)`
      // relative to the container div.
      svg
        .style('left', box.x + 'px')
        .style('top', box.y + 'px')
    });

    model.when(['box', 'margin'], function (box, margin) {
      model.set('width', box.width - margin.left - margin.right);
      model.set('height', box.height - margin.top - margin.bottom);
    });

    model.when('width', function (width) {
      xAxisLabel.attr('x', width);
    });

    model.when('height', function (height) {
      xAxisG.attr('transform', 'translate(0,' + height + ')');
    });

    model.when(['width', 'height'], function (width, height) {
      brush.x(d3.scale.identity().domain([0, width]));
      brush.y(d3.scale.identity().domain([0, height]));
      brushG
        .call(brush)
        .call(brush.event);
    });


    model.when(['width', 'height', 'data', 'xField', 'yField'], function (width, height, data, xField, yField) {

      // Updated the scales
      x.domain(d3.extent(data, function(d) { return d[xField]; })).nice();
      y.domain(d3.extent(data, function(d) { return d[yField]; })).nice();

      x.range([0, width]);
      y.range([height, 0]);

      // update the quadtree
      quadtree = d3.geom.quadtree()
        .x(function(d) { return x(d[xField]); })
        .y(function(d) { return y(d[yField]); })
        (data);

      // update the axes
      xAxisG.call(xAxis);
      yAxisG.call(yAxis);

      // Plot the data as dots
      dots = g.selectAll('.dot').data(data);
      dots.enter().append('circle')
        .attr('class', 'dot')
        .attr('r', 3.5);
      dots
        .attr('cx', function(d) { return x(d[xField]); })
        .attr('cy', function(d) { return y(d[yField]); });
      dots.exit().remove();
    });
    return model;

    function brushed() {
      var extent = brush.extent();
      if(dots) {
        dots.each(function(d) { d.selected = false; });
        search(extent[0][0], extent[0][1], extent[1][0], extent[1][1]);
        dots.classed('selected', function(d) { return d.selected; });
      }
      if(brush.empty()){
        model.set('selectedData', model.get('data'));
      } else {
        model.set('selectedData', dots.filter(function (d) {
          return d.selected;
        }).data());
      }
    }

    // Find the nodes within the specified rectangle.
    function search(x0, y0, x3, y3) {
      quadtree.visit(function(node, x1, y1, x2, y2) {
        if (node.leaf) {
          node.point.selected = (
            (node.x >= x0) && (node.x < x3) &&
            (node.y >= y0) && (node.y < y3)
          );
        }
        return x1 >= x3 || y1 >= y3 || x2 < x0 || y2 < y0;
      });
    }
  }
});
