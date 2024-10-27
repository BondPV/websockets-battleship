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
