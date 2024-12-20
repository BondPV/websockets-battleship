import { WebSocket } from 'ws';
import { ClientRequestType, CommandType } from './types';
import { OnlinePlayerDataType, onlinePlayersDataBase } from './db/db';

export enum LogTypeEnum {
    error = '❌',
    exit = '🔴',
    success = '✅',
    run = '🚀',
    server = '🌐',
    update = '🔄',
    warning = '⚠️',
}

export const logMessage = (type: LogTypeEnum, message: string, object?: unknown): void =>
    object ? console.log(`${type} ${message}`, object) : console.log(`${type} ${message}`);

export const parseClientRequest = (message: string): ClientRequestType => {
    const { type, data } = JSON.parse(message.toString());

    return {
        type,
        data: data ? JSON.parse(data) : '',
        id: 0,
    };
};

export const serializeServerResponse = (type: CommandType, data: unknown): string =>
    JSON.stringify({
        type,
        data: JSON.stringify(data),
        id: 0,
    });

export const sendResponse = (ws: WebSocket, command: CommandType, data: unknown) => {
    ws.send(serializeServerResponse(command, data));
};

export const generateID = (prefix = '') => {
    const hash = Math.random().toString(36).slice(-7);

    return `${prefix}-${hash}`;
};

export const findPlayerByWebSocket = (ws: WebSocket): OnlinePlayerDataType | null => {
    for (const player of onlinePlayersDataBase.values()) {
        if (player.ws === ws) {
            return player;
        }
    }

    return null;
};
