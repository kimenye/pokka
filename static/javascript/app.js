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
            self.deck().display();
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
            self.shuffle();
            self.deal();
            self.inProgress(true);
        }

        self.shuffle = function() {
            self.deck().shuffle();
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
            }
        }

        self.pick = function() {
            self.user().pick(1);
        }

        self.deal = function() {
            _.each(_.range(0, 4), function (idx) {
                var player_card = self.deck().deal();
                var computer_card = self.deck().deal();
                self.user().give(player_card);
                self.computer.give(computer_card);
            });

            var starting_card = self.deck().cut();
            self.board().start(starting_card);

            self.game().startGame(true);
//            self.game().startGame();
        }
    }
    var vm = new GameVM()
    ko.applyBindings(vm);
    vm.startGame();
});