import { DownloadRecord } from '../DownloadRecord';
import * as data from './data';
import { makePnDownloadDocumentURL } from '../PnDownloadDocumentURL';

const downloadRecord: DownloadRecord = {
  type: 'DownloadRecord',
  input: { url: makePnDownloadDocumentURL(data.makeTestSystemEnv()) || data.aUrl },
  output: {
    statusCode: 200,
    returned: undefined,
  },
  loggedAt: data.aDate,
};

const downloadRecordWithFakeUrl: DownloadRecord = {
  ...downloadRecord,
  input: { url: 'https://fakeurl.com' },
};

export const DownloadRecords = {
  empty: [],
  onlyDownload: [downloadRecord],
  withFakeUrl: [downloadRecordWithFakeUrl],
  withRealAndFakeUrl: [downloadRecord, downloadRecordWithFakeUrl],
};
