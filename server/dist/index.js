"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const socket_io_1 = require("socket.io");
const Room_1 = require("./Room");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
}));
const server = http_1.default.createServer(app);
const port = process.env.PORT || 3000;
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "https://omelive.vercel.app/",
        methods: ["GET", "POST"],
        credentials: true,
    },
});
app.get("/", (req, res) => {
    return res.json({ status: "Server working" });
});
const manager = new Room_1.RoomManager(io);
io.on('connection', (socket) => {
    console.log("user connected :: ", socket.id);
    socket.on("join", () => {
        console.log("user joined :: ", socket.id);
        manager.addUser(socket.id);
    });
    socket.on("disconnect", () => {
        console.log("user disconnected :: ", socket.id);
        manager.handleDisconnect(socket.id);
    });
    socket.on("message", (roomId, message) => {
        manager.handleMessage(roomId, socket.id, message);
    });
    socket.on("offer", (roomId, offer) => {
        console.log("offer -> ");
        manager.handleOffer(socket.id, roomId, offer);
    });
    socket.on("answer", (roomId, offer) => {
        console.log("answer -> ");
        manager.handleAnswer(socket.id, roomId, offer);
    });
    socket.on("ice-candidates", (roomId, iceCandidates) => {
        console.log("iceCandidates -> ");
        manager.handleIceCandidates(socket.id, roomId, iceCandidates);
    });
    socket.on("leaveRoom", (roomId) => {
        console.log("LEAVE ROOM REQUEST FROM ", socket.id);
        manager.handleLeaveRoom(socket.id);
    });
});
server.listen(Number(port), "0.0.0.0", () => {
    console.log('listening on *:', port);
});
