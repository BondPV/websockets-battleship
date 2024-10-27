import { WebSocket } from 'ws';

export type PlayerRegDataType = {
    id: string;
    name: string;
    password: string;
    wins: number;
};

export type OnlinePlayerDataType = {
    id: string;
    name: string;
    ws: WebSocket;
};

export const playersDataBase: Map<string, PlayerRegDataType> = new Map();

export const onlinePlayersDataBase: Map<string, OnlinePlayerDataType> = new Map();

export type RoomType = {
    id: string;
    creator: string;
    players: OnlinePlayerDataType[];
};

export const roomsDataBase: Map<string, RoomType> = new Map();
