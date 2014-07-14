// A model driven force directed graph for automatic generation
// of data flow diagrams for reactive models. 
// 
// Draws from http://bl.ocks.org/mbostock/4062045
//
// Curran Kelleher 4/30/2014
// Updated 5/14/2014, 5/20/2014, 5/22/2014
define(['d3', 'model'], function (d3, Model) {
  return function (div){
    var model = Model(),
        force = d3.layout.force()
          .charge(-200)
          .linkDistance(140)
          .gravity(0.03),
        zoom = d3.behavior.zoom()
          .on('zoom', function (){
            model.scale = zoom.scale();
            model.translate = zoom.translate();
          }),
        svg = d3.select(div)
          .append('svg')
          .style('position', 'absolute')
          .call(zoom),

        // g is used for panning and zooming
        g = svg.append('g'),

        // These 3 groups exist for control of Z-ordering.
        nodeG = g.append('g'),
        linkG = g.append('g'),
        arrowG = g.append('g'),

        // The size of nodes and arrows
        nodeSize = 20,
        arrowWidth = 8;
    
    model.when(['scale', 'translate'], function (scale, translate) {

      // In the case the scale and translate were set externally,
      if(zoom.scale() !== scale){

        // update the internal D3 zoom state.
        zoom.scale(scale);
        zoom.translate(translate);
      }

      g.attr('transform', 'translate(' + translate + ')scale(' + scale + ')');
    });

    // Stop propagation of drag events here so that both
    // dragging nodes and panning are possible.
    // Draws from http://stackoverflow.com/questions/17953106/why-does-d3-js-v3-break-my-force-graph-when-implementing-zooming-when-v2-doesnt/17976205#17976205
    force.drag().on('dragstart', function () {
      d3.event.sourceEvent.stopPropagation();
    });

    force.drag().on('dragend', function () {
      var graph = model.data,
          nodes = graph.nodes;

      nodes.forEach(function (d) { d.fixed = true; });

      // Reassign the data to trigger writing to the server.
      model.data = graph;
    });
    
    // Arrowhead setup.
    // Draws from Mobile Patent Suits example:
    // http://bl.ocks.org/mbostock/1153292
    svg.append('defs')
      .append('marker')
        .attr('id', 'arrow')
        .attr('orient', 'auto')
        .attr('preserveAspectRatio', 'none')
        // See also http://www.w3.org/TR/SVG/coords.html#ViewBoxAttribute
        //.attr('viewBox', '0 -' + arrowWidth + ' 10 ' + (2 * arrowWidth))
        .attr('viewBox', '0 -5 10 10')
        // See also http://www.w3.org/TR/SVG/painting.html#MarkerElementRefXAttribute
        .attr('refX', 10)
        .attr('refY', 0)
        .attr('markerWidth', 10)
        .attr('markerHeight', arrowWidth)
      .append('path')
        .attr('d', 'M0,-5L10,0L0,5');

    model.color = d3.scale.ordinal()
      .domain(['property', 'lambda'])
      .range(['FFD1B5', 'white']);

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
      link.enter().append('line').attr('class', 'link')
      link.exit().remove();

      arrow = arrowG.selectAll('.arrow').data(graph.links);
      arrow.enter().append('line')
        .attr('class', 'arrow')
        .attr('marker-end', function(d) { return 'url(#arrow)' });
      arrow.exit().remove();

      node = nodeG.selectAll('g').data(graph.nodes);

      var nodeEnter = node.enter().append('g').call(force.drag);
      nodeEnter.append('rect')
        .attr('class', 'node')
        .attr('y', -nodeSize)
        .attr('height', nodeSize * 2)
        .attr('rx', nodeSize)
        .attr('ry', nodeSize);
      nodeEnter.append('text')
        .attr('class', 'nodeLabel');

      node.select('g text')
        .text(function(d) {
          return (d.type === 'property' ? d.name : 'λ');
        })
        /* Center text vertically */
        .attr('dy', function(d) {
          if(d.type === 'lambda'){
            return '0.35em';
          } else {
            return '0.3em';
          }
        })
        .each(function (d) {
          var circleWidth = nodeSize * 2,
              textLength = this.getComputedTextLength(),
              textWidth = textLength + nodeSize;

          if(circleWidth > textWidth) {
            d.isCircle = true;
            d.rectX = -nodeSize;
            d.rectWidth = circleWidth;
          } else {
            d.isCircle = false;
            d.rectX = -(textLength + nodeSize) / 2;
            d.rectWidth = textWidth;
            d.textLength = textLength;
          }
        });

      node.select('g rect')
        .style('fill', function(d) { return color(d.type); })
        .attr('x', function(d) { return d.rectX; })
        .attr('width', function(d) { return d.rectWidth; });
      node.exit().remove();

      force.on('tick', function(e) {

        // Execute left-right constraints
        var k = 1 * e.alpha;
        force.links().forEach(function (link) {
          var a = link.source,
              b = link.target,
              dx = b.x - a.x,
              dy = b.y - a.y,
              d = Math.sqrt(dx * dx + dy * dy),
              x = (a.x + b.x) / 2;
          if(!a.fixed){
            a.x += k * (x - d / 2 - a.x);
          }
          if(!b.fixed){
            b.x += k * (x + d / 2 - b.x);
          }
        });
        force.nodes().forEach(function (d) {
          if(d.isCircle){
            d.leftX = d.rightX = d.x;
          } else {
            d.leftX =  d.x - d.textLength / 2 + nodeSize / 2;
            d.rightX = d.x + d.textLength / 2 - nodeSize / 2;
          }
        });

        link.call(edge);
        arrow.call(edge);

        node.attr('transform', function(d) {      
          return 'translate(' + d.x + ',' + d.y + ')';
        });
      });
    });

    // Sets the (x1, y1, x2, y2) line properties for graph edges.
    function edge(selection){
      selection
        .each(function (d) {
          var sourceX, targetX, dy, dy, angle;

          if( d.source.rightX < d.target.leftX ){
            sourceX = d.source.rightX;
            targetX = d.target.leftX;
          } else if( d.target.rightX < d.source.leftX ){
            targetX = d.target.rightX;
            sourceX = d.source.leftX;
          } else if (d.target.isCircle) {
            targetX = sourceX = d.target.x;
          } else if (d.source.isCircle) {
            targetX = sourceX = d.source.x;
          } else {
            targetX = sourceX = (d.source.x + d.target.x) / 2;
          }

          dx = targetX - sourceX;
          dy = d.target.y - d.source.y;
          angle = Math.atan2(dx, dy);

          d.sourceX = sourceX + Math.sin(angle) * nodeSize;
          d.targetX = targetX - Math.sin(angle) * nodeSize;
          d.sourceY = d.source.y + Math.cos(angle) * nodeSize;
          d.targetY = d.target.y - Math.cos(angle) * nodeSize;
        })
        .attr('x1', function(d) { return d.sourceX; })
        .attr('y1', function(d) { return d.sourceY; })
        .attr('x2', function(d) { return d.targetX; })
        .attr('y2', function(d) { return d.targetY; });
    }

    return model;
  };
});
