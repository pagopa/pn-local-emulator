import { makeRequestResponseRecord } from '../RequestResponseRecord';
import * as data from './data';

describe('makeRequestResponseRecord', () => {
  it('creation of RequestResponseRecord without other in records', () => {
    const expected = data.requestResponseRecordWithoutReturned;

    const actual = makeRequestResponseRecord(data.makeTestSystemEnv())({
      apiKey: data.apiKey.valid,
      requestCurl: data.aCurl,
      responseJson: data.aJson,
    })([]);

    expect(actual).toStrictEqual(expected);
  });

  it('returned field should contain previous curls and jsons', () => {
    const reqCurl = 'this is a test curl';
    const respJson = 'this is a test json';
    const reqResRec = makeRequestResponseRecord(data.makeTestSystemEnv())({
      apiKey: data.apiKey.valid,
      requestCurl: reqCurl,
      responseJson: respJson,
    })([data.preLoadRecord]);

    const actual = makeRequestResponseRecord(data.makeTestSystemEnv())({
      apiKey: data.apiKey.valid,
      requestCurl: data.aCurl,
      responseJson: data.aJson,
    })([reqResRec]);

    expect(actual.output.returned).toStrictEqual([{ requestCurl: reqCurl, responseJson: respJson }]);
  });
});
