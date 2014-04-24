// A dynamic version of Jason Davies' Parallel Coordinats
// http://bl.ocks.org/jasondavies/1341281
define(['d3', 'model'], function (d3, Model) {
  return function (div) {

    var x = d3.scale.ordinal(),
        y = {},
        dragging = {},
        line = d3.svg.line(),
        axis = d3.svg.axis().orient("left"),
        background,
        foreground,
        dimension,
        svg = d3.select(div).append("svg"),
        g = svg.append("g"),
        model = Model();

    model.when('margin', function (margin) {
      g.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    });

    model.when('size', function (size) {
      svg.attr('width', size.width)
         .attr('height', size.height);
    });

    model.when(['size', 'margin'], function (size, margin) {
      model.set('width', size.width - margin.left - margin.right);
      model.set('height', size.height - margin.top - margin.bottom);
    });
    
    model.when(['width', 'height', 'data'], function(width, height, cars) {
      x.rangePoints([0, width], 1);

      // Extract the list of dimensions and create a scale for each.
      x.domain(dimensions = d3.keys(cars[0]).filter(function(d) {
        return d != "name" && (y[d] = d3.scale.linear()
            .domain(d3.extent(cars, function(p) { return +p[d]; }))
            .range([height, 0]));
      }));
      
      // Add grey background lines for context.
      var background = g.append("svg:g")
          .attr("class", "background")
        .selectAll("path")
          .data(cars)
        .enter().append("svg:path")
          .attr("d", path);

      // Add blue foreground lines for focus.
      foreground = g.append("svg:g")
          .attr("class", "foreground")
        .selectAll("path")
          .data(cars)
        .enter().append("svg:path")
          .attr("d", path);

      // Add a group element for each dimension.
      dimension = g.selectAll(".dimension")
          .data(dimensions)
        .enter().append("svg:g")
          .attr("class", "dimension")
          .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
          .call(d3.behavior.drag()
            .on("dragstart", function(d) {
              dragging[d] = this.__origin__ = x(d);
              background.attr("visibility", "hidden");
            })
            .on("drag", function(d) {
              dragging[d] = Math.min(width, Math.max(0, this.__origin__ += d3.event.dx));
              foreground.attr("d", path);
              dimensions.sort(function(a, b) { return position(a) - position(b); });
              x.domain(dimensions);
              dimension.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
            })
            .on("dragend", function(d) {
              delete this.__origin__;
              delete dragging[d];
              transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
              transition(foreground)
                  .attr("d", path);
              background
                  .attr("d", path)
                  .transition()
                  .delay(500)
                  .duration(0)
                  .attr("visibility", null);
            }));

      // Add an axis and title.
      dimension.append("svg:g")
          .attr("class", "axis")
          .each(function(d) { d3.select(this).call(axis.scale(y[d])); })
        .append("svg:text")
          .attr("text-anchor", "middle")
          .attr("y", -9)
          .text(String);

      // Add and store a brush for each axis.
      dimension.append("svg:g")
          .attr("class", "brush")
          .each(function(d) { d3.select(this).call(y[d].brush = d3.svg.brush().y(y[d]).on("brush", brush)); })
        .selectAll("rect")
          .attr("x", -8)
          .attr("width", 16);
    });

    function position(d) {
      var v = dragging[d];
      return v == null ? x(d) : v;
    }

    function transition(g) {
      return g.transition().duration(500);
    }

    // Returns the path for a given data point.
    function path(d) {
      return line(dimensions.map(function(p) { return [position(p), y[p](d[p])]; }));
    }

    // Handles a brush event, toggling the display of foreground lines.
    function brush() {
      var actives = dimensions.filter(function(p) { return !y[p].brush.empty(); }),
          extents = actives.map(function(p) { return y[p].brush.extent(); });
      foreground.style("display", function(d) {
        return actives.every(function(p, i) {
          return extents[i][0] <= d[p] && d[p] <= extents[i][1];
        }) ? null : "none";
      });
    }


    return model;
  };
});
