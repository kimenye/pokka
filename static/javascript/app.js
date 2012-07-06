$(document).ready(function () {

    /**
     * Represents a player in the game...
     *
     * @type {*}
     */
    var Player = JS.Class({
        construct:function (name, gender, type) {
            var self = this;
            this.name = name;
//            this.gender = gender;
            this.hand = ko.observable(new Hand(type));
            this.type = type;

            this.hasCards = ko.computed(function() {
                return !self.hand().isEmpty();
            });

            this.hasSelections = ko.computed(function() {

            });
        },

        clearHand:function () {

        },

        give:function (card) {
            this.hand().add(card);
        }


    });

    var UserPlayer = Player.extend({
        construct: function(name, gender) {
            this.parent.construct.apply(this, [name, gender, PLAYER]);
        }
    });


    function Game() {
        var self = this;

        self.deck = ko.observable(null);
        self.computer = new Player("Computer", "F", COMPUTER);
        self.user = ko.observable(new UserPlayer("Player 1", "M"));

        if (self.deck() == null) {
            self.deck(new Deck());
            self.deck().display();
        }

        self.playerCanMove = ko.computed(function() {
//            return false;
            var hasCards = self.user().hasCards();
            console.log("User has cards ", hasCards);
            return hasCards;
        });


        self.shuffle = function() {
            self.deck().shuffle();
        }

        self.move = function() {
            if (user.hasSelections()) {

            }
        }

        self.deal = function() {
            _.each(_.range(0, 4), function (idx) {
                var player_card = self.deck().deal();
                var computer_card = self.deck().deal();
                self.user().give(player_card);
                self.computer.give(computer_card);
            });
        }
    }
    ko.applyBindings(new Game());
});