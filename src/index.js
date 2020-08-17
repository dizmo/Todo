/**
 * @class The custom wrapper around the provided dizmo API
 *
 * @description
 * This class serves as a basis for a custom wrapper around the dizmo API. It should be extended by the developer and can be used as a reference as to how an interaction with the API could work out. Some basic events are already programmed and can be used.
 */
Class("Todo.Dizmo", {
    my: {
        methods: {
            /**
             * Shows the back of the dizmo
             * @static
             */
            showBack: function() {
                dizmo.showBack();
            },

            /**
             * Shows the front of the dizmo
             * @static
             */
            showFront: function() {
                dizmo.showFront();
            },

            /**
             * Get the ID of the underlying dizmo
             * @return {String} ID of the dizmo
             */
            getId: function() {
                return dizmo.identifier;
            },

            /**
             * Load the value saved at the given path. If no value is saved
             * in this path, return null.
             * @param  {String} path The path to look for a value
             * @return {*}      Value that is saved in the given type
             * @static
             */
            load: function(path) {
                var self = this;

                return dizmo.privateStorage.getProperty(path);
            },

            /**
             * Saves a value in the given path.
             * @param {String} path  The path to save the value to
             * @param {*}  value The value to save
             * @static
             */
            save: function(path, value) {
                var self = this;

                dizmo.privateStorage.setProperty(path, value);
            },

            /**
             * Set the title of the dizmo
             * @param {String} value Title of the dizmo
             * @static
             */
            setTitle: function(value) {
                if (jQuery.type(value) === 'string') {
                    dizmo.setAttribute('settings/title', value);
                }
            },

            /**
             * Publish the path with the chosen value. If no path is specified, meaning if
             * the function is called with only value, it will use the standard publish path
             * 'stdout'.
             * @param  {String} path   The path to publish to
             * @param  {*}  value  The value to set the publish path to
             * @static
             */
            publish: function(path, value) {
                var self = this;

                if (jQuery.type(path) === 'undefined') {
                    return;
                }

                if (jQuery.type(value) === 'undefined') {
                    value = path;
                    path = 'stdout';
                }

                dizmo.publicStorage.setProperty(path, value);
            },

            /**
             * Delete the published path. If no path is specified, it will delete the standard
             * path 'stdout'.
             * @param  {String} path Path to remove from publishing
             * @static
             */
            unpublish: function(path) {
                if (jQuery.type(path) === 'undefined') {
                    path = 'stdout';
                }

                dizmo.publicStorage.deleteProperty(path);
            },

            /**
             * @return {Object} The size of the dizmo as width and height
             * @static
             */
            getSize: function() {
                return dizmo.getSize();
            },

            /**
             * Set the size of the dizmo
             * @param {Number} width  The width of the dizmo
             * @param {Number} height The height of the dizmo
             * @static
             */
            setSize: function(width, height) {
                if (jQuery.type(width) !== 'number') {
                    throw 'Please provide only numbers for width!';
                }
                if (jQuery.type(height) !== 'number') {
                    throw 'Please provide only numbers for height!';
                }

                dizmo.setSize(width, height);
            },

            subscribe: function(path, callback) {
                var self = this;

                if (jQuery.type(callback) !== 'function') {
                    console.log('Please only provide a function as the callback.');
                    return null;
                }
                if (jQuery.type(path) !== 'string') {
                    console.log('Please only provide a string as the path.');
                    return null;
                }

                var id = null;
                id = dizmo.privateStorage.subscribeToProperty(path, function(path, val, oldVal) {
                    callback.call(self, val, oldVal);
                });

                return id;
            },

            unsubscribe: function(id) {
                dizmo.privateStorage.unsubscribeProperty(id);
            }
        }
    },

    after: {
        /**
         * Called after the internal initialize method
         * @private
         */
        initialize: function() {
            var self = this;

            self.setAttributes();
            self.initEvents();
        }
    },

    methods: {
        /**
         * Initiate all the events for dizmo related stuff
         * @private
         */
        initEvents: function() {
            var self = this;

            // Show back and front listeners
            dizmo.onShowBack(function() {
                jQuery(events).trigger('dizmo.turned', ['back']);
            });

            dizmo.onShowFront(function() {
                jQuery(events).trigger('dizmo.turned', ['front']);
            });

            // Subscribe to height changes of the dizmo
            dizmo.subscribeToAttribute('geometry/height', function(path, val, oldVal) {
                jQuery(events).trigger('dizmo.resized', [dizmo.getWidth(), dizmo.getHeight()]);
            });

            // Subscribe to width changes of the dizmo
            dizmo.subscribeToAttribute('geometry/width', function(path, val, oldVal) {
                jQuery(events).trigger('dizmo.resized', [dizmo.getWidth(), dizmo.getHeight()]);
            });

            // Subscribe to displayMode changes
            viewer.subscribeToAttribute('settings/displaymode', function(path, val, oldVal) {
                if (val === 'presentation') {
                    dizmo.setAttribute('state/framehidden', true);
                } else {
                    dizmo.setAttribute('state/framehidden', false);
                }

                jQuery(events).trigger('dizmo.onmodechanged', [val]);
            });

            //Tell the dizmo space that this dizmo can be docked to other dizmos. You can also supply a function
            //which gets the to be docked dizmo and has to return false or true if the dizmo can dock.
            dizmo.canDock(false);

            //If a dizmo is docked to this dizmo, the function provided to the onDock function is being called and receives
            //the instance of the docked dizmo as a parameter.
            dizmo.onDock(function(dockedDizmo) {
                // Write code here that should happen when a dizmo has been docked.
                // The line below is a small example on how to relay the event to other
                // classes.
                jQuery(events).trigger('dizmo.docked');
            });

            // onUndock is called when a dizmo has been undocked from this dizmo. The provided function receives the undocked
            // dizmo as a parameter.
            dizmo.onUndock(function(undockedDizmo) {
                // Write code here that should happen when a dizmo has been un-docked.
                // The line below is a small example on how to relay the event to other
                // classes.
                jQuery(events).trigger('dizmo.undocked');
            });
        },

        /**
         * Set the dizmo default attributes like resize and docking
         * @private
         */
        setAttributes: function() {
            var self = this;

            // Allow the resizing of the dizmo
            dizmo.setAttribute('settings/usercontrols/allowresize', true);

            // Set framecolor to white
            dizmo.setAttribute('settings/framecolor', '#ffffffDB');

            dizmo.setAttribute('geometry/minWidth', 275);
            dizmo.setAttribute('geometry/minHeight', 300);
        }
    }
});

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
/**
 * @class The custom wrapper around the provided dizmo API
 *
 * @description
 * This class serves as a basis for a custom wrapper around the dizmo API. It should be extended by the developer and can be used as a reference as to how an interaction with the API could work out. Some basic events are already programmed and can be used.
 */
