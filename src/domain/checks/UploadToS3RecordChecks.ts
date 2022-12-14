import { pipe } from 'fp-ts/lib/function';
import * as R from 'fp-ts/Reader';
import * as RA from 'fp-ts/ReadonlyArray';
import { NotificationPaymentAttachment } from '../../generated/pnapi/NotificationPaymentAttachment';
import { isPreLoadRecord, PreLoadRecord } from '../PreLoadRecord';
import { isUploadToS3Record, UploadToS3Record } from '../UploadToS3Record';

const matchAtLeastOnePreLoadRecord = (records: ReadonlyArray<PreLoadRecord>) => (uploadToS3Record: UploadToS3Record) =>
  pipe(
    records,
    RA.exists(
      (record) =>
        record.output.statusCode === 200 &&
        pipe(
          RA.zip(record.output.returned)(record.input.body),
          RA.exists(
            ([body, response]) =>
              body.sha256 === uploadToS3Record.input.checksum &&
              response.secret === uploadToS3Record.input.secret &&
              response.key === uploadToS3Record.input.key &&
              body.sha256 === uploadToS3Record.input.computedSha256 &&
              record.loggedAt.getTime() < uploadToS3Record.loggedAt.getTime() &&
              // the response.url contains also the protocol, the hostname and the port
              // the uploadToS3Record.input.url doesn't
              (response.url?.endsWith(uploadToS3Record.input.url) || false)
          )
        )
    )
  );

export const atLeastNUploadMatchingPreLoadRecordC = (n: number) =>
  pipe(
    R.Do,
    R.apS('preloadRecordList', RA.filterMap(isPreLoadRecord)),
    R.apS('uploadToS3RecordList', RA.filterMap(isUploadToS3Record)),
    R.map(({ preloadRecordList, uploadToS3RecordList }) =>
      pipe(
        uploadToS3RecordList,
        RA.filter(matchAtLeastOnePreLoadRecord(preloadRecordList)),
        (records) => RA.size(records) >= n
      )
    )
  );

export const matchAtLeastOneUploadToS3Record =
  (records: ReadonlyArray<UploadToS3Record>) => (document: NotificationPaymentAttachment) =>
    pipe(
      records,
      RA.exists(
        (record) =>
          document.digests.sha256 === record.input.checksum &&
          document.ref.key === record.input.key &&
          document.ref.versionToken === record.output.returned.toString()
      )
    );
