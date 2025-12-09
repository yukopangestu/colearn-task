/**
 * Rock Paper Scissors Game Logic
 */

class RPSGame {
    constructor() {
        this.choices = {
            rock: '✊',
            paper: '✋',
            scissors: '✌️'
        };
        this.scores = {
            player: 0,
            computer: 0,
            draw: 0
        };
    }

    /**
     * Get a random computer choice
     * @returns {string} 'rock', 'paper', or 'scissors'
     */
    getComputerChoice() {
        const options = ['rock', 'paper', 'scissors'];
        return options[Math.floor(Math.random() * 3)];
    }

    /**
     * Determine the winner of a round
     * @param {string} player - Player's choice
     * @param {string} computer - Computer's choice
     * @returns {string} 'player', 'computer', or 'draw'
     */
    determineWinner(player, computer) {
        if (player === computer) {
            return 'draw';
        }

        if (
            (player === 'rock' && computer === 'scissors') ||
            (player === 'paper' && computer === 'rock') ||
            (player === 'scissors' && computer === 'paper')
        ) {
            return 'player';
        }

        return 'computer';
    }

    /**
     * Play a round and update scores
     * @param {string} playerChoice - Player's choice
     * @returns {Object} Round result with winner, choices, and updated scores
     */
    playRound(playerChoice) {
        const computerChoice = this.getComputerChoice();
        const winner = this.determineWinner(playerChoice, computerChoice);

        // Update scores
        if (winner === 'player') {
            this.scores.player++;
        } else if (winner === 'computer') {
            this.scores.computer++;
        } else {
            this.scores.draw++;
        }

        return {
            playerChoice,
            computerChoice,
            winner,
            scores: { ...this.scores }
        };
    }

    /**
     * Reset all scores to zero
     */
    resetScores() {
        this.scores.player = 0;
        this.scores.computer = 0;
        this.scores.draw = 0;
    }

    /**
     * Load scores from an object
     * @param {Object} scores - Scores object with player, computer, and draw properties
     */
    loadScores(scores) {
        this.scores.player = scores.player || 0;
        this.scores.computer = scores.computer || 0;
        this.scores.draw = scores.draw || 0;
    }

    /**
     * Get current scores
     * @returns {Object} Current scores
     */
    getScores() {
        return { ...this.scores };
    }

    /**
     * Get emoji for a choice
     * @param {string} choice - 'rock', 'paper', or 'scissors'
     * @returns {string} Emoji representation
     */
    getChoiceEmoji(choice) {
        return this.choices[choice] || '❓';
    }
}

// For Node.js module exports (Jest)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RPSGame;
}
