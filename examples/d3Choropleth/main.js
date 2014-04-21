require(['d3', 'choropleth'], function (d3, Choropleth) {
  var div = document.getElementById('choroplethContainer'),
      choropleth = Choropleth(div);

  d3.json('us.json', function (err, us) {
    choropleth.set('us', us);
  });

  d3.tsv('unemployment.tsv', function (err, unemployment) {
    choropleth.set('unemployment', unemployment);
  });
});
