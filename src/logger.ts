import * as tslog from 'tslog';

export type Logger = tslog.Logger;

export type LogLevelName = tslog.TLogLevelName;

export const makeLogger = (logLevel: LogLevelName = 'debug'): Logger => new tslog.Logger({ minLevel: logLevel });
