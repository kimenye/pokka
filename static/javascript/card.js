var CLUBS = "C", HEARTS = "H", DIAMONDS = "D", SPADES = "S", JOKER = "J";
var QUEEN = "Q", JACK = "J", KING = "K", ACE = "A";
var COMPUTER = "computer", PLAYER = "player";


var Suite = JS.Class({
    construct:function (symbol, title) {
        this.symbol = symbol;
        this.title = title;
    },

    additionalClass: function() {
        var color = "";
        if (this.symbol == DIAMONDS || this.symbol == HEARTS)
            color = " red";
        return color;
    },

    symbolChar:function () {
        var _symbolChar = "\u00a0";
        switch (this.symbol) {
            case CLUBS :
                _symbolChar = "\u2663";
                break;
            case DIAMONDS :
                _symbolChar = "\u2666";
                break;
            case HEARTS :
                _symbolChar = "\u2665";
                break;
            case SPADES :
                _symbolChar = "\u2660";
                break;
        }
        return _symbolChar;
    }
});

var SUITE_CLUBS = new Suite(CLUBS, "Clubs");
var SUITE_DIAMONDS = new Suite(DIAMONDS, "Diamonds");
var SUITE_HEARTS = new Suite(HEARTS, "Hearts");
var SUITE_SPADES = new Suite(SPADES, "Spades");

var Move = JS.Class({

    construct: function(cards) {
        this.cards = cards;
    }
});

var Group = JS.Class({

    construct: function(cards) {
        this.cards = cards;
    },

    evaluate: function() {
        var _result = false;
        var self = this;
        var _preceding = _.first(self.cards);

        var _idx = _.indexOf(self.cards, _preceding, false) + 1;
        while(_idx < self.cards.length) {
            var _following = _.first(_.rest(self.cards, _idx));
            _result = _preceding.canPlayTogetherWith(_following);
            if (!_result)
                break;
            _idx++;
            _preceding = _following;
        }

        var cs = "";
        _.each(self.cards, function(c) { cs += c.toString() + " " });

//        console.log("Group: " + cs + " : ", _result);
        return _result;
    },

    contains: function(card) {
        return _.find(this.cards, function(c) { return card.eq(c) }) != null;
    },

    canJoin: function(card) {
        if (!card.isAce()) {
            return card.canPlayTogetherWith(_.last(this.cards));
        }
        else
        {
            return _.last(this.cards).isAce(); //can only join groups with fellow aces
        }
    },

    add: function(card) {
        this.cards.push(card);
    },

    toString: function() {
//        debugger;
        var self = this;
        var _str = "[";
        _.each(this.cards, function(card,idx) { _str += card.toString() + (idx < self.cards.length ? " , " : "" ) });
        _str = "]";
    }
})

var Hand = JS.Class({
    construct:function (type) {
        this.cards = ko.observableArray([]);
        var self = this;
//TODO: Temporarily showing the computers cards for debugging purposes
        this.hidden = type != PLAYER;
//        this.hidden = false;

        this.card_container = document.getElementById(type + "-deck");

        while (this.card_container.firstChild != null) {
            this.card_container.removeChild(this.card_container.firstChild);
        }

        this.getSelectedCards = ko.computed(function() {
            return _.filter(self.cards(), function(card) { return card.selected() });
        });
    },

    /**
     * Different factors for players and computers, so that the cards are stacked closer for
     * the non-players
     */
    stackFactor: function() {
        if (this.hidden)
            return [0.25, 0.0625];
        else
            return [1.0, 0.25];
    },

    groups: function() {
        var _groups = [];
        var self = this;

        if (this.cards().length >= 2) {
            var _possible_moves = possible_combinations(this.cards(), 2);
            _.each(_possible_moves, function(move) {
                var _group = new Group(move);
                if (_group.evaluate()) {
                    _groups.push(_group);
                }
            });
        }
        return _groups;
    },

    possibleMoves: function(top_card) {
        //first check if there are any possible moves
        var self = this;
        var moves = [];
        _.each(this.cards(), function(card) {
            if(card.canFollow(top_card)) {
                moves.push(new Move([card]));
            }
        });
        return moves;
    },

    canPlay: function(top_card) {
        return this.possibleMoves(top_card).length > 0;
    },

    add:function (card) {
        this.cards.push(card);
        card.current_hand = this;
        var numCards = this.cards().length;
        var left = this.stackFactor()[0] * numCards;
        var top = this.stackFactor()[1] * numCards;

        var node = card.buildNode();


        if (this.hidden)
            node.firstChild.style.visibility = "hidden";

        card.selectable = !this.hidden;
        node.style.left = left + "em";
        node.style.top = top + "em";

        this.card_container.appendChild(node);
    },

    isEmpty: function() {
        return this.cards().length < 1;
    }
});

/**
 * Based on http://www.brainjar.com
 *
 * @type {*}
 */