Class("Todo.Dizmo", {
    my: {
        methods: {
            /**
             * Shows the back of the dizmo
             * @static
             */
            showBack: function() {
                dizmo.showBack();
            },

            /**
             * Shows the front of the dizmo
             * @static
             */
            showFront: function() {
                dizmo.showFront();
            },

            /**
             * Get the ID of the underlying dizmo
             * @return {String} ID of the dizmo
             */
            getId: function() {
                return dizmo.identifier;
            },

            /**
             * Load the value saved at the given path. If no value is saved
             * in this path, return null.
             * @param  {String} path The path to look for a value
             * @return {*}      Value that is saved in the given type
             * @static
             */
            load: function(path) {
                var self = this;

                return dizmo.privateStorage.getProperty(path);
            },

            /**
             * Saves a value in the given path.
             * @param {String} path  The path to save the value to
             * @param {*}  value The value to save
             * @static
             */
            save: function(path, value) {
                var self = this;

                dizmo.privateStorage.setProperty(path, value);
            },

            /**
             * Set the title of the dizmo
             * @param {String} value Title of the dizmo
             * @static
             */
            setTitle: function(value) {
                if (jQuery.type(value) === 'string') {
                    dizmo.setAttribute('settings/title', value);
                }
            },

            /**
             * Publish the path with the chosen value. If no path is specified, meaning if
             * the function is called with only value, it will use the standard publish path
             * 'stdout'.
             * @param  {String} path   The path to publish to
             * @param  {*}  value  The value to set the publish path to
             * @static
             */
            publish: function(path, value) {
                var self = this;

                if (jQuery.type(path) === 'undefined') {
                    return;
                }

                if (jQuery.type(value) === 'undefined') {
                    value = path;
                    path = 'stdout';
                }

                dizmo.publicStorage.setProperty(path, value);
            },

            /**
             * Delete the published path. If no path is specified, it will delete the standard
             * path 'stdout'.
             * @param  {String} path Path to remove from publishing
             * @static
             */
            unpublish: function(path) {
                if (jQuery.type(path) === 'undefined') {
                    path = 'stdout';
                }

                dizmo.publicStorage.deleteProperty(path);
            },

            /**
             * @return {Object} The size of the dizmo as width and height
             * @static
             */
            getSize: function() {
                return dizmo.getSize();
            },

            /**
             * Set the size of the dizmo
             * @param {Number} width  The width of the dizmo
             * @param {Number} height The height of the dizmo
             * @static
             */
            setSize: function(width, height) {
                if (jQuery.type(width) !== 'number') {
                    throw 'Please provide only numbers for width!';
                }
                if (jQuery.type(height) !== 'number') {
                    throw 'Please provide only numbers for height!';
                }

                dizmo.setSize(width, height);
            },

            subscribe: function(path, callback) {
                var self = this;

                if (jQuery.type(callback) !== 'function') {
                    console.log('Please only provide a function as the callback.');
                    return null;
                }
                if (jQuery.type(path) !== 'string') {
                    console.log('Please only provide a string as the path.');
                    return null;
                }

                var id = null;
                id = dizmo.privateStorage.subscribeToProperty(path, function(path, val, oldVal) {
                    callback.call(self, val, oldVal);
                });

                return id;
            },

            unsubscribe: function(id) {
                dizmo.privateStorage.unsubscribeProperty(id);
            }
        }
    },

    after: {
        /**
         * Called after the internal initialize method
         * @private
         */
        initialize: function() {
            var self = this;

            self.setAttributes();
            self.initEvents();
        }
    },

    methods: {
        /**
         * Initiate all the events for dizmo related stuff
         * @private
         */
        initEvents: function() {
            var self = this;

            // Show back and front listeners
            dizmo.onShowBack(function() {
                jQuery(events).trigger('dizmo.turned', ['back']);
            });

            dizmo.onShowFront(function() {
                jQuery(events).trigger('dizmo.turned', ['front']);
            });

            // Subscribe to height changes of the dizmo
            dizmo.subscribeToAttribute('geometry/height', function(path, val, oldVal) {
                jQuery(events).trigger('dizmo.resized', [dizmo.getWidth(), dizmo.getHeight()]);
            });

            // Subscribe to width changes of the dizmo
            dizmo.subscribeToAttribute('geometry/width', function(path, val, oldVal) {
                jQuery(events).trigger('dizmo.resized', [dizmo.getWidth(), dizmo.getHeight()]);
            });

            // Subscribe to displayMode changes
            viewer.subscribeToAttribute('settings/displaymode', function(path, val, oldVal) {
                if (val === 'presentation') {
                    dizmo.setAttribute('state/framehidden', true);
                } else {
                    dizmo.setAttribute('state/framehidden', false);
                }

                jQuery(events).trigger('dizmo.onmodechanged', [val]);
            });

            //Tell the dizmo space that this dizmo can be docked to other dizmos. You can also supply a function
            //which gets the to be docked dizmo and has to return false or true if the dizmo can dock.
            dizmo.canDock(false);

            //If a dizmo is docked to this dizmo, the function provided to the onDock function is being called and receives
            //the instance of the docked dizmo as a parameter.
            dizmo.onDock(function(dockedDizmo) {
                // Write code here that should happen when a dizmo has been docked.
                // The line below is a small example on how to relay the event to other
                // classes.
                jQuery(events).trigger('dizmo.docked');
            });

            // onUndock is called when a dizmo has been undocked from this dizmo. The provided function receives the undocked
            // dizmo as a parameter.
            dizmo.onUndock(function(undockedDizmo) {
                // Write code here that should happen when a dizmo has been un-docked.
                // The line below is a small example on how to relay the event to other
                // classes.
                jQuery(events).trigger('dizmo.undocked');
            });
        },

        /**
         * Set the dizmo default attributes like resize and docking
         * @private
         */
        setAttributes: function() {
            var self = this;

            // Allow the resizing of the dizmo
            dizmo.setAttribute('settings/usercontrols/allowresize', true);

            // Set framecolor to white
            dizmo.setAttribute('settings/framecolor', '#ffffffDB');

            dizmo.setAttribute('geometry/minWidth', 275);
            dizmo.setAttribute('geometry/minHeight', 300);
        }
    }
});

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
/**
 * @class The custom wrapper around the provided dizmo API
 *
 * @description
 * This class serves as a basis for a custom wrapper around the dizmo API. It should be extended by the developer and can be used as a reference as to how an interaction with the API could work out. Some basic events are already programmed and can be used.
 */
