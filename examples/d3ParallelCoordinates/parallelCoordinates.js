// A dynamic version of Jason Davies' Parallel Coordinats
// http://bl.ocks.org/jasondavies/1341281
define(['d3', 'model'], function (d3, Model) {
  return function (div) {

    var x = d3.scale.ordinal(),
        y = {},
        dragging = {},
        line = d3.svg.line(),
        axis = d3.svg.axis().orient('left'),
        svg = d3.select(div).append('svg'),
        g = svg.append('g'),
        background = g.append('g')
          .attr('class', 'background'),
        foreground = g.append('g')
          .attr('class', 'foreground'),
        dimension,
        backgroundPaths,
        foregroundPaths,
        model = Model();

    function getY(d) {
      if(!y[d]) {
        y[d] = d3.scale.linear();
        y[d].brush = d3.svg.brush()
          .y(y[d])
          .on('brush', brush);
      }
      return y[d];
    }

    model.when('margin', function (margin) {
      g.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    });

    model.when('size', function (size) {
      svg.attr('width', size.width)
         .attr('height', size.height);
    });

    model.when(['size', 'margin'], function (size, margin) {
      model.width = size.width - margin.left - margin.right;
      model.height = size.height - margin.top - margin.bottom;
    });
    
    model.when(['width', 'height', 'data'], function(width, height, cars) {
      x.rangePoints([0, width], 1);

      // Extract the list of dimensions and create a scale for each.
      dimensions = d3.keys(cars[0]).filter(function(d) {
        return d != 'name';
      });
      x.domain(dimensions);
      dimensions.forEach(function (d) {
        getY(d)
          .domain(d3.extent(cars, function(p) { return +p[d]; }))
          .range([height, 0]);
      });
      
      // Add grey background lines for context.
      backgroundPaths = background.selectAll('path').data(cars);
      backgroundPaths.enter().append('path');
      backgroundPaths.attr('d', path);
      backgroundPaths.exit().remove();

      // Add blue foreground lines for focus.
      foregroundPaths = foreground.selectAll('path').data(cars);
      foregroundPaths.enter().append('path');
      foregroundPaths.attr('d', path);
      foregroundPaths.exit().remove();

      // Add a group element for each dimension.
      dimension = g.selectAll('.dimension').data(dimensions);

      var dimensionEnter = dimension.enter()
        .append('g').attr('class', 'dimension');
      dimensionEnter
        .append('g').attr('class', 'axis')
        .append('text').attr('class', 'axis-label')
        .attr('text-anchor', 'middle')
        .attr('y', -9);
      dimensionEnter.append('g').attr('class', 'brush')

      dimension.exit().remove();

      dimension.attr('transform', function(d) { return 'translate(' + x(d) + ')'; })
        .call(d3.behavior.drag()
          .on('dragstart', function(d) {
            dragging[d] = this.__origin__ = x(d);
            backgroundPaths.attr('visibility', 'hidden');
          })
          .on('drag', function(d) {
            dragging[d] = Math.min(width, Math.max(0, this.__origin__ += d3.event.dx));
            foregroundPaths.attr('d', path);
            dimensions.sort(function(a, b) { return position(a) - position(b); });
            x.domain(dimensions);
            dimension.attr('transform', function(d) {
              return 'translate(' + position(d) + ')';
            });
          })
          .on('dragend', function(d) {
            delete this.__origin__;
            delete dragging[d];
            transition(d3.select(this)).attr('transform', 'translate(' + x(d) + ')');
            transition(foregroundPaths).attr('d', path);
            backgroundPaths
              .attr('d', path)
              .transition()
              .delay(500)
              .duration(0)
              .attr('visibility', null);
          }));

      // Add an axis and title.
      dimension.select('.axis').each(function(d) {
        d3.select(this).call(axis.scale(y[d]));
      });
      dimension.select('.axis .axis-label').text(String);

      // Add and store a brush for each axis.
      dimension.select('.brush').each(function(d) {
        d3.select(this).call(y[d].brush);
      }).selectAll('rect')
        .attr('x', -8)
        .attr('width', 16);
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
          extents = actives.map(function(p) { return y[p].brush.extent(); }),
          selectedPaths = foregroundPaths.filter(function(d) {
            return actives.every(function(p, i) {
              return extents[i][0] <= d[p] && d[p] <= extents[i][1];
            });
          });
      foregroundPaths.style('display', 'none');
      selectedPaths.style('display', null);
      model.selectedData = selectedPaths.data();
    }

    return model;
  };
});
