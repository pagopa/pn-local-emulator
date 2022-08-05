import express from 'express';
import { pipe } from 'fp-ts/lib/function';
import * as E from 'fp-ts/Either';
import * as utils from '../utils';
import { PreLoadUseCase } from '../../../useCases/PreLoadUseCase';
import { PreLoadRequestBody } from '../../../generated/definitions/PreLoadRequestBody';
import { ApiKey } from '../../../generated/definitions/ApiKey';

const preloadHandler =
  (preLoadUseCase: PreLoadUseCase): express.Handler =>
  (req, res) =>
    pipe(
      E.of(preLoadUseCase),
      E.ap(ApiKey.decode(req.headers['x-api-key'])),
      E.ap(PreLoadRequestBody.decode(req.body)),
      utils.sendResponse(res)(
        (_error) => res.status(500).send(utils.makeAPIProblem(500, 'Internal Server Error')(undefined)),
        (_) => res.status(_.statusCode).send(_.returned)
      )
    );

export const makePreLoadRouter = (preLoadUC: PreLoadUseCase): express.Router => {
  const router = express.Router();

  router.post('/delivery/attachments/preload', preloadHandler(preLoadUC));

  return router;
};
