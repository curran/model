require(['model', 'd3', 'topojson'], function (Model, d3, topojson) {
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
      svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height),
      model = Model();

  d3.json('us.json', function (err, us) {
    model.set('us', us);
  });

  d3.tsv('unemployment.tsv', function (err, unemployment) {
    var rateById = {};
    unemployment.forEach(function (d) {
      rateById[d.id] = +d.rate;
    });
    model.set('rateById', rateById);
  });

  model.when(['us', 'rateById'], function (us, rateById) {
    svg.append("g")
        .attr("class", "counties")
      .selectAll("path")
        .data(topojson.feature(us, us.objects.counties).features)
      .enter().append("path")
        .attr("class", function(d) { return quantize(rateById[d.id]); })
        .attr("d", path);

    svg.append("path")
        .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
        .attr("class", "states")
        .attr("d", path);
  });

  d3.select(self.frameElement).style("height", height + "px");
});
