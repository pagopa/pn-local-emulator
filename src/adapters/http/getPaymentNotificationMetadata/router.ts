import express from 'express';
import * as E from 'fp-ts/Either';
import * as T from 'fp-ts/Task';
import { flow, pipe } from 'fp-ts/function';
import * as tt from 'io-ts-types';
import * as t from 'io-ts';
import * as TE from 'fp-ts/TaskEither';
import * as Apply from 'fp-ts/Apply';
import { Handler, toExpressHandler } from '../Handler';
import { IUN } from '../../../generated/pnapi/IUN';
import * as Problem from '../Problem';
import { persistRecord } from '../../../useCases/PersistRecord';
import { makeGetPaymentNotificationMetadataRecord } from '../../../domain/GetPaymentNotificationMetadataRecord';
import { SystemEnv } from '../../../useCases/SystemEnv';

const handler =
  (env: SystemEnv): Handler =>
  (req, res) =>
    pipe(
      Apply.sequenceS(E.Apply)({
        apiKey: t.string.decode(req.headers['x-api-key']),
        iun: IUN.decode(req.params.iun),
        recipientId: tt.NumberFromString.decode(req.params.recipientIdx),
        attachmentName: t.string.decode(req.params.attachmentName),
      }),
      E.map(flow(makeGetPaymentNotificationMetadataRecord(env), persistRecord(env))),
      E.map(
        TE.fold(
          (_) => T.of(res.status(500).send(Problem.fromNumber(500))),
          ({ output }) => T.of(res.status(output.statusCode).send(output.returned))
        )
      )
    );

export const makeGetPaymentNotificationMetadataRouter = (env: SystemEnv): express.Router => {
  const router = express.Router();

  router.get(
    '/delivery/notifications/sent/:iun/attachments/payment/:recipientIdx/:attachmentName',
    toExpressHandler(handler(env))
  );

  return router;
};
