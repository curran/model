require(['d3', 'scatterPlot', 'barChart'], function (d3, ScatterPlot, BarChart) {
  var div = document.getElementById('container'),
      scatterPlot = ScatterPlot(div),
      barChart = BarChart(div);

  scatterPlot.set({
    xField: 'sepalWidth',
    yField: 'sepalLength',
    xLabel: 'Sepal Width (cm)',
    yLabel: 'Sepal Width (cm)',
    margin: { 'top': 20, 'right': 20, 'bottom': 30, 'left': 40 }
  });

  barChart.set({
    barField: 'species',
    heightField: 'count',
    yLabel: 'number of irises',
    margin: { 'top': 20, 'right': 20, 'bottom': 30, 'left': 40 }
  });

  scatterPlot.when('selectedData', function (scatterData) {

    // Aggregate scatter plot data by counting 
    // the number of irises for each species.
    var speciesCounts = {},
        barData = [];
    scatterData.forEach(function (d) {
      if(!speciesCounts[d.species]){
        speciesCounts[d.species] = 0;
      }
      speciesCounts[d.species]++;
    });
    barData = Object.keys(speciesCounts).map(function (species) {
      return {
        species: species,
        count: speciesCounts[species]
      };
    });

    // Update the bar chart with the aggregated data.
    barChart.set('data', barData);
  });

  d3.tsv('data.tsv', function (d) {
    d.sepalLength = +d.sepalLength;
    d.sepalWidth = +d.sepalWidth;
    return d;
  }, function(error, data) {

    // Set size once to initialize
    setSizes();

    // Set size on resize
    window.addEventListener('resize', setSizes);

    // Set the data
    scatterPlot.set('data', data);
  });

  function setSizes(){
    scatterPlot.set('box', {
      x: 0,
      y: 0,
      width: div.clientWidth / 2,
      height: div.clientHeight
    });
    barChart.set('box', {
      x: div.clientWidth / 2,
      y: 0,
      width: div.clientWidth / 2,
      height: div.clientHeight
    });
  }
});
