import express from 'express';
import { pipe } from 'fp-ts/function';
import * as t from 'io-ts';
import * as tt from 'io-ts-types';
import * as E from 'fp-ts/Either';
import * as T from 'fp-ts/Task';
import * as TE from 'fp-ts/TaskEither';
import * as Apply from 'fp-ts/Apply';
import { flow } from 'fp-ts/lib/function';
import { IUN } from '../../../generated/pnapi/IUN';
import { Handler, toExpressHandler } from '../Handler';
import * as Problem from '../Problem';
import { SystemEnv } from '../../../useCases/SystemEnv';
import { makeGetNotificationDocumentMetadataRecord } from '../../../domain/GetNotificationDocumentMetadataRecord';
import { persistRecord } from '../../../useCases/UseCase';

const handler =
  (env: SystemEnv): Handler =>
  (req, res) =>
    pipe(
      Apply.sequenceS(E.Apply)({
        apiKey: t.string.decode(req.headers['x-api-key']),
        iun: IUN.decode(req.params.iun),
        docIdx: tt.NumberFromString.decode(req.params.docIdx),
      }),
      E.map(flow(makeGetNotificationDocumentMetadataRecord(env), persistRecord(env))),
      E.map(
        TE.fold(
          () => T.of(res.status(500).send(Problem.fromNumber(500))),
          ({ output }) => T.of(res.status(output.statusCode).send(output.returned))
        )
      )
    );

export const makeGetNotificationDocumentMetadataRouter = (env: SystemEnv): express.Router => {
  const router = express.Router();

  router.get('/delivery/notifications/sent/:iun/attachments/documents/:docIdx', toExpressHandler(handler(env)));

  return router;
};
