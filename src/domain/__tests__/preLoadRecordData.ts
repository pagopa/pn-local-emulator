import { PreLoadRecord } from '../PreLoadRecord';
import * as data from './data';

const preLoadBody = { preloadIdx: '0', contentType: 'application/pdf', sha256: data.aSha256 };
const preLoadResponse = { preloadIdx: '0', secret: data.aSecret, url: data.aUrl, key: data.anAttachmentRef.key };

const preLoadRecord: PreLoadRecord = {
  type: 'PreLoadRecord',
  input: { apiKey: data.apiKey.valid, body: [preLoadBody] },
  output: { statusCode: 200, returned: [preLoadResponse] },
  loggedAt: data.aDate,
};
const preLoadRecordBulk: PreLoadRecord = {
  type: 'PreLoadRecord',
  input: { apiKey: data.apiKey.valid, body: [preLoadBody, { ...preLoadBody, preloadIdx: '1' }] },
  output: { statusCode: 200, returned: [preLoadResponse, { ...preLoadResponse, preloadIdx: '1' }] },
  loggedAt: data.aDate,
};

export const PreLoadRecords = {
  empty: [],
  one: [preLoadRecord],
  oneWithMultipleFiles: [preLoadRecordBulk],
  oneWithPdf: [preLoadRecord],
  two: [preLoadRecord, preLoadRecord],
  twoWithPdf: [preLoadRecord, preLoadRecord],
  twoWithMultipleFiles: [preLoadRecordBulk, preLoadRecordBulk],
};
