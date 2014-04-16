// A functional reactive model library.
// 
// By Curran Kelleher 4/15/2014
define([], function () {

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

    // Return the public Model API,
    // using the revealing module pattern.
    return {

      // Gets a value from the model.
      get: function(key){
        return values[key];
      },

      // Sets a value on the model and
      // invokes callbacks added for the property,
      // passing the new value into the callback.
      set: function(key, value){
        values[key] = value;
        if(callbacks[key]){
          callbacks[key].forEach(function (callback) {
            callback(value);
          });
        }
      },

      // Adds a callback that will listen for changes
      // to the specified property.
      on: function(key, callbackToAdd){
        if(!callbacks[key]){
          callbacks[key] = [];
        }
        callbacks[key].push(callbackToAdd);
      },

      // Removes a callback that listening for changes
      // to the specified property.
      off: function(key, callbackToRemove){
        if(callbacks[key]){
          callbacks[key] = callbacks[key].filter(function (callback) {
            return callback !== callbackToRemove;
          });
        }
      }
    };
  }
});
