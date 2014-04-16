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

  it("can create a model and listen for changes to a single property", function(done) {

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
});
