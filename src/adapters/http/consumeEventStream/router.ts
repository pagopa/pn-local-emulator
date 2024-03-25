import express from 'express';
import { pipe } from 'fp-ts/function';
import * as t from 'io-ts';
import * as E from 'fp-ts/Either';
import * as T from 'fp-ts/Task';
import * as TE from 'fp-ts/TaskEither';
import * as Apply from 'fp-ts/Apply';
import { flow } from 'fp-ts/lib/function';
import { Handler, toExpressHandler } from '../Handler';
import * as Problem from '../Problem';
import { makeConsumeEventStreamRecord } from '../../../domain/ConsumeEventStreamRecord';
import { SystemEnv } from '../../../useCases/SystemEnv';
import { persistRecord } from '../../../useCases/PersistRecord';

const handler =
  (env: SystemEnv): Handler =>
  (req, res) =>
    pipe(
      Apply.sequenceS(E.Apply)({
        apiKey: t.string.decode(req.headers['x-api-key']),
        streamId: t.string.decode(req.params.streamId),
        lastEventId: t.union([t.string, t.undefined]).decode(req.query.lastEventId),
      }),
      E.map(flow(makeConsumeEventStreamRecord(env), persistRecord(env))),
      E.map(
        TE.fold(
          (_) => T.of(res.status(500).send(Problem.fromNumber(500))),
          ({ output }) => T.of(res.header(output.headers).status(output.statusCode).send(output.returned))
        )
      )
    );

export const makeConsumeEventStreamRouter = (env: SystemEnv): express.Router => {
  const router = express.Router();

  router.get('/delivery-progresses/v2.3/streams/:streamId/events', toExpressHandler(handler(env)));

  return router;
};
