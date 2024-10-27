export const COMMANDS = {
    reg: 'reg',
    updateWinners: 'update_winners',
    createRoom: 'create_room',
    addUserToRoom: 'add_user_to_room',
    createGame: 'create_game',
    startGame: 'start_game',
    addShips: 'add_ships',
    attack: 'attack',
    randomAttack: 'randomAttack',
    turn: 'turn',
    finish: 'finish',
    updateRoom: 'update_room',
} as const;

export const MIN_LOGIN_FIELDS_LENGTH = 5;
