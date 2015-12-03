var Cmp = ng.
Component({
    selector: 'cmp',
    template:
    '<ul style="width:15em">' +
    '<li *ng-for="#item of list" id="{{item.id}}">' +
    '{{ item.name }}' +
    '</li>' +
    '</ul>',
    directives: [ng.NgModel, ng.FORM_DIRECTIVES, ng.NgFor]
}).
Class({
    constructor: [function Cmp() {
        // API Variables - PUT YOUR API INFO HERE ****
        var myAccountKey = "671e9b84e0662ba0aa64e9a2263fb579fbea53d8";
        var myApiKey = "7568df7fe6bf519f4a1d50996b64320fd986303b";
        var myInstance = "shy-sound-2014";
        var myClass = "items";

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