var Card = JS.Class({
    construct:function (suite, rank) {
        this.suite = suite;
        this.rank = rank;
        this.selectable = false;
        this.id = rank + "_" + suite.title;
        this.selected = ko.observable(false);
        this.current_hand = null; //TODO: is the hand part of the static definition of the game or is it an active element?
    },

    toString:function () {
        return  this.rank + " of " + this.suite.title;
    },

    move: function() {
//            var el = document.getElementById("card_" + id);
        this.node.style["z-index"] = 1000;
        this.node.style["left"] = 300 + "px";
        this.node.style["top"] = 300 + "px";
        this.node.style["z-index"] = 0;
    },

    handleClick: function(node) {
        node.toggleClass("selected");
        this.selected(!this.selected());
    },

    /**
     * Build the actual card node using either images or css
     * @return {Element}
     */
    buildNode:function () {
        var _cardNode, _frontNode, _spotNode, _tempNode, _textNode;
        var _indexStr, _spotChar;

        _cardNode = document.createElement("DIV");
        _cardNode.className = "card";
        var me = this;

        $(_cardNode).click(function() {
            //TODO: We need to handle different states of the card
            if (me.selectable) {
                me.handleClick($(_cardNode));
            }
        });

        // Build the front of card.

        _spotChar = this.suite.symbolChar();
        _indexStr = this.rank;

        _frontNode = document.createElement("DIV");
        _frontNode.className = "front";
        _frontNode.className += this.suite.additionalClass();

        _spotNode = document.createElement("DIV");
        _spotNode.className = "index";
        _textNode = document.createTextNode(_indexStr);
        _spotNode.appendChild(_textNode);
        _spotNode.appendChild(document.createElement("BR"));
        _textNode = document.createTextNode(_spotChar);
        _spotNode.appendChild(_textNode);
        _frontNode.appendChild(_spotNode);


        // Create and add spots based on card rank (Ace thru 10).

        _spotNode = document.createElement("DIV");
        _textNode = document.createTextNode(_spotChar);
        _spotNode.appendChild(_textNode);

        if (this.rank == ACE) {
            _spotNode.className = "ace";
            _tempNode = _spotNode.cloneNode(true);
            _frontNode.appendChild(_tempNode);
        }
        if (this.rank == 3 || this.rank == 5 || this.rank == 9) {
            _spotNode.className = "spotB3";
            _tempNode = _spotNode.cloneNode(true);
            _frontNode.appendChild(_tempNode);
        }
        if (this.rank == 2 || this.rank == 3) {
            _spotNode.className = "spotB1";
            _tempNode = _spotNode.cloneNode(true);
            _frontNode.appendChild(_tempNode);
        }
        if (this.rank == 2 || this.rank == 3) {
            _spotNode.className = "spotB5";
            _tempNode = _spotNode.cloneNode(true);
            _frontNode.appendChild(_tempNode);
        }
        if (this.rank == 4 || this.rank == 5 || this.rank == 6 ||
            this.rank == 7 || this.rank == 8 || this.rank == 9 ||
            this.rank == 10) {
            _spotNode.className = "spotA1";
            _tempNode = _spotNode.cloneNode(true);
            _frontNode.appendChild(_tempNode);
            _spotNode.className = "spotA5";
            _tempNode = _spotNode.cloneNode(true);
            _frontNode.appendChild(_tempNode);
            _spotNode.className = "spotC1";
            _tempNode = _spotNode.cloneNode(true);
            _frontNode.appendChild(_tempNode);
            _spotNode.className = "spotC5";
            _tempNode = _spotNode.cloneNode(true);
            _frontNode.appendChild(_tempNode);
        }
        if (this.rank == 6 || this.rank == 7 || this.rank == 8) {
            _spotNode.className = "spotA3";
            _tempNode = _spotNode.cloneNode(true);
            _frontNode.appendChild(_tempNode);
            _spotNode.className = "spotC3";
            _tempNode = _spotNode.cloneNode(true);
            _frontNode.appendChild(_tempNode);
        }
        if (this.rank == 7 || this.rank == 8 || this.rank == 10) {
            _spotNode.className = "spotB2";
            _tempNode = _spotNode.cloneNode(true);
            _frontNode.appendChild(_tempNode);
        }
        if (this.rank == 8 || this.rank == 10) {
            _spotNode.className = "spotB4";
            _tempNode = _spotNode.cloneNode(true);
            _frontNode.appendChild(_tempNode);
        }
        if (this.rank == 9 || this.rank == 10) {
            _spotNode.className = "spotA2";
            _tempNode = _spotNode.cloneNode(true);
            _frontNode.appendChild(_tempNode);
            _spotNode.className = "spotA4";
            _tempNode = _spotNode.cloneNode(true);
            _frontNode.appendChild(_tempNode);
            _spotNode.className = "spotC2";
            _tempNode = _spotNode.cloneNode(true);
            _frontNode.appendChild(_tempNode);
            _spotNode.className = "spotC4";
            _tempNode = _spotNode.cloneNode(true);
            _frontNode.appendChild(_tempNode);
        }


        _tempNode = document.createElement("IMG");
        _tempNode.className = "face";
        if (this.rank == JACK)
            _tempNode.src = "images/jack.gif";
        if (this.rank == QUEEN)
            _tempNode.src = "images/queen.gif";
        if (this.rank == KING)
            _tempNode.src = "images/king.gif";

        // For face cards, add suit characters to the upper-left and lower-right
        // corners.

        if (this.isFaceCard()) {
            _frontNode.appendChild(_tempNode);
            _spotNode.className = "spotA1";
            _tempNode = _spotNode.cloneNode(true);
            _frontNode.appendChild(_tempNode);
            _spotNode.className = "spotC5";
            _tempNode = _spotNode.cloneNode(true);
            _frontNode.appendChild(_tempNode);
        }

        // Add front node to the card node.

        _cardNode.appendChild(_frontNode);
        this.node = _cardNode;
        return _cardNode;
    },

    /**
     * Is this one of the K,Q,J cards?
     */
    isFaceCard:function () {
        return this.rank == KING || this.isQueen() || this.rank == JACK;
    },

    isAce: function() {
        return this.rank == ACE;
    },

    isSpecialCard: function() {
        return (this.suite.symbol == JOKER || this.rank == 2 || this.rank == 3 || this.isEight());
    },

    isQueen : function() {
        return this.rank == QUEEN
    },

    isEight : function() {
        return this.rank == 8;
    },

    canStart: function() {
        //TODO: This rules need to be downloaded from the server so that
        //there is collaboration in defining the rules

        //at the minimum you can start with a face card, ace or 2,3,joker,8
        return !this.isFaceCard() && !this.isAce() && !this.isSpecialCard();
    },

    eq: function(other) {
        return (this.suite == other.suite && this.rank == other.rank);
    },

    /**
     * Check if a card can follow another card...
     *
     * @param card
     */
    canFollow: function(card) {
        var isSameSuite = this.suite == card.suite;
        var isSameRank = this.rank == card.rank;

        var can_follow = (isSameRank || isSameSuite || this.isAce());
        return can_follow;
    },



    /**
     * Can be joined with the card specified in a group
     *
     * @param card
     * @return {*}
     */
    canPlayTogetherWith: function(card) {
        var _follow = this.canFollow(card);
        var _sameRank = this.rank == card.rank;
        var _sameSuite = this.suite == card.suite;

        if (this.isQueen() || this.isEight()) {
            return _follow && (_sameSuite || _sameRank);
        }
        else
            return _follow && _sameRank;
    }
});

