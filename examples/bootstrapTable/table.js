// A reactive HTML table.
// Draws from http://bost.ocks.org/mike/nest/
// Curran Kelleher 6/12/2014
define(['d3', 'model'], function (d3, Model) {
  return function Table(div){
    var model = Model(),
        table = d3.select(div)

          // Make the div scrollable
          .style('overflow-y', 'auto')

          // Append the HTML table
          .append('table')

          // Use Bootstrap 'table' class
          .attr('class', 'table'),

        // Append table header and table body
        thead = table.append('thead').append('tr'),
        tbody = table.append('tbody');

    // When the data changes, update the table
    model.when(['data', 'columns'], function (data, columns) {
      var titles, tr, td;

      // Populate the table header
      titles = thead.selectAll('th').data(columns);
      titles.enter().append('th');
      titles.text(function (d) { return d.title; });
      titles.exit().remove();

      // Populate the table rows
      tr = tbody.selectAll('tr').data(data);
      tr.enter().append('tr');
      tr.exit().remove();
      
      // Set the values for each table cell
      td = tr.selectAll('td').data(function (row) {
        return columns.map(function (column) {
          return row[column.property];
        });
      });
      td.enter().append('td');
      td.exit().remove();
      td.text( function (d) { return d; });
    });

    return model;
  }
});
