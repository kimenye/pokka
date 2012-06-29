$(document).ready(function() {

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

    var Player = JS.Class({
        construct: function(name, gender) {
            this.name = name;
            this.gender = gender;
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
        },

        /**
         * Build the actual card node using either images or css
         * @return {Element}
         */
        buildNode: function() {
            var _cardNode, _frontNode, _spotNode, _tempNode, _textNode;
            var _indexStr, _spotChar;

            _cardNode = document.createElement("DIV");
            _cardNode.className = "card";

            // Build the front of card.

            _spotChar = this.suite.symbolChar();
            _indexStr = this.rank;

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
        /**
         * Construct a deck of cards
         */
        construct: function() {
            var self = this;
            this.visibleCards = [];
            self.suites = [new Suite(CLUBS, "Clubs"),new Suite(DIAMONDS, "Diamonds"), new Suite(HEARTS, "Hearts"), new Suite(SPADES, "Spades")];

            self.cards = [];
            _.each(self.suites, function(suite) {
                _.each(_.range(2,11), function(itr) {
                    self.cards.push(new Card(suite, itr));
                });

                _.each([JACK, QUEEN, KING, ACE], function(face) {
                    self.cards.push(new Card(suite, face));
                })
            });

            self.cards.push(new Joker(0));
            self.cards.push(new Joker(1));
        },

        /**
         * Displays the deck at a specific position
         */
        display: function() {
            var el, top, left;
            var n;

            // Note: only a fraction of the cards in the deck and discard pile are
            // displayed, just enough to get an idea of the number of cards in each.

            left = 0;
            top  = 0;
            el = document.getElementById("deck");
            while (el.firstChild != null)
                el.removeChild(el.firstChild);
            n = this.cards.length;

            for (i = 0; i < n; i++) {
//            for (i = 0; i < Math.round(n / 5); i++) {
                var node = this.cards[i].buildNode();
                node.firstChild.style.visibility = "hidden";
                node.style.left = left + "em";
                node.style.top  = top  + "em";
                el.appendChild(node);
                //left += 0.10;
                //top  += 0.05;

                this.visibleCards.push(node);
            }
        },

        /**
         * Shuffle the cards
         */
        shuffle: function() {
            _.each(this.visibleCards, function(card, idx) {
                //shuffle a card every 100 seconds
                var duration = (idx) * 100;
                setTimeout(function() {
                    $(card)
                        .animate({left:15 + "%", marginTop:2 + "em"}, 500, "easeOutBack", function () {
                            i--;
                            $(this).css("z-index", i)
                        })
                        .animate({left:0 + "%", marginTop:0 + "em"}, 500, "easeOutBack");
                }, duration);
            });
        },

        deal: function() {
//            left = 0;
//            top  = 0;
//            el = document.getElementById("hand");
//            while (el.firstChild != null)
//                el.removeChild(el.firstChild);
//            for (i = 0; i < hand.cardCount(); i++) {
//                node = hand.cards[i].createNode();
//                node.style.left = left + "em";
//                node.style.top  = top  + "em";
//                el.appendChild(node);
//                left += 1.00;
//                top  += 0.25;
//            }

        }
    });

    var deck = null;

    if (deck == null) {
        deck = new Deck();
        deck.display();
    }

    $('#shuffle').click(function() {
        deck.shuffle();
    });

    $('#deal').click(function(){
       deck.deal();
    });
});