import { flow, pipe } from 'fp-ts/function';
import * as Apply from 'fp-ts/Apply';
import * as E from 'fp-ts/Either';
import * as t from 'io-ts';
import * as TE from 'fp-ts/TaskEither';
import * as T from 'fp-ts/Task';
import express from 'express';
import { deleteStreamRecord } from '../../../useCases/PersistRecord';
import { Handler, toExpressHandler } from '../Handler';
import { SystemEnv } from '../../../useCases/SystemEnv';
import { makeDeleteStreamRecord } from '../../../domain/DeleteStreamRecord';
import * as Problem from '../Problem';

const handler =
  (env: SystemEnv): Handler =>
  (req, res) =>
    pipe(
      Apply.sequenceS(E.Apply)({
        apiKey: t.string.decode(req.headers['x-api-key']),
        streamId: t.string.decode(req.params.streamId),
      }),
      E.map(flow(makeDeleteStreamRecord(env), deleteStreamRecord(env))),
      E.map(
        TE.fold(
          (_) => T.of(res.status(500).send(Problem.fromNumber(500))),
          (_) => T.of(res.status(204).send())
        )
      )
    );

export const makeDeleteEventStreamRouter = (env: SystemEnv): express.Router => {
  const router = express.Router();

  router.delete('/delivery-progresses/streams/:streamId', toExpressHandler(handler(env)));

  return router;
};
