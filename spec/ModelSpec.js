// Unit tests for the Model module.
// Curran Kelleher 4/15/2014
describe('model', function() {

  var Model;

  // Use require.js to fetch the module
  it("should load the AMD module", function(done) {
    require(['model'], function (loadedModule) {
      Model = loadedModule;
      done();
    });
  });

  it('should create a model and listen for changes to a single property', function(done) {

    // Create a new model.
    var model = Model();

    // Listen for changes on x.
    model.when('x', function (x) {
      expect(x).toBe(30);
      done();
    });

    // Set x.
    model.set('x', 30);
  });

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

  it('should call fn with multiple dependency properties in the order specified', function(done) {
    var model = Model();

    // Test changing the order
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

  it('should call fn once to initialize', function(done) {
    var model = Model();
    model.set('x', 55);
    model.when(['x'], function (x) {
      expect(x).toBe(55);
      done();
    });
  });

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
  // TODO add more starting from Ohm's Law
});
