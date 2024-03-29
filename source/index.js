/*global $ DizmoElements */
global.document.addEventListener('dizmoready', function() {
  initEvents();
});
var todos;
function initEvents() {
  dizmo.canDock(false);
  dizmo.setAttribute('settings/usercontrols/allowresize', true);
  dizmo.setAttribute('settings/framecolor', '#ffffffDB');
  dizmo.setAttribute('geometry/minWidth', 240);
  dizmo.setAttribute('geometry/minHeight', 280);
  $('#todos').height(dizmo.getHeight() - 110);
  $('#new-todo').on('keypress', function(e) { if (e.which == 13) { addNewTodo(); } });
  $('#clear-all').on('click', function() {
    DizmoElements('#my-confirmation').dnotify('ask', { title: 'Clear all todos', text: 'Are you sure? Please confirm.',
      ok: function() { deleteAll(); }
    });
  });
  $('#clear-completed').on('click', function() {
    DizmoElements('#my-confirmation').dnotify('ask', { title: 'Clear completed todos', text: 'Are you sure? Please confirm.',
      ok: function() { deleteCompleted(); }
    });
  });
  $('#todos').on('click keypress', function(e) {
    const otid = e.target.id;
    const tid = otid.substr(0, 2);
    const eid = e.target.getAttribute('data-id');
    if (tid == 'to') {
      $('.edit').each(function() { $(this).hide(); });
    }
    if (eid) {
      if (tid == 'ip') {
        if (e.type == 'keypress' && e.which == 13) {
          var nv = DizmoElements('#' + otid).val();
          update(eid, nv);
          let ioe = otid.substr(2, 1);
          $('#' + otid).hide();
          $('#la' + ioe).show();
        }
      } else if (tid == 'la') {
        $('.edit').each(function() { $(this).hide(); });
        var cid = e.target.id;
        let ioe = cid.substr(2, 1);
        $('#' + e.target.id).hide();
        $('#ip' + ioe).show();
        $('#ip' + ioe).focus();
      } else if (tid == 'cb') {
        toggleCompleted(eid);
      } else if (tid == 'bu') {
        deleteOne(eid);
      }
    }
  });
  dizmo.onProperty('todos', changeTodos, { public: true });
  changeTodos('todos',dizmo.getProperty('todos', { public: true }));
  function changeTodos(p,val) {
    if (!val){ todos=[]; dizmo.setProperty('todos',todos, { public: true }); return; }
    todos=val;
    refresh();
  }
}
function addNewTodo() {
  const todo = $('#new-todo').val().trim();
  if (todo !== '') { add(todo); }
  $('#new-todo').val('');
}
function refresh() {
  const $ul = $('<ul />');
  todos.forEach((todo, i) => {
    let $li = $('<li />');
    $('<input />', { 'id': 'cb' + i, 'data-type': 'dizmo-input', 'data-id': todo.id, 'type': 'checkbox' }).appendTo($li);
    $('<label>', { 'id': 'la' + i, 'data-id': todo.id, 'text': todo.name, 'class': 'tasklabel' }).appendTo($li);
    $('<input />', { 'id': 'ip' + i, 'data-type': 'dizmo-input', 'data-id': todo.id, 'type': 'text', 'class': 'edit', 'value': todo.name }).appendTo($li);
    $('<button>', { 'id': 'bu' + i, 'text': 'x', 'data-id': todo.id, 'class': 'delete-todo', 'data-type': 'dizmo-button' }).appendTo($li);
    $li.appendTo($ul);
  });
  $('#todos').empty();
  $ul.appendTo('#todos');
  todos.forEach((todo, i) => {
    DizmoElements('#cb' + i).dcheckbox();
    DizmoElements('#bu' + i).dbutton();
    DizmoElements('#ip' + i).dinput();
    $('#ip' + i).hide();
    $('#la' + i).show();
    if (todo.completed) {
      DizmoElements('#cb' + i).prop('checked', true);
      $('#la' + i).css('text-decoration', 'line-through');
    }
  });
}
function _generateid() {
  return (_s4() + _s4() + '-' + _s4() + _s4());
  function _s4() { return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1); }
}
function add(name) {
  var todo = {};
  todo.name = name;
  todo.completed = false;
  todo.id = _generateid();
  todos.push(todo);
  dizmo.setProperty('todos', todos, { public: true });
  refresh();
}
function update(id, name) {
  todos.forEach((todo) => { if (id == todo.id) { todo.name = name; } });
  dizmo.setProperty('todos', todos, { public: true });
}
function toggleCompleted(id) {
  todos.forEach((todo) => { if (id == todo.id) { todo.completed=!todo.completed; } });
  dizmo.setProperty('todos', todos, { public: true });
}
function deleteOne(id) {
  dizmo.setProperty('todos', todos.filter((todo)=>id !== todo.id), { public: true });
}
function deleteCompleted() {
  dizmo.setProperty('todos', todos.filter((todo)=>!todo.completed), { public: true });
}
function deleteAll() {
  dizmo.setProperty('todos', [], { public: true });
}
