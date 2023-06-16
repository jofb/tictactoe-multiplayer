import { WebSocketServer } from "ws";
import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}
const port = process.env.PORT;

let clientCount = 0;
let playerid = 0;
const maxConnections = 2;

// game state
let board = Array(9);
board = board.fill(" ");
let currentPlayer = 1;
let gameActive = false;
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

let players = {};

const wss = new WebSocketServer({ port: port });
wss.on("listening", () => {
    console.log(`Listening on port ${port}`);
});
wss.on("connection", (ws) => {
    if (clientCount >= maxConnections) {
        ws.close(1000, "Max connections reached");
        return;
    }

    console.log(`Client ${clientCount} connected`);

    players[clientCount] = new Player(ws);

    ws.on("error", console.error);

    ws.on("message", (data) => {
        move(data);
    });

    ws.on("close", () => {
        if (clientCount >= 2) {
            globalMsg("msg", "Other player disconnected...", wss.clients, ws);
        }
        clientCount--;
    });
    ws.send(jsonPayload("init", clientCount + 1));
    clientCount++;

    // if they are the first player to connect, let them know waiting for game
    if (clientCount == 1) {
        ws.send(jsonPayload("msg", "Waiting for other player to connect..."));
    } else {
        // can start the game
        globalMsg(
            "msg",
            "All players connected. Starting game...",
            wss.clients
        );
        gameActive = true;
        update();
    }
});

// generates simple json based on given type and data
function jsonPayload(type, data) {
    return JSON.stringify({
        type: type,
        data: data,
    });
}

// broadcasts a msg to all clients with optional exclusion
function globalMsg(type, msg, clients, ws = null) {
    clients.forEach((client) => {
        if (ws == null || (ws != null && ws != client)) {
            client.send(jsonPayload(type, msg));
        }
    });
}

function update(state = 0) {
    const current = players[currentPlayer - 1];
    const char = playerChars[currentPlayer - 1];

    gameActive = state == 0;

    globalMsg(
        "state",
        {
            active: gameActive,
            currentPlayer: currentPlayer,
            board: board,
        },
        wss.clients
    );
    if (state == 0) {
        globalMsg(
            "msg",
            `Player ${currentPlayer}'s turn (${char})`,
            wss.clients
        );
        current.send("msg", "It is your turn");
    } else if (state == 1) {
        globalMsg("msg", "The game is a tie", wss.clients);
        resetGame();
    } else if (state == 2) {
        globalMsg("msg", `Player ${currentPlayer} wins!`, wss.clients);
        resetGame();
    }
}

function move(data) {
    const char = playerChars[currentPlayer - 1];
    let space = data - 1;
    // check if input is valid
    if (!validateMove(space)) {
        console.log("Invalid move");
        players[currentPlayer - 1].send("msg", "Invalid move.");
        return;
    }
    // update board
    board[space] = char;

    let status = checkStatus();
    if (status == 0) currentPlayer = (currentPlayer % 2) + 1;

    update(status);
}
// 2 win, 1 tie, 0 cont
function checkStatus() {
    if (checkWin(playerChars[currentPlayer - 1])) return 2;
    if (checkTie()) return 1;
    return 0;
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
function resetGame() {
    wss.clients.forEach((ws) => {
        ws.close();
    });
    board.fill(" ");
    currentPlayer = 1;
    gameActive = false;
    console.log("Resetting game");
}
// validate move against board
function validateMove(index) {
    // check the board and ensure that that space is not currently occupied
    return board[index] == " ";
}

class Player {
    constructor(socket) {
        this.socket = socket;
    }
    send(type, msg) {
        // send to socket
        this.socket.send(jsonPayload(type, msg));
    }
}
