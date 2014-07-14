require(['d3', 'forceDirectedGraph'], function (d3, ForceDirectedGraph) {

  // Grab the container div.
  var div = document.getElementById('container'),

      // Create the force directed graph visualization.
      forceDirectedGraph = ForceDirectedGraph(div),

      // Extract the name of the data flow graph file
      // from the URL hash, or use 'svg' by default.
      name = window.location.hash.substr(1),
      filename = '../../dataFlowGraphs/' + name + '.json';

  // Load the data flow graph file.
  d3.json(filename, function (graph) {

    // Set the data on the graph visualization.
    forceDirectedGraph.data = graph;

    // Extract the scale and translate from the saved data.
    if(graph.scale && graph.translate) {
      forceDirectedGraph.scale = graph.scale;
      forceDirectedGraph.translate = graph.translate;
    }

    // Whenever the user manually positions nodes,
    forceDirectedGraph.when(['data', 'scale', 'translate'], function (data, scale, translate) {

      // If the code is running in a development environment,
      if( window.location.host === 'localhost:8000') {

        // write the new positions to disk via the server.
        sendToServer({
          name: name,
          data: {
            nodes: data.nodes,
            // Restore indices so the data can be parsed properly later.
            links: data.links.map(function (d) {
              return {
                source: d.source.index,
                target: d.target.index
              };
            }),
            scale: scale,
            translate: translate
          }
        }); 
      }
    });
  });

  function sendToServer(json){

    // Draws from http://stackoverflow.com/questions/6418220/javascript-send-json-object-with-ajax
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', '/writeDataFlowGraph');
    xmlhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xmlhttp.send(JSON.stringify(json));
  }

  // initialize zoom
  var scale = div.clientWidth * 1 / 800;
  forceDirectedGraph.set({
    scale: scale,
    translate: [
      div.clientWidth / 2 * (1 - scale),
      div.clientHeight / 2 * (1 - scale)
    ]
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
