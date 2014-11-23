// TODO
//
//  * use box instead of size
//  * grab UN population data
//  * grab natural earth country boundaries
require(["d3", "choropleth", "lineChart"], function (d3, Choropleth, LineChart) {
  var div = document.getElementById("container"),
      choropleth = Choropleth(div),
      lineChart = LineChart(div);

  choropleth.set({
    idField: "country",
    colorField: "population"
  });

  lineChart.set({
    xField: "date",
    yField: "population",
    idField: "country",
    yLabel: "Population (bn)",
    margin: {
      top: 20,
      right: 20,
      bottom: 30,
      left: 40
    }
  });

  d3.json("countries.json", function (err, countries) {
    var naturalEarthToUnitedNations = {
          "United States": "United States of America",
          "Solomon Is.": "Solomon Islands",
          "Russia": "Russian Federation",
          "Iran": "Iran (Islamic Republic of)",
          "Dem. Rep. Congo": "Democratic Republic of the Congo",
          "Venezuela": "Venezuela (Bolivarian Republic of)",
          "Dominican Rep.": "Dominican Republic",
          "Bolivia": "Bolivia (Plurinational State of)",
          "Côte d\"Ivoire": "C�te d\"Ivoire",
          "Tanzania": "United Republic of Tanzania",
          "Central African Rep.": "Central African Republic",
          "S. Sudan": "South Sudan",
          "Eq. Guinea": "Equatorial Guinea",
          "W. Sahara": "Western Sahara",
          "Syria": "Syrian Arab Republic",
          "Vietnam": "Viet Nam",
          "Czech Rep.": "Czech Republic",
          "Bosnia and Herz.": "Bosnia and Herzegovina",
          "Macedonia": "TFYR Macedonia",
          "Moldova": "Republic of Moldova",
          "Palestine": "State of Palestine",
          "Lao PDR": "Lao People\"s Democratic Republic",
          "Dem. Rep. Korea": "Dem. People\"s Republic of Korea",
          "Korea": "Republic of Korea",
          "Brunei": "Brunei Darussalam"
        },
        geoms = countries.objects.countriesGeoJSON.geometries;
    geoms.forEach(function (d) {
      var id = d.properties.name;
      d.id = naturalEarthToUnitedNations[id] || id;
    });
    choropleth.countries = countries;
  });

  d3.csv("un_locations.csv", function (error, locations) {
    var countryNamesByCode = {}

    locations.forEach(function (d) {
      if(d.locationTypeName == "Country/Area"){
        countryNamesByCode[d.unCountryCode] = d.countryName;
      }
    });

    d3.csv("un_population.csv", function(error, data) {
      data = data.filter(function (d) {
        d.date = new Date(d.year, 0);
        d.population = (+d.population) / 1000000;
        d.country = countryNamesByCode[d.countryCode];
        return d.country;
      });

      lineChart.data = data;

      lineChart.selectedYear = d3.max(data, function (d) {
        return d.date.getFullYear();
      });

      lineChart.when("selectedYear", function (selectedYear) {
        choropleth.data = data.filter(function (d) {
          return d.date.getFullYear() == selectedYear;
        });
      });

      choropleth.when("visibleRegions", function (visibleRegions) {
        var visibleCountries = {};
        visibleRegions.forEach(function (d) {
          visibleCountries[d.id] = true;
        });
        lineChart.data = data.filter(function (d) {
          return visibleCountries[d.country];
        });
      });

      choropleth.when("hoveredData", function (hoveredData) {
        lineChart.highlightedData = hoveredData;
      });
    });
  });

  setSizes();
  window.addEventListener("resize", setSizes);
  function setSizes(){
    var ratio = 2 / 3;
    choropleth.box = {
      x: 0,
      y: 0,
      width: div.clientWidth,
      height: div.clientHeight * ratio
    };

    lineChart.box = {
      x: 0,
      y: div.clientHeight * ratio,
      width: div.clientWidth,
      height: div.clientHeight * (1 - ratio)
    };
  }

});
