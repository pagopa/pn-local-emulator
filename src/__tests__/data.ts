import { Config } from '../config';

export const envs: NodeJS.ProcessEnv = {
  ...process.env,
};

export const config: Config = {
  server: {
    hostname: envs['HOSTNAME'] as string,
    port: Number(envs['PORT']),
    uploadToS3URL: new URL(`http://${envs['HOSTNAME']}:${envs['PORT']}/uploadS3`),
  },
};
