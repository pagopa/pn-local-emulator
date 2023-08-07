import * as t from 'io-ts';
import * as tt from 'io-ts-types';
import * as E from 'fp-ts/Either';
import * as PR from 'io-ts/PathReporter';
import { pipe } from 'fp-ts/lib/function';
import { LogLevelName } from './logger';

export type Config = {
  npm_package_version: string;
  server: {
    port: number;
    hostname: string;
    uploadToS3URL: URL;
    downloadDocumentURL: URL;
  };
  logLevel: LogLevelName;
};

const EnvCodec = t.type({
  PORT: t.string.pipe(tt.NumberFromString),
  HOSTNAME: t.string,
  BASEURL: t.string,
  LOG_LEVEL: t.union([
    t.literal('debug'),
    t.literal('error'),
    t.literal('fatal'),
    t.literal('info'),
    t.literal('silly'),
    t.literal('trace'),
    t.literal('warn'),
  ]),
  npm_package_version: t.string,
});

export const parseConfig = (envs: Record<string, undefined | string>): E.Either<string, Config> =>
  pipe(
    EnvCodec.decode(envs),
    E.bimap(
      (errors) => PR.failure(errors).join('\n'),
      (envs) => ({
        npm_package_version: envs.npm_package_version,
        server: {
          port: envs.PORT,
          hostname: envs.HOSTNAME,
          uploadToS3URL: new URL(`${envs.BASEURL}/uploadS3`),
          downloadDocumentURL: new URL(`${envs.BASEURL}/download`),
        },
        logLevel: envs.LOG_LEVEL,
      })
    )
  );
