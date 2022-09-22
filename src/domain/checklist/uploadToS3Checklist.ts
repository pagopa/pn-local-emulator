import { pipe, tuple } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import * as RA from 'fp-ts/ReadonlyArray';
import { PreLoadRecord } from '../PreLoadRepository';
import { UploadToS3Record } from '../UploadToS3RecordRepository';
import { Checklist } from './types';

const group = {
  name: 'The upload to S3 request',
};

export const check0 = {
  group,
  name: 'Exists a response with status code 200',
  eval: RA.some(
    (record: PreLoadRecord | UploadToS3Record) => record.output.statusCode === 200 && record.type === 'UploadToS3Record'
  ),
};

const match = (preLoadRecord: PreLoadRecord, uploadToS3Record: UploadToS3Record): boolean =>
  preLoadRecord.output.statusCode === 200 &&
  pipe(
    RA.zip(preLoadRecord.output.returned)(preLoadRecord.input.body),
    RA.some(
      ([body, result]) =>
        // TODO: Add insert date and check that uploadToS3Record.createdAt is bigger than the one of preLoadRecord
        body.sha256 === uploadToS3Record.input.checksum &&
        result.secret === uploadToS3Record.input.secret &&
        result.key === uploadToS3Record.input.key
    )
  );

export const check1 = {
  group,
  name: `Exists a request that matches checksum, secret, key and url returned in any previous request of step 'Request an "upload slot"'`,
  eval: (recordList: ReadonlyArray<PreLoadRecord | UploadToS3Record>) => {
    const preLoadRecords = pipe(
      recordList,
      RA.filterMap((record) => (record.type === 'PreLoadRecord' ? O.some(record) : O.none))
    );
    const uploadToS3Records = pipe(
      recordList,
      RA.filterMap((record) => (record.type === 'UploadToS3Record' ? O.some(record) : O.none))
    );
    return pipe(
      RA.comprehension([preLoadRecords, uploadToS3Records], tuple),
      RA.some(([preload, upload]) => match(preload, upload))
    );
  },
};

export const uploadToS3Checklist: Checklist<ReadonlyArray<PreLoadRecord | UploadToS3Record>> = [check0, check1];
