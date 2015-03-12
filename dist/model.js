
// A functional reactive model library.
//
// ## Public API
//
// `var model = Model([defaults]);`
//
//  * The model constructor function.
//  * Using "new" is optional.
//  * The optional `defaults` constructor argument is an object literal that specifies default model property values.
//  * The returned `model` object can be treated as a plain JavaScript Object
//    for setting and getting property values, e.g.
//    * `model.x = 5;`
//    * `console.log(model.x);`
//
// `var listener = model.when(properties, callback [, thisArg]);`
//
//  * Listens for changes to the given dependency properties.
//  * `properties` Either an array of strings or a string.
//    Specifies the dependency properties.
//  * `callback` A callback function that is called:
//    * with dependency property values as arguments,
//    * only if all dependency properties have values,
//    * once for initialization,
//    * whenever one or more dependency properties change,
//    * on the next tick of the JavaScript event loop after 
//      dependency properties change,
//    * only once as a result of one or more changes to
//      dependency properties.
//  * `thisArg` An optional argument bound to `this` in the callback.
//  * Returns a `listener` object that can be used to remove the callback.
//
// `model.removeListener(listenerToRemove)`
//
//  * Removes the listener returned by `when`. This means the callback
//    will no longer be called when properties change.
//
// `model.set(values)`
//
//  * A convenience function for setting many model properties at once.
//  * Assigns each property from the given `values` object to the model.
//  * This function can be used to deserialize models, e.g.:
//    * `var json = JSON.stringify(model);`
//    * ... later on ..
//    * `model.set(JSON.parse(json));`
//
define('model/model',[], function (){

  // The constructor function, accepting default values.
  return function Model(defaults){

    // The returned public API object.
    var model = {},

        // The internal stored values for tracked properties. { property -> value }
        values = {},

        // The callback functions for each tracked property. { property -> [callback] }
        listeners = {},

        // The set of tracked properties. { property -> true }
        trackedProperties = {};

    // The functional reactive "when" operator.
    //
    //  * `properties` An array of property names (can also be a single property string).
    //  * `callback` A callback function that is called:
    //    * with property values as arguments, ordered corresponding to the properties array,
    //    * only if all specified properties have values,
    //    * once for initialization,
    //    * whenever one or more specified properties change,
    //    * on the next tick of the JavaScript event loop after properties change,
    //    * only once as a result of one or more synchronous changes to dependency properties.
    function when(properties, callback, thisArg){
      
      // Make sure the default `this` becomes 
      // the object you called `.on` on.
      thisArg = thisArg || this;

      // Handle either an array or a single string.
      properties = (properties instanceof Array) ? properties : [properties];

      // This function will trigger the callback to be invoked.
      var triggerCallback = debounce(function (){
        var args = properties.map(function(property){
          return values[property];
        });
        if(allAreDefined(args)){
          callback.apply(thisArg, args);
        }
      });

      // Trigger the callback once for initialization.
      triggerCallback();
      
      // Trigger the callback whenever specified properties change.
      properties.forEach(function(property){
        on(property, triggerCallback);
      });

      // Return this function so it can be removed later.
      return triggerCallback;
    }

    // Returns a debounced version of the given function.
    // See http://underscorejs.org/#debounce
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

    // Returns true if all elements of the given array are defined, false otherwise.
    function allAreDefined(arr){
      return !arr.some(function (d) {
        return typeof d === 'undefined' || d === null;
      });
    }

    // Adds a change listener for a given property with Backbone-like behavior.
    // Similar to http://backbonejs.org/#Events-on
    function on(property, callback, thisArg){

      // Make sure the default `this` becomes 
      // the object you called `.on` on.
      thisArg = thisArg || this;
      getListeners(property).push(callback);
      track(property, thisArg);
    }
    
    // Gets or creates the array of listener functions for a given property.
    function getListeners(property){
      return listeners[property] || (listeners[property] = []);
    }

    // Tracks a property if it is not already tracked.
    function track(property, thisArg){
      if(!(property in trackedProperties)){
        trackedProperties[property] = true;
        values[property] = model[property];
        Object.defineProperty(model, property, {
          get: function () { return values[property]; },
          set: function(newValue) {
            var oldValue = values[property];
            values[property] = newValue;
            getListeners(property).forEach(function(callback){
              callback.call(thisArg, newValue, oldValue);
            });
          }
        });
      }
    }

    // Removes a listener added using `when()`.
    function removeListener(listener){
      for(var property in listeners){
        off(property, listener);
      }
    }

    // Removes a change listener added using `on`.
    function off(property, callback){
      listeners[property] = listeners[property].filter(function (listener) {
        return listener !== callback;
      });
    }

    // Sets all of the given values on the model.
    // Values is an object { property -> value }.
    function set(values){
      for(var property in values){
        model[property] = values[property];
      }
    }

    // Transfer defaults passed into the constructor to the model.
    set(defaults);

    // Expose the public API.
    model.when = when;
    model.removeListener = removeListener;
    model.on = on;
    model.off = off;
    model.set = set;
    return model;
  };
});

define('model', ['model/model'], function (main) { return main; });
