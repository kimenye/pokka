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

function debugArray(array) {
    _.each(array, function(a) { console.log(a) });
}

describe("Card rules:", function() {

    var deck;

    beforeEach(function() {
        deck = new Deck();
    })

    it("A deck has 54 cards per deck", function() {
       expect(deck.cards.length).toBe(54);
    });

    it("A card can be removed from a hand", function() {
        var hand = buildHand([
            new Card(SUITE_CLUBS,4),
            new Card(SUITE_CLUBS,5)
        ]);

        expect(hand.size()).toBe(2);
        hand.removeCard(new Card(SUITE_CLUBS, 5));

        expect(hand.size()).toBe(1);
    })

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

    it("A queen cannot finish a move", function() {
        var q_d = new Card(SUITE_DIAMONDS, QUEEN);
        expect(q_d.canEndMove()).toBe(false);

        var k_d = new Card(SUITE_DIAMONDS, KING);
        expect(k_d.canEndMove()).toBe(true);

        var e_d = new Card(SUITE_DIAMONDS, 8);
        expect(e_d.canEndMove()).toBe(false);
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

describe("Utility rules", function() {

    it ("Should return an array of elements without the specified index", function() {

        var arr = [1,2,3,4];
        var res = exclude_from(arr,0); // [2,3,4]
        expect(res[0]).toBe(2);
        expect(res[1]).toBe(3);
        expect(res[2]).toBe(4);

        res = exclude_from(arr, 3); // [1,2,3]
        expect(res[0]).toBe(1);
        expect(res[1]).toBe(2);
        expect(res[2]).toBe(3);

        res = exclude_from(arr, 1); // [1,3,4]
        expect(res[0]).toBe(1);
        expect(res[1]).toBe(3);
        expect(res[2]).toBe(4);

        res = exclude_from(arr, 2); // [1,2,4]
        expect(res[0]).toBe(1);
        expect(res[1]).toBe(2);
        expect(res[2]).toBe(4);

    });

    it("Should return a stepped breakdown of an array", function() {
        var arr = [1,2,3,4];
        expect(step(arr,2).length).toBe(3);

        arr = [1,2,3];
        expect(step(arr,2).length).toBe(2);

    });

    it("Decompose returns the possible combinations in array given the minimum length", function() {

        var arr = [1,2,3,4];
        expect(decompose(arr,2).length).toBe(3);
    });

    it("Raw Permuations returns the possible number of permutations", function() {

        var arr = [1,2];
        expect(permute(arr).length).toBe(2);

        var arr = [1,2,3];
        expect(permute(arr).length).toBe(6);
    });

    it("When an array length is equal to the minimum size of combinations then the total possibilities is equal to the number of permutations", function() {
        var arr = [1,2];
        expect(possible_combinations(arr, 2).length).toBe(permute(arr).length);
    });

    it("The number of combinations is equal to the sum of the number of permutations of the component parts", function() {
        var arr = [1,2,3,4];

        var decomposed = decompose(arr,2);
        var num_possibilities = 0;
        _.each(decomposed, function(a) {
            num_possibilities += permute(a).length;
        });

        console.log("P:",num_possibilities);
        expect(possible_combinations(arr,2).length).toBe(num_possibilities);
    });

    it("The number of possible moves in a hand is equal to the number of possible combinations in the hand", function() {
        var cards = [
            new Card(SUITE_CLUBS, 3),
            new Card(SUITE_DIAMONDS, 3),
            new Card(SUITE_CLUBS, 5),
            new Card(SUITE_HEARTS, 7)
        ];

        expect(possible_combinations(cards,2).length).toBe(32);
    })
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

        it("A group requires at least 2 cards in a hand", function() {
            hand = buildHand([new Card(SUITE_CLUBS,3)]);
            expect(hand.groups().length).toBe(0);
        });

        it("A group can only be evaluated if the top card in on the deck is provided", function() {
            hand = buildHand([
                new Card(SUITE_SPADES, 4),
                new Card(SUITE_CLUBS, 4),
                new Card(SUITE_HEARTS, 3),
                new Card(SUITE_SPADES, 5)
            ]);
            expect(hand.groups().length).toBe(0);
        });

        it("A group does not exist if no cards in a hand can be played together even if they can follow each other", function () {
            hand = buildHand([
                new Card(SUITE_DIAMONDS, 5),
                new Card(SUITE_DIAMONDS, 6)
            ]);

            expect(hand.groups().length).toBe(0);
        });

        it("A group exists if more than one cards in a hand can be played together", function () {
            hand = buildHand([
                new Card(SUITE_SPADES, 4),
                new Card(SUITE_CLUBS, 4),
                new Card(SUITE_HEARTS, 3),
                new Card(SUITE_SPADES, 5)
            ]);

            expect(hand.groups(new Card(SUITE_SPADES, 6)).length).toBe(1);
        });

        it("A group with more cards is more valuable than one with less", function() {
            hand = buildHand([
                new Card(SUITE_SPADES, 4),
                new Card(SUITE_CLUBS, 4),
                new Card(SUITE_HEARTS, 4),
                new Card(SUITE_SPADES, 5),
                new Card(SUITE_HEARTS, 5)
            ]);

            expect(hand.groups(new Card(SUITE_SPADES, 6)).length).toBe(2);
            expect(hand.bestGroup(new Card(SUITE_SPADES, 6)).score()).toBe(3);
        });
    });
});

describe("Game play mechanics:", function() {

    var computerPlayer, userPlayer, board, game, deck;

    beforeEach(function() {
        computerPlayer = new ComputerPlayer();
        userPlayer = new UserPlayer("nobody");
        board = new Board();
        deck = new Deck();
        game = new Game(userPlayer,computerPlayer, board, deck);
    });

    afterEach(function() {
        computerPlayer = null;
        userPlayer = null;
        board = null;
        game = null;
        deck = null;
    });


    it("It chooses a starter of a game randomly", function() {
        game.startGame();
        //TODO: How do you test random starting of game?
    });

    it("When a hand is reset all the cards are moved", function() {
        var hand = buildHand([
            new Card(SUITE_SPADES, 4),
            new Card(SUITE_CLUBS, 4),
            new Card(SUITE_HEARTS, 3),
            new Card(SUITE_SPADES, 5)
        ]);
        hand.reset();
        expect(hand.isEmpty()).toBe(true);
    });

    it("When a game is restarted, everything is reset to the beginning", function() {
       game.startGame();
    });

    it("Logs the start of the game", function() {
        expect(game.logs().length).toBe(0);
        game.startGame();
        expect(game.logs().length).toBe(1);
    });

    it("A player cannot play when its not players turn", function() {
        game.startGame(true);
        var isComputersTurn = computerPlayer.isTurnToPlay();
        var isPlayersTurn = userPlayer.isTurnToPlay();

        expect(isComputersTurn == isPlayersTurn).toBe(false);
        expect(isComputersTurn).toBe(true);
        expect(game.currentTurn()).toBe(computerPlayer);

        expect(game.whoseTurn()).toBe("COMPUTER'S TURN TO PLAY");
    });

    it("When the game is started with debug its the computers turn to play", function() {
        game.startGame(true);
        expect(computerPlayer.isTurnToPlay()).toBe(true);
    });

    it("A boards top card is the last card played", function() {
        expect(board.topCard()).toBeUndefined();
        board.start(new Card(SUITE_HEARTS, QUEEN));
        expect(board.topCard().eq(new Card(SUITE_HEARTS, QUEEN))).toBe(true);
    });

    it("When its a players turn to play and the player cant play, they pick a card from the deck", function() {
        game.startGame(true);
        computerPlayer.give(new Card(SUITE_CLUBS,4));
        computerPlayer.give(new Card(SUITE_DIAMONDS,4));
        computerPlayer.give(new Card(SUITE_CLUBS,4));
        computerPlayer.give(new Card(SUITE_SPADES,5));

        expect(computerPlayer.hasCards()).toBe(true);
        board.start(new Card(SUITE_HEARTS, QUEEN));
        expect(board.topCard() != null).toBe(true);

        expect(computerPlayer.numCards()).toBe(4);
        expect(computerPlayer.hasCards()).toBe(true);
        game.giveTurnTo(computerPlayer,userPlayer);
        computerPlayer.play();

        expect(computerPlayer.numCards()).toBe(5);
        expect(userPlayer.isTurnToPlay()).toBe(true);
//        waitsFor(function() {
//            return computerPlayer.hasPlayed();
//        }, "Computer never played on time", 5000);
//
//        runs(function() {
//            expect(computerPlayer.numCards()).toBe(5);
//        });
    });

    it("When its the computers turn to play it plays and the turn passes to the other player", function() {
        game.startGame(true);

        computerPlayer.give(new Card(SUITE_SPADES,4));
        computerPlayer.give(new Card(SUITE_DIAMONDS,4));
        computerPlayer.give(new Card(SUITE_CLUBS,4));
        computerPlayer.give(new Card(SUITE_SPADES,5));

        board.start(new Card(SUITE_SPADES, 6));

        expect(computerPlayer.hand().groups(new Card(SUITE_SPADES, 6)).length).toBe(1);
        //give the computer the turn to play
        computerPlayer.isTurnToPlay(true);
        computerPlayer.play();

        expect(computerPlayer.numCards()).toBe(1);
        expect(board.topCard().eq(new Card(SUITE_CLUBS,4))).toBe(true);
    });

    it("When a player picks a card there is one less card in the deck and the players cards increase", function() {
       game.startGame();

        userPlayer.isTurnToPlay(true);
        userPlayer.give(new Card(SUITE_SPADES, 8));
        userPlayer.give(new Card(SUITE_DIAMONDS, 4));
        userPlayer.give(new Card(SUITE_DIAMONDS, 5));
        userPlayer.give(new Card(SUITE_SPADES, KING));

        expect(userPlayer.numCards()).toBe(4);
        userPlayer.pick(1);
        expect(userPlayer.numCards()).toBe(5);
    });

    it("When a player picks a card from the deck it becomes the other players turn to play", function() {
        game.startGame(true);
        expect(computerPlayer.isTurnToPlay()).toBe(true);
        expect(userPlayer.isTurnToPlay()).toBe(false);
        computerPlayer.pick(1);
        expect(userPlayer.isTurnToPlay()).toBe(true);
        expect(computerPlayer.isTurnToPlay()).toBe(false)
        userPlayer.pick(1);
        expect(computerPlayer.isTurnToPlay()).toBe(true);
        expect(userPlayer.isTurnToPlay()).toBe(false);
    });

    it("A hands best single move is the first one that can be played", function() {
        hand = buildHand([new Card(SUITE_CLUBS,6),
                        new Joker(1),
                        new Card(SUITE_DIAMONDS,7),
                        new Card(SUITE_HEARTS,5)]);

        expect(hand.bestSingleMove(new Card(SUITE_DIAMONDS,9)).eq(new Card(SUITE_DIAMONDS, 7))).toBe(true);
    });

    it("When a player does not have any groups they play a single card", function() {
        game.startGame(true);

        board.start(new Card(SUITE_DIAMONDS, 9));

        computerPlayer.give(new Card(SUITE_CLUBS,6));
        computerPlayer.give(new Joker(1));
        computerPlayer.give(new Card(SUITE_DIAMONDS,7));
        computerPlayer.give(new Card(SUITE_HEARTS,5));

        computerPlayer.isTurnToPlay(true);
        computerPlayer.play();

        expect(computerPlayer.numCards()).toBe(3);
        expect(board.topCard().eq(new Card(SUITE_DIAMONDS, 7))).toBe(true);
    });

    it("A player can only move cards which they have selected if they are valid", function() {

        var selected = new Card(SUITE_DIAMONDS,7);
        selected.selected(true);

        var unselected = new Card(SUITE_HEARTS,5);
        unselected.selected(false);
        hand = buildHand([new Card(SUITE_CLUBS,6),
            new Joker(1),
            selected,
            unselected]);

        expect(hand.numSelected()).toBe(1);
        expect(hand.canPlaySelections(new Card(SUITE_DIAMONDS,9))).toBe(true);

        selected.selected(false);
        unselected.selected(true);


        expect(hand.numSelected()).toBe(1);
        expect(hand.canPlaySelections(new Card(SUITE_DIAMONDS,9))).toBe(false);

        unselected.selected(false);
        expect(hand.numSelected()).toBe(0);
        expect(hand.canPlaySelections(new Card(SUITE_DIAMONDS,9))).toBe(false);
    });

    it("A player can only move a selected group if they are valid", function() {
        hand = buildHand([
            new Card(SUITE_SPADES, 4),
            new Card(SUITE_CLUBS, 4),
            new Card(SUITE_HEARTS, 3),
            new Card(SUITE_SPADES, 5)
        ]);

        hand.cards()[0].selected(true);
        hand.cards()[1].selected(true);

        expect(hand.numSelected()).toBe(2);
        expect(hand.canPlaySelections(new Card(SUITE_HEARTS, 4))).toBe(true);

        hand.cards()[0].selected(true);
        hand.cards()[2].selected(true);
        hand.cards()[1].selected(false);

        expect(hand.numSelected()).toBe(2);
        expect(hand.canPlaySelections(new Card(SUITE_HEARTS, 4))).toBe(false);
    });

    describe("Queen Moves", function() {

        it("When a play selects a queen and they dont have another card that can match it the have to pick a card", function() {
            game.startGame(true);

            board.start(new Card(SUITE_DIAMONDS, 9));

            computerPlayer.give(new Card(SUITE_DIAMONDS,QUEEN));
            computerPlayer.give(new Card(SUITE_HEARTS,5));

            computerPlayer.isTurnToPlay(true);
            computerPlayer.play();

            expect(computerPlayer.numCards()).toBe(2);
        });

//        it("A move is not complete if ")
//        it ("A ")
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