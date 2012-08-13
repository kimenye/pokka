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
    },

    first: function() {
        return _.first(this.cards);
    }
});

var Group = JS.Class({

    construct: function(cards) {
        this.cards = cards;
    },

    evaluate: function() {

        if (this.cards.length < 2)
            return false;

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

        return _result;
    },

    score: function() {
        //TODO: A better ranking for groups
        return this.cards.length;
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

        this.numSelected = ko.computed(function() {
            return self.getSelectedCards().length;
        })
    },

    reset: function() {
        this.cards([]);
        this.redrawCards();
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

    bestGroup:  function(top_card) {
        var _groups = this.groups(top_card);
        var _sorted = _.sortBy(_groups, function(group) {
           return group.score();
        });
        return _.last(_sorted);
    },

    removeCard: function(card) {
        var _without = _.reject(this.cards(), function(c) {
            return card.eq(c);
        });
        this.cards(_without);
    },

    groups: function(top_card) {
        var _groups = [];
        var self = this;

        if (self.cards().length >= 2 && top_card != null && self.possibleMoves(top_card).length > 0) {
            var _moves = self.possibleMoves(top_card);

            _.each(_moves, function(move, idx) {

                var _c = move.first();
                var _gp = new Group([_c]);
                _.each(self.cards(), function(card, idx) {

                    if (!card.eq(_c)) {
                        //can the card join the group
                        if (_gp.canJoin(card)) {
                            //then add it to the group
                            _gp.cards.push(card);
                        }
                    }
                });

                if (_gp.evaluate()) {
                    _groups.push(_gp);
                }
            });
        }

        return _groups;
    },

    canPlaySelections : function(top_card) {
        if (this.numSelected() > 1) {
            var _cards = new Group(this.getSelectedCards());
            return _cards.evaluate();
        }
        else if (this.numSelected() == 1) {
            var _card = _.first(this.getSelectedCards());
            return _card.canFollow(top_card);
        }
        return false;
    },

    bestSingleMove : function(top_card) {
        var _moves = this.possibleMoves(top_card);
        if (_moves.length > 0) {
            return _.first(_moves).first();
        }
        return null;
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

    redrawCards : function() {
        //TODO: Implement this with _.each()
        $(this.card_container).empty();
        for(var x=0;x<this.cards().length;x++) {
            var c = this.cards()[x];
            this.drawCard(c,x);
        }
    },

    drawCard: function(card,idx) {
        var numCards = this.cards().length;
        if (!_.isUndefined(idx))
            numCards = idx;
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

    add:function (card) {
        this.cards.push(card);
        card.current_hand = this;
        this.drawCard(card);
    },

    isEmpty: function() {
        return this.size() < 1;
    },

    size: function() {
        return this.cards().length;
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

        $(_cardNode).dblclick(function() {
            if (me.selectable) {

            }
        })

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

    isKing : function() {
        return this.rank == KING;
    },

    isJack : function() {
        return this.rank == JACK;
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

    canEndMove: function() {
       return !this.isQueen() && !this.isEight();
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
//        var _jackOrKing = card.isKing() || card.isJack();

        if (this.isQueen() || this.isEight()) {
//            return _follow && (_sameSuite || _sameRank) && !_jackOrKing;
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
    display:function (element) {
        var el, top, left;
        var n;

        // Note: only a fraction of the cards in the deck and discard pile are
        // displayed, just enough to get an idea of the number of cards in each.

        left = 0;
        top = 0;
        el = document.getElementById(element);
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

    removeCard: function(c) {
        var _card = this.findCard(c);
        this.cards = _.reject(this.cards, function(card) {
            return card.eq(_card);
        });
        return _card;
    },

    findCard: function(c) {
        var _targetIdx = 0;
        var _target = _.find(this.cards, function(card) {
            return card.eq(c);
        });
        return _target;
    },

    /**
     * Shuffle the cards
     */
    shuffle:function () {
        var _shuffled = _.shuffle(this.cards);
        this.cards = _shuffled;
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
});var CLUBS = "C", HEARTS = "H", DIAMONDS = "D", SPADES = "S", JOKER = "J";
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
    },

    first: function() {
        return _.first(this.cards);
    }
});

var Group = JS.Class({

    construct: function(cards) {
        this.cards = cards;
    },

    evaluate: function() {

        if (this.cards.length < 2)
            return false;

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

        return _result;
    },

    score: function() {
        //TODO: A better ranking for groups
        return this.cards.length;
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

        this.numSelected = ko.computed(function() {
            return self.getSelectedCards().length;
        })
    },

    reset: function() {
        this.cards([]);
        this.redrawCards();
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

    bestGroup:  function(top_card) {
        var _groups = this.groups(top_card);
        var _sorted = _.sortBy(_groups, function(group) {
           return group.score();
        });
        return _.last(_sorted);
    },

    removeCard: function(card) {
        var _without = _.reject(this.cards(), function(c) {
            return card.eq(c);
        });
        this.cards(_without);
    },

    groups: function(top_card) {
        var _groups = [];
        var self = this;

        if (self.cards().length >= 2 && top_card != null && self.possibleMoves(top_card).length > 0) {
            var _moves = self.possibleMoves(top_card);

            _.each(_moves, function(move, idx) {

                var _c = move.first();
                var _gp = new Group([_c]);
                _.each(self.cards(), function(card, idx) {

                    if (!card.eq(_c)) {
                        //can the card join the group
                        if (_gp.canJoin(card)) {
                            //then add it to the group
                            _gp.cards.push(card);
                        }
                    }
                });

                if (_gp.evaluate()) {
                    _groups.push(_gp);
                }
            });
        }

        return _groups;
    },

    canPlaySelections : function(top_card) {
        if (this.numSelected() > 1) {
            var _cards = new Group(this.getSelectedCards());
            return _cards.evaluate();
        }
        else if (this.numSelected() == 1) {
            var _card = _.first(this.getSelectedCards());
            return _card.canFollow(top_card);
        }
        return false;
    },

    bestSingleMove : function(top_card) {
        var _moves = this.possibleMoves(top_card);
        if (_moves.length > 0) {
            return _.first(_moves).first();
        }
        return null;
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

    redrawCards : function() {
        //TODO: Implement this with _.each()
        $(this.card_container).empty();
        for(var x=0;x<this.cards().length;x++) {
            var c = this.cards()[x];
            this.drawCard(c,x);
        }
    },

    drawCard: function(card,idx) {
        var numCards = this.cards().length;
        if (!_.isUndefined(idx))
            numCards = idx;
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

    add:function (card) {
        this.cards.push(card);
        card.current_hand = this;
        this.drawCard(card);
    },

    isEmpty: function() {
        return this.size() < 1;
    },

    size: function() {
        return this.cards().length;
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

        $(_cardNode).dblclick(function() {
            if (me.selectable) {

            }
        })

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

    isKing : function() {
        return this.rank == KING;
    },

    isJack : function() {
        return this.rank == JACK;
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

    canEndMove: function() {
       return !this.isQueen() && !this.isEight();
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
//        var _jackOrKing = card.isKing() || card.isJack();

        if (this.isQueen() || this.isEight()) {
//            return _follow && (_sameSuite || _sameRank) && !_jackOrKing;
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
    display:function (element) {
        var el, top, left;
        var n;

        // Note: only a fraction of the cards in the deck and discard pile are
        // displayed, just enough to get an idea of the number of cards in each.

        left = 0;
        top = 0;
        el = document.getElementById(element);
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

    removeCard: function(c) {
        var _card = this.findCard(c);
        this.cards = _.reject(this.cards, function(card) {
            return card.eq(_card);
        });
        return _card;
    },

    findCard: function(c) {
        var _targetIdx = 0;
        var _target = _.find(this.cards, function(card) {
            return card.eq(c);
        });
        return _target;
    },

    /**
     * Shuffle the cards
     */
    shuffle:function () {
        var _shuffled = _.shuffle(this.cards);
        this.cards = _shuffled;
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