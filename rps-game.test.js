const RPSGame = require('./rps-game');

describe('RPSGame', () => {
    let game;

    beforeEach(() => {
        game = new RPSGame();
    });

    describe('Constructor', () => {
        test('should initialize with zero scores', () => {
            expect(game.getScores()).toEqual({
                player: 0,
                computer: 0,
                draw: 0
            });
        });

        test('should have correct choice emojis', () => {
            expect(game.choices).toEqual({
                rock: '✊',
                paper: '✋',
                scissors: '✌️'
            });
        });
    });

    describe('getComputerChoice', () => {
        test('should return a valid choice', () => {
            const choice = game.getComputerChoice();
            expect(['rock', 'paper', 'scissors']).toContain(choice);
        });

        test('should return random choices', () => {
            const choices = new Set();
            // Run multiple times to ensure randomness
            for (let i = 0; i < 100; i++) {
                choices.add(game.getComputerChoice());
            }
            // Should have at least 2 different choices in 100 runs (very likely all 3)
            expect(choices.size).toBeGreaterThanOrEqual(2);
        });
    });

    describe('determineWinner', () => {
        test('should return draw when choices are the same', () => {
            expect(game.determineWinner('rock', 'rock')).toBe('draw');
            expect(game.determineWinner('paper', 'paper')).toBe('draw');
            expect(game.determineWinner('scissors', 'scissors')).toBe('draw');
        });

        test('should return player when player wins', () => {
            expect(game.determineWinner('rock', 'scissors')).toBe('player');
            expect(game.determineWinner('paper', 'rock')).toBe('player');
            expect(game.determineWinner('scissors', 'paper')).toBe('player');
        });

        test('should return computer when computer wins', () => {
            expect(game.determineWinner('scissors', 'rock')).toBe('computer');
            expect(game.determineWinner('rock', 'paper')).toBe('computer');
            expect(game.determineWinner('paper', 'scissors')).toBe('computer');
        });
    });

    describe('playRound', () => {
        test('should return round result with all required properties', () => {
            const result = game.playRound('rock');
            expect(result).toHaveProperty('playerChoice');
            expect(result).toHaveProperty('computerChoice');
            expect(result).toHaveProperty('winner');
            expect(result).toHaveProperty('scores');
        });

        test('should increment player score on player win', () => {
            // Mock getComputerChoice to always return scissors
            jest.spyOn(game, 'getComputerChoice').mockReturnValue('scissors');
            
            const result = game.playRound('rock');
            expect(result.winner).toBe('player');
            expect(result.scores.player).toBe(1);
            expect(result.scores.computer).toBe(0);
            expect(result.scores.draw).toBe(0);
        });

        test('should increment computer score on computer win', () => {
            // Mock getComputerChoice to always return paper
            jest.spyOn(game, 'getComputerChoice').mockReturnValue('paper');
            
            const result = game.playRound('rock');
            expect(result.winner).toBe('computer');
            expect(result.scores.player).toBe(0);
            expect(result.scores.computer).toBe(1);
            expect(result.scores.draw).toBe(0);
        });

        test('should increment draw score on draw', () => {
            // Mock getComputerChoice to always return rock
            jest.spyOn(game, 'getComputerChoice').mockReturnValue('rock');
            
            const result = game.playRound('rock');
            expect(result.winner).toBe('draw');
            expect(result.scores.player).toBe(0);
            expect(result.scores.computer).toBe(0);
            expect(result.scores.draw).toBe(1);
        });

        test('should accumulate scores over multiple rounds', () => {
            jest.spyOn(game, 'getComputerChoice')
                .mockReturnValueOnce('scissors') // player wins
                .mockReturnValueOnce('paper')    // computer wins
                .mockReturnValueOnce('rock');    // draw

            game.playRound('rock');
            game.playRound('rock');
            game.playRound('rock');

            const scores = game.getScores();
            expect(scores.player).toBe(1);
            expect(scores.computer).toBe(1);
            expect(scores.draw).toBe(1);
        });
    });

    describe('resetScores', () => {
        test('should reset all scores to zero', () => {
            // Play some rounds first
            jest.spyOn(game, 'getComputerChoice')
                .mockReturnValueOnce('scissors')
                .mockReturnValueOnce('paper')
                .mockReturnValueOnce('rock');

            game.playRound('rock');
            game.playRound('rock');
            game.playRound('rock');

            // Now reset
            game.resetScores();

            expect(game.getScores()).toEqual({
                player: 0,
                computer: 0,
                draw: 0
            });
        });
    });

    describe('loadScores', () => {
        test('should load scores from an object', () => {
            game.loadScores({ player: 5, computer: 3, draw: 2 });
            expect(game.getScores()).toEqual({
                player: 5,
                computer: 3,
                draw: 2
            });
        });

        test('should handle missing properties with defaults', () => {
            game.loadScores({ player: 5 });
            expect(game.getScores()).toEqual({
                player: 5,
                computer: 0,
                draw: 0
            });
        });

        test('should handle empty object', () => {
            game.loadScores({});
            expect(game.getScores()).toEqual({
                player: 0,
                computer: 0,
                draw: 0
            });
        });
    });

    describe('getScores', () => {
        test('should return a copy of scores, not the original', () => {
            const scores1 = game.getScores();
            scores1.player = 999;
            const scores2 = game.getScores();
            expect(scores2.player).toBe(0);
        });
    });

    describe('getChoiceEmoji', () => {
        test('should return correct emoji for valid choices', () => {
            expect(game.getChoiceEmoji('rock')).toBe('✊');
            expect(game.getChoiceEmoji('paper')).toBe('✋');
            expect(game.getChoiceEmoji('scissors')).toBe('✌️');
        });

        test('should return question mark for invalid choice', () => {
            expect(game.getChoiceEmoji('invalid')).toBe('❓');
            expect(game.getChoiceEmoji('')).toBe('❓');
            expect(game.getChoiceEmoji(null)).toBe('❓');
        });
    });
});
