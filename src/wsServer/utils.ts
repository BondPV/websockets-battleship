import { WebSocket } from 'ws';
import { ClientRequestType, CommandType } from './types';

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
        data: JSON.parse(data),
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
