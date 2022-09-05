import { pipe } from 'fp-ts/lib/function';
import * as E from 'fp-ts/Either';
import * as RA from 'fp-ts/ReadonlyArray';
import { AnyRecord } from '../AnyRecord';
import { PreLoadRecord } from '../PreLoadRepository';
import { UploadToS3Record } from '../UploadToS3RecordRepository';
import { Checklist } from './types';

export const check0 = {
  name: 'Exists a response with status code 200',
  eval: RA.some((record: AnyRecord) => record.output.statusCode === 200 && record.type === 'UploadToS3Record'),
};

const match = (uploadToS3Record: UploadToS3Record, preLoadRecord: PreLoadRecord): boolean =>
  preLoadRecord.output.statusCode === 200 &&
  pipe(
    RA.zip(preLoadRecord.output.returned)(preLoadRecord.input.body),
    RA.some(
      ([body, result]) =>
        // TODO: Add insert date and check that uploadToS3Record.createdAt is bigger than preLoadRecord
        body.sha256 === uploadToS3Record.input.checksum &&
        result.secret === uploadToS3Record.input.secret &&
        result.key === uploadToS3Record.input.key
    )
  );

export const check1 = {
  name: `Exists a request that matches checksum, secret, key and url returned in any previous request of step 'Request an "upload slot"'`,
  eval: (recordList: ReadonlyArray<UploadToS3Record | PreLoadRecord>) =>
    pipe(
      recordList,
      RA.partitionMap((_) => (_.type === 'PreLoadRecord' ? E.right(_) : E.left(_))),
      ({ left, right }) =>
        pipe(
          left,
          RA.some((upload) =>
            pipe(
              right,
              RA.some((preload) => match(upload, preload))
            )
          )
        )
    ),
};

const group = {
  name: 'The upload to S3 request',
};

export const uploadToS3Checklist: Checklist<ReadonlyArray<AnyRecord>> = pipe(
  [check0, check1],
  RA.map((check) => ({ ...check, group }))
);
