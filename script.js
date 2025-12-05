function loadGameStats() {
    // Load Tic Tac Toe stats
    const tttScores = JSON.parse(localStorage.getItem('tictactoe_scores')) || {
        playerX: 0,
        playerO: 0,
        draws: 0
    };
    const tttTotal = tttScores.playerX + tttScores.playerO + tttScores.draws;
    document.getElementById('tictactoe-stats').textContent = 
        tttTotal > 0 ? `Games: ${tttTotal}` : 'No games played';

    // Load Rock Paper Scissors stats
    const rpsScores = JSON.parse(localStorage.getItem('rps_scores')) || {
        player: 0,
        computer: 0
    };
    const rpsTotal = rpsScores.player + rpsScores.computer;
    document.getElementById('rps-stats').textContent = 
        rpsTotal > 0 ? `Wins: ${rpsScores.player} | Losses: ${rpsScores.computer}` : 'No games played';

    // Load Connect 4 stats
    const c4Scores = JSON.parse(localStorage.getItem('connect4_scores')) || {
        red: 0,
        yellow: 0,
        draws: 0
    };
    const c4Total = c4Scores.red + c4Scores.yellow + c4Scores.draws;
    document.getElementById('connect4-stats').textContent = 
        c4Total > 0 ? `Games: ${c4Total}` : 'No games played';
}

function selectGame(game) {
    switch(game) {
        case 'tictactoe':
            window.location.href = 'tictactoe.html';
            break;
        case 'rps':
            window.location.href = 'rps.html';
            break;
        case 'connect4':
            window.location.href = 'connect4.html';
            break;
    }
}

// Load stats when page loads
window.addEventListener('DOMContentLoaded', loadGameStats);
