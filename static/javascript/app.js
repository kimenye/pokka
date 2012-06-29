$(document).ready(function () {

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
            return _symbolChar
        }
    });


    var Hand = JS.Class({
        construct:function (type) {
            this.cards = [];
            this.hidden = type != PLAYER
            this.card_container = document.getElementById(type + "-deck");

            while (this.card_container.firstChild != null) {
                this.card_container.removeChild(this.card_container.firstChild);
            }
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

        add:function (card) {
            this.cards.push(card);
            var numCards = this.cards.length;
            var left = this.stackFactor()[0] * numCards;
            var top = this.stackFactor()[1] * numCards;

            var node = card.buildNode();

            if (this.hidden)
                node.firstChild.style.visibility = "hidden";

            card.selectable = !this.hidden;
            node.style.left = left + "em";
            node.style.top = top + "em";

            this.card_container.appendChild(node);
        }
    });

    /**
     * Represents a player in the game...
     *
     * TODO: Initalize with an array of cards
     *
     * @type {*}
     */
    var Player = JS.Class({
        construct:function (name, gender, type) {
            this.name = name;
            this.gender = gender;
            this.hand = new Hand(type);
            this.type = type;
        },

        clearHand:function () {

        },

        give:function (card) {
            this.hand.add(card);
        }
    });

    var background = new Image();
    background.src = "images/cardback.gif";
    var jack = new Image();
    jack.src = "images/jack.gif";
    var queen = new Image();
    queen.src = "images/queen.gif";
    var king = new Image();
    king.src = "images/king.gif";

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
        },

        toString:function () {
            return  this.rank + " of " + this.suite.title;
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
                if (me.selectable) {
                    $(_cardNode).toggleClass("selected");
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

            return _cardNode;
        },

        /**
         * Is this one of the K,Q,J cards?
         */
        isFaceCard:function () {
            return this.rank == KING || this.rank == QUEEN || this.rank == JACK;
        }
    });

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
            self.suites = [new Suite(CLUBS, "Clubs"), new Suite(DIAMONDS, "Diamonds"), new Suite(HEARTS, "Hearts"), new Suite(SPADES, "Spades")];

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
        }
    });

    var deck = null;
    var computer = new Player("Computer", "F", COMPUTER);
    var user = new Player("Player 1", "M", PLAYER);

    if (deck == null) {
        deck = new Deck();
        deck.display();
//        deck.shuffle();
//        deck.deal()
    }

    $('#shuffle').click(function () {
        deck.shuffle();
    });


    $('#deal').click(function () {
        _.each(_.range(0, 4), function (idx) {
            var player_card = deck.deal();
            var computer_card = deck.deal();
            user.give(player_card);
            computer.give(computer_card);
        });
    });
});