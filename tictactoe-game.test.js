const TicTacToeGame = require('./tictactoe-game');

describe('TicTacToeGame', () => {
    let game;

    beforeEach(() => {
        game = new TicTacToeGame();
    });

    describe('Constructor', () => {
        test('should initialize with empty board', () => {
            expect(game.getBoard()).toEqual(['', '', '', '', '', '', '', '', '']);
        });

        test('should start with player X', () => {
            expect(game.getCurrentPlayer()).toBe('X');
        });

        test('should be active initially', () => {
            expect(game.isGameActive()).toBe(true);
        });

        test('should initialize with zero scores', () => {
            expect(game.getScores()).toEqual({
                playerX: 0,
                playerO: 0,
                draws: 0
            });
        });

        test('should not be in AI mode by default', () => {
            expect(game.isAiMode()).toBe(false);
        });
    });

    describe('resetGame', () => {
        test('should reset board to empty', () => {
            game.makeMove(0);
            game.makeMove(1);
            game.resetGame();
            expect(game.getBoard()).toEqual(['', '', '', '', '', '', '', '', '']);
        });

        test('should reset to player X', () => {
            game.makeMove(0);
            game.resetGame();
            expect(game.getCurrentPlayer()).toBe('X');
        });

        test('should set game to active', () => {
            // Force game to end
            game.board = ['X', 'X', 'X', 'O', 'O', '', '', '', ''];
            game.gameActive = false;
            game.resetGame();
            expect(game.isGameActive()).toBe(true);
        });
    });

    describe('makeMove', () => {
        test('should place player mark on board', () => {
            game.makeMove(0);
            expect(game.getBoard()[0]).toBe('X');
        });

        test('should switch players after valid move', () => {
            game.makeMove(0);
            expect(game.getCurrentPlayer()).toBe('O');
            game.makeMove(1);
            expect(game.getCurrentPlayer()).toBe('X');
        });

        test('should reject move on occupied cell', () => {
            game.makeMove(0);
            const result = game.makeMove(0);
            expect(result.success).toBe(false);
            expect(result.reason).toBe('invalid_move');
        });

        test('should reject move when game is inactive', () => {
            game.gameActive = false;
            const result = game.makeMove(0);
            expect(result.success).toBe(false);
        });

        test('should return success true for valid move', () => {
            const result = game.makeMove(0);
            expect(result.success).toBe(true);
        });
    });

    describe('checkGameState - Winning Conditions', () => {
        test('should detect top row win', () => {
            game.board = ['X', 'X', 'X', '', '', '', '', '', ''];
            game.currentPlayer = 'X';
            const result = game.checkGameState();
            expect(result.gameOver).toBe(true);
            expect(result.winner).toBe('X');
            expect(result.winningLine).toEqual([0, 1, 2]);
        });

        test('should detect middle row win', () => {
            game.board = ['', '', '', 'O', 'O', 'O', '', '', ''];
            game.currentPlayer = 'O';
            const result = game.checkGameState();
            expect(result.gameOver).toBe(true);
            expect(result.winner).toBe('O');
        });

        test('should detect bottom row win', () => {
            game.board = ['', '', '', '', '', '', 'X', 'X', 'X'];
            game.currentPlayer = 'X';
            const result = game.checkGameState();
            expect(result.gameOver).toBe(true);
            expect(result.winner).toBe('X');
        });

        test('should detect left column win', () => {
            game.board = ['X', '', '', 'X', '', '', 'X', '', ''];
            game.currentPlayer = 'X';
            const result = game.checkGameState();
            expect(result.gameOver).toBe(true);
            expect(result.winner).toBe('X');
        });

        test('should detect middle column win', () => {
            game.board = ['', 'O', '', '', 'O', '', '', 'O', ''];
            game.currentPlayer = 'O';
            const result = game.checkGameState();
            expect(result.gameOver).toBe(true);
            expect(result.winner).toBe('O');
        });

        test('should detect right column win', () => {
            game.board = ['', '', 'X', '', '', 'X', '', '', 'X'];
            game.currentPlayer = 'X';
            const result = game.checkGameState();
            expect(result.gameOver).toBe(true);
            expect(result.winner).toBe('X');
        });

        test('should detect diagonal win (top-left to bottom-right)', () => {
            game.board = ['X', '', '', '', 'X', '', '', '', 'X'];
            game.currentPlayer = 'X';
            const result = game.checkGameState();
            expect(result.gameOver).toBe(true);
            expect(result.winner).toBe('X');
        });

        test('should detect diagonal win (top-right to bottom-left)', () => {
            game.board = ['', '', 'O', '', 'O', '', 'O', '', ''];
            game.currentPlayer = 'O';
            const result = game.checkGameState();
            expect(result.gameOver).toBe(true);
            expect(result.winner).toBe('O');
        });

        test('should detect draw', () => {
            game.board = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
            const result = game.checkGameState();
            expect(result.gameOver).toBe(true);
            expect(result.draw).toBe(true);
        });

        test('should update scores on win', () => {
            game.board = ['X', 'X', 'X', '', '', '', '', '', ''];
            game.currentPlayer = 'X';
            game.checkGameState();
            expect(game.getScores().playerX).toBe(1);
        });

        test('should update draw score on draw', () => {
            game.board = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
            game.checkGameState();
            expect(game.getScores().draws).toBe(1);
        });
    });

    describe('AI Mode', () => {
        beforeEach(() => {
            game.setAiMode(true);
        });

        test('should enable AI mode', () => {
            expect(game.isAiMode()).toBe(true);
        });

        test('should reset game when enabling AI mode', () => {
            game.makeMove(0);
            game.setAiMode(true);
            expect(game.getBoard()).toEqual(['', '', '', '', '', '', '', '', '']);
        });

        test('should reject player move on O turn in AI mode', () => {
            game.makeMove(0); // X plays
            const result = game.makeMove(1); // Try to play O
            expect(result.success).toBe(false);
            expect(result.reason).toBe('ai_turn');
        });

        test('should allow AI to make move', () => {
            game.currentPlayer = 'O';
            const result = game.makeAiMove();
            expect(result.success).toBe(true);
            expect(result.move).toBeDefined();
        });

        test('AI should win when possible', () => {
            game.board = ['O', 'O', '', '', '', '', '', '', ''];
            game.currentPlayer = 'O';
            const result = game.makeAiMove();
            expect(result.move).toBe(2); // Should complete the winning line
        });

        test('AI should block player from winning', () => {
            game.board = ['X', 'X', '', '', '', '', '', '', ''];
            game.currentPlayer = 'O';
            const result = game.makeAiMove();
            expect(result.move).toBe(2); // Should block X from winning
        });

        test('AI should prefer center when available', () => {
            game.board = ['X', '', '', '', '', '', '', '', ''];
            game.currentPlayer = 'O';
            const result = game.makeAiMove();
            expect(result.move).toBe(4); // Should take center
        });

        test('AI should take corner when center is taken', () => {
            game.board = ['', '', '', '', 'X', '', '', '', ''];
            game.currentPlayer = 'O';
            const result = game.makeAiMove();
            expect([0, 2, 6, 8]).toContain(result.move); // Should take a corner
        });
    });

    describe('checkWinForPlayer', () => {
        test('should return true when player has winning condition', () => {
            game.board = ['X', 'X', 'X', '', '', '', '', '', ''];
            expect(game.checkWinForPlayer('X')).toBe(true);
        });

        test('should return false when player does not have winning condition', () => {
            game.board = ['X', 'X', '', '', '', '', '', '', ''];
            expect(game.checkWinForPlayer('X')).toBe(false);
        });
    });

    describe('Score Management', () => {
        test('should load scores from object', () => {
            game.loadScores({ playerX: 5, playerO: 3, draws: 2 });
            expect(game.getScores()).toEqual({
                playerX: 5,
                playerO: 3,
                draws: 2
            });
        });

        test('should handle missing score properties', () => {
            game.loadScores({ playerX: 5 });
            expect(game.getScores()).toEqual({
                playerX: 5,
                playerO: 0,
                draws: 0
            });
        });

        test('should reset scores to zero', () => {
            game.loadScores({ playerX: 5, playerO: 3, draws: 2 });
            game.resetScores();
            expect(game.getScores()).toEqual({
                playerX: 0,
                playerO: 0,
                draws: 0
            });
        });

        test('should return copy of scores', () => {
            const scores1 = game.getScores();
            scores1.playerX = 999;
            const scores2 = game.getScores();
            expect(scores2.playerX).toBe(0);
        });
    });

    describe('Integration - Full Game Flow', () => {
        test('should play a complete game with X winning', () => {
            game.makeMove(0); // X
            game.makeMove(3); // O
            game.makeMove(1); // X
            game.makeMove(4); // O
            const result = game.makeMove(2); // X wins

            expect(result.gameOver).toBe(true);
            expect(result.winner).toBe('X');
            expect(game.isGameActive()).toBe(false);
            expect(game.getScores().playerX).toBe(1);
        });

        test('should play a complete game ending in draw', () => {
            game.makeMove(0); // X
            game.makeMove(1); // O
            game.makeMove(2); // X
            game.makeMove(4); // O
            game.makeMove(3); // X
            game.makeMove(5); // O
            game.makeMove(7); // X
            game.makeMove(6); // O
            const result = game.makeMove(8); // X - Draw

            expect(result.gameOver).toBe(true);
            expect(result.draw).toBe(true);
            expect(game.getScores().draws).toBe(1);
        });
    });
});
