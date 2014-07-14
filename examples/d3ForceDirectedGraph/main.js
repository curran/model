// A model driven force directed graph.
// Draws from http://bl.ocks.org/mbostock/4062045
// Curran Kelleher 4/30/2014
require(['d3', 'forceDirectedGraph'], function (d3, ForceDirectedGraph) {
  var div = document.getElementById('container'),
      forceDirectedGraph = ForceDirectedGraph(div);

  // Choose a random color scale periodically.
  setInterval(function () {
    forceDirectedGraph.color = [
      d3.scale.category20,
      d3.scale.category20b,
      d3.scale.category20c
    ][Math.floor(Math.random() * 3)];
  }, 1200);

  setInterval(function () {
    forceDirectedGraph.set({
      'charge': -120 + Math.random() * 50,
      'linkDistance': 30 + Math.random() * 20
    });
  }, 1600);

  d3.json('miserables.json', function(error, data) {

    forceDirectedGraph.data = data;

    setInterval(function () {
      var names = {};
      forceDirectedGraph.data = {
        nodes: data.nodes.filter(function(d){
          return Math.random() < 0.5 ? (names[d.name] = true) : false;
        }),
        links: data.links.filter(function(d){
          return names[d.source.name] && names[d.target.name];
        })
      };
    }, 3000);
  });

  setSizeFromDiv();
  window.addEventListener('resize', setSizeFromDiv);
  function setSizeFromDiv(){
    forceDirectedGraph.box = {
      x: 0,
      y: 0,
      width: div.clientWidth,
      height: div.clientHeight
    };
  }
});
