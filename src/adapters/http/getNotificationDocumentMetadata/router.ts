import express from 'express';
import { pipe } from 'fp-ts/function';
import * as t from 'io-ts';
import * as tt from 'io-ts-types';
import * as E from 'fp-ts/Either';
import * as T from 'fp-ts/Task';
import * as TE from 'fp-ts/TaskEither';
import { IUN } from '../../../generated/pnapi/IUN';
import { GetNotificationDocumentMetadataUseCase } from '../../../useCases/GetNotificationDocumentMetadataUseCase';
import { Handler, toExpressHandler } from '../Handler';
import * as Problem from '../Problem';

const handler =
  (getNotificationDocumentMetadataUseCase: GetNotificationDocumentMetadataUseCase): Handler =>
  (req, res) =>
    pipe(
      E.of(getNotificationDocumentMetadataUseCase),
      E.ap(t.string.decode(req.headers['x-api-key'])),
      E.ap(IUN.decode(req.params.iun)),
      E.ap(tt.NumberFromString.decode(req.params.docIdx)),
      E.map(
        TE.fold(
          () => T.of(res.status(500).send(Problem.fromNumber(500))),
          (_) => T.of(res.status(_.statusCode).send(_.returned))
        )
      )
    );

export const makeGetNotificationDocumentMetadataRouter = (
  getNotificationDocumentMetadataUseCase: GetNotificationDocumentMetadataUseCase
): express.Router => {
  const router = express.Router();

  router.get(
    '/delivery/notifications/sent/:iun/attachments/documents/:docIdx',
    toExpressHandler(handler(getNotificationDocumentMetadataUseCase))
  );

  return router;
};
