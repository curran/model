// A functional reactive model library.
//
(function(){

  // The D3 conventional graph representation.
  // See https://github.com/mbostock/d3/wiki/Force-Layout#nodes
  var nodes, links, idCounter, map;

  function resetFlowGraph(){
    nodes = [];
    links = [];
    idCounter = 0;
    map = {};
  }

  function getFlowGraph(){
    return {
      nodes: nodes,
      links: links
    };
  }

  resetFlowGraph();

  // Adds the nodes and links to the data flow graph for one
  // particular reactive function.
  function updateLambda(modelId, lambdaId, inProperties, outProperties){
    var lambda = lambdaNode(lambdaId);
    inProperties.forEach(function(property){
      link(propertyNode(modelId, property), lambda);
    });
    outProperties.forEach(function(property){
      link(lambda, propertyNode(modelId, property));
    });
  }

  function lambdaNode(id){
    return getOrCreate(id, nodes, createLambda);
  }

  function createLambda(index){
    return {
      type: "lambda",
      index: index
    };
  }

  function propertyNode(modelId, property){
    var id = modelId + "." + property;
    return getOrCreate(id, nodes, createPropertyNode(property));
  }

  function createPropertyNode(property){
    return function(index){
      return {
        type: "property",
        index: index,
        property: property
      };
    };
  }

  function link(sourceNode, destinationNode){
    var source = sourceNode.index,
        destination = destinationNode.index,
        id = source + "-" + destination;
    getOrCreate(id, links, createLink(source, destination));
  }

  function createLink(source, destination){
    return function(index){
      return {
        source: source,
        destination: destination
      };
    };
  }

  function getOrCreate(id, things, createThing){
    var thing = map[id];
    if(!thing){
      thing = map[id] = createThing(things.length);
      things.push(thing);
    } 
    return thing;
  }

  // The constructor function, accepting default values.
  function Model(defaults){

    // The returned public API object.
    var model = {},

        // The internal stored values for tracked properties. { property -> value }
        values = {},

        // The callback functions for each tracked property. { property -> [callback] }
        listeners = {},

        // The set of tracked properties. { property -> true }
        trackedProperties = {},

        modelId = idCounter++,
        changedProperties = {};

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

      var lambdaId = idCounter++;
      
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
          changedProperties = {};

          callback.apply(thisArg, args);

          updateLambda(modelId, lambdaId, properties, Object.keys(changedProperties));
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

            changedProperties[property] = true;
          }
        });
      }
    }

    // Removes a listener added using `when()`.
    function cancel(listener){
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
    // `newValues` is an object { property -> value }.
    function set(newValues){
      for(var property in newValues){
        model[property] = newValues[property];
      }
    }

    // Transfer defaults passed into the constructor to the model.
    set(defaults);

    // Expose the public API.
    model.when = when;
    model.cancel = cancel;
    model.on = on;
    model.off = off;
    model.set = set;
    return model;
  }

  Model.getFlowGraph = getFlowGraph;
  Model.resetFlowGraph = resetFlowGraph;

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
