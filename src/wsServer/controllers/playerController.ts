import { WebSocket } from 'ws';
import { createHash } from 'node:crypto';
import { onlinePlayersDataBase, PlayerRegDataType, playersDataBase } from '../db/db';
import { PlayerRequestDataType } from '../types';
import { COMMANDS, MIN_LOGIN_FIELDS_LENGTH } from '../constants';
import { sendResponse } from '../utils';

const isFieldValid = (fieldContent: string): boolean => {
    return fieldContent.length >= MIN_LOGIN_FIELDS_LENGTH;
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

    if (playersDataBase.has(name)) {
        sendResponse(ws, COMMANDS.reg, {
            name,
            index: name,
            error: true,
            errorText: 'Player already exists',
        });
        return;
    }

    const newPlayer: PlayerRegDataType = {
        name,
        password: createHash('sha256').update(password).digest('hex'),
        wins: 0,
    };

    playersDataBase.set(name, newPlayer);
    onlinePlayersDataBase.set(ws, newPlayer);

    sendResponse(ws, COMMANDS.reg, {
        name,
        index: name,
        error: false,
        errorText: '',
    });
};
