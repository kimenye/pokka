var Turn = JS.Class({
    construct: function() {
        var self = this;
        this.move_idx = 0;
    }
});

var Game = JS.Class({
    //TODO: need to implement multi player...
    construct: function(user_player, computer_player, board, deck) {
        var self = this;
        this.user = user_player;
        this.computer = computer_player;
        this.board = board;
        this.deck = deck;

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
        //TODO: for now make the computer start coz it needs to be trained
        var playerWinsToss = Math.floor( Math.random() * 2 ) == 1;
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
        this.drawCard(openingCard);
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
