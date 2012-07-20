/**
 * Test functions for pokkah.js
 */

//helper functions

function randomFromInterval(from,to)
{
    return Math.floor(Math.random()*(to-from+1)+from);
}

function randomRank() {

    return randomFromInterval(2,10);
}

function randomSuite() {
    var _suites = [SUITE_CLUBS, SUITE_DIAMONDS, SUITE_HEARTS, SUITE_SPADES];
    return _suites[randomFromInterval(0,3)];
}

function randomCard() {
    return new Card(randomSuite(), randomRank());
}

function buildHand(cards) {
    var hand = new Hand(COMPUTER);
    _.each(cards, function(card) { hand.cards.push(card); });
    return hand;
}

describe("Card rules:", function() {

    var deck;

    beforeEach(function() {
        deck = new Deck();
    })

    it("A deck has 54 cards per deck", function() {
       expect(deck.cards.length).toBe(54);
    });

    it("Game cannot start game with invalid card", function() {
        var starting_card = deck.cut();
        expect(starting_card.isFaceCard()).toBe(false);
        expect(starting_card.isSpecialCard()).toBe(false);
        expect(starting_card.isAce()).toBe(false);
    });

    it("Cards of the same suite can follow each other", function() {
        var random_spade_card = new Card(SUITE_SPADES, randomRank());
        var other_spade_card = new Card(SUITE_SPADES, randomRank());

        expect(random_spade_card.canFollow(other_spade_card)).toBe(true);
        expect(other_spade_card.canFollow(random_spade_card)).toBe(true);
    });

    it("Cards of a different suite but same rank can follow each other", function() {
        var rank = randomRank();
        var random_diamond = new Card(SUITE_DIAMONDS, rank);
        var random_spade = new Card(SUITE_SPADES, rank);

        expect(random_diamond.canFollow(random_spade)).toBe(true);
    });

    it("An ace can follow any card", function() {
        var any_card = randomCard();
        var an_ace = new Card(SUITE_DIAMONDS, ACE);

        expect(an_ace.canFollow(any_card)).toBe(true);
    });

    it("A card can be be in a move with another if they are the same rank", function() {
        var five_d = new Card(SUITE_DIAMONDS, 5);
        var five_s = new Card(SUITE_SPADES, 5);

        expect(five_d.canPlayTogetherWith(five_s)).toBe(true);
    });

    it("A card cannot be in a move with another if they are not the same rank", function() {
        var five_d = new Card(SUITE_DIAMONDS, 5);
        var six_d = new Card(SUITE_DIAMONDS, 6);

        expect(five_d.canPlayTogetherWith(six_d)).toBe(false);
    });

    it("An ace can not be in a move a non ace card", function() {
        var five_d = new Card(SUITE_DIAMONDS, 5);
        var ace_d = new Card(SUITE_DIAMONDS, ACE);

        expect(five_d.canPlayTogetherWith(ace_d)).toBe(false);
    });

    describe("Queen rules", function() {

        it("A queen can play together with another queen", function() {
            var q_d = new Card(SUITE_DIAMONDS, QUEEN);
            var q_s = new Card(SUITE_HEARTS, QUEEN);

            expect(q_d.canPlayTogetherWith(q_s)).toBe(true);
        });

        it("A queen can play together with another ordinary card of the same suite", function() {
            var q_d = new Card(SUITE_DIAMONDS, QUEEN);
            var seven_d = new Card(SUITE_DIAMONDS, 7);
            var seven_s = new Card(SUITE_CLUBS, 7);

            expect(q_d.canPlayTogetherWith(seven_d)).toBe(true);
            expect(q_d.canPlayTogetherWith(seven_s)).toBe(false);
        });

        it("An eight can act as a queen", function() {

            var eight_d = new Card(SUITE_DIAMONDS, 8);
            var seven_d = new Card(SUITE_DIAMONDS, 7);

            expect(eight_d.canPlayTogetherWith(seven_d)).toBe(true);
        });
    });
});


