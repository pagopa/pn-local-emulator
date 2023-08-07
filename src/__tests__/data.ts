import { Config } from '../config';
import { LogLevelName } from '../logger';

export const envs: NodeJS.ProcessEnv = {
  ...process.env,
};

export const config: Config = {
  npm_package_version: envs['npm_package_version'] as string,
  server: {
    hostname: envs['HOSTNAME'] as string,
    port: Number(envs['PORT']),
    uploadToS3URL: new URL(`${envs['BASEURL']}/uploadS3`),
    downloadDocumentURL: new URL(`${envs['BASEURL']}/download`),
  },
  logLevel: envs['LOG_LEVEL'] as LogLevelName,
};
