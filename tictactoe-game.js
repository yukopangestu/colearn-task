/**
 * Tic Tac Toe Game Logic
 */

class TicTacToeGame {
    constructor() {
        this.board = ['', '', '', '', '', '', '', '', ''];
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.aiMode = false;
        this.scores = {
            playerX: 0,
            playerO: 0,
            draws: 0
        };
        this.winningConditions = [
            [0, 1, 2], // Top row
            [3, 4, 5], // Middle row
            [6, 7, 8], // Bottom row
            [0, 3, 6], // Left column
            [1, 4, 7], // Middle column
            [2, 5, 8], // Right column
            [0, 4, 8], // Diagonal top-left to bottom-right
            [2, 4, 6]  // Diagonal top-right to bottom-left
        ];
    }

    /**
     * Reset the game board
     */
    resetGame() {
        this.board = ['', '', '', '', '', '', '', '', ''];
        this.currentPlayer = 'X';
        this.gameActive = true;
    }

    /**
     * Set AI mode
     * @param {boolean} enabled - Whether AI mode is enabled
     */
    setAiMode(enabled) {
        this.aiMode = enabled;
        this.resetGame();
    }

    /**
     * Make a move
     * @param {number} index - Board position (0-8)
     * @returns {Object} Result of the move
     */
    makeMove(index) {
        if (this.board[index] !== '' || !this.gameActive) {
            return { success: false, reason: 'invalid_move' };
        }

        if (this.aiMode && this.currentPlayer === 'O') {
            return { success: false, reason: 'ai_turn' };
        }

        this.board[index] = this.currentPlayer;
        const result = this.checkGameState();

        if (!result.gameOver) {
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        }

        return {
            success: true,
            ...result
        };
    }

    /**
     * Check current game state
     * @returns {Object} Game state information
     */
    checkGameState() {
        // Check for win
        for (let condition of this.winningConditions) {
            const [a, b, c] = condition;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                this.gameActive = false;
                
                // Update scores
                if (this.currentPlayer === 'X') {
                    this.scores.playerX++;
                } else {
                    this.scores.playerO++;
                }

                return {
                    gameOver: true,
                    winner: this.currentPlayer,
                    winningLine: condition
                };
            }
        }

        // Check for draw
        if (!this.board.includes('')) {
            this.gameActive = false;
            this.scores.draws++;
            return {
                gameOver: true,
                draw: true
            };
        }

        return {
            gameOver: false
        };
    }

    /**
     * Check if a player would win with a specific move (for AI)
     * @param {string} player - 'X' or 'O'
     * @returns {boolean} True if player has winning condition
     */
    checkWinForPlayer(player) {
        for (let condition of this.winningConditions) {
            const [a, b, c] = condition;
            if (this.board[a] === player && this.board[b] === player && this.board[c] === player) {
                return true;
            }
        }
        return false;
    }

    /**
     * Get AI move using intelligent strategy
     * @returns {number} Board position for AI move
     */
    getAiMove() {
        // 1. Try to win
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'O';
                if (this.checkWinForPlayer('O')) {
                    this.board[i] = '';
                    return i;
                }
                this.board[i] = '';
            }
        }

        // 2. Block player from winning
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'X';
                if (this.checkWinForPlayer('X')) {
                    this.board[i] = '';
                    return i;
                }
                this.board[i] = '';
            }
        }

        // 3. Take center if available
        if (this.board[4] === '') {
            return 4;
        }

        // 4. Take a corner
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(i => this.board[i] === '');
        if (availableCorners.length > 0) {
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }

        // 5. Take any available space
        const availableSpaces = [];
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                availableSpaces.push(i);
            }
        }
        return availableSpaces[Math.floor(Math.random() * availableSpaces.length)];
    }

    /**
     * Execute AI move
     * @returns {Object} Result of AI move
     */
    makeAiMove() {
        if (!this.gameActive || this.currentPlayer !== 'O' || !this.aiMode) {
            return { success: false, reason: 'invalid_ai_state' };
        }

        const move = this.getAiMove();
        if (move === undefined) {
            return { success: false, reason: 'no_moves_available' };
        }

        this.board[move] = 'O';
        const result = this.checkGameState();

        if (!result.gameOver) {
            this.currentPlayer = 'X';
        }

        return {
            success: true,
            move,
            ...result
        };
    }

    /**
     * Get current board state
     * @returns {Array} Copy of the board
     */
    getBoard() {
        return [...this.board];
    }

    /**
     * Get current player
     * @returns {string} 'X' or 'O'
     */
    getCurrentPlayer() {
        return this.currentPlayer;
    }

    /**
     * Check if game is active
     * @returns {boolean} True if game is active
     */
    isGameActive() {
        return this.gameActive;
    }

    /**
     * Get current scores
     * @returns {Object} Scores object
     */
    getScores() {
        return { ...this.scores };
    }

    /**
     * Load scores from an object
     * @param {Object} scores - Scores object
     */
    loadScores(scores) {
        this.scores.playerX = scores.playerX || 0;
        this.scores.playerO = scores.playerO || 0;
        this.scores.draws = scores.draws || 0;
    }

    /**
     * Reset all scores
     */
    resetScores() {
        this.scores.playerX = 0;
        this.scores.playerO = 0;
        this.scores.draws = 0;
    }

    /**
     * Check if AI mode is enabled
     * @returns {boolean} True if AI mode is enabled
     */
    isAiMode() {
        return this.aiMode;
    }
}

// For Node.js module exports (Jest)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TicTacToeGame;
}
