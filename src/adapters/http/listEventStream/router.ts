import express from 'express';
import * as t from 'io-ts';
import { flow, pipe } from 'fp-ts/function';
import * as E from 'fp-ts/Either';
import * as T from 'fp-ts/Task';
import * as TE from 'fp-ts/TaskEither';
import * as Apply from 'fp-ts/Apply';
import * as Problem from '../Problem';
import { Handler, toExpressHandler } from '../Handler';
import { SystemEnv } from '../../../useCases/SystemEnv';
import { persistRecord } from '../../../useCases/PersistRecord';
import { makeListEventStreamRecord } from '../../../domain/ListEventStreamRecord';

const handler =
  (env: SystemEnv): Handler =>
  (req, res) =>
    pipe(
      Apply.sequenceS(E.Apply)({
        apiKey: t.string.decode(req.headers['x-api-key']),
      }),
      E.map(flow(makeListEventStreamRecord(env), persistRecord(env))),
      E.map(
        TE.fold(
          (_) => T.of(res.status(500).send(Problem.fromNumber(500))),
          ({ output }) => T.of(res.status(output.statusCode).send(output.returned))
        )
      )
    );

export const makeListEventStreamRouter = (env: SystemEnv): express.Router => {
  const router = express.Router();

  router.get('/delivery-progresses/streams', toExpressHandler(handler(env)));

  return router;
};
