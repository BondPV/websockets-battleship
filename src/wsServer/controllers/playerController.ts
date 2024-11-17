import { WebSocket } from 'ws';
import { createHash } from 'node:crypto';
import { onlinePlayersDataBase, PlayerRegDataType, playersDataBase } from '../db/db';
import { PlayerRequestDataType } from '../types';
import { COMMANDS, MIN_LOGIN_FIELDS_LENGTH } from '../constants';
import { findPlayerByWebSocket, generateID, logMessage, LogTypeEnum, sendResponse } from '../utils';
import { deleteRoomsCreatedByPlayer, updateRoom } from './roomController';

const isFieldValid = (fieldContent: string): boolean => {
    return fieldContent.length >= MIN_LOGIN_FIELDS_LENGTH;
};

const handlePlayerLogin = (player: PlayerRegDataType, password: string, ws: WebSocket) => {
    const hashedPassword = createHash('sha256').update(password).digest('hex');
    const { id, name, password: playerPassword } = player;

    if (hashedPassword !== playerPassword) {
        sendResponse(ws, COMMANDS.reg, {
            name,
            index: 0,
            error: true,
            errorText: 'Invalid password',
        });

        return;
    }

    onlinePlayersDataBase.set(id, { id, name, ws });

    logMessage(LogTypeEnum.success, `Player ${name} has login`);

    sendResponse(ws, COMMANDS.reg, {
        name,
        index: id,
        error: false,
        errorText: '',
    });

    updateRoom(ws);
};

export const handlePlayerRegistration = (data: unknown, ws: WebSocket) => {
    const { name, password } = data as PlayerRequestDataType;

    if (!isFieldValid(name) || !isFieldValid(password)) {
        sendResponse(ws, COMMANDS.reg, {
            error: true,
            errorText: `Player name or password must be at least ${MIN_LOGIN_FIELDS_LENGTH} characters long`,
        });

        return;
    }

    const player = playersDataBase.get(name.toLocaleLowerCase());

    if (player) {
        handlePlayerLogin(player, password, ws);

        return;
    }

    const id = generateID(name);

    const newPlayer: PlayerRegDataType = {
        id,
        name,
        password: createHash('sha256').update(password).digest('hex'),
        wins: 0,
    };

    playersDataBase.set(name.toLocaleLowerCase(), newPlayer);
    onlinePlayersDataBase.set(id, { id, name, ws });

    sendResponse(ws, COMMANDS.reg, {
        name,
        index: id,
        error: false,
        errorText: '',
    });

    logMessage(LogTypeEnum.success, `Player ${name} registered`);

    updateRoom(ws);
};

export const handleDisconnectedPlayer = (ws: WebSocket): void => {
    const player = findPlayerByWebSocket(ws);

    if (!player) {
        return;
    }

    onlinePlayersDataBase.delete(player.id);

    deleteRoomsCreatedByPlayer(player.id);
    updateRoom();
};
