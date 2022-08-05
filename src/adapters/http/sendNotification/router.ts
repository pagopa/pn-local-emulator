import express from 'express';
import * as f from 'fp-ts/function';
import * as E from 'fp-ts/Either';
import * as utils from '../utils';
import { ApiKey } from '../../../generated/definitions/ApiKey';
import { NewNotificationRequest } from '../../../generated/definitions/NewNotificationRequest';
import { SendNotificationUseCase } from '../../../useCases/SendNotificationUseCase';

const handler =
  (sendNotificationUseCase: SendNotificationUseCase): express.Handler =>
  (req, res) => {
    return f.pipe(
      E.of(sendNotificationUseCase),
      E.ap(ApiKey.decode(req.headers['x-api-key'])),
      E.ap(NewNotificationRequest.decode(req.body)),
      utils.sendResponse(res)(
        (_error) => res.status(500).send(utils.makeAPIProblem(500, 'Internal Server Error')(undefined)),
        (_) => res.status(202).send(_.returned)
      )
    );
  };

export const makeSendNotificationRouter = (sendNotificationUseCase: SendNotificationUseCase): express.Router => {
  const router = express.Router();

  router.post('/delivery/requests', handler(sendNotificationUseCase));

  return router;
};
