var width = 960,
    height = 600,
    rateById = {},
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
      .attr("height", height);

d3.json('us.json', function (us) {
  d3.tsv('unemployment.tsv', function(d) { rateById[d.id] = +d.rate; }, function () {
    ready(null, us);
  })
});

function ready(error, us) {
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
}

d3.select(self.frameElement).style("height", height + "px");
