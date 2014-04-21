// A dynamic Choropleth map using model.js.
// Based on the Choropleth D3 example http://bl.ocks.org/mbostock/4060606
// By Curran Kelleher 4/20/2014
define(['model', 'd3', 'topojson'], function (Model, d3, topojson) {
  return function (div) {
    var quantize = d3.scale.quantize().domain([0, .15])
          .range(d3.range(9).map(function(i) { return 'q' + i + '-9'; })),
        projection = d3.geo.albersUsa(),
        path = d3.geo.path(),
        svg = d3.select(div).append('svg'),
        countiesG = svg.append('g').attr('class', 'counties'),
        states = svg.append('path').attr('class', 'states'),
        model = Model();

    model.when('unemployment', function (unemployment) {
      var rateById = {};
      unemployment.forEach(function (d) { rateById[d.id] = +d.rate; });
      model.set('rateById', rateById);
    });

    model.when(['us'], function (us) {
      model.set({
        countiesFeatures: topojson.feature(us, us.objects.counties).features,
        stateBoundaries: topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; })
      });
    });

    model.when(['size', 'countiesFeatures', 'stateBoundaries', 'rateById'],
        function (size, countiesFeatures, stateBoundaries, rateById) {
      var counties;

      svg.attr('width', size.width).attr('height', size.height);
      projection
        .scale(2 * Math.min(size.width, size.height))
        .translate([size.width / 2, size.height / 2]);
      path.projection(projection);

      counties = countiesG.selectAll('path').data(countiesFeatures);
      counties.enter().append('path')
      counties.attr('d', path)
        .attr('class', function(d) { return quantize(rateById[d.id]); });

      states.attr('d', path(stateBoundaries));
    });

    return model;
  };
});

