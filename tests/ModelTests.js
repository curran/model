// Unit tests for `model.js`.
//
// Curran Kelleher March 2015
var requirejs = require("requirejs"),
    expect = require("chai").expect,
    fs = require("fs"),
    writeDataFlowFiles = false;

// Point require.js to the built model.js source.
requirejs.config({ baseUrl: "dist" });

describe("model", function() {

  // Load the library as an AMD module.
  var ModelFromRequireJS = requirejs("../dist/model");

  // Load the library as a CommonJS module.
  var ModelFromCommonJS = require("../dist/model");

  // Do some tests with the RequireJS version.
  var Model = ModelFromRequireJS;

  it("should be a Model instance", function() {

    // Create a new model by calling `Model()`.
    var model = Model();

    // Values in the model can be accessed like plain JS object properties.
    expect(model instanceof Model).to.equal(true);
  });

  it("should create a model and listen for changes to a single property", function(done) {

    // Create a new model by calling `Model()`.
    var model = Model();

    // Listen for changes on x using `model.when()`.
    model.when("x", function (x) {
      expect(x).to.equal(30);
      done();
    });

    // Set x to be 30, which triggers the callback.
    model.x = 30;

    // Values in the model can be accessed like plain JS object properties.
    expect(model.x).to.equal(30);
  });

  // `model.when()` calls the callback for existing values.
  it("should call fn once to initialize", function(done) {
    var model = Model();
    model.x = 55;
    model.when("x", function (x) {
      expect(x).to.equal(55);
      done();
    });
  });

  // An array of dependencies can be passed to `when()`,
  // and the values from the model are passed to the callback.
  it("should call fn with multiple dependency properties", function(done) {
    var model = Model();
    model.when(["x", "y", "z"], function (x, y, z) {
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
  it("should call fn with multiple dependency properties in the order specified", function(done) {
    var model = Model();
    model.when(["y", "x", "z"], function (y, x, z) {
      expect(x).to.equal(5);
      expect(y).to.equal(6);
      expect(z).to.equal(7);
      done();
    });
    model.x = 5;
    model.y = 6;
    model.z = 7;
  });

  // Do some tests with the CommonJS version to make sure it works.
  Model = ModelFromCommonJS;

  // Multiple properties can be set simultaneously by
  // passing an object to `model.set`.
  it("should set values from an object", function(done) {
    var model = Model();
    model.when(["y", "x", "z"], function (y, x, z) {
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
  it("should call fn only when all properties are defined", function(done) {
    var model = Model();
    model.when(["y", "x", "z"], function (y, x, z) {
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
  it("should call fn only once for multiple updates", function(done) {
    var model = Model();
    model.when("x", function (x) {
      expect(x).to.equal(30);
      done();
    });
    model.x = 10;
    model.x = 20;
    model.x = 30;
  });

  it("should call fn with multiple dependency properties only once after several updates", function(done) {
    var model = Model();
    model.when(["x", "y", "z"], function (x, y, z) {
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
  it("should compute fullName from firstName and lastName", function(done) {
    var model = Model();

    model.when(["firstName", "lastName"], function (firstName, lastName) {
      model.fullName = firstName + " " + lastName;
    });

    model.when("fullName", function (fullName) {
      expect(fullName).to.equal("John Doe");
      done();
    });

    model.firstName = "John";
    model.lastName = "Doe";
  });

  it("should propagate changes two hops through a data dependency graph", function(done) {
    var model = Model();
    model.when(["x"], function (x) {
      model.y = x + 1;
    });
    model.when(["y"], function (y) {
      expect(y).to.equal(11);
      model.z = y * 2;
    });
    model.when(["z"], function (z) {
      expect(z).to.equal(22);
      done();
    });

    model.x = 10;
  });

  it("should propagate changes three hops through a data dependency graph", function(done) {
    var model = Model();
    model.when(["w"], function (w) {
      expect(w).to.equal(5);
      model.x = w * 2;
    });
    model.when(["x"], function (x) {
      expect(x).to.equal(10);
      model.y = x + 1;
    });
    model.when(["y"], function (y) {
      expect(y).to.equal(11);
      model.z = y * 2;
    });
    model.when(["z"], function (z) {
      expect(z).to.equal(22);
      done();
    });

    model.w = 5;
  });

  // An additional argument can be passed to `when`,
  // which will be the value of `this` in the callback function.
  it("should use thisArg", function(done) {
    var model = Model(),
        theThing = { foo: "bar" };
    model.when("x", function (x) {
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
  it("should propagate changes in breadth first iterations", function (done) {
    var model = Model();

    /* a -> (b, c) */
    model.when("a", function (a) {
      model.set({ b: a + 1, c: a + 2 });
    });

    /* b -> d */
    model.when("b", function (b) {
      model.d = b + 1;
    });

    /* c -> e */
    model.when("c", function (c) {
      model.e = c + 1;
    });

    /* (d, e) -> f */
    model.when(["d", "e"], function (d, e) {
      model.f = d + e;
    });

    model.when("f", function (f) {
      expect(f).to.equal(15);
      done();
    });

    model.a = 5;
  });

  it("should support model.on", function() {
    var model = Model({ x: 4 });
    model.on("x", function(newValue, oldValue){
      expect(newValue).to.equal(5);
      expect(oldValue).to.equal(4);
      expect(this).to.equal(model);
    });
    model.x = 5;
  });

  it("should support model.on with thisArg", function() {
    var model = Model(),
        that = { foo: "bar" };
    model.on("x", function(newValue, oldValue){
      expect(this.foo).to.equal("bar");
    }, that);
    model.x = 5;
  });

  it("should support model.off", function() {
    var model = Model(),
        invocationCount = 0,
        callback = function(newValue, oldValue){
          invocationCount++;
        };
    model.on("x", callback);
    model.x = 5;
    expect(invocationCount).to.equal(1);
    model.x = 6;
    expect(invocationCount).to.equal(2);
    model.off("x", callback);
    model.x = 7;
    expect(invocationCount).to.equal(2);
  });

  it("should cancel listeners", function(done) {
    var model = Model(),
        xValue,
        listener = model.when("x", function (x) {
          xValue = x;
        });
    model.x = 5;
    setTimeout(function () {
      expect(xValue).to.equal(5);
      model.cancel(listener);
      model.x = 6;
      setTimeout(function () {
        expect(xValue).to.equal(5);
        done();
      }, 0);
    }, 0);
  });

  it("should cancel listeners for multiple properties", function(done) {
    var model = Model(),
        xValue,
        listener = model.when(["x", "y", "z"], function (x, y, z) {
          xValue = x;
        });
    model.x = 5;
    model.y = 6;
    model.z = 7;
    setTimeout(function () {
      expect(xValue).to.equal(5);
      model.cancel(listener);
      model.x = 8;
      model.y = 9;
      setTimeout(function () {
        expect(xValue).to.equal(5);
        done();
      }, 0);
    }, 0);
  });

  it("should cancel multiple listeners separately", function(done) {
    var model = Model(),
        xValue,
        yValue,
        xListener = model.when("x", function (x) { xValue = x; }),
        yListener = model.when("y", function (y) { yValue = y; });
    model.x = 5;
    model.y = 10;
    setTimeout(function () {
      expect(xValue).to.equal(5);
      expect(yValue).to.equal(10);
      model.cancel(xListener);
      model.x = 6;
      model.y = 11;
      setTimeout(function () {
        expect(xValue).to.equal(5);
        expect(yValue).to.equal(11);
        model.cancel(yListener);
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

  it("should handle Model(defaults) constructor API", function() {

    var model = Model({ x: 5, y: 10 });

    expect(model.x).to.equal(5);
    expect(model.y).to.equal(10);

  });

  it("Models should work with JSON stringify and parse API ", function(done) {

    var model1 = Model({ x: 5, y: 10 }),
        json1 = JSON.parse(JSON.stringify(model1)),
        model2 = Model(json1);

    model2.when(["x", "y"], function (x, y) {
      expect(x).to.equal(5);
      expect(y).to.equal(10);
      done();
    });

  });

  it("should support optionally specified properties with Model.None", function(done) {

    var model = Model({
      first: "John",
      middle: Model.None,
      last: "Smith"
    });

    model.when(["first", "middle", "last"], function (first, middle, last){
      if(middle === Model.None){
        model.full = first + " " + last;
      } else {
        model.full = first + " " + middle + " " + last;
      }
    });

    model.when("full", function (full){
      if(full === "John Smith") {
        model.middle = "Clayton";
      } else {
        expect(full).to.equal("John Clayton Smith");
        done();
      }
    });
  });

  it("should support instanceof to check model type, regardless if 'new' is used", function() {
    var a = Model(),
        b = new Model();
    expect(a instanceof Model).to.equal(true);
    expect(b instanceof Model).to.equal(true);
  });

});
