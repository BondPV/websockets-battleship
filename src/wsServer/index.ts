import { WebSocketServer, WebSocket } from 'ws';
import { logMessage, LogTypeEnum, parseClientRequest } from './utils';
import { handleDisconnectedPlayer, handlePlayerRegistration } from './controllers/playerController';
import { ClientRequestType } from './types';
import { COMMANDS } from './constants';
import { handleAddUserToRoom, handleCreateRoom } from './controllers/roomController';
import { handleAddShips } from './controllers/gameController';

export const createWebSocketServer = (port: number) => {
    const wss = new WebSocketServer({ port });

    wss.on('connection', (ws: WebSocket) => {
        logMessage(LogTypeEnum.server, 'Client connected');

        ws.on('message', (message: string) => {
            try {
                const { type, data }: ClientRequestType = parseClientRequest(message.toString());

                switch (type) {
                    case COMMANDS.reg:
                        handlePlayerRegistration(data, ws);
                        break;
                    case COMMANDS.createRoom:
                        handleCreateRoom(ws);
                        break;
                    case COMMANDS.addShips:
                        handleAddShips(data);
                        break;
                    case COMMANDS.addUserToRoom:
                        handleAddUserToRoom(data, ws);
                        break;
                    default:
                        logMessage(LogTypeEnum.warning, `Unknown message type: ${type}`);
                }
            } catch (error) {
                logMessage(LogTypeEnum.error, 'Unknown error', error);
            }
        });

        ws.on('close', () => {
            handleDisconnectedPlayer(ws);
            logMessage(LogTypeEnum.exit, 'Client disconnected');
        });

        ws.on('error', () => logMessage(LogTypeEnum.error, 'WebSocket connection error'));
    });
};
