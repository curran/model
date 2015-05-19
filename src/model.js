// ModelJS v0.2.1
//
// https://github.com/curran/model
//
// Last updated by Curran Kelleher March 2015
//
// Includes contributions from
//
//  * github.com/mathiasrw
//  * github.com/bollwyvl
//  * github.com/adle29
//
// The module is defined inside an immediately invoked function
// so it does not pullute the global namespace.
(function(){

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

  // The constructor function, accepting default values.
  function Model(defaults){

    if (!(this instanceof Model)) {
      return new Model(defaults);
    }

    // The internal stored values for tracked properties. { property -> value }
    model.$$values = {};

    // The callback functions for each tracked property. { property -> [callback] }
    model.$$listeners = {};

    // The set of tracked properties. { property -> true }
    model.$$trackedProperties = {};

    // Transfer defaults passed into the constructor to the model.
    this.set(defaults);

  }

  // Tracks a property if it is not already tracked. private
  function track(model, property, thisArg) {
    if(!(property in model.$$trackedProperties)){
      model.$$trackedProperties[property] = true;
      model.$$values[property] = model[property];
      Object.defineProperty(model, property, {
        get: function () { return this.$$values[property]; },
        set: function(newValue) {
          var oldValue = model.$$values[property];
          this.$$values[property] = newValue;
          getListeners(this, property).forEach(function(callback){
            callback.call(thisArg, newValue, oldValue);
          });
        }
      });
    }
  }

  // Gets or creates the array of listener functions for a given property. private
  function getListeners(model, property){
    return model.$$listeners[property] || (model.$$listeners[property] = []);
  }

  // Sets all of the given values on the model.
  // `newValues` is an object { property -> value }.
  Model.prototype.set = function set(newValues){
    for(var property in newValues){
      this[property] = newValues[property];
    }
  };

  // Removes a change listener added using `on`.
  Model.prototype.off = function off(property, callback){
    this.$$listeners[property] = this.$$listeners[property].filter(function (listener) {
      return listener !== callback;
    });
  };

  // Cancels a listener returned by a call to `model.when(...)`.
  Model.prototype.cancel = function cancel(listener){
    for(var property in this.$$listeners){
      this.off(property, listener);
    }
  };

  // Adds a change listener for a given property with Backbone-like behavior.
  // Similar to http://backbonejs.org/#Events-on
  Model.prototype.on = function on(property, callback, thisArg){
    thisArg = thisArg || this;
    getListeners(this, property).push(callback);
    track(this, property, thisArg);
  };

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
  Model.prototype.when = function when(properties, callback, thisArg){

    // Make sure the default `this` becomes
    // the object you called `.on` on.
    thisArg = thisArg || this;

    var self = this;

    // Handle either an array or a single string.
    properties = (properties instanceof Array) ? properties : [properties];

    // This function will trigger the callback to be invoked.
    var listener = debounce(function (){
      var args = properties.map(function(property){
        return self.$$values[property];
      });
      if(allAreDefined(args)){
        callback.apply(thisArg, args);
      }
    });

    // Trigger the callback once for initialization.
    listener();

    // Trigger the callback whenever specified properties change.
    properties.forEach(function(property){
      self.on(property, listener);
    });

    // Return this function so it can be removed later with `model.cancel(listener)`.
    return listener;
  };

  // Model.None is A representation for an optional Model property that is not specified.
  // Model property values of null or undefined are not propagated through
  // to when() listeners. If you want the when() listener to be invoked, but
  // some of the properties may or may not be defined, you can use Model.None.
  // This way, the when() listener is invoked even when the value is Model.None.
  // This allows the "when" approach to support optional properties.
  //
  // For example usage, see this scatter plot example with optional size and color fields:
  // http://bl.ocks.org/curran/9e04ccfebeb84bcdc76c
  //
  // Inspired by Scala's Option type.
  // See http://alvinalexander.com/scala/using-scala-option-some-none-idiom-function-java-null
  Model.None = "__NONE__";

  // Support AMD (RequireJS), CommonJS (Node), and browser globals.
  // Inspired by https://github.com/umdjs/umd
  if (typeof define === "function" && define.amd) {
    define([], function () { return Model; });
  } else if (typeof exports === "object") {
    module.exports = Model;
  } else {
    this.Model = Model;
  }
})();
