import express from 'express';
import * as f from 'fp-ts/function';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { lookup } from 'fp-ts/lib/ReadonlyRecord';
import { HTTP_STATUS, sendError, sendSucces } from '../utils';
import { ApiKey } from '../../../generated/definitions/ApiKey';
import { NewNotificationRequest } from '../../../generated/definitions/NewNotificationRequest';
import { SendNotificationUseCase } from '../../../useCases/SendNotificationUseCase';

const handler =
  (sendNotificationUseCase: SendNotificationUseCase): express.Handler =>
  (req, res) =>
    f.pipe(
      E.of(sendNotificationUseCase),
      E.ap(ApiKey.decode(req.headers['x-api-key'])),
      E.ap(NewNotificationRequest.decode(req.body)),
      E.fold(
        sendError('Input error', HTTP_STATUS[400])(res),
        TE.fold(sendError('Input error', HTTP_STATUS[400])(res), (_) => sendSucces(HTTP_STATUS[202])(res)(_.returned))
      )
    )();

export const makeSendNotificationRouter = (sendNotificationUseCase: SendNotificationUseCase): express.Router => {
  const router = express.Router();

  router.post('/delivery/requests', handler(sendNotificationUseCase));

  return router;
};
