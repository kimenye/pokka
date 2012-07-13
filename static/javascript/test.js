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

describe("Test Card rules", function() {

    var deck;

    beforeEach(function() {
        deck = new Deck();
    })

    it("has 54 cards per deck", function() {
       expect(deck.cards.length).toBe(54);
    });

    it("cannot start game with invalid card", function() {
        var starting_card = deck.cut();
        expect(starting_card.isFaceCard()).toBe(false);
        expect(starting_card.isSpecialCard()).toBe(false);
        expect(starting_card.isAce()).toBe(false);
    });

    it("cards of the same suite can follow each other", function() {
        var random_spade_card = new Card(SUITE_SPADES, randomRank());
        var other_spade_card = new Card(SUITE_SPADES, randomRank());

        expect(random_spade_card.canFollow(other_spade_card)).toBe(true);
        expect(other_spade_card.canFollow(random_spade_card)).toBe(true);
    });

    it("cards of a different suite but same rank can follow each other", function() {
        var rank = randomRank();
        var random_diamond = new Card(SUITE_DIAMONDS, rank);
        var random_spade = new Card(SUITE_SPADES, rank);

        expect(random_diamond.canFollow(random_spade)).toBe(true);
    });

    it("an ace can follow any card", function() {
        var any_card = randomCard();
        var an_ace = new Card(SUITE_DIAMONDS, ACE);

        expect(an_ace.canFollow(any_card)).toBe(true);
    });
});


describe("Building moves rules", function() {
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


    it("no moves are possible if no cards can follow", function() {
        var starting_card = new Card(SUITE_DIAMONDS, 10);

        hand.cards.push(new Card(SUITE_HEARTS, 2));
        hand.cards.push(new Card(SUITE_SPADES, 3));
        hand.cards.push(new Card(SUITE_HEARTS, 4));
        hand.cards.push(new Card(SUITE_CLUBS, 4));

        expect(hand.canPlay(starting_card)).toBe(false);
    });

    it("moves are possible if at least one card can follow the starting card", function() {
        var starting_card = new Card(SUITE_DIAMONDS, 10);

        var five_d = new Card(SUITE_DIAMONDS, 5);
        var six_d = new Card(SUITE_CLUBS, 6);
        var k_s = new Card(SUITE_SPADES, KING);
        var two_c = new Card(SUITE_CLUBS, 2);

        var cards_in_hand = [five_d, six_d, k_s, two_c];

        _.each(cards_in_hand, function(card) { hand.cards.push(card); });

        expect(hand.cards().length).toBe(4);
        expect(hand.canPlay(starting_card)).toBe(true);

    });
})

describe("Test Game starting mechanics", function() {

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