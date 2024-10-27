import { WebSocket } from 'ws';

export type PlayerRegDataType = {
    name: string;
    password: string;
    wins: number;
};

export const playersDataBase: Map<string, PlayerRegDataType> = new Map();

export const onlinePlayersDataBase: Map<WebSocket, PlayerRegDataType> = new Map();
