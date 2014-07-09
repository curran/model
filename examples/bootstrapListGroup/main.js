// An interactive list.
// Curran Kelleher 6/12/2014
require(['listGroup'], function (ListGroup) {
  var div = document.getElementById('container'),
      listGroup = ListGroup(div);

  listGroup.set({
    data: ['Larry', 'Curly', 'Moe'],
    selectedItems: ['Curly']
  });
});
