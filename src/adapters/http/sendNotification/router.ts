import express from 'express';
import { pipe, flow } from 'fp-ts/function';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { ApiKey } from '../../../generated/definitions/ApiKey';
import { NewNotificationRequest } from '../../../generated/definitions/NewNotificationRequest';
import { SendNotificationUseCase } from '../../../useCases/SendNotificationUseCase';
import { Handler, toExpressHandler } from '../Handler';
import { makeProblem } from '../codec';

const handler =
  (sendNotificationUseCase: SendNotificationUseCase): Handler =>
  (req, res) =>
    pipe(
      E.of(sendNotificationUseCase),
      E.ap(ApiKey.decode(req.headers['x-api-key'])),
      E.ap(NewNotificationRequest.decode(req.body)),
      // Create response
      E.map(
        flow(
          TE.bimap(
            (_) => res.status(500).send(makeProblem(500)),
            (_) => res.status(_.statusCode).send(_.returned)
          ),
          TE.toUnion
        )
      )
    );

export const makeSendNotificationRouter = (sendNotificationUseCase: SendNotificationUseCase): express.Router => {
  const router = express.Router();

  router.post('/delivery/requests', toExpressHandler(handler(sendNotificationUseCase)));

  return router;
};
