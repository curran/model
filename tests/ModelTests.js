// Unit tests for `model.js`.
//
// Read through this to learn how to use the library.
var requirejs = require('requirejs'),
    expect = require('chai').expect;

requirejs.config({
  baseUrl: 'dist',
  nodeRequire: require
});

describe('model', function() {

  var Model = requirejs('model');

  console.log(Model);

  it('should create a model and listen for changes to a single property', function(done) {

    // Create a new model by calling `Model()`.
    var model = Model();

    // Listen for changes on x using `model.when()`.
    model.when('x', function (x) {
      expect(x).to.equal(30);
      done();
    });

    // Set x to be 30, which triggers the callback.
    model.set('x', 30);

    // `model.get()` can be used to get a value from the model.
    expect(model.get('x')).to.equal(30);
  });

  // `model.when()` calls the callback for existing values.
  it('should call fn once to initialize', function(done) {
    var model = Model();
    model.set('x', 55);
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
    model.set('x', 5);
    model.set('y', 6);
    model.set('z', 7);
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
    model.set('x', 5);
    model.set('y', 6);
    model.set('z', 7);
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
      model.set('z', 7);
    }, 50);
  });

  // Multiple changes on a property that happen in sequence
  // cause the `when` callback to be executed only once.
  it('should call fn only once for multiple updates', function(done) {
    var model = Model();
    model.when('x', function (x) {
      expect(x).to.equal(30);
      done();
    });
    model.set('x', 10);
    model.set('x', 20);
    model.set('x', 30);
  });

  it('should call fn with multiple dependency properties only once after several updates', function(done) {
    var model = Model();
    model.when(['x', 'y', 'z'], function (x, y, z) {
      expect(x).to.equal(5);
      expect(y).to.equal(6);
      expect(z).to.equal(7);
      done();
    });
    model.set('x', 5);
    model.set('y', 6);

    model.set('z', 5);
    model.set('z', 6);
    model.set('z', 7);
  });

  // Properties can be set in the model in the body of a `when()` callback.
  // This pattern can be used to define a data dependency graph
  // using a functional reactive style. The model system automatically propagates changes
  // through the data dependency graph. This is similar to computed properties in Ember.js.
  it('should compute fullName from firstName and lastName', function(done) {
    var model = Model();
    model.when(['firstName', 'lastName'], function (firstName, lastName) {
      model.set('fullName', firstName + ' ' + lastName);
    });
    model.when('fullName', function (fullName) {
      expect(fullName).to.equal('John Doe');
      done();
    });
    model.set('firstName', 'John');
    model.set('lastName', 'Doe');
  });

  it('should propagate changes two hops through a data dependency graph', function(done) {
    var model = Model();
    model.when(['x'], function (x) {
      model.set('y', x + 1);
    });
    model.when(['y'], function (y) {
      expect(y).to.equal(11);
      model.set('z', y * 2);
    });
    model.when(['z'], function (z) {
      expect(z).to.equal(22);
      done();
    });
    model.set('x', 10);
  });

  it('should propagate changes three hops through a data dependency graph', function(done) {
    var model = Model();
    model.when(['w'], function (w) {
      expect(w).to.equal(5);
      model.set('x', w * 2);
    });
    model.when(['x'], function (x) {
      expect(x).to.equal(10);
      model.set('y', x + 1);
    });
    model.when(['y'], function (y) {
      expect(y).to.equal(11);
      model.set('z', y * 2);
    });
    model.when(['z'], function (z) {
      expect(z).to.equal(22);
      done();
    });
    model.set('w', 5);
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
    model.set('x', 5);
  });

  it('should propagate changes in breadth first iterations', function (done) {
    // Updates through a data dependency graph propagate in a
    // breadth-first manner.
    //
    // Here is a data dependency graph that can test this
    // (data flowing left to right):
    //```
    //   b  d
    // a      f
    //   c  e
    //```
    //
    // When "a" changes, "f" should update once only, after the changes propagated
    // through the following two paths simultaneously:
    // 
    //  * a -> b -> d -> f
    //  * a -> c -> e -> f
    var model = Model(),
        fWasSetTo25 = false;

    // a -> (b, c)
    model.when('a', function (a) {
      model.set({
        b: a + 1,
        c: a + 2
      });
    }); 

    // b -> d
    model.when('b', function (b) {
      model.set('d', b + 1);
    });

    // c -> e
    model.when('c', function (c) {
      model.set('e', c + 1);
    });

    // (d, e) -> f
    model.when(['d', 'e'], function (d, e) { 
      model.set('f', d + e);
    });

    model.when('f', function (f) {
      if(f == 15){
        model.set('a', 10);
      } else {
        if(fWasSetTo25) {
          throw new Error('f set to 25 more than once.');
        }
        expect(f).to.equal(25);
        fWasSetTo25 = true;
        done();
      }
    });
    model.set('a', 5);
  });

  // `when` callbacks can be removed using `cancel`.
  it('should cancel a single callback', function(done) {
    var model = Model(),
        xValue,
        whens = model.when('x', function (x) {
          xValue = x;
        });
    model.set('x', 5);
    setTimeout(function () {
      expect(xValue).to.equal(5);
      model.cancel(whens);
      model.set('x', 6);
      setTimeout(function () {
        expect(xValue).to.equal(5);
        done();
      }, 0);
    }, 0);
  });

  it('should cancel multiple callbacks', function(done) {
    var model = Model(),
        xValue,
        yValue,
        whens = model.when('x', function (x) { xValue = x; })
                     .when('y', function (y) { yValue = y; });
    model.set('x', 5);
    model.set('y', 10);
    setTimeout(function () {
      expect(xValue).to.equal(5);
      expect(yValue).to.equal(10);
      model.cancel(whens);
      model.set('x', 6);
      model.set('y', 11);
      setTimeout(function () {
        expect(xValue).to.equal(5);
        expect(yValue).to.equal(10);
        done();
      }, 0);
    }, 0);
  });
  it('should cancel callbacks independently', function(done) {
    var model = Model(),
        xValue,
        yValue,
        whenX = model.when('x', function (x) { xValue = x; }),
        whenY = model.when('y', function (y) { yValue = y; });
    model.set('x', 5);
    setTimeout(function () {
      expect(xValue).to.equal(5);
      model.cancel(whenX);
      model.set('x', 6);
      model.set('y', 10);
      setTimeout(function () {
        expect(xValue).to.equal(5);
        expect(yValue).to.equal(10);
        model.cancel(whenY);
        model.set('x', 7);
        model.set('y', 11);
        setTimeout(function () {
          expect(xValue).to.equal(5);
          expect(yValue).to.equal(10);
          done();
        }, 0);
      }, 0);
    }, 0);
  });
});
// By Curran Kelleher 4/25/2014
