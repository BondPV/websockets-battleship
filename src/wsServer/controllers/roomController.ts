import { WebSocket } from 'ws';
import { OnlinePlayerDataType, onlinePlayersDataBase, roomsDataBase, RoomType } from '../db/db';
import { generateID, sendResponse } from '../utils';
import { COMMANDS } from '../constants';
import { createGame } from '../model/game';

type AddUserToRoomDataType = {
    indexRoom: string;
};

const findPlayerByWebSocket = (ws: WebSocket): OnlinePlayerDataType | null => {
    for (const player of onlinePlayersDataBase.values()) {
        if (player.ws === ws) {
            return player;
        }
    }

    return null;
};

export const handleCreateRoom = (ws: WebSocket) => {
    const player = findPlayerByWebSocket(ws);

    if (!player) {
        return;
    }

    const isUserAlreadyCreatedRoom = [...roomsDataBase.values()].some(room => room.creator === player.id);

    if (isUserAlreadyCreatedRoom) {
        return;
    }

    const roomId = generateID('room');

    const newRoom: RoomType = {
        id: roomId,
        creator: player.id,
        players: [player],
    };

    roomsDataBase.set(roomId, newRoom);

    sendResponse(ws, COMMANDS.createGame, {
        idGame: newRoom.id,
        idPlayer: newRoom.creator,
    });
};

export const updateRoom = (ws?: WebSocket): void => {
    const responseData = [...roomsDataBase.values()].map(({ id, players }) => ({
        id,
        roomUsers: players.map(({ name, id }) => ({ name, index: id })),
    }));

    if (ws) {
        sendResponse(ws, COMMANDS.updateRoom, responseData);
    } else {
        onlinePlayersDataBase.forEach(player => sendResponse(player.ws, COMMANDS.updateRoom, responseData));
    }
};

const deleteRoomsCreatedByPlayer = (playerId: string): void => {
    roomsDataBase.forEach(room => {
        if (room.creator === playerId) {
            roomsDataBase.delete(room.id);
        }
    });
};

export const handleAddUserToRoom = (data: unknown, ws: WebSocket) => {
    const { indexRoom } = data as AddUserToRoomDataType;

    const player = findPlayerByWebSocket(ws);
    const room = roomsDataBase.get(indexRoom);

    if (!player || !room) {
        return;
    }

    if (room.players[0]?.id === player.id) {
        return;
    }

    room.players.push({ id: player.id, name: player.name, ws });

    const { gameId } = createGame();

    room.players.forEach(player => {
        sendResponse(ws, COMMANDS.createGame, {
            idGame: gameId,
            idPlayer: player.id,
        });

        deleteRoomsCreatedByPlayer(player.id);
    });

    roomsDataBase.delete(indexRoom);
    updateRoom();
};
