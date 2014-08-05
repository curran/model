// This is an example of how Handlebars templates
// can be used with Model.js.
//
// Curran Kelleher August 2014
require(["model", "view"], function (Model, View) {

  // Grab the view DOM element.
  var container = document.getElementById("container"),

      // Grab the template and compile it with Handlebars.
      templateElement = document.getElementById("name-template"),
      templateText = templateElement.innerHTML,
      template = Handlebars.compile(templateText),

      // Extract view dependencies from the "dependencies" attribute,
      // which is expected to contain comma-separated model property names.
      dependenciesStr = templateElement.getAttribute("dependencies"),
      dependencies = dependenciesStr.split(","),

      // Create the model.
      person = Model(),

      // Create the view.
      view = View({
        el: container,
        model: person,
        dependencies: dependencies,
        template: template
      });

  // Compute last name from first name.
  person.when(["firstName", "lastName"], function (firstName, lastName) {
    person.fullName = firstName + " " + lastName;
  });

  // Set defaults.
  person.set({
    firstName: "Joe",
    lastName: "Schmoe"
  });

  // Randomly update firstName and lastName
  // to show that the template updates.
  setInterval(function () {
    var i = Math.floor(Math.random() * 4);
    person.firstName = ["Joe", "Jill", "John", "Jane"][i];
  }, 400);

  setInterval(function () {
    var i = Math.floor(Math.random() * 4);
    person.lastName = ["Schmoe", "Smith", "Doe", "Rogers"][i];
  }, 500);
});
