/*global jQuery DizmoElements */
window.showBack = dizmo.showBack;
window.showFront = dizmo.showFront;
window.document.addEventListener('dizmoready', function() {
  initEvents();
});
var storagelist;
dizmo.subscribeToAttribute('geometry/height', resized);
dizmo.subscribeToAttribute('geometry/width', resized);
function resized() {
  jQuery('#todo-list').height(dizmo.getHeight() - 110);
}
function initEvents() {
  dizmo.canDock(false);
  dizmo.setAttribute('settings/usercontrols/allowresize', true);
  dizmo.setAttribute('settings/framecolor', '#ffffffDB');
  dizmo.setAttribute('geometry/minWidth', 275);
  dizmo.setAttribute('geometry/minHeight', 300);
  init();
  refresh();
  jQuery('#todo-list').height(dizmo.getHeight() - 110);
  // keypress handler for new task input field
  jQuery('#new-todo').on('keypress', function(e) {
    updateOnEnter(e);
  });
  jQuery('#clear-all').on('click', function() {
    DizmoElements('#my-confirmation').dnotify('ask', { title: 'Clear all todos', text: 'Are you sure? Please confirm.',
      ok: function() { deleteAll(); }
    });
  });
  jQuery('#clear-completed').on('click', function() {
    DizmoElements('#my-confirmation').dnotify('ask', { title: 'Clear completed todos', text: 'Are you sure? Please confirm.',
      ok: function() { deleteCompleted(); }
    });
  });
  jQuery('#todo-list').on('click keypress', function(e) {
    var i, l, ioe, tid;
    var otid = e.target.id;
    if (otid) { tid = otid.substr(0, 2); }
    var eid = e.target.getAttribute('data-id');
    if (tid == "to") {
      jQuery('.edit-todo').each(function() { jQuery(this).hide(); });
      l = jQuery('.text-todo').length;
      for (i = 0; i < l; i++) { jQuery('#la' + i).show(); }
    }
    if (eid) {
      if (tid == "ip") {
        if (e.type == "keypress" && e.which == 13) {
          var nv = DizmoElements('#' + otid).val();
          update(eid, nv);
          ioe = otid.substr(2, 1);
          jQuery('#' + otid).hide();
          jQuery('#la' + ioe).show();
        }
      }
      // label
      if (tid == "la") {
        //  hide all input elements
        jQuery('.edit-todo').each(function() { jQuery(this).hide(); });
        // show all label elements
        l = jQuery('.text-todo').length;
        for (i = 0; i < l; i++) { jQuery('#la' + i).show(); }
        var cid = e.target.id;
        ioe = cid.substr(2, 1);
        // show input, hide label
        jQuery('#' + e.target.id).hide();
        jQuery('#ip' + ioe).show();
        jQuery('#ip' + ioe).focus();
      }
      // checkbox
      if (tid == "cb") {
        toggleCompleted(eid);
      }
      // button
      if (tid == "bu") {
        // console.log("delete:"+eid);
        deleteOne(eid);
      }
    }
  });
  dizmo.publicStorage.subscribeToProperty("dizmo-todos", function() { refresh(); });
}
function updateOnEnter(e) { if (e.which == 13) { addTodo(); } }
function addTodo() {
  var value = jQuery('#new-todo').val().trim();
  if (value !== "") { add(value); }
  jQuery('#new-todo').val('');
}
function refresh() {
  var i;
  // var list=getStorageList();
  var list = dizmo.publicStorage.getProperty('dizmo-todos');
  if (!list) { list = []; }
  var el = jQuery('<ul />');
  var list_el;
  for (i = 0; i < list.length; i++) {
    list_el = jQuery('<li />');
    jQuery('<input />', { 'id': 'cb' + i, 'data-type': 'dizmo-input', 'data-id': list[i].id, 'type': 'checkbox' }).appendTo(list_el);
    jQuery('<label>', { 'id': 'la' + i, 'data-id': list[i].id, 'text': list[i].name, 'class': 'tasklabel' }).appendTo(list_el);
    jQuery('<input />', { 'id': 'ip' + i, 'data-type': 'dizmo-input', 'data-id': list[i].id, 'type': 'text', 'class': 'edit-todo', 'value': list[i].name }).appendTo(list_el);
    jQuery('<button>', { 'id': 'bu' + i, 'text': 'x', 'data-id': list[i].id, 'class': 'delete-todo', 'data-type': 'dizmo-button' }).appendTo(list_el);
    list_el.appendTo(el);
  }
  jQuery('#todo-list').empty();
  el.appendTo('#todo-list');
  for (i = 0; i < list.length; i++) {
    DizmoElements('#cb' + i).dcheckbox();
    DizmoElements('#bu' + i).dbutton();
    DizmoElements('#ip' + i).dinput();
    jQuery('#ip' + i).hide();
    jQuery('#la' + i).show();
    if (list[i].completed) {
      DizmoElements('#cb' + i).prop('checked', true);
      jQuery("#la" + i).css("text-decoration", "line-through");
    }
  }
}
function init() {
  var records = dizmo.publicStorage.getProperty("dizmo-todos");
  if (records) { storagelist = records; }
}
function _generateid() {
  return (_s4() + _s4() + "-" + _s4() + _s4());
  function _s4() { return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1); }
}
function add(value) {
  var model = {};
  model.name = value;
  model.completed = false;
  model.id = _generateid();
  storagelist = dizmo.publicStorage.getProperty("dizmo-todos");
  if (!storagelist) {
    storagelist = [];
  }
  storagelist.push(model);
  dizmo.publicStorage.setProperty("dizmo-todos", storagelist);
  refresh();
}
function update(id, newValue) {
  // console.log("update",id,newValue);
  storagelist = dizmo.publicStorage.getProperty("dizmo-todos");
  if (!storagelist) {
    storagelist = [];
  }
  for (var i = 0; i < storagelist.length; i++) {
    if (id == storagelist[i].id) {
      storagelist[i].name = newValue;
    }
  }
  dizmo.publicStorage.setProperty("dizmo-todos", storagelist);
}
function toggleCompleted(id) {
  storagelist = dizmo.publicStorage.getProperty("dizmo-todos");
  if (!storagelist) {
    storagelist = [];
  }
  for (var i = 0; i < storagelist.length; i++) {
    if (id == storagelist[i].id) {
      if (storagelist[i].completed) {
        storagelist[i].completed = false;
      } else {
        storagelist[i].completed = true;
      }
    }
  }
  dizmo.publicStorage.setProperty("dizmo-todos", storagelist);
  //console.log(storagelist);
}
function deleteOne(id) {
  storagelist = dizmo.publicStorage.getProperty("dizmo-todos");
  if (!storagelist) {
    storagelist = [];
  }
  for (var i = 0; i < storagelist.length; i++) {
    if (id == storagelist[i].id) {
      storagelist.splice(i, 1);
    }
  }
  dizmo.publicStorage.setProperty("dizmo-todos", storagelist);
  //console.log(storagelist);
}
function deleteCompleted() {
  storagelist = dizmo.publicStorage.getProperty("dizmo-todos");
  if (!storagelist) {
    storagelist = [];
  }
  for (var i = 0; i < storagelist.length; i++) {
    if (storagelist[i].completed) {
      storagelist.splice(i, 1);
      i--;
    }
  }
  dizmo.publicStorage.setProperty("dizmo-todos", storagelist);
}
function deleteAll() {
  storagelist = [];
  dizmo.publicStorage.setProperty("dizmo-todos", []);
}
