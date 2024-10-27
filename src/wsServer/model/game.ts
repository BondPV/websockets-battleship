import { generateID } from '../utils';

type PlayerIdType = string;
type GameIdType = string;

const GAME_PLAYERS_COUNT = 2;
const GAME_FIELD_SIZE = 10;

type PositionType = {
    x: number;
    y: number;
};
type CellStatusType = 'empty' | 'ship' | 'hit';

type ShipSizeType = 'small' | 'medium' | 'large' | 'huge';

type ShipInfoType = {
    position: PositionType;
    direction: boolean;
    length: number;
    type: ShipSizeType;
};

type CellInfoType = {
    isAttacked: boolean;
    status: CellStatusType;
    position: PositionType;
    ship: ShipInfoType | null;
};

type GameFieldType = CellInfoType[][];

type PlayerStateType = {
    field: GameFieldType;
    shipsNumber: number;
};

type PlayersStateDataType = Map<PlayerIdType, PlayerStateType>;

type GameStateType = {
    gameId: GameIdType;
    playersStateData: PlayersStateDataType;
    playersQueue: PlayerIdType[];
};

type AttackStatusType = 'miss' | 'killed' | 'shot';

type AttackResultType = {
    position: PositionType;
    currentPlayer: PlayerIdType;
    status: AttackStatusType;
};

export const createGame = (): GameStateType => {
    const gameId = generateID('game');
    const playersStateData: PlayersStateDataType = new Map();
    const playersQueue: PlayerIdType[] = [];

    return { gameId, playersStateData, playersQueue };
};

export const addPlayer = (gameState: GameStateType, playerId: PlayerIdType) => {
    gameState.playersQueue.push(playerId);
};

const getEmptyField = (): GameFieldType => {
    const emptyCell: CellInfoType = {
        isAttacked: false,
        status: 'empty',
        position: { x: -1, y: -1 },
        ship: null,
    };

    return [...Array(GAME_FIELD_SIZE)].map((_, y) =>
        [...Array(GAME_FIELD_SIZE)].map((_, x) => ({ ...emptyCell, position: { x, y } })),
    );
};

const getCellFromField = (field: GameFieldType, x: number, y: number): CellInfoType | null => {
    const row = field[y];

    if (!row) {
        return null;
    }

    const cell = row[x];

    return cell ? cell : null;
};

const getShipCells = (field: GameFieldType, ship: ShipInfoType): CellInfoType[] => {
    const cells = [];

    for (let i = 0; i < ship.length; i++) {
        const shipY = ship.direction ? ship.position.y + i : ship.position.y;
        const shipX = ship.direction ? ship.position.x : ship.position.x + i;

        const cell = getCellFromField(field, shipX, shipY);

        if (cell) {
            cells.push(cell);
        }
    }

    return cells;
};

const createField = (ships: ShipInfoType[]): GameFieldType => {
    const field = getEmptyField();

    ships.forEach(ship => {
        const shipCells = getShipCells(field, ship);

        shipCells.forEach(cell => {
            cell.ship = ship;
            cell.status = 'ship';
        });
    });

    return field;
};

export const addShips = (gameState: GameStateType, playerId: PlayerIdType, ships: ShipInfoType[]) => {
    const field = createField(ships);

    gameState.playersStateData.set(playerId, { field, shipsNumber: ships.length });
};

export const isGameReady = (gameState: GameStateType) => {
    return gameState.playersStateData.size === GAME_PLAYERS_COUNT;
};

export const getPlayerInTurn = (gameState: GameStateType): PlayerIdType => {
    return gameState.playersQueue[0];
};

const getOpponentState = (gameState: GameStateType): PlayerStateType | null => {
    const opponentId = gameState.playersQueue[1];

    if (!opponentId) {
        return null;
    }

    return gameState.playersStateData.get(opponentId) || null;
};

const generateRandom = (min = 0, max = GAME_FIELD_SIZE) => Math.floor(Math.random() * (max - min)) + min;
const getRandomCellFromField = (field: GameFieldType) => getCellFromField(field, generateRandom(), generateRandom());

const getRandomTarget = (field: GameFieldType): CellInfoType => {
    let target = null;

    while (!target) {
        const randomTarget = getRandomCellFromField(field);

        if (randomTarget && !randomTarget.isAttacked) {
            target = randomTarget;
        }
    }

    return target;
};

export const getNearbyPositions = ({ x, y }: PositionType): PositionType[] => {
    return [
        { x: x + 1, y: y },
        { x: x - 1, y: y },
        { x: x, y: y + 1 },
        { x: x, y: y - 1 },
        { x: x + 1, y: y + 1 },
        { x: x + 1, y: y - 1 },
        { x: x - 1, y: y + 1 },
        { x: x - 1, y: y - 1 },
    ];
};

const getNearbyEmptyCells = (field: GameFieldType, shipCells: CellInfoType[]) => {
    const cells: PositionType[] = [];

    shipCells.forEach(cell => {
        const nearbyPositions = getNearbyPositions(cell.position);

        nearbyPositions.forEach(({ x, y }) => {
            const nearbyCell = getCellFromField(field, x, y);

            if (nearbyCell && nearbyCell.status === 'empty') {
                nearbyCell.isAttacked = true;
                cells.push({ x, y });
            }
        });
    });

    return cells;
};

export const attack = (
    gameState: GameStateType,
    currentPlayer: PlayerIdType,
    target: PositionType | null,
): AttackResultType[] | undefined => {
    if (currentPlayer !== getPlayerInTurn(gameState)) {
        return;
    }

    const opponentState = getOpponentState(gameState);

    if (!opponentState) {
        return;
    }

    const opponentField = opponentState.field;

    const targetCell = target ? getCellFromField(opponentField, target.x, target.y) : getRandomTarget(opponentField);

    if (!targetCell || targetCell.isAttacked) return;

    const attackResults: AttackResultType[] = [];

    const targetResult: AttackResultType = {
        position: { x: targetCell.position.x, y: targetCell.position.y },
        currentPlayer,
        status: 'miss',
    };

    attackResults.push(targetResult);

    if (targetCell.status === 'empty') {
        gameState.playersQueue.shift();
        gameState.playersQueue.push(currentPlayer);
    } else {
        targetCell.status = 'hit';

        if (!targetCell.ship) {
            return;
        }

        const shipCells = getShipCells(opponentField, targetCell.ship);
        const isKilled = !shipCells.some(cell => cell.status === 'ship');

        targetResult.status = isKilled ? 'killed' : 'shot';

        if (isKilled) {
            opponentState.shipsNumber -= 1;

            shipCells.forEach(cell => {
                attackResults.push({
                    position: { x: cell.position.x, y: cell.position.y },
                    currentPlayer,
                    status: 'killed',
                });
            });

            const emptyCells = getNearbyEmptyCells(opponentField, shipCells);

            emptyCells.forEach(cell => {
                attackResults.push({
                    position: { x: cell.x, y: cell.y },
                    currentPlayer,
                    status: 'miss',
                });
            });
        }
    }

    targetCell.isAttacked = true;

    return attackResults;
};

export const isCurrentPlayerWin = (gameState: GameStateType): boolean => {
    const opponentState = getOpponentState(gameState);

    return opponentState?.shipsNumber === 0;
};
