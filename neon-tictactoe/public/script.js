const socket = io();

const board = document.getElementById("board");
const cells = document.querySelectorAll(".cell");

const createRoomBtn = document.getElementById("createRoom");
const joinRoomBtn = document.getElementById("joinRoom");
const roomInput = document.getElementById("roomInput");

const statusText = document.getElementById("status");

const winnerPopup = document.getElementById("winnerPopup");
const winnerText = document.getElementById("winnerText");

let roomId = "";
let playerSymbol = "";
let currentTurn = "X";

let gameState = ["", "", "", "", "", "", "", "", ""];

let gameOver = false;

const winningCombos = [
    [0,1,2],
    [3,4,5],
    [6,7,8],

    [0,3,6],
    [1,4,7],
    [2,5,8],

    [0,4,8],
    [2,4,6]
];

function generateRoomId(){
    return Math.random().toString(36).substring(2,7).toUpperCase();
}

createRoomBtn.addEventListener("click", () => {

    roomId = generateRoomId();

    roomInput.value = roomId;

    socket.emit("joinRoom", roomId);

    statusText.innerText = `Room Created: ${roomId}`;
});

joinRoomBtn.addEventListener("click", () => {

    roomId = roomInput.value.trim();

    if(roomId === ""){
        alert("Enter Room ID");
        return;
    }

    socket.emit("joinRoom", roomId);

    statusText.innerText = `Joined Room: ${roomId}`;
});

socket.on("playerSymbol", (symbol) => {

    playerSymbol = symbol;

    statusText.innerText = `You are ${symbol}`;
});

socket.on("playerCount", (count) => {

    if(count === 2){
        statusText.innerText = "Game Started";
    }
});

socket.on("roomFull", () => {
    alert("Room is full");
});

cells.forEach(cell => {

    cell.addEventListener("click", () => {

        const index = cell.dataset.index;

        if(
            gameState[index] !== "" ||
            gameOver ||
            currentTurn !== playerSymbol
        ){
            return;
        }

        socket.emit("makeMove", {
            roomId,
            index,
            symbol: playerSymbol
        });
    });
});

socket.on("moveMade", ({ index, symbol }) => {

    if(gameState[index] !== "") return;

    gameState[index] = symbol;

    cells[index].innerText = symbol;

    cells[index].classList.add(symbol.toLowerCase());

    checkWinner();

    currentTurn = currentTurn === "X" ? "O" : "X";

    if(!gameOver){
        statusText.innerText =
            currentTurn === playerSymbol
            ? "Your Turn"
            : "Opponent Turn";
    }
});

function checkWinner(){

    for(let combo of winningCombos){

        const [a,b,c] = combo;

        if(
            gameState[a] &&
            gameState[a] === gameState[b] &&
            gameState[a] === gameState[c]
        ){

            gameOver = true;

            cells[a].style.boxShadow =
            "0 0 20px #00ff88, 0 0 40px #00ff88";

            cells[b].style.boxShadow =
            "0 0 20px #00ff88, 0 0 40px #00ff88";

            cells[c].style.boxShadow =
            "0 0 20px #00ff88, 0 0 40px #00ff88";

            setTimeout(() => {

                winnerPopup.classList.add("show");

                if(gameState[a] === playerSymbol){
                    winnerText.innerText = "YOU WIN 🎉";
                }else{
                    winnerText.innerText = "YOU LOSE 😭";
                }

            }, 500);

            return;
        }
    }

    if(!gameState.includes("")){

        gameOver = true;

        setTimeout(() => {

            winnerPopup.classList.add("show");

            winnerText.innerText = "DRAW 😎";

        }, 500);
    }
}