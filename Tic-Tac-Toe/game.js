let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = false;

let scoreX = 0;
let scoreO = 0;

let playerXName = "Player X";
let playerOName = "Player O";

const cells = document.querySelectorAll('.box');
const statusDisplay = document.getElementById('status');

const labelX = document.getElementById('labelX');
const labelO = document.getElementById('labelO');

const scoreXDisplay = document.getElementById('scoreX');
const scoreODisplay = document.getElementById('scoreO');

const resetBoardBtn = document.getElementById('Play-Again');
const resetScoreBtn = document.getElementById('Abort-Game');

const startBtn = document.getElementById('startGame');

const nameX = document.getElementById('nameX');
const nameO = document.getElementById('nameO');

const playerXPanel = document.getElementById('playerX');
const playerOPanel = document.getElementById('playerO');

const winningCombinations = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
];


startBtn.addEventListener("click", () => {
    if (nameX.value.trim() !== "") playerXName = nameX.value.trim();
    if (nameO.value.trim() !== "") playerOName = nameO.value.trim();

    labelX.textContent = playerXName;
    labelO.textContent = playerOName;

    statusDisplay.textContent = `${playerXName}'s Turn`;
    gameActive = true;
});


function updateActivePlayer() {
    if (currentPlayer === "X") {
        playerXPanel.classList.add("active");
        playerOPanel.classList.remove("active");
    } else {
        playerOPanel.classList.add("active");
        playerXPanel.classList.remove("active");
    }
}

function handleClick(e) {
    if (!gameActive) return;

    const cell = e.target;
    const index = cell.getAttribute("data-index");

    if (board[index] !== '') return;

    board[index] = currentPlayer;
    cell.classList.add(currentPlayer.toLowerCase());

    if (checkWinner()) {
        statusDisplay.textContent =
            currentPlayer === 'X' ? `${playerXName} Wins!` : `${playerOName} Wins!`;

        highlightWinner();

        if (currentPlayer === "X") scoreX++;
        else scoreO++;

        scoreXDisplay.textContent = scoreX;
        scoreODisplay.textContent = scoreO;

        gameActive = false;
        return;
    }

    if (!board.includes('')) {
        statusDisplay.textContent = "Draw!";
        gameActive = false;
        return;
    }

    currentPlayer = currentPlayer === "X" ? "O" : "X";
    updateActivePlayer();

    statusDisplay.textContent =
        currentPlayer === 'X' ? `${playerXName}'s Turn` : `${playerOName}'s Turn`;
}

function checkWinner() {
    return winningCombinations.some(combo => {
        return board[combo[0]] &&
               board[combo[0]] === board[combo[1]] &&
               board[combo[1]] === board[combo[2]];
    });
}

function highlightWinner() {
    winningCombinations.forEach(combo => {
        if (
            board[combo[0]] &&
            board[combo[0]] === board[combo[1]] &&
            board[combo[1]] === board[combo[2]]
        ) {
            combo.forEach(i => cells[i].classList.add("winner"));
        }
    });
}

function resetBoard() {
    board = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    currentPlayer = "X";

    statusDisplay.textContent = `${playerXName}'s Turn`;

    cells.forEach(cell => cell.classList.remove("x", "o", "winner"));
    updateActivePlayer();
}

function resetScore() {
    scoreX = 0;
    scoreO = 0;
    scoreXDisplay.textContent = 0;
    scoreODisplay.textContent = 0;
    resetBoard();
}

cells.forEach(cell => cell.addEventListener('click', handleClick));
resetBoardBtn.addEventListener('click', resetBoard);
resetScoreBtn.addEventListener('click', resetScore);

updateActivePlayer();
