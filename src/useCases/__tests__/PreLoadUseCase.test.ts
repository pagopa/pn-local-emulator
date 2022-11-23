import { PreLoadUseCase } from '../PreLoadUseCase';
import { pipe } from 'fp-ts/lib/function';
import * as E from 'fp-ts/Either';
import * as RA from 'fp-ts/ReadonlyArray';
import * as data from '../../domain/__tests__/data';

const body = [
  {
    preloadIdx: '0',
    contentType: 'application/pdf',
    sha256: 'sha-value',
  },
];

describe('PreLoadUseCase', () => {
  it('should return the key into url for each elements', async () => {
    const useCase = PreLoadUseCase(data.makeTestSystemEnv());
    const actual = await useCase(data.apiKey.valid)(body)();
    const checkKey = pipe(
      actual,
      E.exists(
        (element) =>
          element.statusCode === 200 &&
          pipe(
            element.returned,
            RA.every((_) => (_.url && _.key ? _.url.includes(_.key) : false))
          )
      )
    );
    expect(checkKey).toBeTruthy();
  });
});
