// A dynamic Choropleth map using model.js.
//
// Draws from:
//
//  * Mike Bostock's Choropleth D3 examples
//    http://bl.ocks.org/mbostock/4060606
//    http://bl.ocks.org/mbostock/3757132
//  * SVG Geometric Zooming example
//    http://bl.ocks.org/mbostock/3680999
//  * Merging states using topojson
//    https://gist.github.com/mbostock/5416405
//  * Zooming to a feature
//    https://gist.github.com/mbostock/4699541
// 
// By Curran Kelleher 4/22/2014
define(['model', 'd3', 'topojson'], function (Model, d3, topojson) {
  return function (div) {
    var quantize = d3.scale.quantize().domain([0, .15])
          .range(d3.range(9).map(function(i) { return 'q' + i + '-9'; })),
        projection = d3.geo.albersUsa().translate([0, 0]).scale(1),
        path = d3.geo.path().projection(projection),
        svg = d3.select(div).append('svg'),
        g = svg.append('g'),
        countiesG = g.append('g').attr('class', 'counties'),
        states = g.append('path').attr('class', 'states'),
        zoomBehavior = d3.behavior.zoom().on('zoom', function () {
          model.pan = d3.event.translate;
          model.zoom = d3.event.scale;
        }),
        model = Model();

    // Set default pan & zoom
    model.pan = [0, 0];
    model.zoom = 1;

    // Set pan & zoom in response to interaction
    svg.call(zoomBehavior);

    // Update the SVG width and height
    model.when(['size'], function (size) {
      svg.attr('width', size.width).attr('height', size.height);
    });

    model.when(['data', 'idField', 'colorField'], function (data, idField, colorField) {
      var dataById = {};
      data.forEach(function (d) {
        dataById[d[idField]] = +d[colorField];
      });
      model.dataById = dataById;
    });

    model.when(['us', 'size'], function (us, size) {
      var countiesFeatures = topojson.feature(us, us.objects.counties).features,
          stateBoundaries = topojson.mesh(us, us.objects.states, function(a, b) {
            return a !== b;
          }),
 
          // Fit the map on the display.
          usGeom = topojson.merge(us, us.objects.states.geometries),
          bounds = path.bounds(usGeom),
          dx = bounds[1][0] - bounds[0][0],
          dy = bounds[1][1] - bounds[0][1],
          x = (bounds[0][0] + bounds[1][0]) / 2,
          y = (bounds[0][1] + bounds[1][1]) / 2,
          scale = 1 / Math.max(dx / size.width, dy / size.height);

      projection
        .scale(scale)
        .translate([ size.width / 2 - scale * x, size.height / 2 - scale * y ]);

      model.set({
        countiesFeatures: countiesFeatures,
        stateBoundaries: stateBoundaries
      });
    });

    // Update the transform based pan & zoom
    model.when(['pan', 'zoom'], function (pan, zoom) {
      g.attr('transform', 'translate(' + pan + ')scale(' + zoom + ')');
    });
    
    // Update the county polygons
    model.when('countiesFeatures', function (countiesFeatures) {
      counties(countiesFeatures).attr('d', path);
    });

    // Update the state boundary lines
    model.when('stateBoundaries', function (stateBoundaries) {
      states.attr('d', path(stateBoundaries));
    });

    // Update the color only (not polygons) when the data changes
    model.when(['countiesFeatures', 'dataById'], function (countiesFeatures, dataById) {
      counties(countiesFeatures).attr('class', function(d) {
        return quantize(dataById[d.id]);
      });
    });

    function counties(countiesFeatures){
      var counties = countiesG.selectAll('path').data(countiesFeatures);
      counties.enter().append('path');
      return counties;
    }

    return model;
  };
});

