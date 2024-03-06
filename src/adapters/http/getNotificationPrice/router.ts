import express from 'express';
import { flow, pipe } from 'fp-ts/function';
import * as t from 'io-ts';
import * as E from 'fp-ts/Either';
import * as T from 'fp-ts/Task';
import * as TE from 'fp-ts/TaskEither';
import * as Apply from 'fp-ts/Apply';
import * as Problem from '../Problem';
import { Handler, toExpressHandler } from '../Handler';
import { persistRecord } from '../../../useCases/PersistRecord';
import { makeGetNotificationPriceRecord } from '../../../domain/GetNotificationPriceRecord';
import { SystemEnv } from '../../../useCases/SystemEnv';

const handler =
  (env: SystemEnv): Handler =>
  (req, res) =>
    pipe(
      Apply.sequenceS(E.Apply)({
        apiKey: t.string.decode(req.headers['x-api-key']),
        paTaxId: t.string.decode(req.params.paTaxId),
        noticeCode: t.string.decode(req.params.noticeCode),
      }),
      E.map(flow(makeGetNotificationPriceRecord(env), persistRecord(env))),
      E.map(
        TE.fold(
          (_) => T.of(res.status(500).send(Problem.fromNumber(500))),
          ({ output }) => T.of(res.status(output.statusCode).send(output.returned))
        )
      )
    );

export const makeGetNotificationPriceRouter = (env: SystemEnv): express.Router => {
  const router = express.Router();

  router.get('/delivery/2.3/price/:paTaxId/:noticeCode', toExpressHandler(handler(env)));

  return router;
};
