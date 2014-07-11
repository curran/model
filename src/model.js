// A functional reactive model library.
//
// Curran Kelleher July 2014
define([], function () {

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

  return function Model() {
    var listeners = {},
        trackedProperties = {},
        values = {},
        model;

    function setUpListener(properties, callback, thisArg){
      var listener = debounce(function(){
        var args = properties.map(function (property) {
          return values[property];
        });
        if(allAreDefined(args)) {
          callback.apply(thisArg, args);
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
      when: function (properties, callback, thisArg) {
        if(!(properties instanceof Array)) {
          properties = [properties];
        }
        setUpListener(properties, callback, thisArg);
        setUpProperties(properties);
      },
      removeListeners: function () {
        listeners = {};
      },
      set: function (values) {
        Object.keys(values).forEach(function (property) {
          model[property] = values[property];
        });
      }
    });

    return model;
  };
});
