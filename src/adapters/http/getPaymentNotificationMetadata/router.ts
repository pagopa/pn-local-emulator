import express from 'express';
import * as E from 'fp-ts/Either';
import * as T from 'fp-ts/Task';
import { pipe } from 'fp-ts/function';
import * as tt from 'io-ts-types';
import * as t from 'io-ts';
import * as TE from 'fp-ts/TaskEither';
import { Handler, toExpressHandler } from '../Handler';
import { GetPaymentNotificationMetadataUseCase } from '../../../useCases/GetPaymentNotificationMetadataUseCase';
import { ApiKey } from '../../../generated/definitions/ApiKey';
import { Iun } from '../../../generated/definitions/Iun';
import * as Problem from '../Problem';

const handler =
  (getPaymentNotificationMetadataUseCase: GetPaymentNotificationMetadataUseCase): Handler =>
  (req, res) =>
    pipe(
      E.of(getPaymentNotificationMetadataUseCase),
      E.ap(ApiKey.decode(req.headers['x-api-key'])),
      E.ap(Iun.decode(req.params.iun)),
      E.ap(tt.NumberFromString.decode(req.params.recipientId)),
      E.ap(t.string.decode(req.params.attachmentName)),
      E.map(
        TE.fold(
          () => T.of(res.status(500).send(Problem.fromNumber(500))),
          (_) => T.of(res.status(_.statusCode).send(_.returned))
        )
      )
    );

export const makeGetPaymentNotificationMetadataRouter = (
  getPaymentNotificationMetadataUseCase: GetPaymentNotificationMetadataUseCase
): express.Router => {
  const router = express.Router();

  router.get(
    '/delivery/notifications/sent/:iun/attachments/payment/:recipientIdx/:attachmentName',
    toExpressHandler(handler(getPaymentNotificationMetadataUseCase))
  );

  return router;
};
