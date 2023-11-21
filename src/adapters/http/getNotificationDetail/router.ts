import express from 'express';
import { pipe } from 'fp-ts/function';
import * as t from 'io-ts';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import * as T from 'fp-ts/Task';
import * as Apply from 'fp-ts/Apply';
import { flow } from 'fp-ts/lib/function';
import { Handler, toExpressHandler } from '../Handler';
import { IUN } from '../../../generated/pnapi/IUN';
import * as Problem from '../Problem';
import { makeGetNotificationDetailRecord } from '../../../domain/GetNotificationDetailRecord';
import { SystemEnv } from '../../../useCases/SystemEnv';
import { persistRecord } from '../../../useCases/PersistRecord';

const handler =
  (env: SystemEnv): Handler =>
  (req, res) =>
    pipe(
      Apply.sequenceS(E.Apply)({
        apiKey: t.string.decode(req.headers['x-api-key']),
        iun: IUN.decode(req.params.iun),
      }),
      E.map(flow(makeGetNotificationDetailRecord(env), persistRecord(env))),
      E.map(
        TE.fold(
          (_) => T.of(res.status(500).send(Problem.fromNumber(500))),
          ({ output }) => T.of(res.status(output.statusCode).send(output.returned))
        )
      )
    );

export const makeGetNotificationDetailRouter = (env: SystemEnv): express.Router => {
  const router = express.Router();

  router.get('/delivery/v2.1/notifications/sent/:iun', toExpressHandler(handler(env)));

  return router;
};
