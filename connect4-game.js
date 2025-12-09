/**
 * Connect 4 Game Logic
 */

class Connect4Game {
    constructor(rows = 6, cols = 7) {
        this.ROWS = rows;
        this.COLS = cols;
        this.board = Array(this.ROWS).fill(null).map(() => Array(this.COLS).fill(null));
        this.currentPlayer = 'red';
        this.gameActive = true;
        this.aiMode = false;
        this.scores = {
            red: 0,
            yellow: 0,
            draws: 0
        };
    }

    /**
     * Reset the game board
     */
    resetGame() {
        this.board = Array(this.ROWS).fill(null).map(() => Array(this.COLS).fill(null));
        this.currentPlayer = 'red';
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
     * Get the lowest empty row in a column
     * @param {number} col - Column index
     * @returns {number} Row index or -1 if column is full
     */
    getLowestEmptyRow(col) {
        for (let r = this.ROWS - 1; r >= 0; r--) {
            if (this.board[r][col] === null) {
                return r;
            }
        }
        return -1;
    }

    /**
     * Place a piece in a column
     * @param {number} col - Column index
     * @returns {Object} Result of the move
     */
    placePiece(col) {
        if (!this.gameActive) {
            return { success: false, reason: 'game_inactive' };
        }

        if (this.aiMode && this.currentPlayer === 'yellow') {
            return { success: false, reason: 'ai_turn' };
        }

        const row = this.getLowestEmptyRow(col);
        if (row === -1) {
            return { success: false, reason: 'column_full' };
        }

        this.board[row][col] = this.currentPlayer;
        const result = this.checkGameState(row, col);

        if (!result.gameOver) {
            this.currentPlayer = this.currentPlayer === 'red' ? 'yellow' : 'red';
        }

        return {
            success: true,
            row,
            col,
            ...result
        };
    }

    /**
     * Check if there's a win in a specific direction
     * @param {number} row - Starting row
     * @param {number} col - Starting column
     * @param {number} deltaRow - Row direction
     * @param {number} deltaCol - Column direction
     * @returns {boolean} True if there's a win
     */
    checkDirection(row, col, deltaRow, deltaCol) {
        let count = 1;
        const color = this.board[row][col];

        // Check positive direction
        let r = row + deltaRow;
        let c = col + deltaCol;
        while (r >= 0 && r < this.ROWS && c >= 0 && c < this.COLS && this.board[r][c] === color) {
            count++;
            r += deltaRow;
            c += deltaCol;
        }

        // Check negative direction
        r = row - deltaRow;
        c = col - deltaCol;
        while (r >= 0 && r < this.ROWS && c >= 0 && c < this.COLS && this.board[r][c] === color) {
            count++;
            r -= deltaRow;
            c -= deltaCol;
        }

        return count >= 4;
    }

    /**
     * Check if there's a win at the given position
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @returns {boolean} True if there's a win
     */
    checkWin(row, col) {
        return (
            this.checkDirection(row, col, 0, 1) ||  // Horizontal
            this.checkDirection(row, col, 1, 0) ||  // Vertical
            this.checkDirection(row, col, 1, 1) ||  // Diagonal /
            this.checkDirection(row, col, 1, -1)    // Diagonal \
        );
    }

    /**
     * Check current game state
     * @param {number} row - Row of last move
     * @param {number} col - Column of last move
     * @returns {Object} Game state information
     */
    checkGameState(row, col) {
        // Check for win
        if (this.checkWin(row, col)) {
            this.gameActive = false;
            this.scores[this.currentPlayer]++;
            return {
                gameOver: true,
                winner: this.currentPlayer
            };
        }

        // Check for draw
        if (this.board.every(row => row.every(cell => cell !== null))) {
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
     * Evaluate a window of 4 cells for AI scoring
     * @param {Array} window - Array of 4 cells
     * @param {string} player - Player color
     * @returns {number} Score for the window
     */
    evaluateWindow(window, player) {
        let score = 0;
        const opponent = player === 'yellow' ? 'red' : 'yellow';

        const playerCount = window.filter(x => x === player).length;
        const emptyCount = window.filter(x => x === null).length;
        const opponentCount = window.filter(x => x === opponent).length;

        if (playerCount === 4) {
            score += 100;
        } else if (playerCount === 3 && emptyCount === 1) {
            score += 5;
        } else if (playerCount === 2 && emptyCount === 2) {
            score += 2;
        }

        if (opponentCount === 3 && emptyCount === 1) {
            score -= 4;
        }

        return score;
    }

    /**
     * Score the position for a player
     * @param {string} player - Player color
     * @returns {number} Total score
     */
    scorePosition(player) {
        let score = 0;

        // Score center column (most valuable)
        const centerCol = Math.floor(this.COLS / 2);
        let centerCount = 0;
        for (let r = 0; r < this.ROWS; r++) {
            if (this.board[r][centerCol] === player) centerCount++;
        }
        score += centerCount * 3;

        // Score horizontal
        for (let r = 0; r < this.ROWS; r++) {
            for (let c = 0; c < this.COLS - 3; c++) {
                const window = [this.board[r][c], this.board[r][c+1], this.board[r][c+2], this.board[r][c+3]];
                score += this.evaluateWindow(window, player);
            }
        }

        // Score vertical
        for (let c = 0; c < this.COLS; c++) {
            for (let r = 0; r < this.ROWS - 3; r++) {
                const window = [this.board[r][c], this.board[r+1][c], this.board[r+2][c], this.board[r+3][c]];
                score += this.evaluateWindow(window, player);
            }
        }

        // Score diagonal (positive slope)
        for (let r = 0; r < this.ROWS - 3; r++) {
            for (let c = 0; c < this.COLS - 3; c++) {
                const window = [this.board[r][c], this.board[r+1][c+1], this.board[r+2][c+2], this.board[r+3][c+3]];
                score += this.evaluateWindow(window, player);
            }
        }

        // Score diagonal (negative slope)
        for (let r = 3; r < this.ROWS; r++) {
            for (let c = 0; c < this.COLS - 3; c++) {
                const window = [this.board[r][c], this.board[r-1][c+1], this.board[r-2][c+2], this.board[r-3][c+3]];
                score += this.evaluateWindow(window, player);
            }
        }

        return score;
    }

    /**
     * Get AI move using intelligent strategy
     * @returns {number} Column index for AI move
     */
    getAiMove() {
        // Check if AI can win
        for (let col = 0; col < this.COLS; col++) {
            const row = this.getLowestEmptyRow(col);
            if (row !== -1) {
                this.board[row][col] = 'yellow';
                if (this.checkWin(row, col)) {
                    this.board[row][col] = null;
                    return col;
                }
                this.board[row][col] = null;
            }
        }

        // Check if need to block player
        for (let col = 0; col < this.COLS; col++) {
            const row = this.getLowestEmptyRow(col);
            if (row !== -1) {
                this.board[row][col] = 'red';
                if (this.checkWin(row, col)) {
                    this.board[row][col] = null;
                    return col;
                }
                this.board[row][col] = null;
            }
        }

        // Score all valid moves
        let validCols = [];
        for (let col = 0; col < this.COLS; col++) {
            if (this.getLowestEmptyRow(col) !== -1) {
                validCols.push(col);
            }
        }

        // Evaluate each valid move
        let bestScore = -Infinity;
        let bestCol = validCols[Math.floor(Math.random() * validCols.length)];

        for (let col of validCols) {
            const row = this.getLowestEmptyRow(col);
            this.board[row][col] = 'yellow';
            const score = this.scorePosition('yellow');
            this.board[row][col] = null;

            if (score > bestScore) {
                bestScore = score;
                bestCol = col;
            }
        }

        return bestCol;
    }

    /**
     * Execute AI move
     * @returns {Object} Result of AI move
     */
    makeAiMove() {
        if (!this.gameActive || this.currentPlayer !== 'yellow' || !this.aiMode) {
            return { success: false, reason: 'invalid_ai_state' };
        }

        const col = this.getAiMove();
        if (col === undefined) {
            return { success: false, reason: 'no_moves_available' };
        }

        const row = this.getLowestEmptyRow(col);
        this.board[row][col] = 'yellow';
        const result = this.checkGameState(row, col);

        if (!result.gameOver) {
            this.currentPlayer = 'red';
        }

        return {
            success: true,
            row,
            col,
            ...result
        };
    }

    /**
     * Get current board state
     * @returns {Array} Deep copy of the board
     */
    getBoard() {
        return this.board.map(row => [...row]);
    }

    /**
     * Get current player
     * @returns {string} 'red' or 'yellow'
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
        this.scores.red = scores.red || 0;
        this.scores.yellow = scores.yellow || 0;
        this.scores.draws = scores.draws || 0;
    }

    /**
     * Reset all scores
     */
    resetScores() {
        this.scores.red = 0;
        this.scores.yellow = 0;
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
    module.exports = Connect4Game;
}
