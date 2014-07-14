// Unit tests for `model.js`.
//
// By Curran Kelleher July 2014
var requirejs = require('requirejs'),
    expect = require('chai').expect,
    fs = require('fs'),
    writeDataFlowFiles = false;

// Point require.js to the built model.js source.
requirejs.config({ baseUrl: 'dist' });

// Detects the model dependency graph then
// writes the graph to disk for later visualization.
function outputDataFlowGraph(name, model){
  if(writeDataFlowFiles){
    model.detectFlowGraph(function (graph) {
      var json = JSON.stringify(graph, null, 2);
      fs.writeFile('./dataFlowGraphs/' + name + '.json', json, function(err) {
        if(err) console.log(err);
      }); 
    });
  }
}

describe('model', function() {

  var Model = requirejs('model');

  it('should create a model and listen for changes to a single property', function(done) {

    // Create a new model by calling `Model()`.
    var model = Model();

    // Listen for changes on x using `model.when()`.
    model.when('x', function (x) {
      expect(x).to.equal(30);
      done();
    });

    // Set x to be 30, which triggers the callback.
    model.x = 30;

    // Values in the model can be accessed like plain JS object properties.
    expect(model.x).to.equal(30);
  });

  // `model.when()` calls the callback for existing values.
  it('should call fn once to initialize', function(done) {
    var model = Model();
    model.x = 55;
    model.when('x', function (x) {
      expect(x).to.equal(55);
      done();
    });
  });

  // An array of dependencies can be passed to `when()`,
  // and the values from the model are passed to the callback.
  it('should call fn with multiple dependency properties', function(done) {
    var model = Model();
    model.when(['x', 'y', 'z'], function (x, y, z) {
      expect(x).to.equal(5);
      expect(y).to.equal(6);
      expect(z).to.equal(7);
      done();
    });
    model.x = 5;
    model.y = 6;
    model.z = 7;
  });

  // Model values are passed as arguments to the callback
  // in the order specified in the dependencies array. 
  it('should call fn with multiple dependency properties in the order specified', function(done) {
    var model = Model();
    model.when(['y', 'x', 'z'], function (y, x, z) {
      expect(x).to.equal(5);
      expect(y).to.equal(6);
      expect(z).to.equal(7);
      done();
    });
    model.x = 5;
    model.y = 6;
    model.z = 7;
  });

  // Multiple properties can be set simultaneously by
  // passing an object to `model.set`.
  it('should set values from an object', function(done) {
    var model = Model();
    model.when(['y', 'x', 'z'], function (y, x, z) {
      expect(x).to.equal(5);
      expect(y).to.equal(6);
      expect(z).to.equal(7);
      done();
    });
    model.set({
      x: 5,
      y: 6,
      z: 7
    });
  });

  // The callback is not called until all dependency values are defined.
  it('should call fn only when all properties are defined', function(done) {
    var model = Model();
    model.when(['y', 'x', 'z'], function (y, x, z) {
      expect(x).to.equal(5);
      expect(y).to.equal(6);
      expect(z).to.equal(7);
      done();
    });
    model.set({ x: 5, y: 6 });
    setTimeout(function () {
      model.z = 7;
    }, 10);
  });

  // Multiple changes on a property that happen in sequence
  // cause the `when` callback to be executed only once.
  it('should call fn only once for multiple updates', function(done) {
    var model = Model();
    model.when('x', function (x) {
      expect(x).to.equal(30);
      done();
    });
    model.x = 10;
    model.x = 20;
    model.x = 30;
  });

  it('should call fn with multiple dependency properties only once after several updates', function(done) {
    var model = Model();
    model.when(['x', 'y', 'z'], function (x, y, z) {
      expect(x).to.equal(5);
      expect(y).to.equal(6);
      expect(z).to.equal(7);
      done();
    });
    model.x = 5;
    model.y = 6;
    model.z = 5;
    model.z = 6;
    model.z = 7;
  });

  // Properties can be set in the model in the body of a `when()` callback.
  // This pattern can be used to define a data dependency graph
  // using a functional reactive style. The model system automatically propagates changes
  // through the data dependency graph. This is similar to computed properties in Ember.js.
  //
  // <iframe src="../examples/dataFlowDiagram/#fullName" width="450" height="200" frameBorder="0"></iframe>
  it('should compute fullName from firstName and lastName', function(done) {
    var model = Model();

    model.when(['firstName', 'lastName'], function (firstName, lastName) {
      model.fullName = firstName + ' ' + lastName;
    });

    model.when('fullName', function (fullName) {
      expect(fullName).to.equal('John Doe');
      done();
    });

    outputDataFlowGraph('fullName', model);

    model.firstName = 'John';
    model.lastName = 'Doe';
  });

  // <iframe src="../examples/dataFlowDiagram/#twoHops" width="450" height="200" frameBorder="0"></iframe>
  it('should propagate changes two hops through a data dependency graph', function(done) {
    var model = Model();
    model.when(['x'], function (x) {
      model.y = x + 1;
    });
    model.when(['y'], function (y) {
      expect(y).to.equal(11);
      model.z = y * 2;
    });
    model.when(['z'], function (z) {
      expect(z).to.equal(22);
      done();
    });

    outputDataFlowGraph('twoHops', model);

    model.x = 10;
  });

  // <iframe src="../examples/dataFlowDiagram/#threeHops" width="450" height="200" frameBorder="0"></iframe>
  it('should propagate changes three hops through a data dependency graph', function(done) {
    var model = Model();
    model.when(['w'], function (w) {
      expect(w).to.equal(5);
      model.x = w * 2;
    });
    model.when(['x'], function (x) {
      expect(x).to.equal(10);
      model.y = x + 1;
    });
    model.when(['y'], function (y) {
      expect(y).to.equal(11);
      model.z = y * 2;
    });
    model.when(['z'], function (z) {
      expect(z).to.equal(22);
      done();
    });

    outputDataFlowGraph('threeHops', model);

    model.w = 5;
  });

  // An additional argument can be passed to `when`,
  // which will be the value of `this` in the callback function.
  it('should use thisArg', function(done) {
    var model = Model(),
        theThing = { foo: "bar" };
    model.when('x', function (x) {
      expect(x).to.equal(5);
      expect(this).to.equal(theThing);
      expect(this.foo).to.equal("bar");
      done();
    }, theThing);
    model.x = 5;
  });

  // Updates through a data dependency graph propagate in a
  // breadth-first manner.
  //
  // When "a" changes, "f" should update once only, after the changes propagated
  // through the following two paths simultaneously:
  // 
  //  * a -> b -> d -> f
  //  * a -> c -> e -> f
  //
  // <iframe src="../examples/dataFlowDiagram/#breadthFirst" width="450" height="200" frameBorder="0"></iframe>
  it('should propagate changes in breadth first iterations', function (done) {
    var model = Model();

    /* a -> (b, c) */
    model.when('a', function (a) {
      model.set({ b: a + 1, c: a + 2 });
    }); 

    /* b -> d */
    model.when('b', function (b) {
      model.d = b + 1;
    });

    /* c -> e */
    model.when('c', function (c) {
      model.e = c + 1;
    });

    /* (d, e) -> f */
    model.when(['d', 'e'], function (d, e) { 
      model.f = d + e;
    });

    model.when('f', function (f) {
      expect(f).to.equal(15);
      done();
    });
    
    outputDataFlowGraph('breadthFirst', model);

    model.a = 5;
  });

  it('should remove listeners', function(done) {
    var model = Model(),
        xValue,
        listener = model.when('x', function (x) {
          xValue = x;
        });
    model.x = 5;
    setTimeout(function () {
      expect(xValue).to.equal(5);
      model.removeListener(listener);
      model.x = 6;
      setTimeout(function () {
        expect(xValue).to.equal(5);
        done();
      }, 0);
    }, 0);
  });

  it('should cancel multiple listeners separately', function(done) {
    var model = Model(),
        xValue,
        yValue,
        xListener = model.when('x', function (x) { xValue = x; }),
        yListener = model.when('y', function (y) { yValue = y; });
    model.x = 5;
    model.y = 10;
    setTimeout(function () {
      expect(xValue).to.equal(5);
      expect(yValue).to.equal(10);
      model.removeListener(xListener);
      model.x = 6;
      model.y = 11;
      setTimeout(function () {
        expect(xValue).to.equal(5);
        expect(yValue).to.equal(11);
        model.removeListener(yListener);
        model.x = 7;
        model.y = 12;
        setTimeout(function () {
          expect(xValue).to.equal(5);
          expect(yValue).to.equal(11);
          done();
        }, 0);
      }, 0);
    }, 0);
  });

  // <iframe src="../examples/dataFlowDiagram/#simple" width="450" height="200" frameBorder="0"></iframe>
  it('should detect a flow graph', function(done) {
    var model = Model();
    model.when('x', function (x) {
      model.y = x * 2;
    });

    // The changed properties must be tracked
    // by calling `when` in order for flow detection to work.
    model.when('y', function (y) {});

    model.detectFlowGraph(function (graph) {
      var xId, yId, lambdaId;

      //console.log(JSON.stringify(graph, null, 2));
      expect(graph.nodes.length).to.equal(3);
      expect(graph.links.length).to.equal(2);

      graph.nodes.forEach(function (node) {
        if(node.type === 'lambda') {
          lambdaId = node.index;
        } else if(node.type === 'property') {
          if(node.name === 'x') {
            xId = node.index;
          } else if(node.name === 'y') {
            yId = node.index;
          }
        }
      });

      graph.links.forEach(function (link) {
        if(link.source === xId){
          expect(link.target).to.equal(lambdaId);
        } else if(link.source === lambdaId){
          expect(link.target).to.equal(yId);
        }
      });

      // Detect the flow graph again
      // and output the file for later visualization.
      outputDataFlowGraph('simple', model);
      model.x = 10;

      done();
    });

    model.x = 5;
  });
});
