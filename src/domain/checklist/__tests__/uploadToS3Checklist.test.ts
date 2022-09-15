import { evalCheck } from '../types';
import { check0, check1 } from '../uploadToS3Checklist';
import * as data from '../../__tests__/data';

const group = { name: 'Group' };

describe('uploadToS3Checklist', () => {
  it('should exist a response with status code 2xx', () => {
    const check = evalCheck({ ...check0, group });

    const actualOK = check([data.uploadToS3Record]);
    expect(actualOK.result).toStrictEqual('ok');
  });

  it('should exist a correlation between the "preload"', () => {
    const check = evalCheck({ ...check1, group });

    const actualOK = check([data.preLoadRecord, data.uploadToS3Record]);
    expect(actualOK.result).toStrictEqual('ok');

    const actualKO = check([data.uploadToS3Record, data.uploadToS3Record]);
    expect(actualKO.result).toStrictEqual('ko');
  });
});
