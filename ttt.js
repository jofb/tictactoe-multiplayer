// const prompt = require("prompt-sync")();
import prompt from "prompt-sync";

const input = prompt();

const playerChars = ["x", "o"];
const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
];
// game state
let board = Array(9);
let currentPlayer = 0;
let gameActive = false;

// fill blank board
function resetBoard() {
    console.log("reseting");
    board.fill(" ", 0, 9);
}

// prints board to console
function drawBoard() {
    console.log("-------------");
    for (let i = 0; i < 3; i++) {
        const offset = i * 3;
        console.log(
            `| ${board[offset]} | ${board[offset + 1]} | ${board[offset + 2]} |`
        );
        console.log("-------------");
    }
}

// checks if a player has won
function checkWin(char) {
    let win = false;
    let spaces = [];
    // traverse board array and get indexes of char
    for (let i = 0; i < board.length; i++) {
        if (board[i] == char) {
            spaces.push(i);
        }
    }
    // check each win line and check whether they contain all nums from spaces
    lines.forEach((line, index) => {
        if (win) return;
        let count = 0;
        line.forEach((num, index) => {
            if (!spaces.includes(num)) return;
            count++;
        });
        win = count == 3;
    });
    return win;
}
// check if the game board is filled with no win
function checkTie() {
    return !board.includes(" ");
}
// validate move against board
function validateMove(index) {
    // check the board and ensure that that space is not currently occupied
    return board[index] == " ";
}

function resetGameState() {
    currentPlayer = 0;
    gameActive = true;
    resetBoard();
    drawBoard();
}

resetGameState();

while (gameActive) {
    const char = playerChars[currentPlayer];
    console.log(`Player ${currentPlayer}'s turn (${char})`);
    // get player input
    let index = input("Enter a space (0-8) :: ");
    gameActive = index.trim() != "exit";
    // TODO ideally validate input here
    index = parseInt(index);
    // validate move
    if (validateMove(index)) board[index] = char;
    else {
        // invalid move, restart turn
        console.log("Invalid move!");
        continue;
    }
    drawBoard();
    if (checkWin(char)) {
        console.log(`Player ${currentPlayer} wins! `);
        gameActive = false;
        //continue;
        // would you like to keep playing?
        const reset = input("Would you like to play again? (y/n) :: ");
        if (reset) {
        }
        // resetBoard();
    } else if (checkTie()) {
        console.log("The game is a tie!");
        gameActive = false;
        continue;
    }
    currentPlayer = (currentPlayer + 1) % 2;
}
