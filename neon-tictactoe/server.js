const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

const rooms = {};

io.on("connection", (socket) => {

    socket.on("joinRoom", (roomId) => {

        socket.join(roomId);

        if (!rooms[roomId]) {
            rooms[roomId] = [];
        }

        if (rooms[roomId].length >= 2) {
            socket.emit("roomFull");
            return;
        }

        rooms[roomId].push(socket.id);

        const symbol = rooms[roomId].length === 1 ? "X" : "O";

        socket.emit("playerSymbol", symbol);

        io.to(roomId).emit("playerCount", rooms[roomId].length);
    });

    socket.on("makeMove", ({ roomId, index, symbol }) => {
        io.to(roomId).emit("moveMade", { index, symbol });
    });

    socket.on("disconnect", () => {
        for (const roomId in rooms) {
            rooms[roomId] = rooms[roomId].filter(id => id !== socket.id);

            if (rooms[roomId].length === 0) {
                delete rooms[roomId];
            }
        }
    });
});

server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});