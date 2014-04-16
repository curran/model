// Unit tests for `model.js` (using [Jasmine](http://jasmine.github.io/2.0/introduction.html)).
//
// [Run the unit tests](http://curran.github.io/model/SpecRunner.html)
describe('model', function() {

  var Model;

  // Use Require.js to fetch the AMD module.
  it("should load the AMD module", function(done) {
    require(['model'], function (loadedModule) {
      Model = loadedModule;
      done();
    });
  });

  it('should create a model and listen for changes to a single property', function(done) {

    // Create a new model by calling `Model()`.
    var model = Model();

    // Listen for changes on x using `model.when()`.
    model.when('x', function (x) {
      expect(x).toBe(30);
      done();
    });

    // Set x to be 30, which triggers the callback.
    model.set('x', 30);
  });

  // `model.when()` calls the callback for existing values,
  // even if they are not changed.
  it('should call fn once to initialize', function(done) {
    var model = Model();
    model.set('x', 55);
    model.when(['x'], function (x) {
      expect(x).toBe(55);
      done();
    });
  });

  // An array of dependencies can be passed to `when()`,
  // and the values from the model are passed to the callback
  // This is similar to the dependency injection syntax of Angular.js.
  it('should call fn with multiple dependency properties', function(done) {
    var model = Model();
    model.when(['x', 'y', 'z'], function (x, y, z) {
      expect(x).toBe(5);
      expect(y).toBe(6);
      expect(z).toBe(7);
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
      expect(x).toBe(5);
      expect(y).toBe(6);
      expect(z).toBe(7);
      done();
    });
    model.set('x', 5);
    model.set('y', 6);
    model.set('z', 7);
  });

  // Multiple properties can be set simultaneously by
  // passing an object to `model.set` (similar to Backbone).
  it('should set values from an object', function(done) {
    var model = Model();
    model.when(['x', 'y'], function (x, y) {
      expect(x).toBe(9);
      expect(y).toBe(7);
      done();
    });
    model.set({
      x: 9,
      y: 7
    });
  });

  // Multiple changes on a property that happen in sequence
  // cause the `when` callback to be executed only once.
  it('should call fn only once for multiple updates', function(done) {
    var model = Model();
    model.when('x', function (x) {
      expect(x).toBe(30);
      done();
    });
    model.set('x', 10);
    model.set('x', 20);
    model.set('x', 30);
  });

  it('should call fn with multiple dependency properties only once after several updates', function(done) {
    var model = Model();
    model.when(['x', 'y', 'z'], function (x, y, z) {
      expect(x).toBe(5);
      expect(y).toBe(6);
      expect(z).toBe(7);
      done();
    });
    model.set('x', 5);
    model.set('y', 6);
    model.set('z', 5);
    model.set('z', 6);
    model.set('z', 7);
  });

  // Properties can be set in the model in the body of a `when()` callback.
  // This pattern can be used to deflare a data dependency graph
  // using a functional reactive style. The model system automatically propagates changes
  // through the data dependency graph. This is similar to computed properties in Ember.js.
  it('should compute fullName from firstName and lastName', function(done) {
    var model = Model();
    model.when(['firstName', 'lastName'], function (firstName, lastName) {
      model.set('fullName', firstName + ' ' + lastName);
    });
    model.when('fullName', function (fullName) {
      expect(fullName).toBe('John Doe');
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
      expect(y).toBe(11);
      model.set('z', y * 2);
    });
    model.when(['z'], function (z) {
      expect(z).toBe(22);
      done();
    });
    model.set('x', 10);
  });

  it('should propagate changes three hops through a data dependency graph', function(done) {
    var model = Model();
    model.when(['w'], function (w) {
      expect(w).toBe(5);
      model.set('x', w * 2);
    });
    model.when(['x'], function (x) {
      expect(x).toBe(10);
      model.set('y', x + 1);
    });
    model.when(['y'], function (y) {
      expect(y).toBe(11);
      model.set('z', y * 2);
    });
    model.when(['z'], function (z) {
      expect(z).toBe(22);
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
      expect(x).toBe(5);
      expect(this).toBe(theThing);
      expect(this.foo).toBe("bar");
      done();
    }, theThing);
    model.set('x', 5);
  });
  // TODO add more starting from Ohm's Law
});
// By Curran Kelleher 4/16/2014
