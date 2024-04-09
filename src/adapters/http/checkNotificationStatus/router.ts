import express from 'express';
import * as t from 'io-ts';
import { pipe } from 'fp-ts/function';
import * as E from 'fp-ts/Either';
import * as T from 'fp-ts/Task';
import * as TE from 'fp-ts/TaskEither';
import * as Apply from 'fp-ts/Apply';
import { flow } from 'fp-ts/lib/function';
import * as Problem from '../Problem';
import { Handler, toExpressHandler } from '../Handler';
import { SystemEnv } from '../../../useCases/SystemEnv';
import { makeCheckNotificationStatusRecord } from '../../../domain/CheckNotificationStatusRecord';
import { persistRecord } from '../../../useCases/PersistRecord';

const checkNotificationStatusInputType = t.union([
  t.strict({
    notificationRequestId: t.string,
  }),
  t.strict({
    paProtocolNumber: t.string,
    idempotenceToken: t.union([t.undefined, t.string]),
  }),
]);

const handler =
  (env: SystemEnv): Handler =>
  (req, res) =>
    pipe(
      Apply.sequenceS(E.Apply)({
        apiKey: t.string.decode(req.headers['x-api-key']),
        body: checkNotificationStatusInputType.decode({
          notificationRequestId: req.query.notificationRequestId,
          paProtocolNumber: req.query.paProtocolNumber,
          idempotenceToken: req.query.idempotenceToken,
        }),
      }),
      E.map(flow(makeCheckNotificationStatusRecord(env), persistRecord(env))),
      E.map(
        TE.fold(
          (_) => T.of(res.status(500).send(Problem.fromNumber(500))),
          ({ output }) => T.of(res.status(output.statusCode).send(output.returned))
        )
      )
    );

export const makeNotificationStatusRouter = (env: SystemEnv): express.Router => {
  const router = express.Router();

  router.get('/delivery/v2.3/requests', toExpressHandler(handler(env)));

  return router;
};
