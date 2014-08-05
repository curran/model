define(["model"], function (Model) {
  return function View (options) {
    var view = Model(options),
        oldListener;
    view.when(["model", "template", "dependencies"], function (model, template, dependencies) {
      if(oldListener) {
        model.removeListener(oldListener);
      }
      oldListener = model.when(dependencies, function () {
        var args = arguments,
            data = {};
        dependencies.forEach(function (property, i) {
          data[property] = args[i];
        });
        view.html = template(data);
      });
    });

    view.when(["el", "html"], function (el, html) {
      //console.log("html = " + html);
      el.innerHTML = html;
    });
    return view;
  };
});