describe("Move rules:", function() {
    var hand, deck, computer, board;

    beforeEach(function() {
        computer = new ComputerPlayer();
        hand = new Hand(COMPUTER);
        computer.hand(hand);
        board = new Board();
    });

    afterEach(function() {
       hand = null;
    });


    it("No moves are possible if no cards can follow", function() {
        var starting_card = new Card(SUITE_DIAMONDS, 10);

        hand = buildHand([
            new Card(SUITE_HEARTS, 2),
            new Card(SUITE_SPADES, 3),
            new Card(SUITE_HEARTS, 4),
            new Card(SUITE_CLUBS, 4)
        ]);

        expect(hand.canPlay(starting_card)).toBe(false);
    });

    it("Moves are possible if at least one card can follow the starting card", function() {
        var starting_card = new Card(SUITE_DIAMONDS, 10);

        hand = buildHand([
            new Card(SUITE_DIAMONDS, 5),
            new Card(SUITE_CLUBS, 6),
            new Card(SUITE_CLUBS, KING),
            new Card(SUITE_CLUBS, 2)
        ]);

        expect(hand.canPlay(starting_card)).toBe(true);

    });

    it("Multiple moves are possible without grouping cards", function() {
        hand = buildHand([
            new Card(SUITE_DIAMONDS, 5),
            new Card(SUITE_DIAMONDS, 6),
            new Card(SUITE_SPADES, KING),
            new Card(SPADES, ACE)
        ]);

        expect(hand.possibleMoves(new Card(SUITE_DIAMONDS, 10)).length).toBe(3);
    });

    describe("Group rules", function() {

        it("A group is a series of cards that an be played together", function() {
            var g = new Group([
                new Card(SUITE_CLUBS, 6),
                new Card(SUITE_DIAMONDS, 6)
            ]);

            expect(g.evaluate()).toBe(true);

            g = new Group([
                new Card(SUITE_CLUBS, 7),
                new Card(SUITE_CLUBS, 8)
            ]);

            expect(g.evaluate()).toBe(false);

            g = new Group([
                new Card(SUITE_CLUBS, QUEEN),
                new Card(SUITE_CLUBS, 7)
            ]);

            expect(g.evaluate()).toBe(true);
        });


        it("Any non playable cards in a set makes the group invalid", function() {
            var g = new Group([
                new Card(SUITE_CLUBS, QUEEN),
                new Card(SUITE_CLUBS, 7),
                new Card(SUITE_DIAMONDS, 8)
            ]);

            expect(g.evaluate()).toBe(false);
        });

        it("All consecutive cards must be playable for the cards to form a group", function() {
            var g = new Group([
                new Card(SUITE_CLUBS, QUEEN),
                new Card(SUITE_CLUBS, 7),
                new Card(SUITE_DIAMONDS, 7)
            ]);

            expect(g.evaluate()).toBe(true)

        });


        it("A group does not exist if no cards in a hand can be played together even if they can follow each other", function () {

            hand = buildHand([
                new Card(SUITE_DIAMONDS, 5),
                new Card(SUITE_DIAMONDS, 6)
            ]);

            expect(hand.groups().length).toBe(0);
        });
    });


//    it("A group exists if more than one cards in a hand can be played together", function() {
//        hand = buildHand([
//            new Card(SUITE_DIAMONDS, 5),
//            new Card(SUITE_DIAMONDS, 6),
//            new Card(SUITE_SPADES, 6),
//            new Card(SUITE_SPADES, ACE)
//        ]);
//
//        expect(hand.groups().length).toBe(1);
//    });

//    it("A group within a hand is unique", function() {
//        var gp = new Group([
//            new Card(SUITE_DIAMONDS, 5),
//            new Card(SUITE_CLUBS, 5)
//        ]);
//
//        expect(gp.contains(new Card(SUITE_CLUBS,5))).toBe(true);
//        expect(gp.contains(new Card(SUITE_DIAMONDS,7))).toBe(false);
//
//        expect(gp.canJoin(new Card(SUITE_HEARTS, 5))).toBe(true);
//        expect(gp.canJoin(new Card(SUITE_HEARTS, 4))).toBe(false);
//    });


//
//    it("An ace can't join a group unless it is with another ace", function() {
//       var gp = new Group([
//            new Card(SUITE_DIAMONDS, 5),
//            new Card(SUITE_CLUBS, 5)
//       ]);
//
//        expect(gp.canJoin(new Card(SUITE_CLUBS,ACE))).toBe(false);
//    });

//    it("multiple moves are possible by grouping cards", function() {
//        hand = buildHand([
//            new Card(SUITE_DIAMONDS, 5),
//            new Card(SUITE_DIAMONDS, 6),
//            new Card(SUITE_SPADES, 6),
//            new Card(SPADES, ACE)
//        ]);
//
//        expect(hand.possibleMoves(new Card(SUITE_DIAMONDS, 10)).length).toBe(4);
//    });
})

describe("Game starting mechanics:", function() {

    var computerPlayer, userPlayer, board, game, deck;

    beforeEach(function() {
        computerPlayer = new ComputerPlayer();
        userPlayer = new UserPlayer("nobody");
        board = new Board();
        deck = new Deck();
        game = new Game(computerPlayer,userPlayer, board, deck);
    });

    afterEach(function() {
        computerPlayer = null;
        userPlayer = null;
        board = null;
        game = null;
        deck = null;
    })


    it("chooses a starter of a game randomly", function() {
        game.startGame();
        //TODO: How do you test random starting of game?
    });

    it("cannot play when its not players turn", function() {
        game.startGame();
        var isComputersTurn = computerPlayer.isTurnToPlay();
        var isPlayersTurn = userPlayer.isTurnToPlay();

        expect(isComputersTurn == isPlayersTurn).toBe(false);
    });
});


(function() {
    var jasmineEnv = jasmine.getEnv();
    jasmineEnv.updateInterval = 250;

    var htmlReporter = new jasmine.HtmlReporter();
    jasmineEnv.addReporter(htmlReporter);

    jasmineEnv.specFilter = function(spec) {
        return htmlReporter.specFilter(spec);
    };

    var currentWindowOnload = window.onload;
    window.onload = function() {
        if (currentWindowOnload) {
            currentWindowOnload();
        }

        document.querySelector('.version').innerHTML = jasmineEnv.versionString();
        execJasmine();
    };

    function execJasmine() {
        jasmineEnv.execute();
    }
})();