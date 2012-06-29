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

    var CLUBS = "C", HEARTS = "H", DIAMONDS = "D", SPADES = "S", JOKER = "J";
    var QUEEN = "Q", JACK = "J", KING = "K", ACE = "A";

    var Suite = JS.Class({
        construct: function(symbol, title) {
            this.symbol = symbol;
            this.title = title;
        },

        symbolChar: function() {
            var _symbolChar = "\u00a0";
            switch (this.symbol) {
                case CLUBS :
                    _symbolChar = "\u2663";
                    break;
                case DIAMONDS :
//                    frontNode.className += " red";
                    _symbolChar = "\u2666";
                    break;
                case HEARTS :
//                    frontNode.className += " red";
                    _symbolChar = "\u2665";
                    break;
                case SPADES :
                    _symbolChar = "\u2660";
                    break;
            }
            return _symbolChar
        }
    });


    var background = new Image(); background.src= "images/cardback.gif";
    var jack = new Image(); jack.src= "images/jack.gif";
    var queen = new Image(); queen.src= "images/queen.gif";
    var king = new Image(); king.src= "images/king.gif";

    /**
     * Based on http://www.brainjar.com
     *
     * @type {*}
     */
    var Card = JS.Class({
        construct: function(suite, rank) {
            this.suite = suite;
            this.rank = rank;
            log("Added the " + rank + " of " + suite.title);
        },

        buildNode: function() {
            var _cardNode, _frontNode, _spotNode, _tempNode, _textNode;
            var _indexStr, _spotChar;

            _cardNode = document.createElement("DIV");
            _cardNode.className = "card";

            // Build the front of card.

            _indexStr = this.rank;
            if (this.toString() == "")
                _indexStr = "\u00a0";

            _frontNode = document.createElement("DIV");
            _frontNode.className = "front";

            _spotNode = document.createElement("DIV");
            _spotNode.className = "index";
            _textNode = document.createTextNode(_indexStr);
            _spotNode.appendChild(_textNode);
            _spotNode.appendChild(document.createElement("BR"));
            _textNode = document.createTextNode(_spotChar);
            _spotNode.appendChild(_textNode);
            _frontNode.appendChild(_spotNode);


            // Create and add spots based on card rank (Ace thru 10).
            _spotChar = this.suite.symbolChar();

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
                _tempNode = spotNode.cloneNode(true);
                _frontNode.appendChild(_tempNode);
            }
            if (this.rank == 9 || this.rank == 10) {
                _spotNode.className = "spotA2";
                _tempNode = _spotNode.cloneNode(true);
                _frontNode.appendChild(_tempNode);
                _spotNode.className = "spotA4";
                _tempNode = spotNode.cloneNode(true);
                _frontNode.appendChild(_tempNode);
                _spotNode.className = "spotC2";
                _tempNode = spotNode.cloneNode(true);
                _frontNode.appendChild(_tempNode);
                _spotNode.className = "spotC4";
                _tempNode = _spotNode.cloneNode(true);
                _frontNode.appendChild(_tempNode);
            }


            _tempNode = document.createElement("IMG");
            _tempNode.className = "face";
            if (this.rank == JACK)
                tempNode.src = "images/jack.gif";
            if (this.rank == QUEEN)
                tempNode.src = "images/queen.gif";
            if (this.rank == KING)
                tempNode.src = "images/king.gif";

            // For face cards, add suit characters to the upper-left and lower-right
            // corners.

            if (this.isFaceCard()) {
                _frontNode.appendChild(_tempNode);
                _spotNode.className = "spotA1";
                _tempNode = _spotNode.cloneNode(true);
                _frontNode.appendChild(_tempNode);
                _spotNode.className = "spotC5";
                _tempNode = spotNode.cloneNode(true);
                _frontNode.appendChild(_tempNode);
            }

            return _cardNode;
        },

        /**
         * Is this one of the K,Q,J cards?
         */
        isFaceCard: function() {
            return this.rank == KING || this.rank == QUEEN || this.rank == JACK;
        }
    });

    var Joker = Card.extend({
        construct: function(index) {
            this.parent.construct.apply(this, [new Suite(JOKER, "Joker"), index]);
        }
    });

    var Deck = JS.Class({
        construct: function() {
            var self = this;
            log("Setting up deck!");
            self.suites = [new Suite(CLUBS, "Clubs"),new Suite(DIAMONDS, "Diamonds"), new Suite(HEARTS, "Hearts"), new Suite(SPADES, "Spades")];

            self.cards = [];
            _.each(self.suites, function(suite) {
                log("Setting up suite " + suite.title);
                _.each(_.range(2,11), function(itr) {
                    self.cards.push(new Card(suite, itr));
                });

                _.each([JACK, QUEEN, KING, ACE], function(face) {
                    self.cards.push(new Card(suite, face));
                })
            });

            self.cards.push(new Joker(0));
            self.cards.push(new Joker(1));
        }
    });

    var deck = null;

    $('#setup').click(function() {

        if (deck == null) {
            deck = new Deck();
        }
    });
});