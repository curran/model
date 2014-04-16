model
=====

A functional reactive model library.

 * [Unit Tests](http://curran.github.io/model/docs/ModelSpec.html)
 * [Source](http://curran.github.io/model/docs/model.html)

Created in order to cleanly define reactive model-driven data visualizations. 

When using Backbone and Underscore to define model-driven visualization, the a pattern appears again and again for executing code that depends on multiple model properties. For example, consider a Backbone model that has a `size` property that contains the width and height of the visualization, and a `data` property that contains the array of data to be visualized. This is the code you want to write:

```javascript
model.on('change:size change:data', function (){
  var size = model.get('size'),
      data = model.get('data');
  // Build the visualization using size and data.
});
```

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
