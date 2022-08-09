import * as tslog from 'tslog';

export type Logger = tslog.Logger;

export const makeLogger = (): Logger => new tslog.Logger();
