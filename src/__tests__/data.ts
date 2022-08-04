import { Config } from '../config';

export const envs: NodeJS.ProcessEnv = {
  ...process.env
};

export const config: Config = {
  server: {
    hostname: envs['HOSTNAME'],
    port: Number(envs['PORT'])
  }
};
