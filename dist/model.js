(function(root, factory) {
    if(typeof exports === 'object') {
        module.exports = factory();
    }
    else if(typeof define === 'function' && define.amd) {
        define([], factory);
    }
    else {
        root['Model'] = factory();
    }
}(this, function() {

// A functional reactive model library.
//
// By Curran Kelleher 4/17/2014
//
// # Model()
// The constructor function for models.
// No need to use `new`.
//
// For example: `var model = Model();`

function Model(){

  // The `model` API has only three functions: `get`, `set` and `when`.
  var model = {

        // ## model.set
        //
        // Sets model properties.
        //
        //  * `model.set(property, value)` sets a property to the given value.
        //    * `property` a string, the property name
        //    * `value` the value assigned to the property (any type)
        //  * `model.set(object)` sets the value of model properties
        //    based on the key-value pairs present in the given object.
        set: set,

        // ## model.get
        //
        // Gets model properties.
        //
        //  * `model.get(property)` gets the value of the given property
        //    * `property` a string, the property name
        //    * returns the current property value
        get: get,

        // ## model.when
        //
        // Listens for changes on the model such that:
        //
        //  * Multiple sequential model updates cause the callback
        //    to execute only once
        //  * The callback is only executed if all dependency property
        //    values are defined
        //
        // `model.when(dependencies, callback [, thisArg])`
        //
        //  * `dependencies` specifies the names of model properties that are
        //    dependencies of the callback function. `dependencies` can be
        //    * a string (in the case of a single dependency) or
        //    * an array of strings (in the case of many dependencies).
        //  * `callback(values...)` the callback function that is invoked after dependency
        //    properties change. The values of dependency properties are passed
        //    as arguments to the callback, in the same order specified by `dependencies`.
        //  * `thisArg` value to use as `this` when executing `callback`.
        //  * returns a `whens` object containing
        //    * a chainable `when` function
        //    * `callbacks` an object containing the callbacks for all 
        //      `when` calls in the chain, an array of objects with:
        //      * `properties` an array of property names
        //      * `fn` the callback function added to the properties
        when: function when(dependencies, fn, thisArg){
          return chainableWhen()(dependencies, fn, thisArg);
        },

        // ## model.cancel
        //
        // Cancels previously added `when` callback functions.
        //
        // `model.cancel(whens)`
        //
        //  * `whens` the object returned from `when` or a chain of `when` calls
        cancel: cancel
      },

      // # Internals
      //
      // `callbacks` is an object containing callback functions.
      //  * Keys are property names
      //  * Values are arrays of callback functions
      callbacks = {},

      // `values` is an object containing property values.
      //  * Keys are property names
      //  * Values are values set on the model
      values = {};

  // ## set
  function set(keyOrObject, value){
    if(typeof keyOrObject === 'string') {
      setKeyValue(keyOrObject, value);
    } else {
      setObject(keyOrObject);
    }
  }

  function setObject(object){
    Object.keys(object).forEach(function (key) {
      setKeyValue(key, object[key]);
    });
  }

  function setKeyValue(key, value){

    // Set the internal value.
    values[key] = value;

    // Call callbacks if there are any.
    if(callbacks[key]){
      callbacks[key].forEach(function (callback) {
        callback();
      });
    }
  }

  // ## get
  function get(key){

    // Get the internal value.
    return values[key];
  }

  // ## when
  function chainableWhen(){
    var callbacks = [];
    return function when(dependencies, fn, thisArg){

      // Support passing a single string as `dependencies`
      if(!(dependencies instanceof Array)) {
        dependencies = [dependencies];
      }

      // `callFn()` will invoke `fn` with values of dependency properties
      // on the next tick of the JavaScript event loop.
      var callFn = debounce(function(){

        // Extract the values for each dependency property.
        var args = dependencies.map(get);

        // Only call the function if all values are defined.
        if(allAreDefined(args)) {

          // Call `fn` with the dependency property values.
          fn.apply(thisArg, args);
        }
      });

      // Invoke `fn` once for initialization.
      callFn();

      // Invoke `fn` when dependency properties change.
      //
      // Multiple sequential dependency property changes
      // result in only a single invocation of `fn`
      // because callFn is [debounced](underscorejs.org/#debounce).
      dependencies.forEach(function(property){
        
        // Listen for changes on the property.
        on(property, callFn);
        
        // Store the added callbacks for canceling later.
        callbacks.push({
          property: property,
          fn: callFn
        });
      });

      return {
        when: when,
        callbacks: callbacks
      };
    };
  }

  // ## cancel
  function cancel(whens){
    whens.callbacks.forEach(function (callback) {
      off(callback.property, callback.fn);
    });
  }

  // ## on
  // Adds a change listener for a property.
  function on(key, callback){

    // If there is not already a list
    // of callbacks for the given key,
    if(!callbacks[key]) {

      // then create one.
      callbacks[key] = [];
    }

    // Add the callback to the list of callbacks
    // for the given key.
    callbacks[key].push(callback);
  }

  // ## off
  // Removes a change listener for a property.
  function off(key, callbackToRemove){
    callbacks[key] = callbacks[key].filter(function (callback) {
      return callback !== callbackToRemove;
    });
  }

  return model;
}

// ## debounce
// Returns a debounced version of the given function.
// Calling the debounced function one or more times in sequence
// (on the same tick of the JavaScript event loop)
// will schedule the given function to execute only once
// on the next tick of the JavaScript event loop.
//
// Similar to [debounce in Underscore.js](http://underscorejs.org/#debounce).
//
// When propagating changes through a data dependency graph, debouce causes 
// changes to be propagated in a breadth-first manner, which is the correct behavior.
// Why does this work? See [Breadth-first search with setTimeout](https://tom-fitzhenry.me.uk/blog/2013/10/breadth-first-search-with-settimeout.html).
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

// ## allAreDefined
// Returns true if all values in the given array
// are defined and not null, false otherwise.
function allAreDefined(arr){
  return !arr.some(function (d) {
    return typeof d === 'undefined' || d === null;
  });
}


return Model;

}));
