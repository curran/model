This example is out of date, and is replaced by the [model-contrib bar chart example](http://curran.github.io/model-contrib/#/examples/barChart).

An example model-driven bar chart using `model.js`. Draws from the [D3 bar chart example](http://bl.ocks.org/mbostock/3885304).

[Run the bar chart](http://curran.github.io/model/examples/d3BarChart/)

<img src="http://curran.github.io/model/images/barChartFlow.png">
This diagram shows the flow of data resulting in the dynamic bar chart.

Files:

 * `barChart.js` the model driven bar chart
 * `main.js` the main program, which randomly changes the bar chart to show that it is dynamic
 * `configuration.json` the configuration file that sets bar chart parameters
 * `data.tsv` the data file that is loaded into the bar chart
 * `index.html` the HTML container for the bar chart
 * `requireConfig.js` the configuration for Require.js, telling it where to look for modules
 * `styles.css` the CSS for the bar chart

Curran Kelleher 4/17/2014
