An example of multiple linked views using model.js. This builds on two other examples, the [bar chart](https://github.com/curran/model/tree/gh-pages/examples/d3BarChart) and [scatter plot](https://github.com/curran/model/tree/gh-pages/examples/d3ScatterPlot).

[Run the example](http://curran.github.io/model/examples/d3LinkedViews/)

<img src="http://curran.github.io/model/images/linkedViews.png">

Brushing in the scatter plot causes the selected data to be aggregated and plotted in the bar chart.

Files:

 * `scatterPlot.js` the model driven D3 scatter plot with brushing
 * `barChart.js` the model driven D3 bar chart
 * `main.js` the main program, which sets up the linked views
 * `data.tsv` the data file that is loaded into the visualizations
 * `index.html` the HTML container for the visualizations
 * `requireConfig.js` the configuration for Require.js, telling it where to look for modules
 * `styles.css` the CSS for the visualizations
