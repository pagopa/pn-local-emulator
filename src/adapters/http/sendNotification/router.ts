import express from 'express';
import { pipe } from 'fp-ts/function';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import * as T from 'fp-ts/Task';
import * as Problem from '../Problem';
import { ApiKey } from '../../../generated/definitions/ApiKey';
import { NewNotificationRequest } from '../../../generated/definitions/NewNotificationRequest';
import { SendNotificationUseCase } from '../../../useCases/SendNotificationUseCase';
import {Handler, toExpressHandler, withoutNullValues} from '../Handler';

const handler =
  (sendNotificationUseCase: SendNotificationUseCase): Handler =>
  (req, res) =>
    pipe(
      E.of(sendNotificationUseCase),
      E.ap(ApiKey.decode(req.headers['x-api-key'])),
      E.ap(NewNotificationRequest.decode(withoutNullValues(req.body))),
      // Create response
      E.map(
        TE.fold(
          (_) => T.of(res.status(500).send(Problem.fromNumber(500))),
          (_) => T.of(res.status(_.statusCode).send(_.returned))
        )
      )
    );

export const makeSendNotificationRouter = (sendNotificationUseCase: SendNotificationUseCase): express.Router => {
  const router = express.Router();

  router.post('/delivery/requests', toExpressHandler(handler(sendNotificationUseCase)));

  return router;
};