//TODO: Need to handle the rendering of the joker card
var Joker = Card.extend({
    construct:function (index) {
        this.parent.construct.apply(this, [new Suite(JOKER, "Joker"), index]);
    }
});

var Deck = JS.Class({
    /**
     * Construct a deck of cards
     */
    construct:function () {
        var self = this;
        this.visibleCards = [];
        self.suites = [SUITE_CLUBS, SUITE_DIAMONDS, SUITE_HEARTS, SUITE_SPADES];

        self.cards = [];
        _.each(self.suites, function (suite) {
            _.each(_.range(2, 11), function (itr) {
                self.cards.push(new Card(suite, itr));
            });

            _.each([JACK, QUEEN, KING, ACE], function (face) {
                self.cards.push(new Card(suite, face));
            })
        });

        self.cards.push(new Joker(0));
        self.cards.push(new Joker(1));
    },

    /**
     * Displays the deck at a specific position
     */
    display:function () {
        var el, top, left;
        var n;

        // Note: only a fraction of the cards in the deck and discard pile are
        // displayed, just enough to get an idea of the number of cards in each.

        left = 0;
        top = 0;
        el = document.getElementById("deck");
        while (el.firstChild != null)
            el.removeChild(el.firstChild);
        n = this.cards.length;

        for (i = 0; i < n; i++) {
//            for (i = 0; i < Math.round(n / 5); i++) {
            var node = this.cards[i].buildNode();
            node.firstChild.style.visibility = "hidden";
            node.style.left = left + "em";
            node.style.top = top + "em";
            el.appendChild(node);
            //left += 0.10;
            //top  += 0.05;

            this.visibleCards.push(node);
        }
    },

    /**
     * Shuffle the cards
     */
    shuffle:function () {

        var i, j, k;
        var temp;

        // Shuffle the stack 'n' times.
        for (j = 0; j < this.cards.length; j++) {
            k = Math.floor(Math.random() * this.cards.length);
            temp = this.cards[j];
            this.cards[j] = this.cards[k];
            this.cards[k] = temp;
        }


        _.each(this.visibleCards, function (card, idx) {
            //shuffle a card every 100 seconds
            var duration = (idx) * 10;
            setTimeout(function () {
                $(card)
                    .animate({left:15 + "%", marginTop:2 + "em"}, 500, "easeOutBack", function () {
                        i--;
                        $(this).css("z-index", i);
                    })
                    .animate({left:0 + "%", marginTop:0 + "em"}, 500, "easeOutBack");
            }, duration);
        });
    },

    deal:function () {
        if (this.cards.length > 0)
            return this.cards.shift();
        else
            return null;
    },

    cut: function() {
        //need to return the first card that can start
        var can_start = false;
        var card = null;
        while(!can_start) {
            var card = this.deal();
            can_start = card.canStart();
            if (!can_start)
                this.cards.push(card);
        }
        return card;
    }
});