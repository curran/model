// The configuration for Require.js for the D3 bar chart example.
// Abraham Adberstein 4/19/2014
require.config({
  paths: {
    // Map the `model` module name to the model lib.
    model: '../../dist/model',
    
    // Expose d3 and topojson as AMD modules.
    d3: '../../lib/d3/d3.min',
    topojson: '../../lib/topojson/topojson'
  }
});
