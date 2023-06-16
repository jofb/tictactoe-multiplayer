/*** NOTE THIS NO LONGER WORKS DUE TO REFACTORING IN SERVER */

import { WebSocket } from "ws";
import prompt from "prompt-sync";
const input = prompt();

const host = "127.0.0.1";
const port = 9988;
const address = `ws://${host}:${port}`;

const socket = new WebSocket(address);

socket.onopen = (event) => {
    //socket.send("hey");
};

socket.onmessage = (event) => {
    const json = JSON.parse(event.data);

    switch (json.type) {
        case "draw":
            // draw the board given data
            drawBoard(json.data);
            break;
        case "msg":
            console.log(json.data);
            break;
        case "input":
            console.log(json.data);
            // now respond back with input...
            let choice = input("> ");
            choice = parseInt(choice);
            socket.send(choice);
            break;
    }
};

socket.onclose = (event) => {
    console.log("Connection closed");
};

// loop until game is complete
// on each loop we first check if it is our turn
// if not

// prints board to console
function drawBoard(board) {
    console.log("-------------");
    for (let i = 0; i < 3; i++) {
        const offset = i * 3;
        console.log(
            `| ${board[offset]} | ${board[offset + 1]} | ${board[offset + 2]} |`
        );
        console.log("-------------");
    }
}

function visualBoard(board) {
    // access the dom table and draw pieces to board
}
