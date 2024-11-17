import { WebSocket } from 'ws';
import { GameStateType } from '../model/game';
import { ShipInfoType } from '../types';

export type PlayerIdType = string;
export type PlayerName = string;
export type RoomIdType = string;
export type GameIdType = string;

export type PlayerRegDataType = {
    id: PlayerIdType;
    name: PlayerName;
    password: string;
    wins: number;
};

export type OnlinePlayerDataType = {
    id: PlayerIdType;
    name: string;
    ws: WebSocket;
    ships?: ShipInfoType[];
};

export const playersDataBase: Map<PlayerName, PlayerRegDataType> = new Map();

export const onlinePlayersDataBase: Map<PlayerIdType, OnlinePlayerDataType> = new Map();

export type RoomType = {
    roomId: RoomIdType;
    creator: PlayerIdType;
    players: OnlinePlayerDataType[];
};

export const roomsDataBase: Map<RoomIdType, RoomType> = new Map();

export type GameType = {
    game: GameStateType;
    players: Map<PlayerIdType, OnlinePlayerDataType>;
};

export type GamesDataType = Map<GameIdType, GameType>;

export const gamesDataBase: GamesDataType = new Map();
