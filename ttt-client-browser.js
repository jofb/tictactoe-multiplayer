const gameConsole = document.getElementById("console");
const playerTag = document.getElementById("player-tag");
let currentPlayer = -1;
let playerid;
let gameActive = false;
let playerChars = ["x", "o"];

// initialize board
let board = [];
for (let i = 1; i <= 9; i++) {
    board.push(document.getElementById(i));
}

const host = "ttt-multiplayer-f664.onrender.com";
// const host = "localhost";
const port = 55882;
const address = `wss://${host}`;
// const address = `ws://${host}:${port}`;
const socket = new WebSocket(address);

socket.onerror = (event) => {
    gameConsole.textContent = "Could not connect to server";
};

socket.onopen = (event) => {
    console.log("Connected to server");
};

socket.onmessage = (event) => {
    const json = JSON.parse(event.data);

    switch (json.type) {
        case "init":
            playerid = json.data;
            playerTag.textContent = `You are Player ${playerid} (${
                playerChars[playerid - 1]
            })`;
            break;
        case "state":
            const gameState = json.data;
            gameActive = gameState.active;
            updateBoard(gameState.board);
            gameConsole.textContent = gameState.msg;
            currentPlayer = gameState.currentPlayer;
            break;
        case "msg":
            console.log(json.data);
            gameConsole.textContent = json.data;
            break;
    }
};

socket.onclose = (event) => {
    console.log("Connection closed");
};

function updateBoard(indexes) {
    board.forEach((btn, i) => {
        const text = btn.childNodes[0];
        text.textContent = indexes[i];
        if (text.textContent == "x" || text.textContent == "o") {
            text.style.opacity = 1;
        }
    });
}

// listeners on buttons, only allow when currentPlayer = playerid
board.forEach((btn) => {
    btn.onclick = () => {
        if (currentPlayer != playerid || !gameActive) return;
        console.log(btn.id);
        socket.send(btn.id);
        btn.childNodes[0].style.opacity = 1;
    };
});
