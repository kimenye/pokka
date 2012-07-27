var Turn = JS.Class({
    construct: function() {
        var self = this;
        this.move_idx = 0;
    }
});

var Action = JS.Class({
    construct: function(idx,text) {
        this.idx = idx;
        this.text = text;
    }
});

var Game = JS.Class({
    //TODO: need to implement multi player...
    construct: function(user_player, computer_player, board, deck) {
        var self = this;
        this.user = ko.observable(user_player);
        this.computer = ko.observable(computer_player);
        this.board = board;
        this.deck = deck;
        this.user().initGame(this);
        this.computer().initGame(this);
        this.logs = ko.observableArray();

        this.currentTurn = ko.computed(function() {
            var _turn = _.find([self.user(), self.computer()], function(player) {
                return player.isTurnToPlay()
            });
            return _turn;
        });

        this.whoseTurn = ko.computed(function() {
            var _turn = self.currentTurn()

            if (_turn != null)
                return _turn.name.toUpperCase() + "'S TURN TO PLAY";
            else
                return "GAME NOT STARTED"
        });
    },
    startGame: function(debug) {
        //randomly pick which user gets to start
        //TODO: implement correct coin toss
        //TODO: for now make the computer start coz it needs to be trained based on the debug property
        if (debug) {
            this.log("Game started with the computers turn");
            this.giveTurnTo(this.computer(), this.user());
        } else {
            var playerWinsToss = Math.floor( Math.random() * 2 ) == 1;
            this.log("Game started with " + (playerWinsToss? " user's" : " computer's") + " turn");
            if (playerWinsToss)
                this.giveTurnTo(this.user(), this.computer());
            else
                this.giveTurnTo(this.computer(), this.user());
        }
    },

    log : function(text) {
        this.logs.push(new Action(this.logs().length, text));
    },

    giveTurnTo: function(player, other) {
        player.isTurnToPlay(true);
        other.isTurnToPlay(false);
    },

    finishTurn : function(player) {
        //TODO: Handle multiplayer
        if (this.currentTurn().isBot())  {
            this.giveTurnTo(this.user(),this.computer());
        }
        else
            this.giveTurnTo(this.computer(), this.user());
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
        this.drawCard(openingCard);
    },

    topCard: function() {
        return _.last(this.cards());
    },

    drawCard: function(card) {
        this.cards.push(card);
        card.current_hand = null;
        var numCards = this.cards().length;
        var left =5 + (0.25 * numCards);
        var top = 3 + (0.0625 * numCards);

        var node = card.buildNode();

        node.style.left = left + "em";
        node.style.top = top + "em";

        card.selectable = false;

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
        this.played = false;
        this.hand = ko.observable(new Hand(type));
        this.type = type;
        this.isTurnToPlay = ko.observable(false);
        this.board = null;
        this.game = null;
        this.deck = null;
        this.isAutomated = false;
        this.isBot = function() {
            return this.type == COMPUTER;
        }

        this.isTurnToPlay.subscribe(function(nevValue) {
            if (nevValue == true && self.isAutomated) {
                this.play();
            }
        }, this);

        this.log = function(text) {
            this.game.log("Player " + this.name + " : " + text);
        },

        this.play = function() {
            if(self.isBot() && self.hasCards()){
                var _card = self.board.topCard();
                if (!self.hand().canPlay(_card)) {
                    self.pick(1);
                }
                else {
//                    Paul simon Love of the common people 1.09
                    var _best_group = self.hand().bestGroup(_card);
                    var _best_move = self.hand().bestSingleMove(_card);
                    if (_best_group != null) {

                        _.each(_best_group.cards, function(card) {
                            self.board.drawCard(card);
                            self.log("Played card " + card.toString());
                            self.hand().removeCard(card);
                        });
                    }
                    else if (_best_move != null)
                    {
                        self.log("Played card " + _best_move.toString());
                        self.board.drawCard(_best_move);
                        self.hand().removeCard(_best_move);
                    }
                }
                self.hand().redrawCards();

                this.game.finishTurn(this);
            }
        };

        this.initGame = function(game) {
            this.game = game;
            this.board = game.board;
            this.deck = game.deck;
        }

        this.numCards = ko.computed(function() {
           return self.hand().cards().length;
        });

        this.hasCards = ko.computed(function() {
            return !self.hand().isEmpty();
        });

        this.hasSelections = ko.computed(function() {
            return self.hand().getSelectedCards().length > 0;
        });
    },

    give:function (card) {
        this.hand().add(card);
    },

    pick: function(num_cards) {
        if (this.deck != null) {
            for(var x=0;x<num_cards;x++)
            {
                var card = this.deck.deal();
                this.give(card);
            }
        }
        this.log("picked " + num_cards + " cards");


        this.played = true;
    },

    hasPlayed: function() {
        return this.played;
    },

    canPlay: function() {
        return this.isTurnToPlay();
    }
});

var UserPlayer = Player.extend({
    construct: function(name) {
        this.parent.construct.apply(this, [name, PLAYER]);
    }
});

var ComputerPlayer = Player.extend({
    construct: function() {
        this.parent.construct.apply(this, ["Computer", COMPUTER])
    }
});
