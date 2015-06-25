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