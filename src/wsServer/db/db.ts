import { WebSocket } from 'ws';
import { GameStateType } from '../model/game';
import { ShipInfoType } from '../types';

export type PlayerIdType = string;

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
    ships?: ShipInfoType[];
};

export const playersDataBase: Map<string, PlayerRegDataType> = new Map();

export const onlinePlayersDataBase: Map<string, OnlinePlayerDataType> = new Map();

export type RoomType = {
    roomId: string;
    creator: string;
    players: OnlinePlayerDataType[];
};

export const roomsDataBase: Map<string, RoomType> = new Map();

export type GameIdType = string;

export type GameType = {
    game: GameStateType;
    players: Map<PlayerIdType, OnlinePlayerDataType>;
};

export type GamesDataType = Map<PlayerIdType, GameType>;

export const gamesDataBase: GamesDataType = new Map();
