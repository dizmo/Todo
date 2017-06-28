//= require Dizmo

Class("Todo.Main", {
    has: {
        // This will be your wrapper around the dizmo API. It is instantiated
        // before the initialize function (defined below) is called and can
        // therefor already be used there.
        dizmo: {
            is: 'ro',
            init: function() {
                return new Todo.Dizmo();
            }
        }
    },

    after: {
        initialize: function() {
            var self = this;

            todo.Storage.init();
            todo.List.refresh();

            self.initEvents();
        }
    },

    methods: {
        initEvents: function() {
            var self = this;

            jQuery('#todo-list').height(dizmo.getHeight() - 110);

            jQuery(events).on('dizmo.resized', function(e, width, height) {
              jQuery('#todo-list').height(dizmo.getHeight() - 110);
            });

            // keypress handler for new task input field
            jQuery('#new-todo').on('keypress', function(e) {
                self.updateOnEnter(e);
            });

            jQuery('#clear-all').on('click', function() {
                // console.log("Clear all");

                DizmoElements('#my-confirmation').dnotify('ask', {
                    title: 'Clear all todos',
                    text: 'Are you sure? Please confirm.',
                    ok: function() { todo.Storage.deleteAll(); }
                });

            });

            jQuery('#clear-completed').on('click', function() {
                // console.log("Clear completed");

                DizmoElements('#my-confirmation').dnotify('ask', {
                    title: 'Clear completed todos',
                    text: 'Are you sure? Please confirm.',
                    ok: function() { todo.Storage.deleteCompleted(); }
                });

            });

            jQuery('#todo-list').on('click keypress', function(e) {

		var i,l,ioe,tid;
                // get target id
                var otid=e.target.id;
                if (otid) { tid=otid.substr(0,2); }
                // console.log(tid);
                // get data-id attribute of target
                var eid=e.target.getAttribute('data-id');
                // console.log(eid);

                // list
                if (tid=="to") {
                    //  hide all input elements
                    jQuery('.edit-todo').each(function(){jQuery(this).hide();});
                    // show all label elements
                    l=jQuery('.text-todo').length;
                    for (i = 0; i < l; i++) {
                        jQuery('#la'+i).show();
                    }
                }


                if (eid) {

                    // input
                    if (tid=="ip") {
                        if (e.type=="keypress"&&e.which==13) {
			    var nv=DizmoElements('#'+otid).val();
                            todo.Storage.update(eid,nv);
                            // hide input, show label
                            ioe=otid.substr(2,1);
                            jQuery('#'+otid).hide();
                            jQuery('#la'+ioe).show();
                        }
                    }

                    // label
                    if (tid=="la") {
                        //  hide all input elements
                        jQuery('.edit-todo').each(function(){jQuery(this).hide();});
                        // show all label elements
                        l=jQuery('.text-todo').length;
                        for (i = 0; i < l; i++) {
                            jQuery('#la'+i).show();
                        }

                        var cid=e.target.id;
                        ioe=cid.substr(2,1);
                        // show input, hide label
                        jQuery('#'+e.target.id).hide();
                        jQuery('#ip'+ioe).show();
                        jQuery('#ip'+ioe).focus();
                    }

                    // checkbox
                    if (tid=="cb") {
                        todo.Storage.toggleCompleted(eid);
                    }


                    // button
                    if (tid=="bu") {
                        // console.log("delete:"+eid);
                        todo.Storage.deleteOne(eid);
                    }
                }

            });

            this.subId=dizmo.publicStorage.subscribeToProperty("dizmo-todos",function(path,value,oldValue){
                todo.List.refresh();
            });

        },
        updateOnEnter: function(e) {
            var self = this;
            if(e.which == 13){
                self.addTodo();

            }
        },
        addTodo: function() {
            var value=jQuery('#new-todo').val().trim();
            if(value !== ""){
              todo.Storage.add(value);
            }
            jQuery('#new-todo').val('');
        }
    }
});
