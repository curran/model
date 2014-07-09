model.js
========

A functional reactive model library. Provides:

 * Models similar to [Backbone Models](http://backbonejs.org/#Model) in that you can call
   * `set(propertyName, value)` to set a value, and
   * `get(propertyName)` to get a value
 * A `when` function, which allows declaration of data dependency graphs in a [functional reactive](http://stackoverflow.com/questions/1028250/what-is-functional-reactive-programming) style. 

Usable via [Bower](http://bower.io/): `bower install model`

Check out the

 * [User Guide](http://curran.github.io/model/docs/ModelSpec.html)
 * [Documentation](http://curran.github.io/model/docs/model.html)
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
   * Bootstrap
     * [Interactive List](https://github.com/curran/model/tree/gh-pages/examples/bootstrapListGroup)
     * [Table](https://github.com/curran/model/tree/gh-pages/examples/bootstrapTable)

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

## Data Dependency Graphs

Combining `when` and `set` enables creating reactive data dependency graphs. This is similar to [computed properties in Ember](http://emberjs.com/guides/object-model/computed-properties/). As a simple example, consider a `fullName` property that is computed from `firstName` and `lastName`.

```javascript
model.when(['firstName', 'lastName'], function (firstName, lastName) {
  model.set('fullName', firstName + ' ' + lastName);
});
```

<img src="http://curran.github.io/model/images/computedProperty.png">

The following example demonstrates construction of a data dependency graph in which the flow propagates two hops from x to y to z.
```javascript
model.when(['x'], function (x) {
  model.set('y', x + 1);
});
model.when(['y'], function (y) {
  model.set('z', y * 2);
});
```

<img src="http://curran.github.io/model/images/dependencyGraph.png">

This pattern can be used to build up reactive data dependency graphs of arbitrary complexity. 

## Building Reactive Visualizations

As an example of how model.js data dependency graphs can be used for creating a reactive visualization, here is a diagram showing the data flow pipeline for the [bar chart example](https://github.com/curran/model/tree/gh-pages/examples/d3BarChart):

<img src="http://curran.github.io/model/images/barChart.png">
<img src="http://curran.github.io/model/images/barChartFlow.png">

Multiple reactive visualizations can be combined together to form visualization dashboards with multiple linked views. For example, take a look at the [linked views example](https://github.com/curran/model/tree/gh-pages/examples/d3LinkedViews), which looks like this:

<img src="http://curran.github.io/model/images/linkedViews.png">
Brushing in the scatter plot causes the selected data to be aggregated and plotted in the bar chart ([run it!](http://curran.github.io/model/examples/d3LinkedViews/)).

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

By [Curran Kelleher](https://github.com/curran/portfolio) 4/17/2014
