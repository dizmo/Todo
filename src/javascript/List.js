Class("todo.List", {
  my: {
    methods: {
      refresh: function() {
        var i;
        // var list=todo.Storage.getStorageList();
        var list = dizmo.publicStorage.getProperty('dizmo-todos');
        if(!list){
          list = [];
        }

        var el = jQuery('<ul />');
        var list_el;

        for (i = 0; i < list.length; i++) {
          list_el=jQuery('<li />');

          jQuery('<input />',{
            'id':'cb'+i,
            'data-type': 'dizmo-input',
            'data-id': list[i].id,
            'type':'checkbox'
          }).appendTo(list_el);


          jQuery('<label>',{
            'id':'la'+i,
            'data-id': list[i].id,
            'text':list[i].name,
            'class': 'tasklabel'

          }).appendTo(list_el);


          jQuery('<input />',{
            'id':'ip'+i,
            'data-type': 'dizmo-input',
            'data-id': list[i].id,
            'type':'text',
            'class': 'edit-todo',
            'value': list[i].name
          }).appendTo(list_el);


          jQuery('<button>',{
            'id' : 'bu'+i,
            'text': 'x',
            'data-id': list[i].id,
            'class': 'delete-todo',
            'data-type' : 'dizmo-button'
          }).appendTo(list_el);

          list_el.appendTo(el);
        }

        // destroy scrollbar
        // if (this.iscroll !== undefined) {
        //   this.iscroll.dlist('destroy');
        // }

        // empty and re-fill list
        jQuery('#todo-list').empty();
        el.appendTo('#todo-list');

        // create scrollbar
        // if (this.iscroll !== undefined) {
        //   this.iscroll.dlist('create');
        // } else {
        //   this.iscroll = DizmoElements('#todo-list');
        //   this.iscroll.dlist();
        // }

        // update list
        // DizmoElements('#todo-list').dlist('update');

        // initialize elements inside list
        for (i = 0; i < list.length; i++) {
          DizmoElements('#cb'+i).dcheckbox();
          DizmoElements('#bu'+i).dbutton();

          DizmoElements('#ip'+i).dinput();

          jQuery('#ip'+i).hide();
          jQuery('#la'+i).show();

          if (list[i].completed) {
            DizmoElements('#cb'+i).prop('checked',true);
            jQuery("#la"+i).css("text-decoration","line-through");
          }
        }
      }

    }
  }
});
