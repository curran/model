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
});
