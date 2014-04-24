// Curran Kelleher 4/24/2014
require(['d3', 'parallelCoordinates'], function (d3, ParallelCoordinates) {
  var div = document.getElementById('parallelCoordinatesContainer'),
      parallelCoordinates = ParallelCoordinates(div);

  parallelCoordinates.set('margin', { top: 20, right: 20, bottom: 30, left: 40 });

  d3.csv('cars.csv', function(error, data) {

    // Set the data
    parallelCoordinates.set('data', data);

    // Reset data each second
    setInterval(function () {
      var randomKeys = Object.keys(data[0]).filter(function(d){
            return Math.random() < 0.7;
          }),

          dataWithRandomKeys = data.map(function (d) {
            var e = {};
            randomKeys.forEach(function (key) {
              e[key] = d[key];
            });
            return e;
          }),

          // Include each element with a 50% chance.
          randomSample = dataWithRandomKeys.filter(function(d){
            return Math.random() < 0.1;
          });

      parallelCoordinates.set('data', randomSample);
    }, 1000);
  });

  // Set size once to initialize
  setSizeFromDiv();

  // Set size on resize
  window.addEventListener('resize', setSizeFromDiv);

  function setSizeFromDiv(){
    parallelCoordinates.set('size', {
      width: div.clientWidth,
      height: div.clientHeight
    });
  }
});
