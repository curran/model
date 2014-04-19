// The main program that runs the scatter plot.
// This program creates a new visualization, loads a
// configuration file for it, and loads data into it.
// Then it periodically updates various aspects of the chart
// with random values, to illustrate that the chart
// is dynamic and reacts to changes in its model.
//
//   Curran Kelleher 4/17/2014

require(['d3', 'stackedArea'], function (d3, StackedArea) {
	var div = document.getElementById('stackedAreaContainer'), 
		stackedArea = StackedArea(div); 

	d3.json('configuration.json', function (config) {
    	stackedArea.set(config);
    });

	d3.tsv("data.tsv",(function () {
	    var parseDate = d3.time.format("%d-%b-%y").parse;
	    return function (d) {
	      d.date = parseDate(d.date);
	      d.frequency = +d.frequency;
	      return d;
	    };
    }()), function(error, data) {
		  
		  setSizeFromDiv();

		  window.addEventListener('resize', stackedArea.updateSize);

		  stackedArea.set('data',data); 

		    // Reset data each second
		    setInterval(function () {

		      // Include each element with a 10% chance.
		      var randomSample = data.filter(function(d){
		        return Math.random() < 0.1;
		      });

		      stackedArea.set('data', randomSample);
		    }, 1000);

		    // Randomly change the margin every 1.7 seconds.
		    function random(){ return Math.random() * 100; }
		    setInterval(function () {
		      stackedArea.set('margin', {top: random(), right: random(), bottom: random(), left: random()});
		    }, 1700);

		    // Change the Y axis label every 600 ms.
		    function randomString() {
		      var possibilities = ['Frequency', 'Population', 'Alpha', 'Beta'],
		          i = Math.round(Math.random() * possibilities.length);
		      return possibilities[i];
		    }
		    setInterval(function () {
		      stackedArea.set('yLabel', randomString());
		    }, 600);


	});

	function setSizeFromDiv(){
  		stackedArea.set('size', {
	      width: div.clientWidth,
	      height: div.clientHeight
	    });
  	} 

});