Class("Todo.Dizmo", {
    my: {
        methods: {
            /**
             * Shows the back of the dizmo
             * @static
             */
            showBack: function() {
                dizmo.showBack();
            },

            /**
             * Shows the front of the dizmo
             * @static
             */
            showFront: function() {
                dizmo.showFront();
            },

            /**
             * Get the ID of the underlying dizmo
             * @return {String} ID of the dizmo
             */
            getId: function() {
                return dizmo.identifier;
            },

            /**
             * Load the value saved at the given path. If no value is saved
             * in this path, return null.
             * @param  {String} path The path to look for a value
             * @return {*}      Value that is saved in the given type
             * @static
             */
            load: function(path) {
                var self = this;

                return dizmo.privateStorage.getProperty(path);
            },

            /**
             * Saves a value in the given path.
             * @param {String} path  The path to save the value to
             * @param {*}  value The value to save
             * @static
             */
            save: function(path, value) {
                var self = this;

                dizmo.privateStorage.setProperty(path, value);
            },

            /**
             * Set the title of the dizmo
             * @param {String} value Title of the dizmo
             * @static
             */
            setTitle: function(value) {
                if (jQuery.type(value) === 'string') {
                    dizmo.setAttribute('settings/title', value);
                }
            },

            /**
             * Publish the path with the chosen value. If no path is specified, meaning if
             * the function is called with only value, it will use the standard publish path
             * 'stdout'.
             * @param  {String} path   The path to publish to
             * @param  {*}  value  The value to set the publish path to
             * @static
             */
            publish: function(path, value) {
                var self = this;

                if (jQuery.type(path) === 'undefined') {
                    return;
                }

                if (jQuery.type(value) === 'undefined') {
                    value = path;
                    path = 'stdout';
                }

                dizmo.publicStorage.setProperty(path, value);
            },

            /**
             * Delete the published path. If no path is specified, it will delete the standard
             * path 'stdout'.
             * @param  {String} path Path to remove from publishing
             * @static
             */
            unpublish: function(path) {
                if (jQuery.type(path) === 'undefined') {
                    path = 'stdout';
                }

                dizmo.publicStorage.deleteProperty(path);
            },

            /**
             * @return {Object} The size of the dizmo as width and height
             * @static
             */
            getSize: function() {
                return dizmo.getSize();
            },

            /**
             * Set the size of the dizmo
             * @param {Number} width  The width of the dizmo
             * @param {Number} height The height of the dizmo
             * @static
             */
            setSize: function(width, height) {
                if (jQuery.type(width) !== 'number') {
                    throw 'Please provide only numbers for width!';
                }
                if (jQuery.type(height) !== 'number') {
                    throw 'Please provide only numbers for height!';
                }

                dizmo.setSize(width, height);
            },

            subscribe: function(path, callback) {
                var self = this;

                if (jQuery.type(callback) !== 'function') {
                    console.log('Please only provide a function as the callback.');
                    return null;
                }
                if (jQuery.type(path) !== 'string') {
                    console.log('Please only provide a string as the path.');
                    return null;
                }

                var id = null;
                id = dizmo.privateStorage.subscribeToProperty(path, function(path, val, oldVal) {
                    callback.call(self, val, oldVal);
                });

                return id;
            },

            unsubscribe: function(id) {
                dizmo.privateStorage.unsubscribeProperty(id);
            }
        }
    },

    after: {
        /**
         * Called after the internal initialize method
         * @private
         */
        initialize: function() {
            var self = this;

            self.setAttributes();
            self.initEvents();
        }
    },

    methods: {
        /**
         * Initiate all the events for dizmo related stuff
         * @private
         */
        initEvents: function() {
            var self = this;

            // Show back and front listeners
            dizmo.onShowBack(function() {
                jQuery(events).trigger('dizmo.turned', ['back']);
            });

            dizmo.onShowFront(function() {
                jQuery(events).trigger('dizmo.turned', ['front']);
            });

            // Subscribe to height changes of the dizmo
            dizmo.subscribeToAttribute('geometry/height', function(path, val, oldVal) {
                jQuery(events).trigger('dizmo.resized', [dizmo.getWidth(), dizmo.getHeight()]);
            });

            // Subscribe to width changes of the dizmo
            dizmo.subscribeToAttribute('geometry/width', function(path, val, oldVal) {
                jQuery(events).trigger('dizmo.resized', [dizmo.getWidth(), dizmo.getHeight()]);
            });

            // Subscribe to displayMode changes
            viewer.subscribeToAttribute('settings/displaymode', function(path, val, oldVal) {
                if (val === 'presentation') {
                    dizmo.setAttribute('state/framehidden', true);
                } else {
                    dizmo.setAttribute('state/framehidden', false);
                }

                jQuery(events).trigger('dizmo.onmodechanged', [val]);
            });

            //Tell the dizmo space that this dizmo can be docked to other dizmos. You can also supply a function
            //which gets the to be docked dizmo and has to return false or true if the dizmo can dock.
            dizmo.canDock(false);

            //If a dizmo is docked to this dizmo, the function provided to the onDock function is being called and receives
            //the instance of the docked dizmo as a parameter.
            dizmo.onDock(function(dockedDizmo) {
                // Write code here that should happen when a dizmo has been docked.
                // The line below is a small example on how to relay the event to other
                // classes.
                jQuery(events).trigger('dizmo.docked');
            });

            // onUndock is called when a dizmo has been undocked from this dizmo. The provided function receives the undocked
            // dizmo as a parameter.
            dizmo.onUndock(function(undockedDizmo) {
                // Write code here that should happen when a dizmo has been un-docked.
                // The line below is a small example on how to relay the event to other
                // classes.
                jQuery(events).trigger('dizmo.undocked');
            });
        },

        /**
         * Set the dizmo default attributes like resize and docking
         * @private
         */
        setAttributes: function() {
            var self = this;

            // Allow the resizing of the dizmo
            dizmo.setAttribute('settings/usercontrols/allowresize', true);

            // Set framecolor to white
            dizmo.setAttribute('settings/framecolor', '#ffffffDB');

            dizmo.setAttribute('geometry/minWidth', 275);
            dizmo.setAttribute('geometry/minHeight', 300);
        }
    }
});

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

