// An interactive list.
// Curran Kelleher 6/12/2014
define(['d3', 'model'], function (d3, Model) {

  // The div that contains the list is passed to the constructor.
  return function (div) {

    // see http://getbootstrap.com/components/#list-group
    var listGroup = d3.select(div)
    
          // Append the top-level list group div
          .append('div')

          // Use the Bootstrap list group class
          .attr('class', 'list-group'),

        // Create an empty model.
        model = Model();

    // Initialize selected item to an empty array
    model.selectedItem = [];
    
    // Update the list when the data or selected item changes.
    model.when(['data', 'selectedItem'], function (data, selectedItem) {

      // Use <a class="list-group-item"> tags for each item.
      var items = listGroup.selectAll('a').data(data);
      items.enter().append('a').attr('class', 'list-group-item');
      items.text(function (d) { return d; });

      // Set the active class on selected item.
      items.classed('active', function (d) { 
        return selectedItem === d;
      });

      // Update the selected item when the user clicks on one.
      items.on('click', function (d) {
        model.selectedItem = d;
      });
    });

    // Return the model as the public API, where clients can set
    //
    //  * 'data' An array of strings representing all items
    //  * 'selectedItem' A string representing the selected item
    return model;
  };
});
