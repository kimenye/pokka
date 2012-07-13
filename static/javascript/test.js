/**
 * Test functions for pokkah.js
 */

describe("Test Game starting mechanics", function() {
//    var a;

    var computerPlayer, userPlayer, board, game;

    beforeEach(function() {
        computerPlayer = new ComputerPlayer();
        userPlayer = new UserPlayer("nobody");
        board = new Board();
        game = new Game(computerPlayer,userPlayer, board);
    });

    afterEach(function() {
        computerPlayer = null;
        userPlayer = null;
        board = null;
        game = null;
    })



    it("chooses a starter of a game randomly", function() {
        game.startGame();

    });

    it("cannot play when its not players turn", function() {
        game.startGame();
    })
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