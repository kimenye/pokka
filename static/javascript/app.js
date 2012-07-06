$(document).ready(function () {

    var Game = JS.Class({
        //TODO: need to implement multi player...
        construct: function(user_player, computer_player, board) {
            var self = this;
            this.user = user_player;
            this.computer = computer_player;
            this.board = board;

            this.whoseTurn = ko.computed(function() {
                var turn = _.find([self.user, self.computer], function(player) {
                    return player.isTurnToPlay()
                });

                if (turn != null)
                    return turn.name.toUpperCase() + "'S TURN TO PLAY";
                else
                    return "GAME NOT STARTED"
            });
        },

        startGame: function() {
            //randomly pick which user gets to start
            //TODO: implement correct coin toss
            var playerWinsToss = Math.floor( Math.random() * 2 ) == 1
            if (playerWinsToss)
                this.giveTurnTo(this.user, this.computer);
            else
                this.giveTurnTo(this.computer, this.user);
        },

        giveTurnTo: function(player, other) {
            player.isTurnToPlay(true);
            other.isTurnToPlay(false);
        }
    });

    var Board = JS.Class({
        construct: function() {
            this.cards = ko.observableArray([]);
            this.card_container = document.getElementById("board-deck");

            while (this.card_container.firstChild != null) {
                this.card_container.removeChild(this.card_container.firstChild);
            }
        },

        start: function(openingCard) {
//            this.cards.push(openingCard);
            this.drawCard(openingCard);
        },

        drawCard: function(card) {
            this.cards.push(card);
//            card.current_hand = this;
            card.current_hand = null;
            var numCards = this.cards().length;
            var left =5 + (0.25 * numCards);
            var top = 3 + (0.0625 * numCards);

            var node = card.buildNode();

//            if (this.hidden)
//                node.firstChild.style.visibility = "hidden";

            card.selectable = false;
            node.style.left = left + "em";
            node.style.top = top + "em";

            this.card_container.appendChild(node);
        }
    });

    /**
     * Represents a player in the game...
     *
     * @type {*}
     */
    var Player = JS.Class({
        construct:function (name, type) {
            var self = this;
            this.name = name;
            this.hand = ko.observable(new Hand(type));
            this.type = type;
            this.isTurnToPlay = ko.observable(false);

            this.hasCards = ko.computed(function() {
                return !self.hand().isEmpty();
            });

            this.hasSelections = ko.computed(function() {
                return self.hand().getSelectedCards().length > 0;
            });
        },

        give:function (card) {
            this.hand().add(card);
        }
    });

    var UserPlayer = Player.extend({
        construct: function(name) {
            this.parent.construct.apply(this, [name, PLAYER]);
        }
    });


    function GameVM() {
        var self = this;

        self.deck = ko.observable(null);
        self.computer = new Player("Computer", COMPUTER);
        self.user = ko.observable(new UserPlayer("Player 1"));
        self.inProgress = ko.observable(false);
        self.board = ko.observable(new Board());
        self.game = ko.observable(new Game(self.user(), self.computer, self.board() ));


        if (self.deck() == null) {
            self.deck(new Deck());
            self.deck().display();
        }

        self.playerCanMove = ko.computed(function() {
            var hasSelections = self.user().hasSelections();
            return hasSelections && self.playerCanPlay();
        });

        self.playerCanPlay = ko.computed(function() {
           return self.user().isTurnToPlay();
        });

        self.startGame = function() {
            self.shuffle();
            self.deal();
            self.inProgress(true);
        }

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

            var starting_card = self.deck().cut();
            self.board().start(starting_card);

            self.game().startGame();
        }
    }
    ko.applyBindings(new GameVM());
});