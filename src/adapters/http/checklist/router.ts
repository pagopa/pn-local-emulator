import express from 'express';
import { pipe } from 'fp-ts/lib/function';
import * as E from 'fp-ts/Either';
import * as utils from '../utils';
import { GetChecklistResultUseCase } from '../../../useCases/GetChecklistResultUseCase';
import * as codec from './codec';

const getChecklistResultHandler =
  (getChecklistResultUseCase: GetChecklistResultUseCase): express.Handler =>
  (_, res) =>
    pipe(
      E.of(getChecklistResultUseCase()),
      utils.sendResponse(res)(
        (_) => res.status(500).send(utils.makeAPIProblem(500, 'Internal Server Error')(undefined)),
        (result) => res.status(200).send(codec.makeChecklistResult(result))
      )
    );

export const makeChecklistRouter = (getChecklistResultUseCase: GetChecklistResultUseCase): express.Router => {
  const router = express.Router();

  router.get('/checklistresult', getChecklistResultHandler(getChecklistResultUseCase));

  return router;
};
