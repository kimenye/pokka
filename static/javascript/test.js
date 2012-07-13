/**
 * Test functions for pokkah.js
 */

//helper functions
function randomRank() {
   return Math.max(2,Math.floor(Math.random() * 10));
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
});

describe("Test Game starting mechanics", function() {
//    var a;

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