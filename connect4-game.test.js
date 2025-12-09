const Connect4Game = require('./connect4-game');

describe('Connect4Game', () => {
    let game;

    beforeEach(() => {
        game = new Connect4Game();
    });

    describe('Constructor', () => {
        test('should initialize with 6 rows and 7 columns', () => {
            const board = game.getBoard();
            expect(board.length).toBe(6);
            expect(board[0].length).toBe(7);
        });

        test('should initialize with empty board', () => {
            const board = game.getBoard();
            expect(board.every(row => row.every(cell => cell === null))).toBe(true);
        });

        test('should start with red player', () => {
            expect(game.getCurrentPlayer()).toBe('red');
        });

        test('should be active initially', () => {
            expect(game.isGameActive()).toBe(true);
        });

        test('should initialize with zero scores', () => {
            expect(game.getScores()).toEqual({
                red: 0,
                yellow: 0,
                draws: 0
            });
        });

        test('should support custom board size', () => {
            const customGame = new Connect4Game(4, 5);
            const board = customGame.getBoard();
            expect(board.length).toBe(4);
            expect(board[0].length).toBe(5);
        });
    });

    describe('resetGame', () => {
        test('should reset board to empty', () => {
            game.placePiece(0);
            game.placePiece(1);
            game.resetGame();
            const board = game.getBoard();
            expect(board.every(row => row.every(cell => cell === null))).toBe(true);
        });

        test('should reset to red player', () => {
            game.placePiece(0);
            game.resetGame();
            expect(game.getCurrentPlayer()).toBe('red');
        });

        test('should set game to active', () => {
            game.gameActive = false;
            game.resetGame();
            expect(game.isGameActive()).toBe(true);
        });
    });

    describe('getLowestEmptyRow', () => {
        test('should return bottom row for empty column', () => {
            expect(game.getLowestEmptyRow(0)).toBe(5);
        });

        test('should return correct row when column has pieces', () => {
            game.board[5][0] = 'red';
            expect(game.getLowestEmptyRow(0)).toBe(4);
        });

        test('should return -1 for full column', () => {
            for (let r = 0; r < 6; r++) {
                game.board[r][0] = 'red';
            }
            expect(game.getLowestEmptyRow(0)).toBe(-1);
        });
    });

    describe('placePiece', () => {
        test('should place piece in the correct position', () => {
            const result = game.placePiece(0);
            expect(result.success).toBe(true);
            expect(result.row).toBe(5);
            expect(result.col).toBe(0);
            expect(game.getBoard()[5][0]).toBe('red');
        });

        test('should stack pieces in same column', () => {
            game.placePiece(0);
            game.placePiece(0);
            const board = game.getBoard();
            expect(board[5][0]).toBe('red');
            expect(board[4][0]).toBe('yellow');
        });

        test('should switch players after valid move', () => {
            game.placePiece(0);
            expect(game.getCurrentPlayer()).toBe('yellow');
            game.placePiece(1);
            expect(game.getCurrentPlayer()).toBe('red');
        });

        test('should reject move in full column', () => {
            for (let i = 0; i < 6; i++) {
                game.placePiece(0);
            }
            const result = game.placePiece(0);
            expect(result.success).toBe(false);
            expect(result.reason).toBe('column_full');
        });

        test('should reject move when game is inactive', () => {
            game.gameActive = false;
            const result = game.placePiece(0);
            expect(result.success).toBe(false);
            expect(result.reason).toBe('game_inactive');
        });
    });

    describe('checkWin - Winning Conditions', () => {
        test('should detect horizontal win', () => {
            // Place 4 red pieces in a row horizontally
            game.board[5] = ['red', 'red', 'red', 'red', null, null, null];
            expect(game.checkWin(5, 0)).toBe(true);
        });

        test('should detect vertical win', () => {
            // Place 4 red pieces in a column
            game.board[5][0] = 'red';
            game.board[4][0] = 'red';
            game.board[3][0] = 'red';
            game.board[2][0] = 'red';
            expect(game.checkWin(2, 0)).toBe(true);
        });

        test('should detect diagonal win (ascending)', () => {
            // Create diagonal from bottom-left to top-right
            game.board[5][0] = 'red';
            game.board[4][1] = 'red';
            game.board[3][2] = 'red';
            game.board[2][3] = 'red';
            expect(game.checkWin(2, 3)).toBe(true);
        });

        test('should detect diagonal win (descending)', () => {
            // Create diagonal from top-left to bottom-right
            game.board[2][0] = 'yellow';
            game.board[3][1] = 'yellow';
            game.board[4][2] = 'yellow';
            game.board[5][3] = 'yellow';
            expect(game.checkWin(5, 3)).toBe(true);
        });

        test('should not detect win with only 3 in a row', () => {
            game.board[5] = ['red', 'red', 'red', null, null, null, null];
            expect(game.checkWin(5, 0)).toBe(false);
        });
    });

    describe('checkGameState', () => {
        test('should detect win and update scores', () => {
            game.board[5] = ['red', 'red', 'red', null, null, null, null];
            game.currentPlayer = 'red';
            game.board[5][3] = 'red';
            const result = game.checkGameState(5, 3);
            
            expect(result.gameOver).toBe(true);
            expect(result.winner).toBe('red');
            expect(game.isGameActive()).toBe(false);
            expect(game.getScores().red).toBe(1);
        });

        test('should detect draw', () => {
            // Fill the board without any winner - alternating pattern carefully designed
            // Pattern avoids 4 in a row horizontally, vertically, and diagonally
            game.board = [
                ['red', 'red', 'yellow', 'yellow', 'red', 'red', 'yellow'],
                ['yellow', 'yellow', 'red', 'red', 'yellow', 'yellow', 'red'],
                ['red', 'red', 'yellow', 'yellow', 'red', 'red', 'yellow'],
                ['yellow', 'yellow', 'red', 'red', 'yellow', 'yellow', 'red'],
                ['yellow', 'red', 'red', 'yellow', 'yellow', 'red', 'red'],
                ['red', 'yellow', 'yellow', 'red', 'red', 'yellow', 'yellow']
            ];
            const result = game.checkGameState(0, 0);
            
            expect(result.gameOver).toBe(true);
            expect(result.draw).toBe(true);
            expect(game.getScores().draws).toBe(1);
        });

        test('should return gameOver false for ongoing game', () => {
            game.board[5][0] = 'red';
            const result = game.checkGameState(5, 0);
            expect(result.gameOver).toBe(false);
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
            game.placePiece(0);
            game.setAiMode(true);
            const board = game.getBoard();
            expect(board.every(row => row.every(cell => cell === null))).toBe(true);
        });

        test('should reject player move on yellow turn in AI mode', () => {
            game.placePiece(0); // red plays
            const result = game.placePiece(1); // Try to play yellow
            expect(result.success).toBe(false);
            expect(result.reason).toBe('ai_turn');
        });

        test('should allow AI to make move', () => {
            game.currentPlayer = 'yellow';
            const result = game.makeAiMove();
            expect(result.success).toBe(true);
            expect(result.col).toBeDefined();
            expect(result.row).toBeDefined();
        });

        test('AI should win when possible', () => {
            // Set up board where AI can win
            game.board[5][0] = 'yellow';
            game.board[5][1] = 'yellow';
            game.board[5][2] = 'yellow';
            game.currentPlayer = 'yellow';
            
            const result = game.makeAiMove();
            expect(result.col).toBe(3); // Should complete the winning line
            expect(result.gameOver).toBe(true);
            expect(result.winner).toBe('yellow');
        });

        test('AI should block player from winning', () => {
            // Set up board where player can win
            game.board[5][0] = 'red';
            game.board[5][1] = 'red';
            game.board[5][2] = 'red';
            game.currentPlayer = 'yellow';
            
            const result = game.makeAiMove();
            expect(result.col).toBe(3); // Should block red from winning
        });
    });

    describe('Score Management', () => {
        test('should load scores from object', () => {
            game.loadScores({ red: 5, yellow: 3, draws: 2 });
            expect(game.getScores()).toEqual({
                red: 5,
                yellow: 3,
                draws: 2
            });
        });

        test('should handle missing score properties', () => {
            game.loadScores({ red: 5 });
            expect(game.getScores()).toEqual({
                red: 5,
                yellow: 0,
                draws: 0
            });
        });

        test('should reset scores to zero', () => {
            game.loadScores({ red: 5, yellow: 3, draws: 2 });
            game.resetScores();
            expect(game.getScores()).toEqual({
                red: 0,
                yellow: 0,
                draws: 0
            });
        });

        test('should return copy of scores', () => {
            const scores1 = game.getScores();
            scores1.red = 999;
            const scores2 = game.getScores();
            expect(scores2.red).toBe(0);
        });
    });

    describe('evaluateWindow', () => {
        test('should give high score for 4 in a row', () => {
            const window = ['red', 'red', 'red', 'red'];
            const score = game.evaluateWindow(window, 'red');
            expect(score).toBe(100);
        });

        test('should give positive score for 3 with 1 empty', () => {
            const window = ['red', 'red', 'red', null];
            const score = game.evaluateWindow(window, 'red');
            expect(score).toBeGreaterThan(0);
        });

        test('should give negative score for opponent 3 with 1 empty', () => {
            const window = ['yellow', 'yellow', 'yellow', null];
            const score = game.evaluateWindow(window, 'red');
            expect(score).toBeLessThan(0);
        });

        test('should give zero score for mixed pieces', () => {
            const window = ['red', 'yellow', 'red', 'yellow'];
            const score = game.evaluateWindow(window, 'red');
            expect(score).toBe(0);
        });
    });

    describe('scorePosition', () => {
        test('should give bonus for center column', () => {
            game.board[5][3] = 'red';
            const score = game.scorePosition('red');
            expect(score).toBeGreaterThan(0);
        });

        test('should score horizontal opportunities', () => {
            game.board[5][0] = 'red';
            game.board[5][1] = 'red';
            const score = game.scorePosition('red');
            expect(score).toBeGreaterThan(0);
        });
    });

    describe('Integration - Full Game Flow', () => {
        test('should play a complete game with red winning horizontally', () => {
            game.placePiece(0); // red
            game.placePiece(0); // yellow
            game.placePiece(1); // red
            game.placePiece(1); // yellow
            game.placePiece(2); // red
            game.placePiece(2); // yellow
            const result = game.placePiece(3); // red wins

            expect(result.gameOver).toBe(true);
            expect(result.winner).toBe('red');
            expect(game.isGameActive()).toBe(false);
            expect(game.getScores().red).toBe(1);
        });

        test('should play a complete game with vertical win', () => {
            game.placePiece(0); // red
            game.placePiece(1); // yellow
            game.placePiece(0); // red
            game.placePiece(1); // yellow
            game.placePiece(0); // red
            game.placePiece(1); // yellow
            const result = game.placePiece(0); // red wins vertically

            expect(result.gameOver).toBe(true);
            expect(result.winner).toBe('red');
        });
    });

    describe('Edge Cases', () => {
        test('should handle multiple consecutive wins', () => {
            // First game
            game.board[5] = ['red', 'red', 'red', 'red', null, null, null];
            game.currentPlayer = 'red';
            game.checkGameState(5, 3);
            
            // Reset and second game
            game.resetGame();
            game.board[5] = ['yellow', 'yellow', 'yellow', 'yellow', null, null, null];
            game.currentPlayer = 'yellow';
            game.checkGameState(5, 3);
            
            const scores = game.getScores();
            expect(scores.red).toBe(1);
            expect(scores.yellow).toBe(1);
        });

        test('should return copy of board not reference', () => {
            const board1 = game.getBoard();
            board1[0][0] = 'red';
            const board2 = game.getBoard();
            expect(board2[0][0]).toBe(null);
        });
    });
});
