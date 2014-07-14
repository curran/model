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
//  * Simple D3 tooltip
//    https://gist.github.com/biovisualize/1016860
//  * CSS TEXT SHADOWS
//    http://www.w3.org/Style/Examples/007/text-shadow.en.html#multiple
// 
// By Curran Kelleher 4/22/2014
define(['model', 'd3', 'topojson'], function (Model, d3, topojson) {
  return function (div) {
    var quantize = d3.scale.quantize().domain([0, .15])
          .range(d3.range(9).map(function(i) { return 'q' + i + '-9'; })),
        projection = d3.geo.equirectangular().translate([0, 0]).scale(1),
        path = d3.geo.path().projection(projection),
        svg = d3.select(div).append('svg').style('position', 'absolute'),
        g = svg.append('g'),
        countriesG = g.append('g').attr('class', 'counties'),
        zoomBehavior = d3.behavior.zoom().on('zoom', function () {
          model.set({
            pan: d3.event.translate,
            zoom: d3.event.scale
          });
        }),
        tooltip = d3.select(div)
          .append('div')
          .attr('class', 'tooltip')
          .style('position', 'absolute')
          .style('z-index', '10')
          .style('visibility', 'hidden');
        model = Model(),
        format = d3.format(',');

    // Set default pan & zoom
    model.set({
      pan: [0, 0],
      zoom: 1
    });

    // Set pan & zoom in response to interaction
    svg.call(zoomBehavior);

    model.when('box', function (box) {
      svg.attr('width', box.width)
         .attr('height', box.height);
      svg.style('left', box.x + 'px')
        .style('top', box.y + 'px');
    });

    model.when(['data', 'idField', 'colorField'], function (data, idField, colorField) {
      var dataById = {};
      data.forEach(function (d) {
        dataById[d[idField]] = +d[colorField];
      });
      model.dataById = dataById;
    });

    model.when(['countries', 'box'], function (countries, box) {
      var countryFeatures = topojson.feature(countries, countries.objects.countriesGeoJSON).features,
 
          // Fit the map on the display.
          landGeometry = topojson.merge(countries, countries.objects.countriesGeoJSON.geometries),
          bounds = path.bounds(landGeometry),
          dx = bounds[1][0] - bounds[0][0],
          dy = bounds[1][1] - bounds[0][1],
          x = (bounds[0][0] + bounds[1][0]) / 2,
          y = (bounds[0][1] + bounds[1][1]) / 2,
          scale = 1 / Math.max(dx / box.width, dy / box.height);

      projection
        .scale(scale)
        .translate([ box.width / 2 - scale * x, box.height / 2 - scale * y ]);

      model.set({
        countryFeatures: countryFeatures,

        // Set countries to null so this function never executes again
        countries: null
      });
    });

    // Update the transform based pan & zoom
    model.when(['pan', 'zoom'], function (pan, zoom) {
      g.attr('transform', 'translate(' + pan + ')scale(' + zoom + ')');
    });

    // Update the county polygons
    model.when('countryFeatures', function (countryFeatures) {
      countries(countryFeatures).attr('d', path)
        .attr('fill', 'red');
    });

    model.when(['pan', 'zoom', 'countryFeatures', 'box'], function (pan, zoom, countryFeatures, box) {
      var visibleRegions = countries(countryFeatures).filter(function () {
        // TODO make this more efficient by using a quadtree
        // in geo space and projecting pixel bounds to projected space
        // TODO select rects where any part is visible, not only fully contained
        var rect = this.getBoundingClientRect();
        return (
          rect.top > box.y &&
          rect.bottom < (box.y + box.height) &&
          rect.left > box.x &&
          rect.right < (box.x + box.width)
        );
      }).data();
      model.visibleRegions = visibleRegions;
    });
    

    // Update the color only (not polygons) when the data changes
    model.when(['countryFeatures', 'dataById', 'colorField'], function (countryFeatures, dataById, colorField) {
      countries(countryFeatures)
        .attr('class', function(d) {
          return quantize(dataById[d.id]);
        })
        .on('mouseover', function (d) {
          var colorField = model.get('colorField');
          tooltip
            .style('visibility', 'visible')
            .html(d.id + '<br>' + colorField + ': ' + format(Math.round(dataById[d.id] * 1000000000)));
        })
        .on('mousemove', function () {
          tooltip
            .style('top', (event.pageY - 10) + 'px')
            .style('left',(event.pageX + 10) + 'px');
        })
        .on('mouseout', function () {
          tooltip.style('visibility', 'hidden');
        });
    });

    function countries(countryFeatures){
      var countries = countriesG.selectAll('path').data(countryFeatures);
      countries.enter().append('path');
      return countries;
    }

    return model;
  };
});

