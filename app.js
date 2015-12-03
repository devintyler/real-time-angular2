var Cmp = ng.
Component({
    selector: 'cmp',
    template:
    '<ul style="width:15em">' +
    '<li *ng-for="#item of list" id="{{item.id}}">' +
    '{{ item.name }} <button (click)="removeItem(item)" style="float:right;">X</button>' +
    '</li>' +
    '</ul>' +
    '<input id="textEntry" #textbox (keyup)="doneTyping($event)">' +
    '<button id="submitButton" (click)="addItem(textbox.value)">Add Item</button>',
    directives: [ng.NgModel, ng.FORM_DIRECTIVES, ng.NgFor]
}).
Class({
    constructor: [function Cmp() {
        // API Variables - PUT YOUR API INFO HERE ****
        var myAccountKey = "SYNCANO-ACCOUNT-KEY";
        var myApiKey = "SYNCANO-API-KEY";
        var myInstance = "SYNCANO-INSTANCE";
        var myClass = "SYNCANO-CLASS";

        var self = this; // ES5
        this.list = []; // list of items

        // Syncano variables
        var sync = new Syncano({accountKey:myAccountKey}); // for creating obj
        var instance = new Syncano({apiKey:myApiKey, instance:myInstance}); // for realtime
        var realtime = instance.channel('itemlist').watch(); // realtime instance variable

        // Initial List from Syncano
        sync.instance(myInstance).class(myClass).dataobject().list()
            .then(function(res){
                for(i=0;i<res.objects.length;i++){
                    self.list.push({ // push to array
                        name: res.objects[i].name,
                        id: res.objects[i].id
                    });
                }
            })
            .catch(function(err){
                console.log(err);
            });

        // Realtime Event Listeners
        realtime.on('create', function(data) {
            self.list.push({ // push new item to array with Syncano data
                name: data.name,
                id: data.id
            });
        });

        realtime.on('delete', function(data) {
            for(var i = self.list.length - 1; i >= 0; i--) {
                if(self.list[i].id === data.id) {
                    self.list.splice(i, 1); // remove from array
                }
            }
        });

        realtime.on('error', function(data) {
            console.log(data);
        });

        this.addItem = function(item) { // add item to Syncano
            var newItem = {
                "name":item,
                "channel":"itemlist"
            };
            sync.instance(myInstance).class(myClass).dataobject().add(newItem)
                .then(function(res){

                })
                .catch(function(err){
                    console.log(err);
                })
        };
        this.removeItem = function(item){ // remove item from Syncano
            sync.instance(myInstance).class(myClass).dataobject(item.id).delete()
                .then(function(res){
                    console.log("Item: [" + item.name + "] was deleted");
                })
                .catch(function(err){
                    console.log(err);
                });
        };
        this.doneTyping = function($event) { // watches for keys when done typing
            if($event.which === 13) { // 'enter' key
                this.addItem($event.target.value);
                $event.target.value = null;
            }
        };
    }]
});

document.addEventListener('DOMContentLoaded', function() {
    ng.bootstrap(Cmp);
});