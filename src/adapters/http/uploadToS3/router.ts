import express from 'express';
import { flow, pipe } from 'fp-ts/lib/function';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { AmzDocumentKey } from '../../../generated/definitions/AmzDocumentKey';
import { AmzSdkChecksumAlg } from '../../../generated/definitions/AmzSdkChecksumAlg';
import { AmzMetaSecret } from '../../../generated/definitions/AmzMetaSecret';
import { AmzChecksumSHA256 } from '../../../generated/definitions/AmzChecksumSHA256';
import { UploadToS3UseCase } from '../../../useCases/UploadToS3UseCase';
import { makeProblem } from '../codec';
import { Handler, toExpressHandler } from '../Handler';

const handler =
  (uploadToS3UseCase: UploadToS3UseCase): Handler =>
  (req, res) =>
    pipe(
      E.of(uploadToS3UseCase),
      E.ap(AmzDocumentKey.decode(req.params.key)),
      E.ap(AmzSdkChecksumAlg.decode(req.headers['x-amz-sdk-checksum-algorithm'])),
      E.ap(AmzMetaSecret.decode(req.headers['x-amz-meta-secret'])),
      E.ap(AmzChecksumSHA256.decode(req.headers['x-amz-checksum-sha256'])),
      // Create response
      E.map(
        flow(
          TE.bimap(
            (_) => res.status(500).send(makeProblem(500)),
            (_) => res.status(200).header('x-amz-version-id', _.toString()).send()
          ),
          TE.toUnion
        )
      )
    );

export const makeUploadToS3Router = (uploadToS3UseCase: UploadToS3UseCase): express.Router => {
  const router = express.Router();

  router.put('/uploadS3/:key', toExpressHandler(handler(uploadToS3UseCase)));

  return router;
};
