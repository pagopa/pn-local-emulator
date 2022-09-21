import { PreLoadRecord } from '../../PreLoadRepository';
import { evalCheck, Group } from '../types';
import { check0, check1, check2, check3 } from '../preLoadChecklist';
import { unauthorizedMessage } from '../../authorize';

const basePreloadRecord: PreLoadRecord = {
  type: 'PreLoadRecord',
  input: { apiKey: 'an-api-key', body: [{ preloadIdx: '0', contentType: 'application/pdf', sha256: 'a-sha256' }] },
  output: { statusCode: 200, returned: [{ preloadIdx: '0', secret: 'a-secret', url: 'a-url', key: 'a-key' }] },
};

describe('preLoadChecklist', () => {
  const group: Group = { name: 'The preload request' };
  const basePreloadDoc = { preloadIdx: '0', contentType: 'application/pdf', sha256: 'a-sha256' };

  it('should exists a response with status code 403', () => {
    const check = evalCheck({ ...check0, group });

    const actualOK = check([
      {
        ...basePreloadRecord,
        output: { ...basePreloadRecord.output, statusCode: 403, returned: unauthorizedMessage },
      },
    ]);
    expect(actualOK.result).toStrictEqual('ok');
    const actualKO = check([{ ...basePreloadRecord }]);
    expect(actualKO.result).toStrictEqual('ko');
  });

  it('should exist a request that contains an api-key', () => {
    const check = evalCheck({ ...check1, group });
    const actualOK = check([{ ...basePreloadRecord, input: { ...basePreloadRecord.input, apiKey: 'an-api-key' } }]);
    expect(actualOK.result).toStrictEqual('ok');
  });
  it('should exist a request with unique preloadIdx values within the body', () => {
    const check = evalCheck({ ...check2, group });
    const actualOK = check([
      {
        ...basePreloadRecord,
        input: {
          ...basePreloadRecord.input,
          body: [
            { ...basePreloadDoc, preloadIdx: '0' },
            { ...basePreloadDoc, preloadIdx: '1' },
          ],
        },
      },
    ]);
    expect(actualOK.result).toStrictEqual('ok');

    const actualKO = check([
      { ...basePreloadRecord, input: { ...basePreloadRecord.input, body: [basePreloadDoc, basePreloadDoc] } },
    ]);
    expect(actualKO.result).toStrictEqual('ko');
  });

  it('should exist a request with contentType always set to "application/pdf"', () => {
    const contentType = 'application/pdf';
    const check = evalCheck({ ...check3, group });
    const actualOK = check([
      {
        ...basePreloadRecord,
        input: {
          ...basePreloadRecord.input,
          body: [
            { ...basePreloadDoc, contentType },
            { ...basePreloadDoc, contentType },
          ],
        },
      },
    ]);
    expect(actualOK.result).toStrictEqual('ok');
    const actualKO = check([
      {
        ...basePreloadRecord,
        input: { ...basePreloadRecord.input, body: [basePreloadDoc, { ...basePreloadDoc, contentType: 'text/plain' }] },
      },
    ]);
    expect(actualKO.result).toStrictEqual('ko');
  });
});
