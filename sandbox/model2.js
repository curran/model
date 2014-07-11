// This script is a proof of concept refactoring of model.js
// that uses Object.create, and allows models to be treated
// as plain JS objects.
//
// Curran Kelleher 7/10/2014

function debounce(callback){
  var queued = false;
  return function () {
    if(!queued){
      queued = true;
      setTimeout(function () {
        queued = false;
        callback();
      }, 0);
    }
  };
}

function allAreDefined(arr){
  return !arr.some(function (d) {
    return typeof d === 'undefined' || d === null;
  });
}

function Model() {
  var listeners = {},
      trackedProperties = {},
      values = {},
      model;

  function setUpListener(properties, callback){
    var listener = debounce(function(){
      var args = properties.map(function (property) {
        return values[property];
      });
      if(allAreDefined(args)) {
        callback.apply(null, args);
      }
    });
    listener();
    properties.forEach(function(property){
      if(!listeners[property]) {
        listeners[property] = [];
      }
      listeners[property].push(listener);
    });
  }

  function setUpProperties(properties){
    properties.forEach(function(property){
      if(!trackedProperties[property]) {
        trackedProperties[property] = true;
        values[property] = model[property];
        Object.defineProperty(model, property, {
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
        });
      }
    });
  }

  model = Object.create({
    when: function (properties, callback) {
      setUpListener(properties, callback);
      setUpProperties(properties);
    },
    removeListeners: function () {
      listeners = {};
    }
  });

  return model;
}

// Create a new model.
var model = Model();
model.x = 5;
model.y = 10;

model.when(['x', 'y'], function (x, y) {
  console.log(x, y);
});

setTimeout(function(){
  model.x = 50;
  model.removeListeners();
  setTimeout(function(){
    model.x = 500;
  }, 1000);
}, 1000);

console.log(JSON.stringify(model, null, 2));
