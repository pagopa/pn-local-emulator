import express from 'express';
import { pipe } from 'fp-ts/function';
import * as t from 'io-ts';
import * as E from 'fp-ts/Either';
import * as T from 'fp-ts/Task';
import * as TE from 'fp-ts/TaskEither';
import * as Apply from 'fp-ts/Apply';
import { Handler, toExpressHandler } from '../Handler';
import * as Problem from '../Problem';
import { makeConsumeEventStreamRecord } from '../../../domain/ConsumeEventStreamRecord';
import { SystemEnv } from '../../../useCases/SystemEnv';
import { computeSnapshotSlim } from '../../../domain/Snapshot';

export const consumeEventStreamHandler =
  (env: SystemEnv): Handler =>
  (req, res) =>
    pipe(
      Apply.sequenceS(E.Apply)({
        apiKey: t.string.decode(req.headers['x-api-key']),
        streamId: t.string.decode(req.params.streamId),
        lastEventId: t.union([t.string, t.undefined]).decode(req.query.lastEventId),
      }),
      E.map((input) =>
        pipe(
          env.recordRepository.list(),
          TE.map((records) => makeConsumeEventStreamRecord(env)(computeSnapshotSlim(env)(records))(input)),
          TE.chain(env.recordRepository.insert)
        )
      ),
      E.map(
        TE.fold(
          (_) => T.of(res.status(500).send(Problem.fromNumber(500))),
          ({ output }) => T.of(res.status(output.statusCode).send(output.returned))
        )
      )
    );

export const makeConsumeEventStreamRouter = (env: SystemEnv): express.Router => {
  const router = express.Router();

  router.get('/delivery-progresses/streams/:streamId/events', toExpressHandler(consumeEventStreamHandler(env)));

  return router;
};
