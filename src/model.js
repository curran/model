// A functional reactive model library.
// 
// By Curran Kelleher 4/15/2014
define([], function () {

  // Returns a debounced version of the given function.
  // Calling the debounced function one or more times in sequence
  // will schedule the given function to execute only once
  // at the next tick of the JavaScript event loop.
  // Similar to http://underscorejs.org/#debounce
  function debounce(func){
    var queued = false;
    return function () {
      if(!queued){
        queued = true;
        setTimeout(function () {
          queued = false;
          func();
        }, 0);
      }
    };
  }

  // Returns true if all values in the given array
  // are defined and not null, false otherwise.
  function allAreDefined(arr){
    var allDefined = true;
    arr.forEach(function (d) {
      if(typeof d === 'undefined' || d === null){
        allDefined = false;
      }
    });
    return allDefined;
  }

  // The constructor function.
  return function Model(){

    // An object containing callback functions.
    //  * Keys are property names
    //  * Values are arrays of callback functions
    var callbacks = {},

        // An object containing property values.
        //  * Keys are property names
        //  * Values are values set on the model
        values = {};

    // Adds a callback that will listen for changes
    // to the specified property.
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

    /*
     Removes a callback that listening for changes
     to the specified property.
    TODO test this
    function off(key, callbackToRemove){
      if(callbacks[key]){
        callbacks[key] = callbacks[key].filter(function (callback) {
          return callback !== callbackToRemove;
        });
      }
    }
    */

    // Sets a value on the model.
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

      // Update the internal value.
      values[key] = value;

      // Call callbacks if there are any.
      if(callbacks[key]){
        callbacks[key].forEach(function (callback) {
          callback();
        });
      }
    }

    /* TODO add documentation here */
    function when(dependencies, fn, thisArg){

      // Support passing a single string as `dependencies`
      if(!(dependencies instanceof Array)) {
        dependencies = [dependencies];
      }

      // `callFn()` will invoke `fn` with values of dependency properties
      // on the next tick of the JavaScript event loop.
      var callFn = debounce(function(){

        // Extract the values for each dependency property from the model.
        var args = dependencies.map(function (dependency) {
          return values[dependency];
        });

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
        on(property, callFn);
      });
    }

    // Return the public Model API,
    // using the revealing module pattern.
    return {
      set: set,
      when: when
    };
  };
});
