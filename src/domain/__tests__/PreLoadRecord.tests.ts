import { makePreLoadRecord } from '../PreLoadRecord';
import * as data from './data';
import { pipe } from 'fp-ts/function';
import * as RA from 'fp-ts/ReadonlyArray';

describe('makePreLoadRecord', () => {
  it('should return the key into url for each elements', async () => {
    const actual = makePreLoadRecord(data.makeTestSystemEnv())(data.preLoadRecord.input);
    const hasKey = pipe(
      actual,
      ({ output }) =>
        output.statusCode === 200 &&
        pipe(
          output.returned,
          RA.every((_) => (_.url && _.key ? _.url.includes(_.key) : false))
        )
    );
    expect(hasKey).toStrictEqual(true);
  });
});
