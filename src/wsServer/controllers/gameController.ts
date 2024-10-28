import { COMMANDS } from '../constants';
import { GameIdType, gamesDataBase, OnlinePlayerDataType, PlayerIdType } from '../db/db';
import { addPlayerToGame, addShips, createGame, getPlayerInTurn, isGameReady } from '../model/game';
import { ShipInfoType, StartGameResponseDataType } from '../types';
import { sendResponse } from '../utils';

type AddShipsRequestDataType = {
    gameId: GameIdType;
    ships: ShipInfoType[];
    indexPlayer: PlayerIdType;
};

export const handleAddShips = (data: unknown) => {
    const { gameId, ships, indexPlayer } = data as AddShipsRequestDataType;

    const gameInfo = gamesDataBase.get(gameId);

    if (!gameInfo) {
        return;
    }

    const { game, players } = gameInfo;
    const activePlayer = players.get(indexPlayer);

    if (!activePlayer) {
        return;
    }

    activePlayer.ships = ships;

    addShips(game, indexPlayer, ships);

    if (isGameReady(game)) {
        players.forEach(player => {
            if (!player.ships) {
                return;
            }

            const responseData: StartGameResponseDataType = {
                currentPlayerIndex: player.id,
                ships: player.ships,
            };

            sendResponse(player.ws, COMMANDS.startGame, responseData);

            const currentPlayer = getPlayerInTurn(game);

            sendResponse(player.ws, COMMANDS.turn, { currentPlayer });
        });
    }
};

export const handleCreateGame = (players: OnlinePlayerDataType[]) => {
    const newGame = createGame();
    const playersInGame = new Map();

    players.forEach(player => {
        addPlayerToGame(newGame, player.id);
        playersInGame.set(player.id, player);
    });

    gamesDataBase.set(newGame.gameId, { game: newGame, players: playersInGame });

    return newGame.gameId;
};
