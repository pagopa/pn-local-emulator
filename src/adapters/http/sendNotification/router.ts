import express from 'express';
import * as t from 'io-ts';
import { flow, pipe } from 'fp-ts/function';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import * as T from 'fp-ts/Task';
import * as Apply from 'fp-ts/Apply';
import { constant } from 'fp-ts/lib/function';
import * as Problem from '../Problem';
import { Handler, toExpressHandler, removeNullValues } from '../Handler';
import { SystemEnv } from '../../../useCases/SystemEnv';
import { persistRecord } from '../../../useCases/UseCase';
import { makeNewNotificationRecord } from '../../../domain/NewNotificationRecord';
import { NewNotificationRequest } from '../../../generated/pnapi/NewNotificationRequest';

const handler =
  (env: SystemEnv): Handler =>
  (req, res) =>
    pipe(
      Apply.sequenceS(E.Apply)({
        apiKey: t.string.decode(req.headers['x-api-key']),
        body: NewNotificationRequest.decode(removeNullValues(req.body)),
      }),
      E.map(flow(makeNewNotificationRecord(env), constant, persistRecord(env))),
      E.map(
        TE.fold(
          (_) => T.of(res.status(500).send(Problem.fromNumber(500))),
          ({ output }) => T.of(res.status(output.statusCode).send(output.returned))
        )
      )
    );

export const makeSendNotificationRouter = (env: SystemEnv): express.Router => {
  const router = express.Router();

  router.post('/delivery/requests', toExpressHandler(handler(env)));

  return router;
};
