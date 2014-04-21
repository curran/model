define(['model', 'd3', 'topojson'], function (Model, d3, topojson) {
  return function (div) {
    var width = 960,
        height = 600,
        quantize = d3.scale.quantize()
          .domain([0, .15])
          .range(d3.range(9).map(function(i) { return "q" + i + "-9"; })),
        projection = d3.geo.albersUsa()
          .scale(1280)
          .translate([width / 2, height / 2]),
        path = d3.geo.path()
          .projection(projection),
        svg = d3.select(div).append('svg')
          .attr('width', width)
          .attr('height', height),
        countiesG = svg.append('g')
          .attr('class', 'counties'),
        states = svg.append('path')
          .attr('class', 'states'),
        model = Model();

    model.when('unemployment', function (unemployment) {
      var rateById = {};
      unemployment.forEach(function (d) { rateById[d.id] = +d.rate; });
      model.set('rateById', rateById);
    });

    model.when(['us', 'rateById'], function (us, rateById) {
      var counties = countiesG.selectAll('path')
        .data(topojson.feature(us, us.objects.counties).features);

      counties.enter().append('path')
      counties
        .attr('class', function(d) { return quantize(rateById[d.id]); })
        .attr('d', path);

      states.attr('d', path(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; })));
    });

    d3.select(self.frameElement).style("height", height + "px");

    return model;
  };
});

