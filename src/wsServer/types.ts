import { COMMANDS } from './constants';

export type CommandType = (typeof COMMANDS)[keyof typeof COMMANDS];

export type ClientRequestType = {
    type: CommandType;
    data: unknown;
    id: 0;
};

export type PlayerRequestDataType = {
    name: string;
    password: string;
};

export type PlayerResponseDataType = {
    name: string;
    index: number | string;
    error: boolean;
    errorText: string;
};

export type PositionType = {
    x: number;
    y: number;
};

export type ShipSizeType = 'small' | 'medium' | 'large' | 'huge';

export type ShipInfoType = {
    position: PositionType;
    direction: boolean;
    length: number;
    type: ShipSizeType;
};

export type StartGameResponseDataType = {
    ships: ShipInfoType[];
    currentPlayerIndex: string;
};
