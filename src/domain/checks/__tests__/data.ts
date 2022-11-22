import * as data from '../../__tests__/data';

// TODO: Refactor using fast-check
export const preLoadRecordSingletonList = [data.preLoadRecord];

export const preLoadRecords = [data.preLoadRecord, data.preLoadRecord];

export const twoPreLoadRecordsOneUploadRecord = [data.preLoadRecord, data.preLoadRecord, data.uploadToS3Record];

export const evenPreLoadAndUploadRecordsThatAreLinked = [
  data.preLoadRecord,
  data.preLoadRecord,
  data.uploadToS3Record,
  { ...data.uploadToS3Record, loggedAt: new Date(data.preLoadRecord.loggedAt.getTime() + 50000) },
];

export const evenPreLoadAndUploadRecordsThatAreNotLinked = [
  data.preLoadRecord,
  data.preLoadRecord,
  data.uploadToS3Record,
  data.uploadToS3RecordDangling,
];
