model.js
========

A functional reactive model library. Provides:

 * Models similar to [Backbone Models](http://backbonejs.org/#Model) in that you can call `set(propertyName, value)`.
 * A `when` function, which allows declaration of data dependencies in a functional reactive style. 

Check out the annotated source code:

 * [Unit Tests](http://curran.github.io/model/docs/ModelSpec.html) - serves as the user guide
 * [Model.js](http://curran.github.io/model/docs/model.html)

Usable via [Bower](http://bower.io/): `bower install model`

This library was created in order to cleanly define reactive model-driven data visualizations. When using Backbone and Underscore to define model-driven visualization, the a pattern appears again and again for executing code that depends on multiple model properties. For example, consider a Backbone model that has a `size` property that contains the width and height of the visualization, and a `data` property that contains the array of data to be visualized. This is the code you want to write:

```javascript
model.on('change:width change:height change:data', function (){
  var width = model.get('width'),
      height = model.get('height'),
      data = model.get('data');
  // Build the visualization using width, height and data.
});
```

However, with the above code, if only one or two of the properties are set, the function will be invoked before all properties are defined. Therefore a null check must be added for all properties as follows:

```javascript
model.on('change:width change:height change:data', function (){
  var width = model.get('width'),
      height = model.get('height'),
      data = model.get('data');
  if(width && height && data) {
    // Build the visualization using width, height and data.
  }
});
```

The above code now does not break, but has another issue. When `width` and `height` are both updated, the function is invoked twice. Ideally, when `width` and `height` are updated in sequence (e.g. `model.set('width', 50); model.set('height', 100);`), the function should only be invoked once with the new values for both width and height. One way to accomplish this is to [debounce](http://underscorejs.org/#debounce) the function as follows:

```javascript
model.on('change:width change:height change:data', _.debounce(function (){
  var width = model.get('width'),
      height = model.get('height'),
      data = model.get('data');
  if(width && height && data) {
    // Build the visualization using width, height and data.
  }
}));
```

The above code behaves as desired - the visualization is only built when all properties are present, and only once when multiple properties change together. As this pattern is so common in developing model driven data visualizations, it would be useful to abstract it away. The `model.when` library does exactly that. Using `model.when`, the above code becomes:

```javascript
model.when(['width', 'height', 'data'], function (width, height, data) {
  // Build the visualization using width, height and data.
});
```

As this was the only usage pattern I encountered with models when using Backbone for developing visualizations, I decided to introduce a new library that only contains the essential features needed from Backbone Models (in order to remove the Backbone dependency), and the `when` function, which appears in the world of Functional Reactive Programming and makes working with models for visualizations much nicer.

Combining `when` and `set` enables creating reactive data dependency graphs. This is similar to [computed properties in Ember](http://emberjs.com/guides/object-model/computed-properties/). As a simple example, consider a `fullName` property that is computed from `firstName` and `lastName`.

```javascript
model.when(['firstName', 'lastName'], function (firstName, lastName) {
  model.set('fullName', firstName + ' ' + lastName);
});
```

<img src="http://curran.github.io/model/images/barChartFlow.png">

As an example of how this pattern can be used for creating a visualization, here is a diagram showing the data flow pipeline for the [bar chart example](https://github.com/curran/model/tree/gh-pages/examples/d3BarChart):

<img src="http://curran.github.io/model/images/barChartFlow.png">

Inspired by

  * [Models in Backbone.js](http://backbonejs.org/#Model)
  * The `when` operator in Functional Reactive Programming
    * [`when`](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/observable.md#rxobservablewhenargs) in [RxJS](http://reactive-extensions.github.io/RxJS/)
    * [`when`](https://github.com/baconjs/bacon.js/tree/master#bacon-when) in [Bacon.js](https://github.com/baconjs/bacon.js/tree/master)
  * [Computed properties in Ember.js](http://emberjs.com/guides/object-model/computed-properties/)
  * [Dependency injection in Angular.js](http://docs.angularjs.org/guide/di)
  * [Dependency declaration syntax in Require.js](http://requirejs.org/docs/api.html#defdep)

See also:

 * [Stackoverflow: how to implement observer pattern in javascript?](http://stackoverflow.com/questions/12308246/how-to-implement-observer-pattern-in-javascript) - Contains bare minimum model implementation that was the seed of this project.
 * [Backbone.js mailing list: Improving the Backbone Model API with wire()](https://groups.google.com/forum/#!searchin/backbonejs/wire/backbonejs/CnFLHg-d0uk/lIJ8wYxSiTEJ) First pass at functional reactive models, built on Backbone models.
 * [wire.js](https://github.com/curran/phd/blob/dac07e2e8c38da7343645d7a07ec17a762120ea0/prototype/src/wire.js) The original implementation of the idea for this library, as an extension to Backbone Models.

By Curran Kelleher 4/16/2014
