import path from 'path';
import express from 'express';
import { constant, pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/TaskEither';
import { SystemEnv } from '../../../useCases/SystemEnv';
import { makeDownloadRecord } from '../../../domain/DownloadRecord';
import { persistRecord } from '../../../useCases/PersistRecord';

const persistDownloadRecord =
  (env: SystemEnv) =>
  (req: express.Request, _res: express.Response, next: express.NextFunction): Promise<void> =>
    pipe(
      makeDownloadRecord(env)({ url: req.originalUrl }),
      constant,
      persistRecord(env),
      TE.bimap(
        () => next(),
        () => next()
      ),
      TE.toUnion
    )();

export const makeDownloadDocumentRouter = (env: SystemEnv): express.Router => {
  const router = express.Router();
  router.use('/download', persistDownloadRecord(env), express.static(path.join(__dirname, 'exampledocuments')));

  return router;
};
