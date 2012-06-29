$(document).ready(function() {

    function ViewModel() {
        var self = this;

        self.messages = ko.observableArray([]);
    }

    var vm = new ViewModel();
    ko.applyBindings(vm);

    function log(msg) {
        vm.messages.push({ txt: msg });
    }

    var Suite = JS.Class({
        construct: function(symbol, title) {
            this.symbol = symbol;
            this.title = title;
        }
    });

    var Card = JS.Class({
        construct: function(suite, face) {
            this.suite = suite;
            this.face = face;
            log("Added the " + face + " of " + suite.title);
        }
    });

    var Joker = Card.extend({
        construct: function(index) {
            this.parent.construct.apply(this, [new Suite("j", "Joker"), index]);
        }
    });

    var Deck = JS.Class({
        construct: function() {
            var self = this;
            log("Setting up deck!");
            self.suites = [new Suite("c", "Cloves"),new Suite("d", "Diamonds"), new Suite("h", "Hearts"), new Suite("s", "Spades")];

            self.cards = [];
            _.each(self.suites, function(suite) {
                log("Setting up suite " + suite.title);
                _.each(_.range(2,11), function(itr) {
                    self.cards.push(new Card(suite, itr));
                });

                _.each(["J", "Q", "K", "A"], function(face) {
                    self.cards.push(new Card(suite, face));
                })
            });

            self.cards.push(new Joker(0));
            self.cards.push(new Joker(1));
        }
    });

    var deck = null;

    $('#poker-table').click(function() {

        if (deck == null) {
            deck = new Deck();
        }
    });



});