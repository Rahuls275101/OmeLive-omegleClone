"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomManager = exports.NUM_OF_PLAYERS = void 0;
const uuid_1 = require("uuid");
const Queue_1 = __importDefault(require("./Queue"));
/*
const iceServers = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun.l.google.com:5349" },
    { urls: "stun:stun1.l.google.com:3478" },
    { urls: "stun:stun1.l.google.com:5349" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:5349" },
    { urls: "stun:stun3.l.google.com:3478" },
    { urls: "stun:stun3.l.google.com:5349" },
    { urls: "stun:stun4.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:5349" }
];

*/
let NUM_OF_PLAYERS = 0;
exports.NUM_OF_PLAYERS = NUM_OF_PLAYERS;
const queue = new Queue_1.default();
class RoomManager {
    constructor(io) {
        this.rooms = new Map();
        this.io = io;
    }
    createRoom(user1, user2) {
        const roomId = (0, uuid_1.v4)();
        this.rooms.set(roomId, { user1, user2 });
        return roomId;
    }
    addUser(socketId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield new Promise(resolve => setTimeout(resolve, 3000));
            exports.NUM_OF_PLAYERS = (NUM_OF_PLAYERS++, NUM_OF_PLAYERS);
            console.log("Number of players ---> ", socketId, " => ", NUM_OF_PLAYERS);
            queue.enqueue({ id: socketId });
            console.log("PLAYERS IN QUEUE -> ", queue.size());
            if (queue.size() > 1) {
                console.log(":: Pair found ::");
                const user1 = queue.dequeue();
                const user2 = queue.dequeue();
                if (user1 && user2) {
                    console.log("requesting offer");
                    const room = this.createRoom(user1, user2);
                    this.io.to(user1.id).to(user2.id).emit('joined', { room });
                    this.io.to(user1.id).emit("send-offer");
                    console.log("sent offer request to :: ", user1.id);
                }
            }
            else {
                console.log("NO PAIR FOUND");
            }
            this.io.emit("user-count", NUM_OF_PLAYERS);
        });
    }
    handleOffer(socketId, roomId, offer) {
        console.log("OFFER SENT BY :: ", socketId, " FOR ROOM ::  ", roomId);
        const room = this.rooms.get(roomId);
        if (!room)
            return;
        const reciever = (room === null || room === void 0 ? void 0 : room.user1.id) === socketId ? room.user2.id : room === null || room === void 0 ? void 0 : room.user1.id;
        console.log("SENDING OFFER TO  :: ", reciever);
        this.io.to(reciever).emit("offer", offer);
    }
    handleAnswer(socketId, roomId, offer) {
        const room = this.rooms.get(roomId);
        if (!room)
            return;
        const reciever = (room === null || room === void 0 ? void 0 : room.user1.id) === socketId ? room.user2.id : room === null || room === void 0 ? void 0 : room.user1.id;
        console.log("RECIEVED ANSWER SENDING TO :: ", reciever);
        this.io.to(reciever).emit("answer", offer);
    }
    handleIceCandidates(socketId, roomId, iceCandidates) {
        const room = this.rooms.get(roomId);
        if (!room)
            return;
        const reciever = (room === null || room === void 0 ? void 0 : room.user1.id) === socketId ? room.user2.id : room === null || room === void 0 ? void 0 : room.user1.id;
        this.io.to(reciever).emit("ice-candidates", iceCandidates);
    }
    handleDisconnect(socketId) {
        console.log("DISCONNECTED :: ", socketId);
        const itemToRemove = queue.find(socketId);
        exports.NUM_OF_PLAYERS = (NUM_OF_PLAYERS--, NUM_OF_PLAYERS);
        queue.printQueue();
        if (itemToRemove) {
            queue.remove(itemToRemove);
            console.log(`Removed item with id ${socketId}.`);
        }
        queue.printQueue();
        this.rooms.forEach((room, roomId) => {
            console.log("ROOM ::  ", roomId, "USER1 :: ", room.user1.id, "  USER2 :: ", room.user2.id);
            if (room.user1.id == socketId || room.user2.id == socketId) {
                this.rooms.delete(roomId);
                console.log("DELETING ROOM :: ", roomId);
                this.io.to(room.user1.id).to(room === null || room === void 0 ? void 0 : room.user2.id).emit("leaveRoom");
            }
        });
        this.io.emit("user-count", NUM_OF_PLAYERS);
    }
    handleLeaveRoom(socketId) {
        console.log("LEAVING REQUEST FROM :: ", socketId);
        this.rooms.forEach((room, roomId) => {
            console.log("ROOM ::  ", roomId, "USER1 :: ", room.user1.id, "  USER2 :: ", room.user2.id);
            if (room.user1.id == socketId || room.user2.id == socketId) {
                this.rooms.delete(roomId);
                console.log("DELETING ROOM :: ", roomId);
                this.io.to(room.user1.id).to(room === null || room === void 0 ? void 0 : room.user2.id).emit("leaveRoom");
            }
        });
    }
    handleMessage(roomId, socketId, message) {
        console.log("MESSAGE RECIEVED IN ::  ", roomId);
        const room = this.rooms.get(roomId);
        if (!room)
            return;
        const reciever = (room === null || room === void 0 ? void 0 : room.user1.id) === socketId ? room.user2.id : room === null || room === void 0 ? void 0 : room.user1.id;
        this.io.to(reciever).emit("message", message);
    }
}
exports.RoomManager = RoomManager;
