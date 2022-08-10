import express from 'express';
import { pipe } from 'fp-ts/function';
import * as E from 'fp-ts/Either';
import * as utils from '../utils';
import { AmzDocumentKey } from '../../../generated/definitions/AmzDocumentKey';
import { AmzSdkChecksumAlg } from '../../../generated/definitions/AmzSdkChecksumAlg';
import { AmzMetaSecret } from '../../../generated/definitions/AmzMetaSecret';
import { AmzChecksumSHA256 } from '../../../generated/definitions/AmzChecksumSHA256';
import { UploadToS3UseCase } from '../../../useCases/UploadToS3UseCase';

const handler =
  (uploadToS3UseCase: UploadToS3UseCase): express.Handler =>
  (req, res) =>
    pipe(
      E.of(uploadToS3UseCase),
      E.ap(AmzDocumentKey.decode(req.params.key)),
      E.ap(AmzSdkChecksumAlg.decode(req.headers['x-amz-sdk-checksum-algorithm'])),
      E.ap(AmzMetaSecret.decode(req.headers['x-amz-meta-secret'])),
      E.ap(AmzChecksumSHA256.decode(req.headers['x-amz-checksum-sha256'])),
      utils.sendResponse(res)(
        (_error) => res.status(500).send(utils.makeAPIProblem(500, 'Internal Server Error')(undefined)),
        (version) => res.status(200).header('x-amz-version-id', version.toString()).send()
      )
    );

export const makeUploadToS3Router = (uploadToS3UseCase: UploadToS3UseCase): express.Router => {
  const router = express.Router();

  router.put('/uploadS3/:key', handler(uploadToS3UseCase));

  return router;
};