Class("todo.Storage", {
    my: {
        has: {
            storagelist: {
                is: 'rw',
                init: [],
                setterName: 'setStorageList',
                getterName: 'getStorageList'
            }
        },
        methods: {
            init: function() {
                var records=dizmo.publicStorage.getProperty("dizmo-todos");
                if (records) { this.storagelist=records; }
            },
            _s4: function() {
                return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
            },
            _generateid: function() {
                return (this._s4()+this._s4()+"-"+this._s4()+this._s4());
            },
            add: function(value) {
                var model= {};
                model.name=value;
                model.completed=false;
                model.id=this._generateid();
                this.storagelist = dizmo.publicStorage.getProperty("dizmo-todos");
                if(!this.storagelist){
                  this.storagelist = [];
                }
                this.storagelist.push(model);
                dizmo.publicStorage.setProperty("dizmo-todos",this.storagelist);
                todo.List.refresh();
            },
            update: function(id,newValue) {
                // console.log("update",id,newValue);
                this.storagelist = dizmo.publicStorage.getProperty("dizmo-todos");
                if(!this.storagelist){
                  this.storagelist = [];
                }
                for (var i = 0; i < this.storagelist.length; i++) {
                    if (id==this.storagelist[i].id) {
                        this.storagelist[i].name=newValue;
                    }
                }
                dizmo.publicStorage.setProperty("dizmo-todos",this.storagelist);
            },
            toggleCompleted: function(id) {
              this.storagelist = dizmo.publicStorage.getProperty("dizmo-todos");
              if(!this.storagelist){
                this.storagelist = [];
              }
                for (var i = 0; i < this.storagelist.length; i++) {
                    if (id==this.storagelist[i].id) {
                        if (this.storagelist[i].completed) { this.storagelist[i].completed=false; } else { this.storagelist[i].completed=true; }
                    }
                }
                dizmo.publicStorage.setProperty("dizmo-todos",this.storagelist);
                //console.log(this.storagelist);
            },
            deleteOne: function(id) {
              this.storagelist = dizmo.publicStorage.getProperty("dizmo-todos");
              if(!this.storagelist){
                this.storagelist = [];
              }
                for (var i = 0; i < this.storagelist.length; i++) {
                    if (id==this.storagelist[i].id) {
                        var removed=this.storagelist.splice(i,1);
                    }
                }
                dizmo.publicStorage.setProperty("dizmo-todos",this.storagelist);
                //console.log(this.storagelist);
            },
            deleteCompleted: function() {
              this.storagelist = dizmo.publicStorage.getProperty("dizmo-todos");
              if(!this.storagelist){
                this.storagelist = [];
              }
                for (var i = 0; i < this.storagelist.length; i++) {
                    if (this.storagelist[i].completed) {
                        var removed=this.storagelist.splice(i,1);
                        i--;
                    }
                }
                dizmo.publicStorage.setProperty("dizmo-todos",this.storagelist);
            },
            deleteAll: function() {
                this.storagelist=[];
                dizmo.publicStorage.setProperty("dizmo-todos",[]);
            }
        }
    }
});

/*
Generally you do not need to edit this file. You can start writing
your code in the provided "Main" class.
*/

// Helper object to attach all the events to
var events = {};

// As soon as the dom is loaded, and the dizmo is ready, instantiate the main class
window.document.addEventListener('dizmoready', function() {
    new Todo.Main();
});

