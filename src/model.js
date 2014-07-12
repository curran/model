// A functional reactive model library.
//
// Curran Kelleher July 2014
define([], function () {

  // Returns a function which when called schedules
  // the original callback function to execute on the next
  // tick of the JavaScript event loop. Multiple calls to the
  // debounced function within a single tick of the event loop
  // cause the original callback to be called only once.
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

  // Returns true if all elements of the given array are defined.
  function allAreDefined(arr){
    return !arr.some(function (d) {
      return typeof d === 'undefined' || d === null;
    });
  }

  // The Model constructor function. Using "new" is optional.
  return function Model() {
    var listeners = {},
        trackedProperties = {},
        values = {},
        model;

    function addListener(properties, callback, thisArg){

      // Define a function that invokes the callback, passing as arguments
      // the model values corresponding to the given dependency properties.
      var listener = debounce(function(){

        // Extract the property values into an array.
        var args = properties.map(function (property) {
          return values[property];
        });

        // Call the callback if all properties are defined.
        if(allAreDefined(args)) {
          callback.apply(thisArg, args);
        }
      });

      // Invoke the listener once for initialization.
      listener();

      // Invoke the listener when dependency properties change.
      properties.forEach(function(property){
        if(!listeners[property]) {
          listeners[property] = [];
        }
        listeners[property].push(listener);
      });
    }

    function trackProperty(property){
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
    }

    model = Object.create({
      when: function (properties, callback, thisArg) {

        // Support passing either single string or 
        // an array of strings as the `properties` argument.
        if(!(properties instanceof Array)) {
          properties = [properties];
        }

        // Set up the callback to be invoked with property values
        // once initially, when any property changes, but only
        // when all property values are defined.
        addListener(properties, callback, thisArg);

        // For each dependency property, track it using
        // Object.defineProperty where setters invoke listeners.
        properties.forEach(trackProperty);
      },

      removeListeners: function () {
        listeners = {};
      },

      // A convenience function for setting model properties
      // using an object. Shallow-copies each property from the
      // given `value` object to the model.
      set: function (values) {
        Object.keys(values).forEach(function (property) {
          model[property] = values[property];
        });
      }
    });

    return model;
  };
});
