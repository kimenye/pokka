$(document).ready(function () {


    function GameVM() {
        var self = this;

        self.deck = ko.observable(null);
        self.computer = new ComputerPlayer();
        self.user = ko.observable(new UserPlayer("Player 1"));
        self.inProgress = ko.observable(false);
        self.board = ko.observable(new Board());
        if (self.deck() == null) {
            self.deck(new Deck());
            self.deck().display("deck");
        }

        self.game = ko.observable(new Game(self.user(), self.computer, self.board(), self.deck()));

        self.playerCanMove = ko.computed(function() {
            var hasSelections = self.user().hasSelections();
            return hasSelections && self.playerCanPlay();
        });

        self.playerCanPlay = ko.computed(function() {
           return self.user().isTurnToPlay();
        });

        self.startGame = function() {
            self.deal();
            self.inProgress(true);
        }

        self.restartGame = function() {
            self.startGame();
        }

        self.computerMove = function() {
            if (self.computer.canPlay()) {
                self.computer.play();
            }
        }

        self.move = function() {
            if (this.user().hasSelections() &&
                this.user().hand().canPlaySelections(this.board().topCard()) ) {
                this.user().play();
                this.computer.play();
            }
        }

        self.pick = function() {
            this.user().pick(1);
            this.computer.play();
        }

        self.deal = function() {
            var starting_card = self.game().startGame();
            if (this.computer.isTurnToPlay())
            {
                this.computer.play();
            }
        }
    }
    var vm = new GameVM()
    ko.applyBindings(vm);
//    vm.startGame();
});