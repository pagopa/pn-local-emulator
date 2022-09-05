import * as O from 'fp-ts/Option';
import { PreLoadRecord } from '../../PreLoadRepository';
import { UploadToS3Record } from '../../UploadToS3RecordRepository';
import { evalCheck } from '../types';
import { check0, check1 } from '../uploadToS3Checklist';

const preLoadResponse = { preloadIdx: '0', secret: 'a-secret', url: 'a-url', key: 'a-key' };
const preLoadBody = { preloadIdx: '0', contentType: 'application/pdf', sha256: 'a-sha256' };

const preLoadRecord: PreLoadRecord = {
  type: 'PreLoadRecord',
  input: { apiKey: 'an-api-key', body: [preLoadBody] },
  output: { statusCode: 200, returned: [preLoadResponse] },
};

const baseUploadToS3Record: UploadToS3Record = {
  type: 'UploadToS3Record',
  input: {
    key: preLoadResponse.key,
    checksumAlg: O.none,
    secret: preLoadResponse.secret,
    checksum: preLoadBody.sha256,
  },
  output: { statusCode: 200, returned: 10 },
};

const group = { name: 'Group' };

describe('uploadToS3Checklist', () => {
  it('should exist a response with status code 2xx', () => {
    const check = evalCheck({ ...check0, group });

    const actualOK = check([baseUploadToS3Record]);
    expect(actualOK.result).toStrictEqual('ok');

    const actualKO = check([preLoadRecord]);
    expect(actualKO.result).toStrictEqual('ko');
  });

  it('should exist a correlation between the "preload"', () => {
    const check = evalCheck({ ...check1, group });

    const actualOK = check([preLoadRecord, baseUploadToS3Record]);
    expect(actualOK.result).toStrictEqual('ok');

    const actualKO = check([baseUploadToS3Record, baseUploadToS3Record]);
    expect(actualKO.result).toStrictEqual('ko');
  });
});
