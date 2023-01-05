import { UploadToS3Record } from '../UploadToS3Record';
import * as data from './data';
import { PreLoadRecords } from './preLoadRecordData';

const uploadToS3Record: UploadToS3Record = {
  type: 'UploadToS3Record',
  input: {
    url: data.aUrl,
    key: data.anAttachmentRef.key,
    checksumAlg: undefined,
    secret: data.aSecret,
    checksum: data.aSha256,
    computedSha256: data.aSha256,
  },
  output: { statusCode: 200, returned: parseInt(data.anAttachmentRef.versionToken, 10) },
  loggedAt: new Date(data.aDate.getTime() + 1000),
};

const uploadToS3RecordDangling: UploadToS3Record = {
  ...uploadToS3Record,
  input: {
    ...uploadToS3Record.input,
    key: `${data.anAttachmentRef.key}-dangling`,
    secret: `${data.aSecret}-dangling`,
    checksum: `${data.aSha256}-dangling`,
  },
};

export const UploadToS3Records = {
  empty: [],
  onlyPreLoadRecords: PreLoadRecords.one,
  onlyDangling: [uploadToS3RecordDangling],
  onlyUploadToS3Record: [uploadToS3Record],
  evenPreLoadOddUploadToS3Record: [...PreLoadRecords.two, uploadToS3Record],
  evenPreloadAndUploadButOneIsDangling: [...PreLoadRecords.two, uploadToS3Record, uploadToS3RecordDangling],
  evenPreloadAndUpload: [...PreLoadRecords.two, uploadToS3Record, uploadToS3Record],
};
