import { WebSocket } from 'ws';
import { onlinePlayersDataBase, roomsDataBase, RoomType } from '../db/db';
import { findPlayerByWebSocket, generateID, logMessage, LogTypeEnum, sendResponse } from '../utils';
import { COMMANDS } from '../constants';
import { handleCreateGame } from './gameController';

type AddUserToRoomDataType = {
    indexRoom: string;
};

export const isPlayerAlreadyCreatedRoom = (playerId: string): boolean => {
    for (const room of roomsDataBase.values()) {
        if (playerId === room.creator) {
            return true;
        }
    }

    return false;
};

export const handleCreateRoom = (ws: WebSocket) => {
    const player = findPlayerByWebSocket(ws);

    if (!player) {
        return;
    }

    if (isPlayerAlreadyCreatedRoom(player.id)) {
        return;
    }

    const roomId = generateID('room');

    const newRoom: RoomType = {
        roomId,
        creator: player.id,
        players: [player],
    };

    roomsDataBase.set(roomId, newRoom);

    sendResponse(ws, COMMANDS.createGame, {
        idGame: newRoom.roomId,
        idPlayer: newRoom.creator,
    });

    updateRoom();
};

export const updateRoom = (ws?: WebSocket): void => {
    const responseData = [...roomsDataBase.values()].map(({ roomId, players }) => ({
        roomId,
        roomUsers: players.map(({ name, id }) => ({ name, index: id })),
    }));

    if (ws) {
        sendResponse(ws, COMMANDS.updateRoom, responseData);
    } else {
        onlinePlayersDataBase.forEach(player => sendResponse(player.ws, COMMANDS.updateRoom, responseData));
    }

    logMessage(LogTypeEnum.update, 'Game rooms updated');
};

export const deleteRoomsCreatedByPlayer = (playerId: string): void => {
    roomsDataBase.forEach(room => {
        if (room.creator === playerId) {
            roomsDataBase.delete(room.roomId);
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

    const { players: playersInRoom } = room;

    if (playersInRoom[0]?.id === player.id) {
        return;
    }

    playersInRoom.push({ id: player.id, name: player.name, ws });

    const gameId = handleCreateGame(playersInRoom);

    playersInRoom.forEach(player => {
        sendResponse(ws, COMMANDS.createGame, {
            idGame: gameId,
            idPlayer: player.id,
        });

        deleteRoomsCreatedByPlayer(player.id);
    });

    roomsDataBase.delete(indexRoom);
    updateRoom();
};
