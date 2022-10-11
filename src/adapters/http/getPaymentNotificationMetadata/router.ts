import express from 'express';
import * as E from 'fp-ts/Either';
import * as T from 'fp-ts/Task';
import { Handler, toExpressHandler } from '../Handler';
import { GetPaymentNotificationMetadataUseCase } from '../../../useCases/GetPaymentNotificationMetadataUseCase';

const handler =
  (_getPaymentNotificationMetadataUseCase: GetPaymentNotificationMetadataUseCase): Handler =>
  (req, res) =>
    E.of(T.of(res.status(200).send('Hello, world!')));

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
