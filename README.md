# Todo dizmo

![Todo dizmo](https://github.com/dizmo/Todo/blob/master/assets/Preview.png)

We start by creating a new dizmo project with

``` {.bash}
$ grace new
```

Name your project 'Todo', choose 'dizmo' as your default plugin and 'joose' as your skeleton.

Note: If [Node.js](https://nodejs.org) is installed, Grace provides linting by default. If you do not wish linting, uncomment the line `//"autolint": false,` in the file project.cfg.

To read more about our Grace tool, refer to the chapter [Grace](/docs/complete-guide/grace/) in our complete guide.

## UI elements

In your Todo project folder, edit the file src/index.html. In the `<body>` tag above `<div id="front">` we add `<div id="my-confirmation" data-type="dizmo-notification"></div>` for a confirmation dialog box. We also add the various input fields, buttons and other UI elements styled with [dizmoElements](/docs/complete-guide/dizmoelements-library/). The `<body>` section:

``` {.html}
<body>
    <div id="my-confirmation" data-type="dizmo-notification"></div>
    <div id="front">
        <div id="task-entry">
            <input id="new-todo" data-type="dizmo-input" type="text" placeholder="Add a new task">

            <div id="todo-list" class="list" data-type="dizmo-list"></div>
            <div id="actions">
                <button id="clear-all" data-type="dizmo-button">Clear all</button>
                <button id="clear-completed" data-type="dizmo-button">Clear completed</button>
            </div>
        </div>
    </div>
    <div id="back">
        <div class="done-btn-wrapper">
            <button class="done-btn" data-type="dizmo-button">Done</button>
        </div>
    </div>

    <!-- Your own JavaScript (do not remove!) -->
    <script type="text/javascript" src="application.js"></script>
</body>
```


## Storage class

The Storage class handles creating new, updating existing, toggling status to completed as well deleting todo items and persists them in the [dizmo data tree](../data-tree/).

Create the file Storage.js in /src/javascript and require it in your /src/application.js file with

``` {.javascript}
//= require Storage
```

Storage.js:

``` {.javascript}
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
                this.storagelist.push(model);
                dizmo.publicStorage.setProperty("dizmo-todos",this.storagelist);
            },
            update: function(id,newValue) {
                console.log("update",id,newValue);
                for (var i = 0; i < this.storagelist.length; i++) {
                    if (id==this.storagelist[i].id) {
                        this.storagelist[i].name=newValue;
                    }
                }
                dizmo.publicStorage.setProperty("dizmo-todos",this.storagelist);
            },
            toggleCompleted: function(id) {
                for (var i = 0; i < this.storagelist.length; i++) {
                    if (id==this.storagelist[i].id) {
                        if (this.storagelist[i].completed) { this.storagelist[i].completed=false; } else { this.storagelist[i].completed=true; }
                    }
                }
                dizmo.publicStorage.setProperty("dizmo-todos",this.storagelist);
                //console.log(this.storagelist);
            },
            deleteOne: function(id) {
                for (var i = 0; i < this.storagelist.length; i++) {
                    if (id==this.storagelist[i].id) {
                        var removed=this.storagelist.splice(i,1);
                    }
                }
                dizmo.publicStorage.setProperty("dizmo-todos",this.storagelist);
                //console.log(this.storagelist);
            },
            deleteCompleted: function() {
                for (var i = 0; i < this.storagelist.length; i++) {
                    if (this.storagelist[i].completed) {
                        var removed=this.storagelist.splice(i,1);
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
```

## List class

The List class retrieves the todo items, then creates a checkbox for each item along with the item name as checkbox label and the delete button. The List class also handles updating the name of a todo item. As this list is created and updated at runtime, we manually add and destroy the scrollbar.

Create the file List.js in /src/javascript and require it in your /src/Storage.js file with

``` {.javascript}
//= require List
```

List.js:

``` {.javascript}
Class("todo.List", {
    my: {
        methods: {
            refresh: function() {

                var list=todo.Storage.getStorageList();

                var el = jQuery('<ul />');
                var list_el;

                for (var i = 0; i < list.length; i++) {
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
                if (this.iscroll !== undefined) {
                    this.iscroll.dlist('destroy');
                }

                // empty and re-fill list
                jQuery('#todo-list').empty();
                el.appendTo('#todo-list');

                // create scrollbar
                if (this.iscroll !== undefined) {
                    this.iscroll.dlist('create');
                } else {
                    this.iscroll = DizmoElements('#todo-list');
                    this.iscroll.dlist();
                }

                // update list
                DizmoElements('#todo-list').dlist('update');

                // initialize elements inside list
                for (var i = 0; i < list.length; i++) {
                    DizmoElements('#cb'+i).dcheckbox();
                    DizmoElements('#bu'+i).dbutton();

                    DizmoElements('#ip'+i).dinput();

                    jQuery('#ip'+i).hide();
                    jQuery('#la'+i).show();

                    if (list[i].completed) DizmoElements('#cb'+i).prop('checked',true);
                }
            }

        }
    }
});
```

## Events

We need to initialise the Storage and refresh the List objects dynamically. In the `after` method modifier, we add

``` {.javascript}
todo.Storage.init();
todo.List.refresh();
```

Our Todo dizmo can add a new todo item, update and delete it as well as prompt the user in a dialog box to confirm when deleting all or all completed todo items. View the full code of [Main.js](https://github.com/dizmo/Todo/blob/4b2193fe77be5bdb61494997c9fd1743347d8bca/src/javascript/Main.js) file on github. Your Todo dizmo is functional but still unstyled.

## Styling and usability

As Todo does not feature settings, we can remove `<div id="back">` in index.html, as well as

``` {.javascript}
jQuery('.done-btn').on('click', function() {
    Todo.Dizmo.showFront();
});
```
in Main.js and in application.js

``` {.javascript}
function showBack() {
    dizmo.showBack();
}
```

As seen in [Events](#events), Todo is not very user friendly yet. When the list grows to necessitate a scrollbar, the user can just scroll it to see all todo items and not move the Todo dizmo itself. We add `no-dizmo-drag` in index.html to the class in the tag `<div id="todo-list" class="list no-dizmo-drag" data-type="dizmo-list">.

When a todo item is completed, it is marked as crossed out. In the List.js file, we edit the condition `if (list[i].completed)`:

``` {.javascript}
if (list[i].completed) {
    DizmoElements('#cb'+i).prop('checked',true);
    jQuery("#la"+i).css("text-decoration","line-through");
}
```

We edit the src/style/style.scss and replace the icon.
