// This script is a proof of concept refactoring of model.js
// that uses Object.create, and allows models to be treated
// as plain JS objects.
//
// Curran Kelleher 7/10/2014


// Queues a function to execute on the 
// next tick of the JavaScript event loop.
function debounce(fn){
  var queued = false;
  return function () {
    if(!queued){
      queued = true;
      setTimeout(function () {
        queued = false;
        fn();
      }, 0);
    }
  };
}

// Returns true if every element in the given array
// is defined (not null or 'undefined').
function allAreDefined(arr){
  return !arr.some(function (d) {
    return typeof d === 'undefined' || d === null;
  });
}

// The Model constructor function. Accepts a `values` argument
// that serves as the default values of the model. Any properties
// not present in the `values` argument will not be tracked.
// For use as dependency arguments to `when`, default properties
// must be present in the `values` object passed to the constructor.
function Model(values) {
  var listeners = {};
  return Object.create({
    when: function (dependencies, callback) {
      var listener = debounce(function(){
        var args = dependencies.map(function (property) {
          return values[property];
        });
        if(allAreDefined(args)) {
          callback.apply(null, args);
        }
      });

      listener();

      // Support both when(['a', 'b'], callback) and when('c', callback).
      if(!(dependencies instanceof Array)) {
        dependencies = [dependencies];
      }

      dependencies.forEach(function(property){
        if(!listeners[property]) {
          listeners[property] = [];
        }
        listeners[property].push(listener);
      });
    },
    removeListeners: function () {
      // Removes reference to all old listeners.
      // This causes old listeners to be garbage collected.
      listeners = {};
    }
  }, (function () {
    var propertiesObject = {};
    Object.keys(values).forEach(function (property) {
      propertiesObject[property] = {
        get: function () {
          return values[property];
        },
        set: function(value) {
          values[property] = value;

          if(listeners[property]){
            listeners[property].forEach(function (listener) {
              listener();
            });
          }
        }
      };
    });
    return propertiesObject;
  }()));
}

// Create a new model.
var model = Model({
  x: 5,
  y: 10
});

model.when(['x'], function (x) {
  console.log(x);
});

setTimeout(function(){
  model.x = 50;
  model.removeListeners();
  setTimeout(function(){
    model.x = 500;
  }, 1000);
}, 1000);
