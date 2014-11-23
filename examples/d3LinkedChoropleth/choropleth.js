// A dynamic Choropleth map using model.js.
//
// Draws from:
//
//  * Mike Bostock"s Choropleth D3 examples
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
//  * D3 Color legend
//    http://stackoverflow.com/questions/21838013/d3-choropleth-map-with-legend
//
// By Curran Kelleher 4/22/2014
// Updated 11/23/2014 to add color legend.
define(["model", "d3", "topojson"], function (Model, d3, topojson) {
  return function (div) {
    var colorScale = d3.scale.quantize().domain([0, 8 * 0.02])
          .range(d3.range(8).map(function(i) { return "q" + (i + 1) + "-9"; })),
        projection = d3.geo.equirectangular().translate([0, 0]).scale(1),
        path = d3.geo.path().projection(projection),
        svg = d3.select(div).append("svg").style("position", "absolute"),

        // Define the hatching pattern used for missing data.
        // Draws from http://stackoverflow.com/questions/13069446/simple-fill-pattern-in-svg-diagonal-hatching
        defs = svg
          .append("defs")
          .append("pattern")
            .attr("id", "diagonalHatch")
            .attr("patternUnits", "userSpaceOnUse")
            .attr("width", "4")
            .attr("height", "4")
          .append("path")
            .attr("d", "M-1,1 l2,-2 \nM0,4 l4,-4 \nM3,5 l2,-2")
            .attr("stroke", "gray")
            .attr("stroke-width", "1px"),

        g = svg.append("g"),
        countriesG = g.append("g").attr("class", "counties"),
        zoomBehavior = d3.behavior.zoom().on("zoom", function () {
          model.set({
            pan: d3.event.translate,
            zoom: d3.event.scale
          });
        }),
        whiteShadow = "-1px -1px 2px #FFF, 1px -1px 2px #FFF, -1px  1px 2px #FFF, 1px  1px 2px #FFF",
        tooltip = d3.select(div)
          .append("div")
          .style("position", "absolute")

          // Make sure the tooltip renders on top of
          // everything else.
          .style("z-index", "10")
          .style("font-size", "2em")
          .style("text-shadow", whiteShadow)

          // Disable pointer events so the tooltip text does not
          // interfere with the mouseover behavior of geometries while dragging.
          .style("pointer-events", "none")
          .style("visibility", "hidden"),

        model = Model(),
        format = d3.format(","),
        missingDataFill = "url(#diagonalHatch)",
        legendEntries = colorScale.range().concat("missing"),
        legend = svg.selectAll("g.legendEntry")
          .data(legendEntries)
          .enter()
          .append("g").attr("class", "legendEntry");

    legend
      .append("rect")
      .attr("x", 20.5)
      .attr("y", function(d, i) {
         return i * 30 + 20.5;
      })
     .attr("width", 20)
     .attr("height", 20)
     .style("stroke", "gray")
     .style("stroke-width", "1px")
     .attr("class", function(d){ 
       return d === "missing" ? null : d;
     })
     .attr("fill", function(d){ 
       return d === "missing" ? missingDataFill : null;
     }); 

    legend
      .append("text")
      .attr("x", 45)
      .attr("y", function(d, i) {
         return i * 30 + 20;
      })
      .attr("dy", "1.2em")
      .style("font-size", "1.3em")
      .style("text-shadow", whiteShadow)
      .text(function(d, i) {
        if(d === "missing") {
          return "Missing data";
        } else {
          var extent = colorScale.invertExtent(d).map(function (d) {
            return Math.round(d * 1000000000);
          });
          if( i === colorScale.range().length - 1 ){
            return "> " + format(+extent[0]);
          } else {
            return format(+extent[0]) + " - " + format(+extent[1]);
          }
        }
      });

    // Set default pan & zoom
    model.set({
      pan: [0, 0],
      zoom: 1
    });

    // Set pan & zoom in response to interaction
    svg.call(zoomBehavior);

    model.when("box", function (box) {
      svg.attr("width", box.width)
         .attr("height", box.height);
      svg.style("left", box.x + "px")
        .style("top", box.y + "px");
    });

    // Restructure the data for use on the choropleth map.
    model.when(["data", "idField", "colorField"], function (data, idField, colorField) {
      var dataById = {};
      data.forEach(function (d) {
        dataById[d[idField]] = +d[colorField];
      });
      model.dataById = dataById;
    });

    // Preprocess the geometries for use in the visualization.
    model.when(["countries", "box"], function (countries, box) {
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

        // Set countries to null so this function never executes again.
        countries: null
      });
    });

    // Update the transform based on pan & zoom.
    model.when(["pan", "zoom"], function (pan, zoom) {
      g.attr("transform", "translate(" + pan + ")scale(" + zoom + ")");
    });

    // Update the polygons.
    model.when("countryFeatures", function (countryFeatures) {
      countries(countryFeatures).attr("d", path)

        // Default the fill to the missing data color.
        // This will be replaced later for all regions that have data.
        .attr("fill", missingDataFill);
    });

    model.when(["pan", "zoom", "countryFeatures", "box"], function (pan, zoom, countryFeatures, box) {
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
    model.when(["countryFeatures", "dataById", "colorField"], function (countryFeatures, dataById, colorField) {
      countries(countryFeatures)
        .attr("class", function(d) {
          return colorScale(dataById[d.id]);
        })
        .on("mouseover", function (d) {
          var html = d.id + "<br>" + colorField + ": " + format(Math.round(dataById[d.id] * 1000000000));
          tooltip.style("visibility", "visible").html(html);

          // Highlight the hovered geometry with the same color
          // used to highlight the line in the line chart.
          // TODO refactor this so the color is a model property
          // set by the main program.
          d3.select(this)
            .style("stroke", "#FF8800")
            .style("stroke-width", "1px");

          model.hoveredData = [d.id];
        })
        .on("mousemove", function () {
          tooltip
            .style("top", (event.pageY - 10) + "px")
            .style("left",(event.pageX + 10) + "px");
        })
        .on("mouseout", function () {
          tooltip.style("visibility", "hidden");
          model.hoveredData = [];
          d3.select(this)
            .style("stroke", "gray")
            .style("stroke-width", "0.1px");
        });
    });

    function countries(countryFeatures){
      var countries = countriesG.selectAll("path").data(countryFeatures);
      countries.enter().append("path")
        .style("stroke", "gray")
        .style("stroke-width", "0.1px");
      return countries;
    }

    return model;
  };
});

