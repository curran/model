// A model driven force directed graph.
// Draws from http://bl.ocks.org/mbostock/4062045
// Curran Kelleher 4/30/2014
define(['d3', 'model'], function (d3, Model) {
  return function (div){
    var model = Model(),
        force = d3.layout.force(),
        svg = d3.select(div).append('svg').style('position', 'absolute'),
        linkG = svg.append('g'),
        nodeG = svg.append('g');

    model.set({
      color: d3.scale.category20(),
      charge: -120,
      linkDistance: 30
    });

    model.when(['charge', 'linkDistance'], function (charge, linkDistance) {
      force
        .charge(charge)
        .linkDistance(linkDistance)
        .start();
    });
    
    model.when('box', function (box) {
      svg.attr('width', box.width).attr('height', box.height);
      svg.style('left', box.x + 'px').style('top', box.y + 'px')
      force.size([box.width, box.height]);
    });

    model.when(['data', 'color'], function (graph, color){
      var link, node;

      force
        .nodes(graph.nodes)
        .links(graph.links)
        .start();

      link = linkG.selectAll('.link').data(graph.links);
      link.enter().append('line').attr('class', 'link');
      link.style('stroke-width', function(d) { return Math.sqrt(d.value); });
      link.exit().remove();

      node = nodeG.selectAll('.node').data(graph.nodes);
      node.enter().append('circle')
        .attr('class', 'node')
        .attr('r', 5)
        .append('title');
      node
        .style('fill', function(d) { return color(d.group); })
        .call(force.drag);
      node.exit().remove();
      node.select('title').text(function(d) { return d.name; });

      force.on('tick', function() {
        link.attr('x1', function(d) { return d.source.x; })
            .attr('y1', function(d) { return d.source.y; })
            .attr('x2', function(d) { return d.target.x; })
            .attr('y2', function(d) { return d.target.y; });

        node.attr('cx', function(d) { return d.x; })
            .attr('cy', function(d) { return d.y; });
      });
    });

    return model;
  };
});
