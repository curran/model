// Loads the table and tests it with random data.
// Curran Kelleher 6/12/2014
require(['d3', 'table'], function (d3, Table) {
  var div = document.getElementById('container'),
      table = Table(div);

  // Fetch cars.csv
  d3.csv('cars.csv', function(error, data) {

    // Set the data
    setRandomData(data);

    // Reset data each second
    setInterval(function () {
      setRandomData(data);
    }, 1000);

  });

  // Sets a random sample of rows and columns on the table,
  // for checking that the table responds properly.
  function setRandomData(data){

    // Include each key with a small chance
    var randomKeys = Object.keys(data[0]).filter(function(d){
          return Math.random() < 0.5;
        }),

        // Make a copy of the objects with only the
        // random keys included.
        dataWithRandomKeys = data.map(function (d) {
          var e = {};
          randomKeys.forEach(function (key) {
            e[key] = d[key];
          });
          return e;
        }),

        // Include each element with a small chance
        randomSample = dataWithRandomKeys.filter(function(d){
          return Math.random() < 0.1;
        });

    // Update the table with the random data.
    table.set({
      data: randomSample,
      columns: randomKeys.map(function (key) {
        return {
          title: capitalize(key),
          property: key
        };
      })
    });
  }

  // From http://stackoverflow.com/questions/1026069/capitalize-the-first-letter-of-string-in-javascript
  function capitalize(string)
  {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
});
