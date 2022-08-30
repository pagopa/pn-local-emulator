import express from 'express';
import { pipe } from 'fp-ts/lib/function';
import * as E from 'fp-ts/Either';
import * as T from 'fp-ts/Task';
import * as TE from 'fp-ts/TaskEither';
import * as Problem from '../Problem';
import { PreLoadUseCase } from '../../../useCases/PreLoadUseCase';
import { PreLoadRequestBody } from '../../../generated/definitions/PreLoadRequestBody';
import { ApiKey } from '../../../generated/definitions/ApiKey';
import { Handler, toExpressHandler } from '../Handler';

const preloadHandler =
  (preLoadUseCase: PreLoadUseCase): Handler =>
  (req, res) =>
    pipe(
      E.of(preLoadUseCase),
      E.ap(ApiKey.decode(req.headers['x-api-key'])),
      E.ap(PreLoadRequestBody.decode(req.body)),
      // Create response
      E.map(
        TE.fold(
          (_) => T.of(res.status(500).send(Problem.fromNumber(500))),
          (_) => T.of(res.status(_.statusCode).send(_.returned))
        )
      )
    );

export const makePreLoadRouter = (preLoadUC: PreLoadUseCase): express.Router => {
  const router = express.Router();

  router.post('/delivery/attachments/preload', toExpressHandler(preloadHandler(preLoadUC)));

  return router;
};
