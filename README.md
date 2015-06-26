model.js
========

[![Build Status](https://travis-ci.org/curran/model.svg?branch=gh-pages)](https://travis-ci.org/curran/model)

A functional reactive model library - Model.js manages the execution flow of the data flow graphs you define.
Kind of like [Backbone](http://backbonejs.org/) and [React](http://facebook.github.io/react/), but _simpler_ and designed specifically for making [D3](http://d3js.org/) easier to use. Also check out [Chiasm](https://github.com/curran/chiasm), a visualization runtime engine built on Model.js.

 * [Annotated Source](http://curran.github.io/model/docs/model.html)
 * [Unit Tests](http://curran.github.io/model/docs/ModelTests.html)
 * Examples:

[![](http://bl.ocks.org/curran/raw/05780c9eb997b86eab76/thumbnail.png)](http://bl.ocks.org/curran/05780c9eb997b86eab76)
[![](http://bl.ocks.org/curran/raw/9aafca5fba0c7fde13aa/thumbnail.png)](http://bl.ocks.org/curran/9aafca5fba0c7fde13aa)
[![](http://curran.github.io/images/model/linkedChoroplethThumb.png)](http://curran.github.io/model/examples/d3LinkedChoropleth/)
[![](http://bl.ocks.org/curran/raw/cf4b98fff0517ca04667/thumbnail.png)](http://bl.ocks.org/curran/cf4b98fff0517ca04667)
[![](http://bl.ocks.org/curran/raw/9e04ccfebeb84bcdc76c/thumbnail.png)](http://bl.ocks.org/curran/9e04ccfebeb84bcdc76c)
[![](http://bl.ocks.org/curran/raw/3b811f05a0ce39d0d7cd/thumbnail.png)](http://bl.ocks.org/curran/3b811f05a0ce39d0d7cd)
[![](http://bl.ocks.org/curran/raw/015d34d6d3d562877e51/thumbnail.png)](http://bl.ocks.org/curran/015d34d6d3d562877e51)
[![](http://bl.ocks.org/curran/raw/015402cce2caa074551e/thumbnail.png)](http://bl.ocks.org/curran/015402cce2caa074551e)

Installable via [Bower](http://bower.io/): `bower install model`.

Installable via [JSPM](http://jspm.io/): `jspm install model=github:curran/model`.

Usable as:

 * an AMD (RequireJS) module `define(["model"], function(Model){ ... });`
 * a CommonJS (Node) module `var Model = require("model");`
 * a browser global `<script src="model.js"></script>`

Also, check out this redesign of this library - [reactive-model](https://github.com/curran/reactive-model).

## Public API

`var model = Model([defaults]);`

 * The model constructor function.
 * Using "new" is optional.
 * The optional `defaults` constructor argument is an object with default property values.
 * The returned `model` object can be treated as a plain JavaScript Object
   for setting and getting property values, e.g.
   * `model.x = 5;`
   * `console.log(model.x);`

`var listener = model.when(properties, callback [, thisArg]);`

 * Listens for changes to the given dependency properties.
 * `properties` Either an array of strings or a string.
   Specifies the dependency properties.
 * `callback` A callback function that is called:
   * with dependency property values as arguments,
   * only if all dependency properties have values,
   * once for initialization,
   * whenever one or more dependency properties change,
   * on the next tick of the JavaScript event loop after 
     dependency properties change,
   * only once as a result of one or more changes to
     dependency properties.
 * `thisArg` An optional argument bound to `this` in the callback.
 * Returns a `listener` object that can be used to remove the callback.

`model.cancel(listener)`

 * Removes the listener returned by `when`. This means the callback
   will no longer be called when properties change.

`model.on(property, callback(newValue, oldValue)[, thisArg])`

 * Adds a change listener for the given property.
 * Kind of like [on in Backbone](http://backbonejs.org/#Events-on)

`model.off(property, callback)`

 * Removes a change listener for the given property.
 * Kind of like [off in Backbone](http://backbonejs.org/#Events-off)

`model.set(values)`

 * A convenience function for setting many model properties at once.
 * Assigns each property from the given `values` object to the model.
 * This function can be used to deserialize models, e.g.:
   * `var json = JSON.stringify(model);`
   * ... later on ..
   * `model.set(JSON.parse(json));`

## Data Dependency Graphs

Setting model properties in `when` callbacks enables creating reactive data dependency graphs. . As a simple example, consider a `fullName` property that is computed from `firstName` and `lastName`.

```javascript
model.when(['firstName', 'lastName'], function (firstName, lastName) {
  model.fullName = firstName + ' ' + lastName;
});
```

[![](http://bl.ocks.org/curran/raw/05780c9eb997b86eab76/thumbnail.png)](http://bl.ocks.org/curran/05780c9eb997b86eab76)
Here's a [full working example that computes fullName and uses HTML forms](http://bl.ocks.org/curran/05780c9eb997b86eab76).

<img src="http://curran.github.io/model/images/computedProperty.png">

The following example demonstrates construction of a data dependency graph in which the flow propagates two hops from x to y to z.
```javascript
model.when('x', function (x) {
  model.y = x + 1;
});
model.when('y', function (y) {
  model.z = y * 2;
});
```

<img src="http://curran.github.io/model/images/dependencyGraph.png">

This pattern can be used to build up reactive data dependency graphs of arbitrary complexity. 

## Reactive Visualizations

As an example of how data dependency graphs can be used for creating visualizations, consider this [bar chart](http://bl.ocks.org/curran/015d34d6d3d562877e51).

[![Bar Chart](http://curran.github.io/images/model/barChart.png)](http://bl.ocks.org/curran/015d34d6d3d562877e51)

This is the reactive data flow graph of the bar chart. 

![Bar Chart Flow](http://bl.ocks.org/curran/raw/015d34d6d3d562877e51/barChartFlow.png)

The diagram was constructed using the [reactive flow diagram renderer](http://bl.ocks.org/curran/5905182da50a4667dc00). Lambdas represent reactive functions, and labeled nodes represent model properties.

Though the entire reactive flow may seem complex, programming it is simple, because each reactive function is defined independently, only knowing about its direct dependencies and the properties that it changes. This is why functional reactive programming is so great.

Multiple reactive visualizations can be combined together to form visualization dashboards with multiple linked views. For example, take a look at the [linked views example](https://github.com/curran/model/tree/gh-pages/examples/d3LinkedViews), which looks like this:

<img src="http://curran.github.io/model/images/linkedViews.png">
Brushing in the scatter plot causes the selected data to be aggregated and plotted in the bar chart ([run it!](http://curran.github.io/model/examples/d3LinkedViews/)).


## See Also

 * [Talk on YouTube](https://www.youtube.com/watch?v=TpZqVAtQs94) This talk presents Model.js and how it can be used to construct reactive data visualizations with D3. Presented in California at the Bay Area D3 Meetup, July 2014.
   * [Presentation on GitHub](https://github.com/curran/screencasts/tree/gh-pages/reactiveDataVis), [Incremental Bar Chart Example Code](http://curran.github.io/screencasts/reactiveDataVis/examples/viewer/index.html#/) (use left/right arrows)
 * Examples
   * D3
     * [Bar Chart](https://github.com/curran/model/tree/gh-pages/examples/d3BarChart)
     * [Line Chart](https://github.com/curran/model/tree/gh-pages/examples/d3LineChart)
     * [Scatter Plot](https://github.com/curran/model/tree/gh-pages/examples/d3ScatterPlot)
     * [Linked Views](https://github.com/curran/model/tree/gh-pages/examples/d3LinkedViews)
     * [Stacked Area Chart](https://github.com/curran/model/tree/gh-pages/examples/d3StackedArea)
     * [Choropleth](https://github.com/curran/model/tree/gh-pages/examples/d3Choropleth)
     * [Linked Choropleth and Line Chart](https://github.com/curran/model/tree/gh-pages/examples/d3LinkedChoropleth)
     * [Parallel Coordinates](https://github.com/curran/model/tree/gh-pages/examples/d3ParallelCoordinates)
     * [Force Directed Graph](https://github.com/curran/model/tree/gh-pages/examples/d3ForceDirectedGraph)
   * [Handlebars](https://github.com/curran/model/tree/gh-pages/examples/handlebars) Reactive templates
   * Bootstrap
     * [List Group](https://github.com/curran/model/tree/gh-pages/examples/bootstrapListGroup)
     * [Table](https://github.com/curran/model/tree/gh-pages/examples/bootstrapTable)
   * [Bootstrap and D3](https://github.com/curran/model/tree/gh-pages/examples/d3Bootstrap)

## Motivation

This library was created in order to cleanly define reactive model-driven data visualizations. When using Backbone and Underscore to define model-driven visualizations, there is a pattern that appears again and again for executing code that depends on multiple model properties. For example, consider a Backbone model that has a `size` property that contains the width and height of the visualization, and a `data` property that contains the array of data to be visualized. This is the code you want to write:

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

The above code now does not break, but has another issue. When `width` and `height` are both updated, the function is invoked twice. Ideally, when `width` and `height` are updated in sequence (e.g. `model.set('width', 50); model.set('height', 100);`), the function should only be invoked once with the new values for both width and height. Also, multiple sequential updates to `width` or `height` (e.g. `model.set('width', 0); model.set('width', 50);`) should only result in a single recomputation of the visualization, using the last value (in this case 50). One way to accomplish this is to [debounce](http://underscorejs.org/#debounce) the function as follows:

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

The above code behaves as desired - the visualization is only built when all properties are present, and only once when multiple properties change together. As this pattern is so common in developing model driven data visualizations, it would be useful to abstract it away into a reusable function. The `model.when` function does exactly that. Using `model.when`, the above code becomes:

```javascript
model.when(['width', 'height', 'data'], function (width, height, data) {
  // Build the visualization using width, height and data.
});
```

As this was the only usage pattern I encountered with models when using Backbone for developing visualizations, I decided to introduce a new library that only contains the essential features needed from Backbone Models (in order to remove the Backbone dependency), and the `when` function, which appears in the world of Functional Reactive Programming and makes working with models for visualizations much nicer. This is why model.js was created.

## Related Work

Inspired by

  * [Models in Backbone.js](http://backbonejs.org/#Model)
  * The `when` operator in Functional Reactive Programming
    * [`when`](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/observable.md#rxobservablewhenargs) in [RxJS](http://reactive-extensions.github.io/RxJS/)
    * [`when`](https://github.com/baconjs/bacon.js/tree/master#bacon-when) in [Bacon.js](https://github.com/baconjs/bacon.js/tree/master)
  * [Computed properties in Ember.js](http://emberjs.com/guides/object-model/computed-properties/)
  * [Dependency injection in Angular.js](http://docs.angularjs.org/guide/di)
  * [Dependency declaration syntax in Require.js](http://requirejs.org/docs/api.html#defdep)

See also:

 * [Towards Reusable Charts](http://bost.ocks.org/mike/chart/) A pattern for creating reusable charts (model.js presents an alternative to this)
 * [GitHub: vogievetsky/DVL](https://github.com/vogievetsky/DVL) A functional reactive library for use with D3.js.
 * [Stackoverflow: how to implement observer pattern in javascript?](http://stackoverflow.com/questions/12308246/how-to-implement-observer-pattern-in-javascript) - Contains bare minimum model implementation that was the seed of this project.
 * [Backbone.js mailing list: Improving the Backbone Model API with wire()](https://groups.google.com/forum/#!searchin/backbonejs/wire/backbonejs/CnFLHg-d0uk/lIJ8wYxSiTEJ) First pass at functional reactive models, built on Backbone models.
 * [wire.js](https://github.com/curran/phd/blob/dac07e2e8c38da7343645d7a07ec17a762120ea0/prototype/src/wire.js) The original implementation of the idea for this library, as an extension to Backbone Models.
 * [Backbone Pull Request](https://github.com/jashkenas/backbone/pull/3135)
 * [Model.js featured in Dashing D3.js](https://www.dashingd3js.com/data-visualization-and-d3-newsletter/data-visualization-and-d3-newsletter-issue-75)
 * [Computed properties in Ember.js](http://emberjs.com/guides/object-model/computed-properties/) A similar system.
 * [Video Demo of Linked Choropleth from D3 Bay Area Meetup](https://youtu.be/ewJdCnO9eQo?t=5m29s)

## Contributing

Pull requests welcome! Potential contributions include:

 * Add a DOM-based example
 * Add more generalized D3 examples! For example:
   * [Focus+Context via Brushing](http://bl.ocks.org/mbostock/1667367)
   * [TreeMap](http://bl.ocks.org/mbostock/4063582)
   * [Streamgraph](http://bl.ocks.org/mbostock/4060954)
   * [Stacked Bar Chart](http://bl.ocks.org/mbostock/3886208)
   * [Grouped Bar Chart](http://bl.ocks.org/mbostock/3887051)
   * [Sunburst Partition](http://bl.ocks.org/mbostock/4063423)
   * [Icicle Plot](http://mbostock.github.io/d3/talk/20111018/partition.html)
 * Add a D3 example with UI elements such as a drop down menu for selecting fields to use in the visualization.

By [Curran Kelleher](https://github.com/curran/portfolio) May 2015
