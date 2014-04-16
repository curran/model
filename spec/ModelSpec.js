// An example Jasmine unit test suite.
// See also http://stackoverflow.com/questions/19240302/does-jasmine-2-0-really-not-work-with-require-js/22702118#22702118
describe('model', function() {
  var Model;

  // Use require.js to fetch the module
  it("should load the AMD module", function(done) {
    require(['model'], function (loadedModule) {
      Model = loadedModule;
      done();
    });
  });

  //run tests that use the myModule object
  it("can create a model and listen for changes to a single property", function(done) {

    // Create a new model.
    var model = Model();

    // Create a callback for the X property.
    function listenX(x){
      // The new value is passed to the callback.
      expect(x).toBe(30);

      done();
    }

    // Add callbacks as observers to the model.
    model.on('x', listenX);

    // Set values of X and Y.
    model.set('x', 30); // prints "x changed to 30"
  });
});
