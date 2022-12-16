import express from 'express';
import { constant, flow, pipe } from 'fp-ts/lib/function';
import * as t from 'io-ts';
import * as E from 'fp-ts/Either';
import * as T from 'fp-ts/Task';
import * as TE from 'fp-ts/TaskEither';
import * as Apply from 'fp-ts/Apply';
import * as Problem from '../Problem';
import { PreLoadBulkRequest } from '../../../generated/pnapi/PreLoadBulkRequest';
import { Handler, toExpressHandler } from '../Handler';
import { SystemEnv } from '../../../useCases/SystemEnv';
import { persistRecord } from '../../../useCases/UseCase';
import { makePreLoadRecord } from '../../../domain/PreLoadRecord';

const preloadHandler =
  (env: SystemEnv): Handler =>
  (req, res) =>
    pipe(
      Apply.sequenceS(E.Apply)({
        apiKey: t.string.decode(req.headers['x-api-key']),
        body: PreLoadBulkRequest.decode(req.body),
      }),
      E.map(flow(makePreLoadRecord(env), constant, persistRecord(env))),
      E.map(
        TE.fold(
          (_) => T.of(res.status(500).send(Problem.fromNumber(500))),
          ({ output }) => T.of(res.status(output.statusCode).send(output.returned))
        )
      )
    );

export const makePreLoadRouter = (env: SystemEnv): express.Router => {
  const router = express.Router();

  router.post('/delivery/attachments/preload', toExpressHandler(preloadHandler(env)));

  return router;
};
