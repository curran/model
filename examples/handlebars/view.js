// A view that reacts to changes in its model.
//
// Curran Kelleher, August 2014
define(["model"], function (Model) {

  // The `View` constructor function accepts the following
  // options, which also may be set later as properties on the
  // returned `view` object.
  //
  //  * `el` The DOM element to render the view into
  //  * `model` The model that drives this view
  //  * `template` A function that renders the view template, accepting
  //    an argument with key-value pairs specifying values for the template
  //  * `dependencies` A comma separated list of `model` properties
  //    that should be passed into the `template` for rendering.
  return function View (options) {

    // Create a model for the view.
    var view = Model(options),
        listener;
    
    // Whenever view configuration changes,
    view.when(["el", "model", "template", "dependencies"],
        function (el, model, template, dependencies) {

      // remove the old listener if there is one, then
      if(listener) {
        model.removeListener(listener);
      }

      // add a new listener to the model such that
      // whenever any dependencies of the view change in the model,
      listener = model.when(dependencies, function () {

        // Extract dependency property values from arguments, and
        var args = arguments,
            data = {};
        dependencies.forEach(function (property, i) {
          data[property] = args[i];
        });

        // pass them into the template for rendering.
        el.innerHTML = template(data);
      });
    });
    return view;
  };
});
