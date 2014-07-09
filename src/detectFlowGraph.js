define([], function () {
  return function (callback){

    // Keeps track of which lambdas have been seen.
    var nodes = {},
        links = [];

    function propertyNode(name) {
      return nodes[name] || (nodes[name] = {
        type: 'property',
        name: name
      });
    }

    // Records a collection of nodes and edges in the
    // flow graph created by a single "when" callback.
    recordLambda = function (dependencies, changedProperties) {
      var key = dependencies.join(',') + '|' + changedProperties.join(','),
          lambda = nodes[key];
      if(!lambda && changedProperties.length > 0){
        lambda = nodes[key] = { type: 'lambda' };
        dependencies.forEach(function (property) {
          links.push({
            source: propertyNode(property),
            target: lambda
          });
        });
        changedProperties.forEach(function (property) {
          links.push({
            source: lambda,
            target: propertyNode(property)
          });
        });
      }
    };
    
    setTimeout(function () {
      callback({
        nodes: Object.keys(nodes).map(function (key, i) {
          var node = nodes[key];
          node.index = i;
          return node;
        }),
        links: links.map(function (link) {
          return {
            source: link.source.index,
            target: link.target.index
          };
        })
      });
    }, 500);
  };
});
